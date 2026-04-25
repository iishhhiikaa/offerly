import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const ContactCard = ({ icon: Icon, title, content, action, color, bgColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-4`}>
      <Icon sx={{ fontSize: 24 }} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{content}</p>
    {action && (
      <button className={`text-sm font-bold ${color} hover:underline`}>
        {action}
      </button>
    )}
  </motion.div>
);

const Contact = () => {
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
        <h1 className="text-lg font-bold text-gray-900">Contact Us</h1>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-[#1c3e26] text-white px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
          >
            <SupportAgentRoundedIcon sx={{ fontSize: 40 }} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black mb-4"
          >
            We're Here to Help
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/90 max-w-2xl mx-auto"
          >
            Have questions about your merchant account? Our dedicated support team is ready to assist you
          </motion.p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <ContactCard
            icon={EmailRoundedIcon}
            title="Email Support"
            content="merchant-support@offerly.com"
            action="Send Email →"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <ContactCard
            icon={PhoneRoundedIcon}
            title="Phone Support"
            content="+91 1800-OFFERLY (24/7)"
            action="Call Now →"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <ContactCard
            icon={WhatsAppIcon}
            title="WhatsApp Business"
            content="+91 98765-43210"
            action="Chat on WhatsApp →"
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <ContactCard
            icon={LocationOnRoundedIcon}
            title="Office Address"
            content="123 Business Park, Tech City, India - 560001"
            action="Get Directions →"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Business Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AccessTimeRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Business Hours</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Monday - Friday</span>
              <span className="font-bold text-gray-900">9:00 AM - 8:00 PM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Saturday</span>
              <span className="font-bold text-gray-900">10:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sunday</span>
              <span className="font-bold text-gray-900">Closed</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Emergency support available 24/7 via phone and WhatsApp
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-black mb-3">Need Immediate Help?</h2>
          <p className="text-white/90 mb-6">Check out our support center for instant answers</p>
          <button
            onClick={() => navigate('/merchant/support')}
            className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Visit Support Center
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
