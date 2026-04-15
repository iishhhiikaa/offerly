import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true, unique: true },
  email: { type: String, trim: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['customer', 'merchant', 'admin'], default: 'customer' },
  status: { type: String, default: 'active' },
  isProfileComplete: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@offerly.com';
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

  const existing = await User.findOne({ email, role: 'admin' });
  if (existing) {
    console.log('Admin user already exists:', existing._id);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name: 'Admin User',
    email,
    phone: '0000000000',
    password: hashedPassword,
    role: 'admin',
    status: 'active',
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('   ID:', admin._id);

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
