import Plan from "../../admin/models/Plan.js";
import MerchantSubscription from "../../payment/models/MerchantSubscription.js";
import { serializeOffer, serializeMerchant } from "../../../utils/serializers.js";
import { calculateDistance, formatDistance } from "../../../utils/distance.js";
import Merchant from "../models/Merchant.js";
import Offer from "../models/Offer.js";

const getOwnedMerchant = async (userId) => {
  return Merchant.findById(userId);
};

const getEffectivePlan = async (merchant) => {
  const activeSubscription = await MerchantSubscription.findOne({
    merchantId: merchant._id,
    status: "active",
  })
    .populate("planId")
    .sort({ createdAt: -1 });

  if (activeSubscription?.planId) {
    return activeSubscription.planId;
  }

  if (!merchant.subscriptionPlanId) {
    return null;
  }

  return Plan.findById(merchant.subscriptionPlanId);
};

const ensureOfferAllowance = async (merchant) => {
  const plan = await getEffectivePlan(merchant);
  const maxOffers = Number(plan?.maxOffers);

  if (!Number.isFinite(maxOffers)) {
    return;
  }

  const offersCount = await Offer.countDocuments({ merchantId: merchant._id });

  if (offersCount >= maxOffers) {
    throw new Error("Current subscription plan offer limit reached");
  }
};

export const getOffers = async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const query = {};

  // Public visibility rules:
  // - only approved merchants
  // - only active offers
  // Admin can bypass via explicit filters.
  if (req.query.merchantId) {
    query.merchantId = req.query.merchantId;
    if (!isAdmin) {
      const merchant = await Merchant.findOne({
        _id: req.query.merchantId,
        status: "approved",
      })
        .select("_id")
        .lean();

      if (!merchant) {
        return res.status(200).json({ offers: [] });
      }

      query.status = "active";
    }
  } else {
    if (isAdmin) {
      if (req.query.status) {
        query.status = req.query.status;
      }
    } else {
      const approvedMerchants = await Merchant.find({ status: "approved" })
        .select("_id")
        .lean();
      query.merchantId = { $in: approvedMerchants.map((item) => item._id) };
      query.status = "active";
    }
  }

  // Existing: Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // NEW: Filter by isNew
  if (req.query.isNew === 'true') {
    query.isNew = true;
  }

  // NEW: Filter by isTrending
  if (req.query.isTrending === 'true') {
    query.isTrending = true;
  }

  // NEW: Filter by city (via merchant)
  if (req.query.city) {
    const cityMerchants = await Merchant.find({
      city: req.query.city,
      status: "approved"
    }).select("_id").lean();

    const cityMerchantIds = cityMerchants.map(m => m._id);

    if (query.merchantId?.$in) {
      // Intersect with existing merchant filter
      query.merchantId.$in = query.merchantId.$in.filter(id =>
        cityMerchantIds.some(cid => cid.equals(id))
      );
    } else {
      query.merchantId = { $in: cityMerchantIds };
    }
  }

  // NEW: Sorting
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sortObj = { [sortBy]: sortOrder };

  // NEW: Limit
  const limit = parseInt(req.query.limit) || 0;

  // Execute query with population
  let offersQuery = Offer.find(query)
    .populate('merchantId', 'storeName businessName verified coordinates city totalRedemptions')
    .populate('productId', 'name price')
    .populate('servicePlanId', 'name price')
    .sort(sortObj);

  if (limit > 0) {
    offersQuery = offersQuery.limit(limit);
  }

  const offers = await offersQuery;

  // Parse user coordinates for distance calculation
  const userLat = req.query.userLat ? parseFloat(req.query.userLat) : null;
  const userLng = req.query.userLng ? parseFloat(req.query.userLng) : null;

  // Enrich offers with merchant data and distance
  const enrichedOffers = offers.map(offer => {
    const offerObj = offer.toObject();

    // Add merchant name
    if (offerObj.merchantId) {
      offerObj.merchantName = offerObj.merchantId.businessName || offerObj.merchantId.storeName;

      // NEW: Add merchant object with enhanced data
      offerObj.merchant = {
        _id: offerObj.merchantId._id,
        storeName: offerObj.merchantId.storeName || offerObj.merchantId.businessName,
        verified: offerObj.merchantId.verified || false,
        coordinates: offerObj.merchantId.coordinates,
        city: offerObj.merchantId.city,
        totalRedemptions: offerObj.merchantId.totalRedemptions || 0
      };

      // Calculate distance if user coordinates provided
      if (userLat && userLng && offerObj.merchantId.coordinates) {
        const distance = calculateDistance(
          userLat,
          userLng,
          offerObj.merchantId.coordinates.lat,
          offerObj.merchantId.coordinates.lng
        );
        offerObj.merchant.distance = formatDistance(distance);
      }
    }

    // Add product price and name if available
    if (offerObj.productId) {
      offerObj.productPrice = offerObj.productId.price;
      offerObj.productName = offerObj.productId.name;
    }

    // Add service plan price and name if available
    if (offerObj.servicePlanId) {
      offerObj.servicePlanPrice = offerObj.servicePlanId.price;
      offerObj.servicePlanName = offerObj.servicePlanId.name;
    }

    return offerObj;
  });

  return res.status(200).json({ offers: enrichedOffers.map(serializeOffer) });
};

