import express from "express";

import { authorize, optionalAuth, protect } from "../../../middlewares/auth.js";
import {
  getMerchantById,
  getMerchantCustomers,
  getMerchantDashboard,
  getMerchants,
  getMyStore,
  getMySubscription,
  registerStore,
  updateMyStore,
  updateOnboarding,
  updateBusinessDetails,
  updateKYBDocuments,
  updateLocationHours,
  getStoreConfig,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/merchantController.js";

const router = express.Router();

router.get("/", optionalAuth, getMerchants);
router.get("/me", protect, authorize("merchant", "admin"), getMyStore);
router.get("/me/store-config", protect, authorize("merchant"), getStoreConfig);
router.patch("/me/onboarding", protect, authorize("merchant"), updateOnboarding);

// 4-Step Registration Routes
router.post("/me/registration/business-details", protect, authorize("merchant"), updateBusinessDetails);
router.post("/me/registration/kyb-documents", protect, authorize("merchant"), updateKYBDocuments);
router.post("/me/registration/location-hours", protect, authorize("merchant"), updateLocationHours);

router.get("/me/dashboard", protect, authorize("merchant", "admin"), getMerchantDashboard);
router.get("/me/customers", protect, authorize("merchant", "admin"), getMerchantCustomers);
router.get("/me/subscription", protect, authorize("merchant", "admin"), getMySubscription);

// Notification Routes
router.get("/me/notifications", protect, authorize("merchant"), getMyNotifications);
router.patch("/me/notifications/:id/read", protect, authorize("merchant"), markNotificationRead);
router.patch("/me/notifications/mark-all-read", protect, authorize("merchant"), markAllNotificationsRead);

router.post("/register", protect, authorize("merchant"), registerStore);
router.put("/me", protect, authorize("merchant", "admin"), updateMyStore);
router.get("/:id", optionalAuth, getMerchantById);

export default router;
