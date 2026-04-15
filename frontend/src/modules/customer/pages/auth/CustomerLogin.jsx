import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { authAPI } from '../../../../api/auth.api';
import toast from 'react-hot-toast';
import CleanCard from '../../../../components/auth/CleanCard';
import CleanButton from '../../../../components/auth/CleanButton';

const countryCodes = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
];

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(() => localStorage.getItem('offerly_login_phone') || '');
  const [countryCode, setCountryCode] = useState(() => localStorage.getItem('offerly_login_country') || '+91');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem('offerly_login_phone', phone);
    localStorage.setItem('offerly_login_country', countryCode);
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
      const response = await authAPI.sendOtp(phone, 'customer', 'login');

      if (response.success) {
        toast.success('OTP sent successfully');
        navigate('/verify', {
          state: {
            phone: `${countryCode} ${phone}`,
            isNewUser: false,
            userType: 'customer',
            devMode: response.devMode
          }
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = typeof error === 'object' ? error.error : error;

      if (errorMessage === 'Account not found for this role') {
        setError('Account not found. Please sign up first.');
        toast.error('No account found for this number.');
      } else {
        setError(errorMessage || 'Failed to send OTP. Please try again.');
        toast.error(errorMessage || 'Failed to send OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col md:flex-row">
      
      {/* Left Column - Hero Text (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-10 md:px-16 lg:px-24 py-20">
        <motion.div 
          className="max-w-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
              Welcome back
            </h1>
            <div className="w-12 h-1 bg-primary-700 rounded-full mb-6" />
            <p className="text-lg text-gray-600 leading-relaxed">
              Sign in to continue to your account
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-700" />
              </div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-700" />
              </div>
              <span>Instant activation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-700" />
              </div>
              <span>24/7 support</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Form Card (Full Width on Mobile) */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-20">
        <CleanCard title="Offerly — Secure Access">
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Enter your mobile number to access your account
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <div className="flex gap-0 relative rounded-lg border bg-[#FAFBFC] focus-within:bg-white focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-700/10 overflow-hidden transition-all duration-200 border-gray-200">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent px-3 py-3 text-sm font-medium text-gray-700 w-20 flex-shrink-0 focus:outline-none border-r border-gray-200"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <SmartphoneRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                        if (error) setError('');
                      }}
                      className="w-full h-full bg-transparent py-3 pl-10 pr-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <CleanButton
                type="submit"
                disabled={isLoading || phone.length < 10}
                loading={isLoading}
                icon={ArrowForwardRoundedIcon}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Continue'}
              </CleanButton>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-primary-700 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </CleanCard>
      </div>
    </div>
  );
};

export default CustomerLogin;
