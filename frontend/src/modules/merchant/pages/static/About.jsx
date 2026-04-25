import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const FeatureCard = ({ icon: Icon, title, description, color, bgColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-4`}>
      <Icon sx={{ fontSize: 24 }} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex gap-4"
  >
    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowBackRoundedIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">About Offerly Business</h1>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1c3e26] text-white px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
          >
            <StorefrontRoundedIcon sx={{ fontSize: 40 }} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black mb-4"
          >
            Grow Your Business with Offerly
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/90 max-w-2xl mx-auto"
          >
            Attract more customers, increase revenue, and build lasting relationships with our powerful merchant platform
          </motion.p>
        </div>
      </div>

      {/* What is Offerly Business */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">What is Offerly Business?</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Offerly Business is a comprehensive merchant platform designed to help local businesses attract new customers, 
            increase foot traffic, and boost revenue through exclusive offers and deals. Join thousands of successful merchants 
            who are growing their business with Offerly.
          </p>
        </motion.div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            <StepCard
              number="1"
              title="Create Your Store Profile"
              description="Set up your business profile with photos, description, and operating hours. Get verified by our team."
            />
            <StepCard
              number="2"
              title="Add Products & Create Offers"
              description="List your products and services, then create attractive offers with discounts to attract customers."
            />
            <StepCard
              number="3"
              title="Customers Book Your Offers"
              description="Customers discover your offers, book them instantly, and receive QR codes for redemption."
            />
            <StepCard
              number="4"
              title="Scan & Fulfill Orders"
              description="Use our QR scanner to verify bookings, fulfill orders, and track your revenue in real-time."
            />
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Why Choose Offerly Business?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={TrendingUpRoundedIcon}
              title="Increase Revenue"
              description="Attract new customers and increase sales with exclusive offers and promotions"
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <FeatureCard
              icon={PeopleRoundedIcon}
              title="Build Customer Base"
              description="Grow your loyal customer base and track customer engagement analytics"
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <FeatureCard
              icon={QrCodeScannerRoundedIcon}
              title="Easy QR Verification"
              description="Quick and secure QR code scanning for instant booking verification"
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <FeatureCard
              icon={LocalOfferRoundedIcon}
              title="Flexible Offers"
              description="Create unlimited offers with custom discounts and validity periods"
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <FeatureCard
              icon={BarChartRoundedIcon}
              title="Real-time Analytics"
              description="Track revenue, bookings, and customer insights with detailed dashboards"
              color="text-indigo-600"
              bgColor="bg-indigo-50"
            />
            <FeatureCard
              icon={VerifiedRoundedIcon}
              title="Verified Platform"
              description="Join a trusted platform with verified merchants and secure transactions"
              color="text-primary"
              bgColor="bg-primary-light"
            />
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-black mb-3">Ready to Grow Your Business?</h2>
          <p className="text-white/90 mb-6">Start attracting more customers and increasing revenue today</p>
          <button
            onClick={() => navigate('/merchant')}
            className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
