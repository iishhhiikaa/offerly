import mongoose from 'mongoose';
import Offer from '../modules/merchant/models/Offer.js';

const offers = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    merchantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Royal Restaurant
    title: 'Flat 20% OFF on All Orders',
    description: 'Enjoy 20% discount on your entire order at Royal Restaurant. Valid on dine-in and takeaway. Minimum order ₹200.',
    offerType: 'generic',
    discountType: 'percentage',
    discountValue: 20,
    validFrom: new Date('2026-04-01T00:00:00Z'),
    validTo: new Date('2026-04-30T23:59:59Z'),
    maxRedemptions: 500,
    currentRedemptions: 342,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    status: 'active',
    category: 'Food',
    isTrending: true,
    isNew: false,
    impressions: 2340,
    saves: 128,
    terms: [
      'Valid on dine-in and takeaway',
      'Min order ₹200',
      'Cannot be combined with other offers',
      'One redemption per customer per day'
    ],
  },
  {
    merchantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), // Style Salon
    title: 'Get 30% OFF on All Services',
    description: 'Book any hair or beauty service at Style Salon and get flat 30% off. No minimum spend.',
    offerType: 'generic',
    discountType: 'percentage',
    discountValue: 30,
    validFrom: new Date('2026-04-01T00:00:00Z'),
    validTo: new Date('2026-04-30T23:59:59Z'),
    maxRedemptions: 200,
    currentRedemptions: 89,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&q=80',
    status: 'active',
    category: 'Saloon',
    isTrending: true,
    isNew: false,
    impressions: 1820,
    saves: 89,
    terms: [
      'Valid Mon–Sat 10am–7pm',
      'Prior appointment recommended',
      'Not valid on Sundays and public holidays'
    ],
  },
  {
    merchantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'), // Fitness Hub
    title: 'Free Trial Class — First Visit',
    description: 'New members get a completely free trial class at Fitness Hub. Try any batch — morning, afternoon, or evening.',
    offerType: 'generic',
    discountType: 'flat',
    discountValue: 0,
    validFrom: new Date('2026-04-01T00:00:00Z'),
    validTo: new Date('2026-05-31T23:59:59Z'),
    maxRedemptions: 100,
    currentRedemptions: 67,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80',
    status: 'active',
    category: 'Gym',
    isTrending: true,
    isNew: false,
    impressions: 3100,
    saves: 245,
    terms: [
      'First-time visitors only',
      'Valid ID required',
      'Batch subject to availability'
    ],
  },
  {
    merchantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'), // Fresh Mart
    title: 'Get 5% OFF on Fresh Produce',
    description: 'Save 5% on all fresh fruits and vegetables at Fresh Mart. No minimum spend.',
    offerType: 'generic',
    discountType: 'percentage',
    discountValue: 5,
    validFrom: new Date('2026-04-01T00:00:00Z'),
    validTo: new Date('2026-04-15T23:59:59Z'),
    maxRedemptions: 300,
    currentRedemptions: 132,
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=500&q=80',
    status: 'active',
    category: 'Shops',
    isTrending: false,
    isNew: true,
    impressions: 980,
    saves: 67,
    terms: [
      'Valid on fresh produce section only',
      'Cannot be clubbed with weekly sale'
    ],
  },
  {
    merchantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'), // Green Bakes
    title: 'Flat 15% OFF on Bakery Items',
    description: 'Celebrate the season with 15% off on all bakery items at Green Bakes. Includes cakes, bread, and pastries.',
    offerType: 'generic',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: new Date('2026-04-01T00:00:00Z'),
    validTo: new Date('2026-04-20T23:59:59Z'),
    maxRedemptions: 400,
    currentRedemptions: 189,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
    status: 'active',
    category: 'Cafe',
    isTrending: false,
    isNew: true,
    impressions: 2100,
    saves: 156,
    terms: [
      'Valid on all bakery items',
      'Min purchase ₹150',
      'Cannot be combined with combo deals'
    ],
  },
];

export const seedOffers = async () => {
  try {
    const count = await Offer.countDocuments();
    
    if (count === 0) {
      await Offer.insertMany(offers);
      console.log('✅ Offers seeded successfully');
      return true;
    } else {
      console.log('ℹ️  Offers already exist, skipping seed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error seeding offers:', error.message);
    throw error;
  }
};