export const getOfferById = async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('merchantId')
    .populate('productId', 'name price')
    .populate('servicePlanId', 'name price');

  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  const isAdmin = req.user?.role === "admin";
  const isOwner =
    req.user &&
    offer.merchantId &&
    offer.merchantId._id.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    const isVisibleToPublic =
      offer.status === "active" && offer.merchantId?.status === "approved";
    if (!isVisibleToPublic) {
      return res.status(404).json({ message: "Offer not found" });
    }
  }

  const offerObj = offer.toObject();
  
  // Serialize merchant separately
  let merchantData = null;
  if (offerObj.merchantId) {
    merchantData = serializeMerchant(offerObj.merchantId);
    offerObj.merchantName = offerObj.merchantId.businessName || offerObj.merchantId.storeName;
  }
  
  // Add product price and name if available
  if (offerObj.productId) {
    offerObj.productPrice = offerObj.productId.price;
    offerObj.productName = offerObj.productId.name;
  }
  
  // Add service plan price and name if available
  if (offerObj.servicePlanId) {
    offerObj.servicePlanPrice = offerObj.servicePlanId.price;
    offerObj.servicePlanName = offerObj.servicePlanId.name;
  }

  const serializedOffer = serializeOffer(offerObj);
  
  // Add merchant object to response
  if (merchantData) {
    serializedOffer.merchant = merchantData;
  }

  return res.status(200).json({ offer: serializedOffer });
};

export const getMyOffers = async (req, res) => {
  const merchant = await getOwnedMerchant(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  const offers = await Offer.find({ merchantId: merchant._id })
    .populate('productId', 'name price')
    .populate('servicePlanId', 'name price')
    .sort({ createdAt: -1 });
  
  // Enrich offers with merchant name and product/service prices
  const enrichedOffers = offers.map(offer => {
    const offerObj = offer.toObject();
    
    // Add merchant name
    offerObj.merchantName = merchant.businessName || merchant.storeName;
    
    // Add product price and name if available
    if (offerObj.productId) {
      offerObj.productPrice = offerObj.productId.price;
      offerObj.productName = offerObj.productId.name;
    }
    
    // Add service plan price and name if available
    if (offerObj.servicePlanId) {
      offerObj.servicePlanPrice = offerObj.servicePlanId.price;
      offerObj.servicePlanName = offerObj.servicePlanId.name;
    }
    
    return offerObj;
  });
  
  return res.status(200).json({ offers: enrichedOffers.map(serializeOffer) });
};

export const createOffer = async (req, res) => {
  const merchant = await getOwnedMerchant(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  await ensureOfferAllowance(merchant);

  // Validate offer type specific requirements
  const offerType = req.body.offerType || "generic";
  
  if (offerType === "product" && !req.body.productId) {
    return res.status(400).json({ message: "Product ID is required for product-based offers" });
  }
  
  if (offerType === "service" && !req.body.servicePlanId) {
    return res.status(400).json({ message: "Service Plan ID is required for service-based offers" });
  }

  const offer = await Offer.create({
    merchantId: merchant._id,
    
    // Offer type and linking (NEW - backward compatible)
    offerType: offerType,
    productId: req.body.productId || null,
    variantId: req.body.variantId || null,
    applyToAllVariants: Boolean(req.body.applyToAllVariants),
    servicePlanId: req.body.servicePlanId || null,
    bookingRequired: Boolean(req.body.bookingRequired),
    bookingWindowDays: Number(req.body.bookingWindowDays || 7),
    
    // Common fields (EXISTING - unchanged)
    title: req.body.title,
    description: req.body.description || "",
    discountType: req.body.discountType || "percentage",
    discountValue: Number(req.body.discountValue || 0),
    validFrom: req.body.validFrom || new Date(),
    validTo: req.body.validTo || null,
    maxRedemptions: Number(req.body.maxRedemptions || 0),
    currentRedemptions: Number(req.body.currentRedemptions || 0),
    
    // Image handling (ENHANCED - backward compatible)
    image: req.body.image || "",
    customImage: req.body.customImage || null,
    useCustomImage: Boolean(req.body.useCustomImage),
    
    status: req.body.status || "active",
    category: req.body.category || merchant.category || "General",
    isTrending: Boolean(req.body.isTrending),
    isNew: "isNew" in req.body ? Boolean(req.body.isNew) : true,
    terms: req.body.terms || "",
  });

  return res.status(201).json({ offer: serializeOffer(offer) });
};

export const updateOffer = async (req, res) => {
  const merchant = await getOwnedMerchant(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  const offer = await Offer.findOne({ _id: req.params.id, merchantId: merchant._id });

  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  // Validate offer type specific requirements if offerType is being changed
  if (req.body.offerType) {
    if (req.body.offerType === "product" && !req.body.productId && !offer.productId) {
      return res.status(400).json({ message: "Product ID is required for product-based offers" });
    }
    
    if (req.body.offerType === "service" && !req.body.servicePlanId && !offer.servicePlanId) {
      return res.status(400).json({ message: "Service Plan ID is required for service-based offers" });
    }
  }

  const editableFields = [
    // Existing fields
    "title",
    "description",
    "discountType",
    "discountValue",
    "validFrom",
    "validTo",
    "maxRedemptions",
    "currentRedemptions",
    "image",
    "status",
    "category",
    "isTrending",
    "isNew",
    "terms",
    // NEW fields (backward compatible)
    "offerType",
    "productId",
    "variantId",
    "applyToAllVariants",
    "servicePlanId",
    "bookingRequired",
    "bookingWindowDays",
    "customImage",
    "useCustomImage",
  ];

  for (const field of editableFields) {
    if (field in req.body) {
      offer[field] = req.body[field];
    }
  }

  await offer.save();

  return res.status(200).json({ offer: serializeOffer(offer) });
};

export const deleteOffer = async (req, res) => {
  const merchant = await getOwnedMerchant(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  const offer = await Offer.findOneAndDelete({ _id: req.params.id, merchantId: merchant._id });

  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  return res.status(200).json({ success: true });
};
