import Plan from "../../admin/models/Plan.js";
import Redemption from "../../booking/models/Redemption.js";
import MerchantSubscription from "../../payment/models/MerchantSubscription.js";
import Notification from "../../user/models/Notification.js";
import { serializeMerchant, serializeRedemption } from "../../../utils/serializers.js";
import Merchant from "../models/Merchant.js";
import Offer from "../models/Offer.js";
import Product from "../models/Product.js";
import { calculateDistance, formatDistance } from "../../../utils/distance.js";

const registrationFields = [
  "storeName",
  "category",
  "city",
  "locality",
  "address",
  "phone",
  "email",
  "description",
  "coordinates",
  "coverImage",
  "logo",
  "photos",
  "documents",
  "subscriptionPlanId",
];

const buildMerchantPayload = (body) => {
  const payload = {};

  for (const field of registrationFields) {
    if (field in body) {
      payload[field] = body[field];
    }
  }

  if (!payload.phone && body.contactNumber) {
    payload.phone = body.contactNumber;
  }

  // Auto-approve merchants for immediate visibility
  payload.status = "approved";
  payload.hasRequestedStore = true;
  payload.verified = true;
  payload.approvedAt = new Date();
  payload.joinedAt = new Date();
  payload.rejectionReason = "";
  payload.rejectedAt = null;
  payload.rejectedBy = null;

  return payload;
};

const getMerchantForOwner = async (userId) => {
  return Merchant.findById(userId);
};

const getLatestSubscription = async (userId, merchantId = null) => {
  return MerchantSubscription.findOne({
    userId: merchantId || userId,
  })
    .populate("planId")
    .sort({ createdAt: -1 });
};

export const getMerchants = async (req, res) => {
  const query = {};

  // Existing: Filter by city
  if (req.query.city) {
    query.city = req.query.city;
  }

  // Existing: Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Existing: Filter by status (only approved for non-admin)
  if (!req.user || req.user.role !== "admin") {
    query.status = "approved";
  } else if (req.query.status) {
    query.status = req.query.status;
  }

  // NEW: Sorting
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sortObj = { [sortBy]: sortOrder };

  // NEW: Limit
  const limit = parseInt(req.query.limit) || 0;

  let merchantsQuery = Merchant.find(query).sort(sortObj);

  if (limit > 0) {
    merchantsQuery = merchantsQuery.limit(limit);
  }

  const merchants = await merchantsQuery;

  // Parse user coordinates for distance calculation
  const userLat = req.query.userLat ? parseFloat(req.query.userLat) : null;
  const userLng = req.query.userLng ? parseFloat(req.query.userLng) : null;

  // NEW: Calculate offer count for each merchant and add distance
  const merchantsWithEnhancements = await Promise.all(
    merchants.map(async (merchant) => {
      const merchantObj = merchant.toObject();

      // Count active offers
      const offerCount = await Offer.countDocuments({
        merchantId: merchant._id,
        status: 'active'
      });

      merchantObj.offerCount = offerCount;

      // Calculate distance if user coordinates provided
      if (userLat && userLng && merchant.coordinates) {
        const distance = calculateDistance(
          userLat,
          userLng,
          merchant.coordinates.lat,
          merchant.coordinates.lng
        );
        merchantObj.distance = formatDistance(distance);
      }

      return merchantObj;
    })
  );

  return res.status(200).json({
    merchants: merchantsWithEnhancements.map(serializeMerchant)
  });
};

export const getMerchantById = async (req, res) => {
  const merchant = await Merchant.findById(req.params.id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant not found" });
  }

  const canSeeMerchant =
    merchant.status === "approved" ||
    (req.user &&
      (req.user.role === "admin" || merchant._id.toString() === req.user._id.toString()));

  if (!canSeeMerchant) {
    return res.status(404).json({ message: "Merchant not found" });
  }

  return res.status(200).json({ merchant: serializeMerchant(merchant) });
};

