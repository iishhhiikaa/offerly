import Joi from 'joi';
import RedemptionModel from '../models/Redemption.js';
import Merchant from '../../merchant/models/Merchant.js';
import Offer from '../../merchant/models/Offer.js';

// @desc    Create a redemption/booking
// @route   POST /api/redemptions
// @access  Private (Customer Only)
export const createRedemption = async (req, res) => {
  const schema = Joi.object({
    offerId: Joi.string().allow(null),
    merchantId: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      product: Joi.string().required(),
      qty: Joi.number().min(1).required(),
    })),
    totals: Joi.object({
      subtotal: Joi.number(),
      discount: Joi.number(),
      total: Joi.number(),
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  try {
    const { offerId, merchantId, items, totals } = req.body;

    // Friendly ID generation (e.g. B-54321)
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const nums = Math.floor(10000 + Math.random() * 90000);
    const internalId = `${letter}-${nums}`;

    // Generate QR Token
    const qrToken = `qr_${merchantId}_${req.user.id}_${Date.now()}`;
    const qrExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const redemption = await RedemptionModel.create({
      offerId,
      merchantId,
      customerId: req.user.id,
      items,
      totals,
      qrToken,
      qrExpiry,
      internalId,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: redemption });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get redemptions for customer
// @route   GET /api/redemptions/customer
// @access  Private
export const getCustomerRedemptions = async (req, res) => {
  try {
    const redemptions = await RedemptionModel.find({ customerId: req.user.id })
        .populate('merchantId', 'storeName logo address')
        .populate('offerId', 'title')
        .sort('-createdAt');
        
    res.status(200).json({ success: true, count: redemptions.length, data: redemptions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single redemption by ID
// @route   GET /api/redemptions/:id
// @access  Private
export const getRedemptionById = async (req, res) => {
  try {
    const redemption = await RedemptionModel.findById(req.params.id)
        .populate('merchantId', 'storeName logo address city phone locality avgRating totalReviews verified')
        .populate('offerId', 'title discountType discountValue validTo image category');
        
    if (!redemption) {
      return res.status(404).json({ success: false, error: 'Redemption not found' });
    }

    res.status(200).json({ success: true, data: redemption });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Verify QR (for merchant)
// @route   POST /api/redemptions/verify-qr
// @access  Private (Merchant Only)
export const verifyQR = async (req, res) => {
  const schema = Joi.object({
    qrToken: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  try {
    const { qrToken } = req.body;

    const redemption = await RedemptionModel.findOne({ qrToken });

    if (!redemption) {
      return res.status(404).json({ success: false, error: 'Invalid QR Token' });
    }

    if (redemption.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Already ${redemption.status}` });
    }

    if (new Date(redemption.qrExpiry) < new Date()) {
      redemption.status = 'expired';
      await redemption.save();
      return res.status(400).json({ success: false, error: 'QR Token has expired' });
    }

    // Verify merchant ownership
    const merchant = await Merchant.findOne({ ownerId: req.user.id });
    if (!merchant || redemption.merchantId.toString() !== merchant._id.toString()) {
       return res.status(401).json({ success: false, error: 'Not authorized for this merchant' });
    }

    // Mark complete
    redemption.status = 'completed';
    redemption.scannedAt = Date.now();
    await redemption.save();

    res.status(200).json({ success: true, message: 'Redemption successful', data: redemption });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
};
