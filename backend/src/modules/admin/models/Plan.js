import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
      enum: ['Lifetime', 'Monthly', 'Yearly'],
    },
    maxProducts: {
      type: Number,
      required: true,
      min: 0,
    },
    maxOffers: {
      type: Number,
      default: 999,
      min: 0,
    },
    features: [String],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Plan', planSchema);
