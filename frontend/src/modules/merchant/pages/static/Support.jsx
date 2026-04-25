import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900 pr-4">{question}</span>
        <ExpandMoreRoundedIcon
          className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          sx={{ fontSize: 24 }}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </motion.div>
  );
};

const CategoryCard = ({ icon: Icon, title, description, color, bgColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-4`}>
      <Icon sx={{ fontSize: 24 }} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </motion.div>
);

const Support = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How do I scan customer QR codes?",
      answer: "Go to 'Verify QR' from your dashboard or sidebar. Allow camera access, then point your camera at the customer's QR code. The system will automatically verify and process the booking."
    },
    {
      question: "How do I create a new offer?",
      answer: "Navigate to 'Active Offers' and click 'Create New Offer'. Select products, set discount percentage, validity period, and terms. Your offer will be live once you publish it."
    },
    {
      question: "When do I receive payments?",
      answer: "Payments are processed weekly. All bookings fulfilled during the week are settled to your registered bank account every Monday. You can track pending settlements in your dashboard."
    },
    {
      question: "How can I update my store information?",
      answer: "Go to Settings > Store Profile to update your store name, description, photos, operating hours, and contact information. Changes are reflected immediately on the platform."
    },
    {
      question: "What if a customer doesn't show up?",
      answer: "Bookings automatically expire after 24 hours if not redeemed. You can also manually cancel expired bookings from the 'Live Bookings' section."
    },
    {
      question: "How do I handle customer complaints?",
      answer: "Contact our merchant support team immediately at merchant-support@offerly.com or call +91 1800-OFFERLY. We'll help resolve the issue and maintain your store's reputation."
    },
    {
      question: "Can I pause my store temporarily?",
      answer: "Yes, you can temporarily deactivate your store from Settings. Your subscription will continue, but customers won't be able to book new offers until you reactivate."
    },
    {
      question: "How do I upgrade my subscription plan?",
      answer: "Go to Settings > Subscription and select 'Upgrade Plan'. Choose your desired plan and complete the payment. Your new benefits will be active immediately."
    },
    {
      question: "What happens if my subscription expires?",
      answer: "Your store will be temporarily deactivated. Existing bookings remain valid, but new bookings are paused. Renew your subscription to reactivate your store."
    },
    {
      question: "How can I improve my store rating?",
      answer: "Provide excellent service, honor all offers, maintain quality, respond to reviews professionally, and ensure accurate product descriptions. Happy customers leave better reviews!"
    }
  ];

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
        <h1 className="text-lg font-bold text-gray-900">Support Center</h1>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1c3e26] text-white px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
          >
            <HelpRoundedIcon sx={{ fontSize: 40 }} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black mb-4"
          >
            How Can We Help You?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/90 max-w-2xl mx-auto"
          >
            Find answers to common questions and learn how to make the most of Offerly Business
          </motion.p>
        </div>
      </div>

      {/* Help Categories */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <CategoryCard
            icon={QrCodeScannerRoundedIcon}
            title="QR Scanning"
            description="Learn how to verify customer bookings"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <CategoryCard
            icon={LocalOfferRoundedIcon}
            title="Offers & Products"
            description="Create and manage your offers"
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <CategoryCard
            icon={PaymentRoundedIcon}
            title="Payments & Billing"
            description="Understand payments and subscriptions"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <CategoryCard
            icon={StorefrontRoundedIcon}
            title="Store Management"
            description="Update your store profile and settings"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <CategoryCard
            icon={TrendingUpRoundedIcon}
            title="Analytics & Reports"
            description="Track your performance and revenue"
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <CategoryCard
            icon={SettingsRoundedIcon}
            title="Account Settings"
            description="Manage your merchant account"
            color="text-gray-600"
            bgColor="bg-gray-50"
          />
        </div>

        {/* FAQs */}
        <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-black mb-3">Still Need Help?</h2>
          <p className="text-white/90 mb-6">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/merchant/contact')}
              className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => window.open('tel:+911800OFFERLY')}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border-2 border-white/30"
            >
              Call Us Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
