import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import WcRoundedIcon from '@mui/icons-material/WcRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { authAPI } from '../../../api/auth.api';
import { categoryAPI } from '../../../api/category.api';
import toast from 'react-hot-toast';
import PageTransition from '../../customer/components/ui/PageTransition';

// Email validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const MerchantSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('offerly_merchant_signup_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved signup data', e);
      }
    }
    return {
      name: '',
      email: '',
      phone: '',
      businessType: '',
      age: '',
      gender: '',
      address: '',
      profilePhoto: ''
    };
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem('offerly_merchant_signup_data', JSON.stringify(formData));
  }, [formData]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const [errors, setErrors] = useState({});

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
            setTimeout(() => {
              const mockAddress = `Shop 12, Main Street, Golaghat, Assam - 785621, India`;
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

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
    if (!formData.businessType) {
      newErrors.businessType = 'Please select a business category';
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

    sessionStorage.setItem('pendingRegistration', JSON.stringify({
      ...formData,
      userType: 'merchant'
    }));

    setLoading(true);

    try {
      const response = await authAPI.sendOtp(formData.phone, 'merchant', 'register');

      if (response.success) {
        toast.success('OTP sent to your phone');
        navigate('/merchant/verify', {
          state: {
            phone: `+91 ${formData.phone}`,
            isNewUser: true,
            userType: 'merchant',
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

  const renderSignupForm = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <div className="md:hidden flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <StorefrontRoundedIcon sx={{ fontSize: 24 }} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-extrabold text-gray-900 tracking-tight uppercase">
              OFFERLY<span className="text-primary italic">BIZ</span>
            </h1>
          </div>
        </div>

        <h2 className="text-heading font-display font-bold text-gray-900">Sign Up ✨</h2>
        <p className="text-text-secondary text-sm mt-1 mb-6">Create a business account</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4 pb-12 md:pb-0">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <PersonRoundedIcon sx={{ fontSize: 40 }} className="text-primary/40" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
            >
              <CameraAltRoundedIcon sx={{ fontSize: 14 }} className="text-white" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          {formData.profilePhoto && (
            <button type="button" onClick={handleRemovePhoto} className="text-xs text-accent-rose hover:text-rose-600 mt-2 font-medium">Remove Photo</button>
          )}
          <p className="text-xs text-text-secondary mt-1.5">Optional</p>
        </div>

        {/* Inputs */}
        <div>
          <label className="merchant-label">Owner Name</label>
          <div className="relative">
            <PersonRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className={`merchant-input-with-icon ${errors.name ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`} />
          </div>
          {errors.name && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.name}</p>}
        </div>

        <div>
          <label className="merchant-label">Business Email</label>
          <div className="relative">
            <EmailRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
            <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className={`merchant-input-with-icon ${errors.email ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`} />
          </div>
          {errors.email && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.email}</p>}
        </div>

        <div>
          <label className="merchant-label">Business Category *</label>
          <div className="relative">
            <CategoryRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" sx={{ fontSize: 20 }} />
            <select name="businessType" value={formData.businessType} onChange={handleChange} className={`merchant-input-with-icon appearance-none cursor-pointer ${errors.businessType ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          {errors.businessType && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.businessType}</p>}
        </div>

        <div>
          <label className="merchant-label">Phone Number</label>
          <div className="relative flex gap-2">
            <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-3 py-3.5 flex items-center justify-center text-sm font-medium text-gray-600">
               +91
            </div>
            <div className="relative flex-1">
              <PhoneRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
              <input type="tel" inputMode="numeric" name="phone" placeholder="98765 43210" value={formData.phone} onChange={handlePhoneChange} className={`merchant-input-with-icon ${errors.phone ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`} />
            </div>
          </div>
          {errors.phone && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="merchant-label">Age</label>
            <div className="relative">
              <CakeRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
              <input type="number" name="age" placeholder="25" value={formData.age} onChange={handleChange} className={`merchant-input-with-icon ${errors.age ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`} />
            </div>
            {errors.age && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.age}</p>}
          </div>
          <div>
            <label className="merchant-label">Gender</label>
            <div className="relative">
              <WcRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" sx={{ fontSize: 20 }} />
              <select name="gender" value={formData.gender} onChange={handleChange} className={`merchant-input-with-icon appearance-none cursor-pointer ${errors.gender ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {errors.gender && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.gender}</p>}
          </div>
        </div>

        <div className="pt-2">
          <label className="merchant-label">Business Address</label>
          <div className="relative">
            <LocationOnRoundedIcon className="absolute left-4 top-3.5 text-gray-400" sx={{ fontSize: 20 }} />
            <textarea name="address" placeholder="E.g. Shop No, Street, City, State, Pincode" value={formData.address} onChange={handleChange} rows="3" className={`w-full bg-white border-2 border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors resize-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.address ? 'border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/10' : ''}`} />
          </div>
          {errors.address && <p className="text-xs text-accent-rose mt-1 pl-1">{errors.address}</p>}

          <button type="button" onClick={handleUseLocation} disabled={locationLoading} className="mt-2 text-primary font-semibold text-xs flex items-center gap-1 hover:text-primary-dark transition-colors">
            {locationLoading ? <div className="w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" /> : <MyLocationRoundedIcon sx={{ fontSize: 14 }} />}
            Use Current Location
          </button>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-merchant w-full !py-4 !text-base mt-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><span>CONTINUE</span><ArrowForwardRoundedIcon sx={{ fontSize: 18 }} /></>}
        </motion.button>
      </form>

      <div className="mt-6 text-center pb-8 md:pb-0">
        <span className="text-sm text-text-secondary">Already have an account? </span>
        <button type="button" onClick={() => navigate('/merchant/login')} className="text-sm text-primary font-bold hover:text-primary-dark transition-colors">
          Login
        </button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      {/* ─── Mobile View ─────────────────────────── */}
      <div className="md:hidden min-h-screen flex flex-col bg-merchant-bg">
        <div className="gradient-hero-green rounded-b-[40px] px-6 pt-12 pb-24 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            src="/merchant-auth-illustration.png" alt="Offerly Biz" className="w-40 h-40 object-contain drop-shadow-xl"
          />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 px-5 -mt-16 relative z-10 w-full mb-8">
          <div className="bg-white rounded-3xl shadow-card-elevated p-6 border border-gray-100/50">
            {renderSignupForm()}
          </div>
        </motion.div>
      </div>

      {/* ─── Desktop View ────────────────────────── */}
      <div className="hidden md:flex min-h-screen">
        <div className="w-1/2 gradient-hero-green flex flex-col items-center justify-center p-12 relative overflow-hidden sticky top-0 h-screen">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 text-center max-w-md">
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight uppercase mb-2">OFFERLY<span className="text-primary-300 italic">BIZ</span></h1>
            <p className="text-white/60 text-sm mb-10">Merchant Onboarding</p>
            <motion.img src="/merchant-auth-illustration.png" alt="Onboarding" className="w-72 h-72 object-contain mx-auto mb-10 drop-shadow-2xl animate-float" />
            <h2 className="text-2xl font-bold text-white mb-3">Partner with Us</h2>
            <p className="text-white/60 text-sm leading-relaxed">Create your merchant account today to start reaching thousands of active local customers.</p>
          </div>
        </div>

        <div className="w-1/2 bg-white flex justify-center p-12 overflow-y-auto min-h-screen">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full h-fit my-auto max-w-md py-12">
            {renderSignupForm()}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchantSignup;
