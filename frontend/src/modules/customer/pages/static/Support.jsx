import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PageTransition from '../../components/ui/PageTransition';

const CategoryCard = ({ icon: Icon, title, count, color, bgColor, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all text-left"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-3`}>
      <Icon sx={{ fontSize: 24 }} />
    </div>
    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-xs text-gray-500">{count} articles</p>
  </motion.button>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{question}</span>
        <ExpandMoreRoundedIcon
          className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 text-sm text-gray-600 leading-relaxed"
        >
          {answer}
        </motion.div>
      )}
    </motion.div>
  );
};

const Support = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: LockRoundedIcon, title: 'Account & Login', count: 8, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: LocalOfferRoundedIcon, title: 'Offers & Booking', count: 12, color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: PaymentRoundedIcon, title: 'Payments', count: 6, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: LocationOnRoundedIcon, title: 'Location & Search', count: 5, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { icon: NotificationsRoundedIcon, title: 'Notifications', count: 4, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { icon: BugReportRoundedIcon, title: 'Technical Issues', count: 7, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  const faqs = [
    {
      question: 'How do I sign up for Offerly?',
      answer: 'Download the Offerly app or visit our website. Click on "Sign Up" and enter your phone number. You\'ll receive an OTP to verify your account. Once verified, complete your profile and start exploring offers!'
    },
    {
      question: 'I didn\'t receive my OTP. What should I do?',
      answer: 'First, check if you entered the correct phone number. Wait for 2-3 minutes as there might be a delay. If you still don\'t receive it, click on "Resend OTP". Make sure you have good network connectivity.'
    },
    {
      question: 'How do I book an offer?',
      answer: 'Browse offers on the home page or search for specific categories. Click on an offer to view details. Tap "Book Now" to generate your QR code. Show this QR code to the merchant when you visit their store.'
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel a booking before it\'s redeemed. Go to "My Bookings", select the booking, and tap "Cancel". Once a QR code is scanned by the merchant, it cannot be cancelled.'
    },
    {
      question: 'Do I need to pay online?',
      answer: 'No! Offerly doesn\'t charge you anything online. All payments are made directly to the merchant at the time of service. Generating a QR code is completely free.'
    },
    {
      question: 'My QR code is not working. What should I do?',
      answer: 'Make sure your QR code hasn\'t expired. Check your internet connection. If the issue persists, try refreshing the booking page. Contact the merchant or our support team if the problem continues.'
    },
    {
      question: 'How do I change my location?',
      answer: 'Tap on the location dropdown at the top of the home page. Select your preferred city from the list. The app will show offers available in that location.'
    },
    {
      question: 'Can I use multiple offers at once?',
      answer: 'Generally, only one offer can be used per transaction. However, this depends on the merchant\'s policy. Check the offer terms and conditions for specific details.'
    },
  ];

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
          <h1 className="text-lg font-bold text-gray-900">Support Center</h1>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative">
              <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-xl font-black text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, idx) => (
                <CategoryCard key={idx} {...category} onClick={() => {}} />
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h2 className="text-xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <FAQItem key={idx} {...faq} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">Still Need Help?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/contact')}
                className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 mx-auto">
                  <EmailRoundedIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">Email Support</h3>
                <p className="text-xs text-gray-500 text-center">Get help via email</p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 mx-auto">
                  <PhoneRoundedIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">Call Support</h3>
                <p className="text-xs text-gray-500 text-center">+91 XXXXX XXXXX</p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 mx-auto">
                  <ChatRoundedIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">Live Chat</h3>
                <p className="text-xs text-gray-500 text-center">Chat with us now</p>
              </motion.button>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-center text-white">
            <h3 className="font-bold text-lg mb-2">Can't find what you're looking for?</h3>
            <p className="text-white/90 text-sm mb-4">Our support team is here to help you</p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-primary px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors text-sm"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;
