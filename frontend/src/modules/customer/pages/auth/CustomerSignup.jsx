import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { authAPI } from '../../../../api/auth.api';
import toast from 'react-hot-toast';
import CleanCard from '../../../../components/auth/CleanCard';
import CleanInput from '../../../../components/auth/CleanInput';
import CleanButton from '../../../../components/auth/CleanButton';
import ProgressBar from '../../../../components/auth/ProgressBar';

// Email validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const CustomerSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('offerly_customer_signup_data');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      address: '',
      profilePhoto: ''
    };
  });

  const [errors, setErrors] = useState({});

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem('offerly_customer_signup_data', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: val });
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleUseLocation = () => {
    setLocationLoading(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Usually we would use a real geocoding API here (e.g. OpenCage, Google Maps API)
            // For now we mock the reverse geocoding to auto-fill address
            setTimeout(() => {
              const mockAddress = `42, MG Road, Golaghat, Assam - 785621, India`;
              setFormData((prev) => ({ ...prev, address: mockAddress }));
              setLocationLoading(false);
              toast.success('Location captured successfully!');
            }, 800);
          } catch (error) {
            setLocationLoading(false);
            toast.error('Could not determine address. Please enter manually.');
          }
        },
        (error) => {
          setLocationLoading(false);
          toast.error('Location access denied. Please enter manually.');
        }
      );
    } else {
      setLocationLoading(false);
      toast.error('Geolocation not supported by your browser');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      toast.success('Photo uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to upload photo');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 13 || age > 100) {
      newErrors.age = 'Age must be between 13 and 100';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }
    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }

    // Store pending registration data
    sessionStorage.setItem('pendingRegistration', JSON.stringify({
      ...formData,
      userType: 'customer'
    }));

    setLoading(true);

    try {
      const response = await authAPI.sendOtp(formData.phone, 'customer', 'register');

      if (response.success) {
        toast.success('OTP sent to your phone');
        navigate('/verify', {
          state: {
            phone: `+91 ${formData.phone}`,
            isNewUser: true,
            userType: 'customer',
            devMode: response.devMode
          }
        });
      }
    } catch (error) {
      toast.error(error.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
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
              Create your account
            </h1>
            <div className="w-12 h-1 bg-primary-700 rounded-full mb-6" />
            <p className="text-lg text-gray-600 leading-relaxed">
              Join thousands of users enjoying exclusive rewards
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-700" />
              </div>
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-700" />
              </div>
              <span>Easy setup process</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-700" />
              </div>
              <span>Instant activation</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Form Card (Full Width on Mobile) */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-20">
        <CleanCard title="Offerly — New Registration" className="max-w-[480px]">
          <div className="p-6 sm:p-8 md:p-10 max-h-[calc(100vh-8rem)] md:max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Answer a few quick questions—we'll handle the rest
            </p>

            {/* Progress Bar */}
            <div className="mb-8">
              <ProgressBar currentStep={1} totalSteps={2} />
            </div>

            <form onSubmit={handleSignup} className="space-y-5">

              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center mb-6">
                <motion.div 
                  className="relative cursor-pointer group" 
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-primary-700 transition-colors">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <PersonRoundedIcon sx={{ fontSize: 32 }} className="text-gray-400 group-hover:text-primary-700 transition-colors" />
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center shadow-sm">
                    <CameraAltRoundedIcon sx={{ fontSize: 14 }} className="text-white" />
                  </div>
                </motion.div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {formData.profilePhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-red-500 hover:text-red-600 mt-2 font-medium"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <CleanInput
                  label="Full Name"
                  icon={PersonRoundedIcon}
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

                {/* Email */}
                <CleanInput
                  label="Email Address"
                  icon={EmailRoundedIcon}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                {/* Phone */}
                <CleanInput
                  label="Mobile Number"
                  icon={PhoneRoundedIcon}
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  placeholder="Enter your mobile number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  error={errors.phone}
                />

                {/* Age & Gender Row */}
                <div className="grid grid-cols-2 gap-4">
                  <CleanInput
                    label="Age"
                    type="number"
                    name="age"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    error={errors.age}
                  />
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full h-12 bg-[#FAFBFC] border rounded-lg px-4 text-[15px] text-gray-900 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all appearance-none cursor-pointer ${errors.gender ? 'border-red-500' : 'border-gray-200'}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.25rem'
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not say</option>
                    </select>
                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.gender}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">
                      Primary Address
                    </label>
                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={locationLoading}
                      className="text-xs text-primary-700 font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
                    >
                      {locationLoading ? (
                        <div className="w-3 h-3 border border-primary-700/40 border-t-primary-700 rounded-full animate-spin" />
                      ) : (
                        <MyLocationRoundedIcon sx={{ fontSize: 14 }} />
                      )}
                      Auto-detect
                    </button>
                  </div>
                  <textarea
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className={`w-full bg-[#FAFBFC] border rounded-lg px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all resize-none ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-100">
                <CleanButton
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Back
                </CleanButton>

                <CleanButton
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  icon={ArrowForwardRoundedIcon}
                  className="w-full sm:flex-1 order-1 sm:order-2"
                >
                  {loading ? 'Processing...' : 'Continue'}
                </CleanButton>
              </div>

            </form>
          </div>
        </CleanCard>
      </div>
    </div>
  );
};

export default CustomerSignup;
