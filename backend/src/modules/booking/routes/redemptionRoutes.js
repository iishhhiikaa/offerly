import express from 'express';
import { 
    createRedemption, 
    getCustomerRedemptions, 
    getRedemptionById,
    verifyQR 
} from '../controllers/redemptionController.js';
import { protect, authorize } from '../../../middlewares/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, createRedemption);

router.get('/customer', protect, getCustomerRedemptions);
router.get('/:id', protect, getRedemptionById);
router.post('/verify-qr', protect, authorize('merchant'), verifyQR);

export default router;
