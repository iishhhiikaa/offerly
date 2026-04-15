import express from "express";

import { protect } from "../../../middlewares/auth.js";
import {
  getCities,
  getMyNotifications,
  getMyProfile,
  getPlans,
  getReferralHistory,
  getSavedOffers,
  markNotificationRead,
  toggleSavedOffer,
  updateMyProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/cities", getCities);
router.get("/plans", getPlans);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/notifications", protect, getMyNotifications);
router.patch("/notifications/:id/read", protect, markNotificationRead);
router.get("/saved-offers", protect, getSavedOffers);
router.post("/saved-offers/:offerId/toggle", protect, toggleSavedOffer);
router.get("/referrals", protect, getReferralHistory);

export default router;
