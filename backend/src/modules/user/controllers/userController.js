import City from "../../admin/models/City.js";
import Plan from "../../admin/models/Plan.js";
import Offer from "../../merchant/models/Offer.js";
import {
  serializeCity,
  serializeMerchant,
  serializeNotification,
  serializeOffer,
  serializePlan,
  serializeReferralHistory,
  serializeUser,
} from "../../../utils/serializers.js";
import Notification from "../models/Notification.js";
import ReferralHistory from "../models/ReferralHistory.js";
import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  return res.status(200).json({ user: serializeUser(req.user) });
};

export const updateMyProfile = async (req, res) => {
  const allowedFields = [
    "name",
    "email",
    "avatar",
    "city",
    "gender",
    "dob",
    "isProfileComplete",
  ];

  for (const field of allowedFields) {
    if (field in req.body) {
      req.user[field] = req.body[field];
    }
  }

  await req.user.save();

  return res.status(200).json({ user: serializeUser(req.user) });
};

export const getCities = async (_req, res) => {
  const cities = await City.find({}).sort({ name: 1 });
  return res.status(200).json({ cities: cities.map(serializeCity) });
};

export const getPlans = async (_req, res) => {
  const plans = await Plan.find({}).sort({ price: 1, createdAt: 1 });
  return res.status(200).json({ plans: plans.map(serializePlan) });
};

export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res.status(200).json({
    notifications: notifications.map(serializeNotification),
    unreadCount: notifications.filter((item) => !item.isRead).length,
  });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json({ notification: serializeNotification(notification) });
};

export const getSavedOffers = async (req, res) => {
  const user = await User.findById(req.user._id).select("savedOffers").lean();
  const savedOfferIds = (user?.savedOffers || []).map((item) => item.toString());
  const offers = await Offer.find({ _id: { $in: savedOfferIds } })
    .populate('merchantId')
    .sort({ createdAt: -1 });

  // Serialize offers with merchant data
  const serializedOffers = offers.map(offer => {
    const offerObj = offer.toObject ? offer.toObject() : offer;
    const serialized = serializeOffer(offerObj);
    
    // Add merchant object if populated
    if (offerObj.merchantId && typeof offerObj.merchantId === 'object') {
      serialized.merchant = serializeMerchant(offerObj.merchantId);
    }
    
    return serialized;
  });

  return res.status(200).json({
    offerIds: savedOfferIds,
    offers: serializedOffers,
  });
};

export const toggleSavedOffer = async (req, res) => {
  const offerId = req.params.offerId;
  
  // 1. Bug Fix: Ensure savedOffers array exists (for older users created before this schema)
  if (!req.user.savedOffers) {
    req.user.savedOffers = [];
  }

  const existingIndex = req.user.savedOffers.findIndex((item) => item.toString() === offerId);
  let isSaved = false;

  if (existingIndex >= 0) {
    // Already saved -> Remove it
    req.user.savedOffers.splice(existingIndex, 1);
    await Offer.findByIdAndUpdate(offerId, { $inc: { saves: -1 } }).catch(console.error);
    isSaved = false;
  } else {
    // Not saved -> Add it
    req.user.savedOffers.push(offerId);
    await Offer.findByIdAndUpdate(offerId, { $inc: { saves: 1 } }).catch(console.error);
    isSaved = true;
  }

  await req.user.save();

  return res.status(200).json({
    savedOfferIds: req.user.savedOffers.map((item) => item.toString()),
    isSaved: isSaved,
  });
};

export const getReferralHistory = async (req, res) => {
  const referrals = await ReferralHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res.status(200).json({
    referrals: referrals.map(serializeReferralHistory),
  });
};
