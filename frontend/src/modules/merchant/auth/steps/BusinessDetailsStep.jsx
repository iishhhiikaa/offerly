import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CleanCard from '../../../../components/auth/CleanCard';
import CleanInput from '../../../../components/auth/CleanInput';
import CleanButton from '../../../../components/auth/CleanButton';
import { categoryAPI } from '../../../../api/category.api';
import toast from 'react-hot-toast';

const BusinessDetailsStep = ({ data, onSubmit, onBack, loading }) => {
  const logoInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    storeName: data.storeName || '',
    category: data.category || '',
    description: data.description || '',
    businessEmail: data.businessEmail || '',
    businessPhone: data.businessPhone || '',
    logo: data.logo || '',
    photos: data.photos || []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, businessPhone: val });
    if (errors.businessPhone) {
      setErrors({ ...errors, businessPhone: '' });
    }
  };

  const [uploading, setUploading] = useState({});

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should be less than 2MB');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, logo: true }));
      // Show instant preview via base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);

      // Upload to server and replace with URL
      const { uploadAPI } = await import('../../../../api/upload.api');
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = response?.url || response;
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo. Please try again.');
      setFormData(prev => ({ ...prev, logo: '' }));
    } finally {
      setUploading(prev => ({ ...prev, logo: false }));
    }
  };

  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.photos.length + files.length > 4) {
      toast.error('Maximum 4 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 2MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploading(prev => ({ ...prev, photos: true }));
      const { uploadAPI } = await import('../../../../api/upload.api');
      
      const uploadedUrls = [];
      for (const file of validFiles) {
        const response = await uploadAPI.uploadImage(file);
        const imageUrl = response?.url || response;
        uploadedUrls.push(imageUrl);
      }

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls]
      }));
      toast.success(`${uploadedUrls.length} photo(s) uploaded!`);
    } catch (error) {
      console.error('Photos upload error:', error);
      toast.error('Failed to upload some photos');
    } finally {
      setUploading(prev => ({ ...prev, photos: false }));
    }
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index)
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.storeName || formData.storeName.trim().length < 3) {
      newErrors.storeName = 'Business name must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a business category';
    }

    // Word count validation for description
    const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (!formData.description || wordCount < 10) {
      newErrors.description = 'Description must be at least 10 words';
    } else if (wordCount > 50) {
      newErrors.description = 'Description must not exceed 50 words';
    }

    if (!formData.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid business email';
    }

    if (!formData.businessPhone || formData.businessPhone.length !== 10) {
      newErrors.businessPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.logo) {
      newErrors.logo = 'Please upload a business logo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isValid = validate();
    
    if (!isValid) {
      toast.error('Please fix the errors');
      return;
    }

    onSubmit(formData);
  };

  return (
    <CleanCard title="Offerly — Business Details" showHeader={false} className="mx-auto">
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Business Details
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Tell us about your business
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Logo */}
          <div className="flex flex-col items-center mb-6">
            <motion.div 
              className="relative cursor-pointer group" 
              onClick={() => logoInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-primary-700 transition-colors">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <StorefrontRoundedIcon sx={{ fontSize: 40 }} className="text-gray-400 group-hover:text-primary-700 transition-colors" />
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center shadow-sm">
                <CameraAltRoundedIcon sx={{ fontSize: 16 }} className="text-white" />
              </div>
            </motion.div>
            
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500 mt-2">Business Logo (Required)</p>
            {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
          </div>

          {/* Business Name */}
          <CleanInput
            label="Business Name"
            icon={StorefrontRoundedIcon}
            type="text"
            name="storeName"
            placeholder="e.g., FitZone Gym & Fitness"
            value={formData.storeName}
            onChange={handleChange}
            error={errors.storeName}
            helperText="This name will be shown to consumers"
          />

          {/* Business Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Business Category
            </label>
            <div className="relative">
              <CategoryRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" sx={{ fontSize: 20 }} />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full h-12 bg-[#FAFBFC] border rounded-lg pl-12 pr-4 text-[15px] text-gray-900 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all appearance-none cursor-pointer ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem'
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-xs text-red-500 mt-1.5">{errors.category}</p>}
            <p className="text-xs text-gray-500 mt-1.5">⚠️ Category cannot be changed later</p>
          </div>

          {/* Business Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your business, services, and what makes you unique..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full bg-[#FAFBFC] border rounded-lg px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1.5">{errors.description}</p>}
            <p className="text-xs text-gray-500 mt-1.5">
              {formData.description.trim().split(/\s+/).filter(word => word.length > 0).length}/50 words (min 10)
            </p>
          </div>

          {/* Business Email */}
          <CleanInput
            label="Business Email"
            icon={EmailRoundedIcon}
            type="email"
            name="businessEmail"
            placeholder="contact@yourbusiness.com"
            value={formData.businessEmail}
            onChange={handleChange}
            error={errors.businessEmail}
            helperText="Can be different from account email"
          />

          {/* Business Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            <div className="flex gap-2">
              <div className="h-12 bg-[#FAFBFC] border border-gray-200 rounded-lg px-3 flex items-center justify-center text-sm font-medium text-gray-600">
                +91
              </div>
              <CleanInput
                icon={PhoneRoundedIcon}
                type="tel"
                inputMode="numeric"
                name="businessPhone"
                placeholder="98765 43210"
                value={formData.businessPhone}
                onChange={handlePhoneChange}
                error={errors.businessPhone}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Consumers will call this number</p>
          </div>

          {/* Business Photos (Optional) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Business Photos (Optional)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-xs">×</span>
                  </button>
                </div>
              ))}
              
              {formData.photos.length < 4 && (
                <button
                  type="button"
                  onClick={() => photosInputRef.current?.click()}
                  className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary-700 transition-colors"
                >
                  <span className="text-gray-400 text-2xl">+</span>
                </button>
              )}
            </div>
            <input
              ref={photosInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1.5">Max 4 photos, 2MB each</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <CleanButton
              type="button"
              variant="secondary"
              onClick={onBack}
              icon={ArrowBackRoundedIcon}
              iconPosition="left"
            >
              Back
            </CleanButton>

            <CleanButton
              type="submit"
              disabled={loading}
              loading={loading}
              icon={ArrowForwardRoundedIcon}
              className="flex-1"
            >
              Continue to Documents
            </CleanButton>
          </div>
        </form>
      </div>
    </CleanCard>
  );
};

export default BusinessDetailsStep;
