import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import PageTransition from '../../customer/components/ui/PageTransition';
import CleanCard from '../../../components/auth/CleanCard';
import CleanInput from '../../../components/auth/CleanInput';
import CleanButton from '../../../components/auth/CleanButton';
import { authAPI } from '../../../api/auth.api';
import toast from 'react-hot-toast';

const countryCodes = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
];

const MerchantLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(() => localStorage.getItem('offerly_merchant_login_phone') || '');
  const [countryCode, setCountryCode] = useState(() => localStorage.getItem('offerly_merchant_login_country') || '+91');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem('offerly_merchant_login_phone', phone);
    localStorage.setItem('offerly_merchant_login_country', countryCode);
  }, [phone, countryCode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.sendOtp(phone, 'merchant', 'login');
      
      if (response.success) {
        toast.success('OTP sent successfully');
        navigate('/merchant/verify', { 
          state: { 
            phone: `${countryCode} ${phone}`, 
            isNewUser: false, 
            userType: 'merchant',
            devMode: response.devMode
          } 
        });
      }
    } catch (error) {
      console.error('Merchant Login error:', error);
      const errorMessage = typeof error === 'object' ? error.error : error;
      
      if (errorMessage === 'Account not found for this role') {
        setError('Business account not found. Please register first.');
        toast.error('No merchant account found for this number.');
      } else {
        setError(errorMessage || 'Failed to send OTP. Please try again.');
        toast.error(errorMessage || 'Failed to send OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Shared Form Component ──────────────────── */
  const renderLoginForm = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-500">Enter your phone number to access your dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Phone input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-12 bg-[#FAFBFC] border border-gray-200 rounded-lg px-3 text-sm text-gray-900 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>

            <CleanInput
              icon={SmartphoneRoundedIcon}
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(val);
                if (error) setError('');
              }}
              error={error}
              className="flex-1"
            />
          </div>
        </div>

        {/* CTA */}
        <CleanButton
          type="submit"
          disabled={isLoading || phone.length < 10}
          loading={isLoading}
          icon={ArrowForwardRoundedIcon}
          className="w-full"
        >
          Get OTP
        </CleanButton>
      </form>

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-500">Don't have an account? </span>
        <button
          onClick={() => navigate('/merchant/signup')}
          className="text-sm text-primary-700 font-semibold hover:text-primary-800 transition-colors"
        >
          Create Business
        </button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      {/* ─── Mobile View (Form Only) ─────────────────────────── */}
      <div className="md:hidden min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6">
        <div className="w-full">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-700/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <StorefrontRoundedIcon sx={{ fontSize: 24 }} className="text-primary-700" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              OFFERLY<span className="text-primary-700">BIZ</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Merchant Dashboard</p>
          </div>

          <CleanCard showHeader={false}>
            <div className="p-8">
              {renderLoginForm()}
            </div>
          </CleanCard>
        </div>
      </div>

      {/* ─── Desktop View (Split Layout) ─────────── */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Panel — Hero Text */}
        <div className="w-1/2 bg-primary-700 flex flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0yLTJ2LTJoLTJ2Mmgyem0tMiAwdi0yaC0ydjJoMnptLTItMnYtMmgtMnYyaDJ6bTItNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTItMnYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 text-center max-w-md"
          >
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              OFFERLY<span className="text-primary-300">BIZ</span>
            </h1>
            <p className="text-white/70 text-sm mb-12">Merchant Dashboard</p>
            
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              src="/merchant-auth-illustration.png"
              alt="Offerly Business"
              className="w-80 h-80 object-contain mx-auto mb-12 drop-shadow-2xl"
            />

            <h2 className="text-3xl font-bold text-white mb-4">Grow Your Business</h2>
            <p className="text-white/70 text-base leading-relaxed">
              Manage offers, track bookings, and grow your customer base — all from one powerful dashboard.
            </p>
          </motion.div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-1/2 bg-[#FAFBFC] flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            {renderLoginForm()}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchantLogin;
