import express from 'express';
import {
  getAllUsers,
  updateMerchantStatus,
  saveCity,
  getCities,
  savePlan,
  getPlans,
  deletePlan,
  getDashboardStats,
  getAllRedemptions,
  getAdminNotifications,
  markAdminNotificationRead,
  globalSearch,
  getAllAdRequests,
  updateAdRequestStatus,
  deleteAdRequest,
  getApprovedAds
} from '../controllers/adminController.js';
import { protect, authorize } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect); // All admin routes require login

// Dashboard
router.get('/dashboard', authorize('admin'), getDashboardStats);

// Admin only routes
router.get('/users', authorize('admin'), getAllUsers);
router.get('/redemptions', authorize('admin'), getAllRedemptions);
router.put('/merchants/:id/status', authorize('admin'), updateMerchantStatus);
router.post('/cities', authorize('admin'), saveCity);
router.post('/plans', authorize('admin'), savePlan);
router.delete('/plans/:id', authorize('admin'), deletePlan);

// Helper public routes
router.get('/cities', getCities);
router.get('/plans', getPlans);

// Notifications
router.get('/notifications', authorize('admin'), getAdminNotifications);
router.put('/notifications/:id/read', authorize('admin'), markAdminNotificationRead);

// Search
router.get('/search', authorize('admin'), globalSearch);

// Ad Requests
router.get('/ads', authorize('admin'), getAllAdRequests);
router.put('/ads/:id/status', authorize('admin'), updateAdRequestStatus);
router.delete('/ads/:id', authorize('admin'), deleteAdRequest);

// Public Ad Requests (no auth required)
router.get('/ads/approved', getApprovedAds);

export default router;
