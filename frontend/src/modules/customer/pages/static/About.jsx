import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import PageTransition from '../../components/ui/PageTransition';

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

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowBackRoundedIcon />
          </button>
          <h1 className="text-lg font-bold text-gray-900">About Offerly</h1>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1c3e26] text-white px-4 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
            >
              <CardGiftcardRoundedIcon sx={{ fontSize: 40 }} className="text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black mb-4"
            >
              Discover Amazing Deals Near You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/90 max-w-2xl mx-auto"
            >
              Save money on your favorite local services and support businesses in your community
            </motion.p>
          </div>
        </div>

        {/* What is Offerly */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">What is Offerly?</h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Offerly is your go-to platform for discovering exclusive deals and offers from local businesses. 
              Whether you're looking for dining, shopping, wellness, or entertainment, we help you save money 
              while supporting your favorite local spots.
            </p>
          </motion.div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">How It Works</h2>
            <div className="space-y-6">
              <StepCard
                number="1"
                title="Browse Offers Near You"
                description="Explore exclusive deals from verified local businesses in your area. Filter by category, distance, and discount amount."
              />
              <StepCard
                number="2"
                title="Book Your Favorite Deal"
                description="Select an offer and generate your booking QR code instantly. No online payment required!"
              />
              <StepCard
                number="3"
                title="Show QR Code at Store"
                description="Visit the merchant, show your QR code, and enjoy your discount. Pay directly at the store."
              />
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Why Choose Offerly?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={LocalOfferRoundedIcon}
                title="Exclusive Deals"
                description="Access special offers you won't find anywhere else, up to 50% off"
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
              <FeatureCard
                icon={LocationOnRoundedIcon}
                title="Location-Based"
                description="Find the best deals near you with smart location-based recommendations"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <FeatureCard
                icon={SavingsRoundedIcon}
                title="Save Money"
                description="Save up to 50% on dining, shopping, wellness, and entertainment"
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <FeatureCard
                icon={QrCodeScannerRoundedIcon}
                title="Instant Booking"
                description="Generate QR codes instantly and redeem offers without hassle"
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <FeatureCard
                icon={VerifiedRoundedIcon}
                title="Verified Merchants"
                description="All businesses are verified to ensure quality and authenticity"
                color="text-primary"
                bgColor="bg-primary-light"
              />
              <FeatureCard
                icon={SearchRoundedIcon}
                title="Easy Discovery"
                description="Smart search and filters help you find exactly what you're looking for"
                color="text-indigo-600"
                bgColor="bg-indigo-50"
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
            <h2 className="text-2xl font-black mb-3">Ready to Start Saving?</h2>
            <p className="text-white/90 mb-6">Join thousands of users discovering amazing deals every day</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Explore Offers
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
