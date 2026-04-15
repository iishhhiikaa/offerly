import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import OtpInput from '../../components/ui/OtpInput';
import { useApp } from '../../context/AppContext';
import { authAPI } from '../../../../api/auth.api';
import { storage } from '../../../../utils/storage';
import toast from 'react-hot-toast';
import CleanCard from '../../../../components/auth/CleanCard';
import CleanButton from '../../../../components/auth/CleanButton';

const OTP_DURATION = 300; // 5 minutes
const RESEND_COOLDOWN = 30;

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const phone = location.state?.phone;
  const isNewUser = location.state?.isNewUser;
  const userType = location.state?.userType || 'customer';
  const devMode = location.state?.devMode || false;

  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // Redirect if state is missing (e.g. on page refresh)
  useEffect(() => {
    if (!phone) {
      toast.error('Session lost. Please try again.');
      navigate(userType === 'merchant' ? '/merchant/login' : '/login');
    }
  }, [phone, navigate, userType]);

  // OTP countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setError('OTP expired. Please request a new one.');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleOtpComplete = async (otp) => {
    if (attempts >= 3) {
      setError('Too many attempts. Please request a new OTP.');
      return;
    }

    setIsVerifying(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const action = isNewUser ? 'register' : 'login';
      
      // Step 1: Verify OTP
      const verifyResponse = await authAPI.verifyOtp(cleanPhone, userType, action, otp);

      if (verifyResponse.success) {
        if (isNewUser) {
          // Step 2: For new users, register with the verification token
          const pendingData = JSON.parse(sessionStorage.getItem('pendingRegistration') || '{}');
          
          if (!pendingData.name) {
            toast.error('Registration data not found. Please try again.');
            navigate(userType === 'customer' ? '/signup' : '/merchant/signup');
            return;
          }

          const registerFn = userType === 'customer' ? authAPI.registerCustomer : authAPI.registerMerchant;
          const registerResponse = await registerFn(verifyResponse.verificationToken, {
            ...pendingData,
            phone: cleanPhone
          });

          if (registerResponse.success) {
            // Store token and user data
            storage.setToken(registerResponse.token);
            storage.setUser(registerResponse.user);
            
            // Update app context
            login(registerResponse.user);

            // Clear pending data
            sessionStorage.removeItem('pendingRegistration');

            toast.success('Account created successfully!');

            // Navigate based on user type
            if (userType === 'customer') {
              navigate('/home');
            } else {
              // New merchant should go to store registration
              navigate('/merchant/register');
            }
          }
        } else {
          // Existing user - login complete after OTP verification
          // Store token and user data
          storage.setToken(verifyResponse.token);
          storage.setUser(verifyResponse.user);
          
          // Update app context
          login(verifyResponse.user);

          toast.success('Login successful!');

          // Navigate based on user type
          if (userType === 'customer') {
            navigate('/home');
          } else {
            navigate('/merchant');
          }
        }
      }
    } catch (error) {
      setAttempts((a) => a + 1);
      setError(error.error || `Incorrect OTP. ${3 - attempts - 1} attempt(s) left.`);
      setResetKey((k) => k + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setAttempts(0);
    setResetKey((k) => k + 1);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const action = isNewUser ? 'register' : 'login';
      
      const response = await authAPI.sendOtp(cleanPhone, userType, action);
      
      if (response.success) {
        setTimeLeft(OTP_DURATION);
        setResendCooldown(RESEND_COOLDOWN);
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      toast.error(error.error || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
      <CleanCard title="Offerly — Verification" className="max-w-md">
        <div className="p-8 sm:p-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(userType === 'customer' ? '/login' : '/merchant/login')}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 20 }} className="text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                {userType === 'merchant' ? (
                  <StorefrontRoundedIcon sx={{ fontSize: 18 }} className="text-primary-700" />
                ) : (
                  <CardGiftcardRoundedIcon sx={{ fontSize: 18 }} className="text-primary-700" />
                )}
              </div>
              <span className="font-semibold text-gray-900">offerly</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verify your phone
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            We sent a code to <span className="font-semibold text-gray-900">{phone}</span>
          </p>

          {devMode && (
            <p className="text-xs text-primary-700 bg-primary-50 px-3 py-2 rounded-lg mb-6 font-medium">
              Dev Mode: Use 123456
            </p>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <OtpInput length={6} onComplete={handleOtpComplete} onReset={resetKey} />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-4 text-center"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              {timeLeft > 0 ? (
                <>Expires in <span className="font-semibold text-gray-900">{formatTime(timeLeft)}</span></>
              ) : (
                <span className="text-red-500 font-medium">OTP expired</span>
              )}
            </p>
          </div>

          {/* Verify Button */}
          <CleanButton
            disabled={isVerifying}
            loading={isVerifying}
            className="w-full mb-6"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </CleanButton>

          {/* Resend */}
          <div className="text-center text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-semibold transition-colors ${
                resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-700 hover:underline'
              }`}
            >
              {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </CleanCard>
    </div>
  );
};

export default OtpVerify;
