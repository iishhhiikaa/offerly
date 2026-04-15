import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../src/modules/admin/models/Plan.js';

dotenv.config();

const plans = [
  {
    name: 'Free Trial',
    price: 0,
    duration: 'Monthly',
    maxProducts: 10,
    maxOffers: 5,
    features: ['1 Month Free Trial', 'Standard Support', 'Basic Analytics'],
    status: 'active'
  },
  {
    name: 'Standard',
    price: 499,
    duration: 'Monthly',
    maxProducts: 50,
    maxOffers: 20,
    features: ['All Trial Features', 'Priority Support', 'Advanced Analytics'],
    status: 'active'
  },
  {
    name: 'Premium',
    price: 1499,
    duration: 'Monthly',
    maxProducts: 999,
    maxOffers: 999,
    features: ['Unlimited Products', 'Dedicated Account Manager', 'Custom Promotions'],
    status: 'active'
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const planData of plans) {
      const existing = await Plan.findOne({ name: planData.name });
      if (!existing) {
        await Plan.create(planData);
        console.log(`Created plan: ${planData.name}`);
      } else {
        console.log(`Plan already exists: ${planData.name}`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedPlans();