export const registerStore = async (req, res) => {
  // Find the "Free Trial" plan or use the provided one
  let plan = null;
  if (req.body.subscriptionPlanId) {
    plan = await Plan.findById(req.body.subscriptionPlanId);
  }

  // If no plan provided or found, default to "Free Trial"
  if (!plan) {
    plan = await Plan.findOne({ name: { $regex: /Trial/i }, status: "active" });
  }

  if (!plan) {
    return res.status(400).json({ message: "Subscription plan not found" });
  }

  // If selecting a paid plan, require payment reference
  if (Number(plan.price || 0) > 0 && !req.body.paymentReference) {
    return res.status(400).json({ message: "Payment required for the selected subscription plan" });
  }

  const payload = buildMerchantPayload(req.body);

  const merchant = await Merchant.findByIdAndUpdate(req.user._id, payload, { new: true });

  // Set subscription end date (30 days for Trial, or handle based on plan duration)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30); // Default 30 days for now

  await MerchantSubscription.findOneAndUpdate(
    {
      userId: req.user._id,
    },
    {
      userId: req.user._id,
      merchantId: merchant._id,
      planId: plan._id,
      amount: Number(plan.price || 0),
      status: "active",
      startDate,
      endDate,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Notification.create({
    userId: req.user._id,
    title: "Store application submitted",
    body: "Your merchant profile has been submitted and is waiting for admin approval. Your 1-month free trial will begin once approved.",
    type: "merchant_application",
    data: { merchantId: merchant._id.toString() },
  });

  return res.status(201).json({
    merchant: serializeMerchant(merchant),
    message: "Merchant application submitted successfully",
  });
};

export const getMyStore = async (req, res) => {
  console.log('getMyStore called for user:', req.user._id, 'phone:', req.user.phone);
  let merchant = await getMerchantForOwner(req.user._id);

  // Fallback: try to find by phone if not found by ID
  if (!merchant && req.user.phone) {
    console.log('Merchant not found by ID, trying by phone:', req.user.phone);
    merchant = await Merchant.findOne({ phone: req.user.phone });
    
    if (merchant) {
      console.log('Merchant found by phone, but ID mismatch. Merchant ID:', merchant._id, 'User ID:', req.user._id);
    }
  }

  if (!merchant) {
    console.log('Merchant not found for user:', req.user._id);
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  console.log('Merchant found:', merchant._id);
  return res.status(200).json({ merchant: serializeMerchant(merchant) });
};

export const updateOnboarding = async (req, res) => {
  try {
    let merchant = await Merchant.findById(req.user._id);
    let isNewMerchant = false;

    // If merchant doesn't exist, create a new one
    if (!merchant) {
      console.log('Creating new merchant for user:', req.user._id);
      isNewMerchant = true;
      merchant = new Merchant({
        _id: req.user._id,
        ownerName: req.user.name || 'Merchant',
        phone: req.user.phone,
        email: req.user.email,
        status: 'pending',
        hasRequestedStore: false,
        onboardingStep: 0,
      });
    }

    const { step, data } = req.body;

    if (step === 'kyb') {
      // Expected data.documents as an array of structured objects
      if (data && data.documents && Array.isArray(data.documents)) {
        // Transform and validate documents
        merchant.documents = data.documents.map(doc => ({
          name: doc.name || '',
          type: doc.type || '',
          url: doc.url || '',
          data: doc.data || '',
          label: doc.label || ''
        }));
      }
      merchant.onboardingStep = 3;
    } else if (step === 'profile') {
      // Expected store info + bank details
      if (data.storeName) merchant.storeName = data.storeName;
      if (data.category) merchant.category = data.category;
      if (data.city) merchant.city = data.city;
      if (data.locality) merchant.locality = data.locality;
      if (data.address) merchant.address = data.address;
      if (data.businessHours) merchant.businessHours = data.businessHours;
      if (data.description) merchant.description = data.description;
      if (data.logo) merchant.logo = data.logo;
      if (data.coverImage) merchant.coverImage = data.coverImage;
      
      if (data.bankDetails) {
        merchant.bankDetails = {
          ...(merchant.bankDetails?.toObject?.() || merchant.bankDetails || {}),
          ...data.bankDetails
        };
      }
      
      if (data.subscriptionPlanId) {
        merchant.subscriptionPlanId = data.subscriptionPlanId;
        merchant.onboardingStep = 4;
        merchant.status = 'pending';
        merchant.hasRequestedStore = true;
      }
    }

    await merchant.save();
    console.log('Merchant saved successfully:', merchant._id, 'isNew:', isNewMerchant);

    return res.status(200).json({ 
      success: true, 
      merchant: serializeMerchant(merchant),
      message: `Onboarding ${step} updated successfully`
    });
  } catch (error) {
    console.error('Update Onboarding Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during onboarding update",
      error: error.message 
    });
  }
};

// Step 2: Business Details
export const updateBusinessDetails = async (req, res) => {
  try {
    console.log('=== UPDATE BUSINESS DETAILS ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    const merchant = await Merchant.findById(req.user._id);
    
    if (!merchant) {
      console.log('ERROR: Merchant not found for user ID:', req.user._id);
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    console.log('Merchant found:', merchant._id, merchant.ownerName);

    const { storeName, category, description, businessEmail, businessPhone, logo, photos } = req.body;

    // Validate required fields
    if (!storeName || !category || !description || !businessEmail || !businessPhone || !logo) {
      console.log('ERROR: Missing required fields');
      console.log('storeName:', storeName);
      console.log('category:', category);
      console.log('description:', description);
      console.log('businessEmail:', businessEmail);
      console.log('businessPhone:', businessPhone);
      console.log('logo:', logo);
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate description word count (10-50 words)
    const wordCount = description.trim().split(/\s+/).filter(word => word.length > 0).length;
    console.log('Description word count:', wordCount);
    
    if (wordCount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 words'
      });
    }
    if (wordCount > 50) {
      return res.status(400).json({
        success: false,
        message: 'Description must not exceed 50 words'
      });
    }

    // Update merchant
    merchant.storeName = storeName;
    merchant.category = category;
    merchant.description = description;
    merchant.businessEmail = businessEmail;
    merchant.businessPhone = businessPhone;
    merchant.logo = logo;
    
    if (photos && Array.isArray(photos)) {
      merchant.photos = photos;
    }

    merchant.onboardingStep = Math.max(merchant.onboardingStep, 2);
    
    console.log('Saving merchant with onboardingStep:', merchant.onboardingStep);
    await merchant.save();
    console.log('Merchant saved successfully');

    return res.status(200).json({
      success: true,
      merchant: serializeMerchant(merchant),
      message: 'Business details updated successfully'
    });
  } catch (error) {
    console.error('Update Business Details Error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to update business details',
      error: error.message
    });
  }
};

// Step 3: KYB Documents
export const updateKYBDocuments = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.user._id);
    
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    const { documents, gstNumber } = req.body;

    // Validate required documents
    const requiredDocs = ['aadhaar_front', 'aadhaar_back', 'pan_card', 'owner_photo', 'business_registration', 'store_front_photo'];
    const uploadedDocTypes = documents.map(doc => doc.type);
    
    const missingDocs = requiredDocs.filter(type => !uploadedDocTypes.includes(type));
    
    if (missingDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingDocs.join(', ')}`
      });
    }

    // Update documents
    merchant.documents = documents.map(doc => ({
      type: doc.type,
      label: doc.label,
      url: doc.url,
      name: doc.name,
      size: doc.size,
      uploadedAt: new Date()
    }));

    if (gstNumber) {
      merchant.gstNumber = gstNumber;
    }

    merchant.onboardingStep = Math.max(merchant.onboardingStep, 3);
    await merchant.save();

    return res.status(200).json({
      success: true,
      merchant: serializeMerchant(merchant),
      message: 'KYB documents uploaded successfully'
    });
  } catch (error) {
    console.error('Update KYB Documents Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload KYB documents',
      error: error.message
    });
  }
};

// Step 4: Location & Hours
export const updateLocationHours = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.user._id);
    
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    const { address, city, state, pincode, latitude, longitude, businessHours } = req.body;

    // Validate required fields (latitude and longitude are now optional)
    if (!address || !city || !state || !pincode || !businessHours) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Update location
    merchant.address = address;
    merchant.city = city;
    merchant.state = state;
    merchant.pincode = pincode;
    
    // Only update coordinates if they are provided
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      merchant.coordinates = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };
    }

    // Update business hours
    merchant.businessHours = businessHours;

    // Mark registration as complete
    merchant.onboardingStep = 4;
    merchant.status = 'pending';
    merchant.hasRequestedStore = true;

    await merchant.save();

    return res.status(200).json({
      success: true,
      merchant: serializeMerchant(merchant),
      message: 'Registration completed successfully! Your application is under review.'
    });
  } catch (error) {
    console.error('Update Location Hours Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location and hours',
      error: error.message
    });
  }
};

export const updateMyStore = async (req, res) => {
  const merchant = await getMerchantForOwner(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  const editableFields = [
    "storeName",
    "category",
    "city",
    "locality",
    "address",
    "phone",
    "email",
    "description",
    "coordinates",
    "coverImage",
    "logo",
    "photos",
    "documents",
  ];

  for (const field of editableFields) {
    if (field in req.body) {
      merchant[field] = req.body[field];
    }
  }

  await merchant.save();

  return res.status(200).json({ merchant: serializeMerchant(merchant) });
};

export const getMerchantDashboard = async (req, res) => {
  const merchant = await getMerchantForOwner(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  const [productsCount, offersCount, redemptions, latestSubscription] = await Promise.all([
    Product.countDocuments({ merchantId: merchant._id }),
    Offer.countDocuments({ merchantId: merchant._id }),
    Redemption.find({ merchantId: merchant._id }).sort({ createdAt: -1 }),
    getLatestSubscription(req.user._id, merchant._id),
  ]);

  const revenue = redemptions
    .filter((item) => ["redeemed", "completed"].includes(item.status))
    .reduce((sum, item) => sum + Number(item?.totals?.final || 0), 0);

  const customersCount = new Set(
    redemptions.map((item) => item.customerId?.toString()).filter(Boolean),
  ).size;

  const remainingDays = latestSubscription?.endDate
    ? Math.max(0, Math.ceil((new Date(latestSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return res.status(200).json({
    merchant: serializeMerchant(merchant),
    stats: {
      productsCount,
      offersCount,
      bookingsCount: redemptions.length,
      revenue,
      customersCount,
      pendingBookingsCount: redemptions.filter((item) => item.status === "active").length,
      remainingDays,
    },
    recentBookings: redemptions.slice(0, 10).map(serializeRedemption),
    subscription: latestSubscription,
  });
};

export const getMerchantCustomers = async (req, res) => {
  const merchant = await getMerchantForOwner(req.user._id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant profile not found" });
  }

  const bookings = await Redemption.find({ merchantId: merchant._id }).populate(
    "customerId",
    "name phone email",
  );

  const customers = new Map();

  for (const booking of bookings) {
    if (!booking.customerId) {
      continue;
    }

    const key = booking.customerId._id.toString();
    const current = customers.get(key) || {
      id: key,
      name: booking.customerName || booking.customerId.name || "",
      phone: booking.customerId.phone || "",
      email: booking.customerId.email || "",
      visits: 0,
      spend: 0,
      lastVisit: booking.createdAt,
    };

    current.visits += 1;
    current.spend += Number(booking?.totals?.final || 0);
    current.lastVisit =
      new Date(current.lastVisit) > new Date(booking.createdAt)
        ? current.lastVisit
        : booking.createdAt;

    customers.set(key, current);
  }

  return res.status(200).json({
    customers: [...customers.values()].sort(
      (left, right) => new Date(right.lastVisit) - new Date(left.lastVisit),
    ),
  });
};

export const getMySubscription = async (req, res) => {
  const merchant = await getMerchantForOwner(req.user._id);
  const subscription = await getLatestSubscription(req.user._id, merchant?._id || null);

  return res.status(200).json({
    subscription,
    merchant: merchant ? serializeMerchant(merchant) : null,
  });
};

// Get store configuration for offer creation
export const getStoreConfig = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.user._id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant profile not found'
      });
    }

    // Import Category model
    const Category = (await import('../../admin/models/Category.js')).default;
    const category = await Category.findOne({ name: merchant.category });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      config: {
        offer_mode: category.offer_mode || category.type,
        requires_booking: category.requires_booking || false,
        category: merchant.category,
        categoryType: category.type
      }
    });
  } catch (error) {
    console.error('Get store config error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch store configuration',
      error: error.message
    });
  }
};
