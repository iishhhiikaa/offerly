import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../customer/context/AppContext';
import { getAuthUser, setAuthUser, getAllUsers, lsSet } from '../../customer/data/localStorageUtils';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import toast from 'react-hot-toast';

const MerchantAuth = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
      toast.success('OTP sent to ' + phone);
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      // Logic for prototype: 
      // 1. Check if user with this phone exists in mockUsers.
      // 2. If yes, login.
      // 3. If no, create new 'merchant' type user and login.
      
      const allUsers = getAllUsers();
      let user = allUsers.find(u => u.phone.includes(phone));
      
      if (!user) {
        // Create new merchant user
        user = {
          id: `usr_m_${Date.now()}`,
          name: 'Merchant User', // Placeholder name
          phone: `+91 ${phone}`,
          email: '',
          type: 'merchant',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...allUsers, user];
        // Note: Using lsSet directly because seedIfNeeded might have already run
        localStorage.setItem('offerly_users', JSON.stringify(updatedUsers));
      }

      setAuthUser(user);
      login(user);
      setLoading(false);
      toast.success('Authenticated successfully!');
      
      // Routing logic handled by MerchantApp layout component based on store status
      navigate('/merchant');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">
            OFFERLY<span className="text-primary italic">BIZ</span>
          </h1>
          <p className="text-gray-400 font-medium">Grow your business with smart local offers.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form 
                key="phone-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">
                    Enter Phone Number
                  </label>
                  <div className="relative">
                    <SmartphoneRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{fontSize: 20}} />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98XXXXXX21"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold tracking-widest placeholder:text-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      maxLength={10}
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      GET OTP <ArrowForwardRoundedIcon sx={{fontSize: 20}} />
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">
                  By continuing, you agree to our <span className="text-gray-300">Terms of Service</span>
                </p>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-1">Verify OTP</h2>
                  <p className="text-sm text-gray-400">Sent to +91 {phone}</p>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                          document.getElementById(`otp-${idx - 1}`).focus();
                        }
                      }}
                      className="w-12 h-14 bg-gray-900/50 border border-gray-700 rounded-xl text-center text-xl font-black text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'VERIFY & CONTINUE'
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep('phone')}
                    className="w-full text-gray-400 font-bold text-sm tracking-widest uppercase hover:text-white transition-colors"
                  >
                    Change Phone Number
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MerchantAuth;
