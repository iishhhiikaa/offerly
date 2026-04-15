import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import toast from 'react-hot-toast';

// Category Behaviour Configuration
const CATEGORY_BEHAVIOURS = {
  // Product-based categories (need product catalogue)
  'Food': { type: 'product_based', icon: '🍔', showVeg: true, showDuration: false },
  'Grocery': { type: 'product_based', icon: '🛒', showVeg: false, showDuration: false },
  'Pharmacy': { type: 'product_based', icon: '💊', showVeg: false, showDuration: false },
  'Electronics': { type: 'product_based', icon: '📱', showVeg: false, showDuration: false },
  'Fashion': { type: 'product_based', icon: '👕', showVeg: false, showDuration: false },
  'Beauty': { type: 'product_based', icon: '💄', showVeg: false, showDuration: false },
  
  // Service-based categories (no product catalogue, offer IS the product)
  'Gym': { type: 'service_based', icon: '💪', showVeg: false, showDuration: true, requiresBooking: true },
  'Hotel': { type: 'service_based', icon: '🏨', showVeg: false, showDuration: true, requiresBooking: true },
  'Spa': { type: 'service_based', icon: '🧖', showVeg: false, showDuration: true, requiresBooking: true },
  'Salon': { type: 'service_based', icon: '💇', showVeg: false, showDuration: true, requiresBooking: false },
  'Tours': { type: 'service_based', icon: '🗺️', showVeg: false, showDuration: true, requiresBooking: true },
};

const getCategoryBehaviour = (category) => {
  return CATEGORY_BEHAVIOURS[category] || CATEGORY_BEHAVIOURS['Food'];
};

const AddProductModal = ({ isOpen, onClose, merchant, editingProduct, onSave }) => {
  const behaviour = getCategoryBehaviour(merchant?.category);
  const isProductBased = behaviour.type === 'product_based';
  const isServiceBased = behaviour.type === 'service_based';

  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    
    // Product-based specific
    category: '',
    isVeg: false,
    stock: '',
    sku: '',
    
    // Service-based specific
    duration: '30 mins',
    inclusions: [''],
    maxBookings: '',
    validityDays: '30',
    
    // Image fields (NEW)
    images: [],
    imagePreview: null,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({ ...editingProduct });
    } else {
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        offerPrice: '',
        category: '',
        isVeg: false,
        stock: '',
        sku: '',
        duration: '30 mins',
        inclusions: [''],
        maxBookings: '',
        validityDays: '30',
        images: [],
        imagePreview: null,
      });
    }
    // Reset saving state when modal opens/closes
    setIsSaving(false);
    setUploadingImage(false);
  }, [editingProduct, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Upload to server
      const { uploadAPI } = await import('../../../api/upload.api');
      const response = await uploadAPI.uploadImage(file);
      
      // Response structure: { success: true, url: "...", publicId: "..." }
      const imageUrl = response?.url || response;
      
      setFormData(prev => ({
        ...prev,
        images: [imageUrl]
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      setFormData(prev => ({
        ...prev,
        imagePreview: null,
        images: []
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [],
      imagePreview: null
    }));
  };

  const handleInclusionChange = (index, value) => {
    const newInclusions = [...formData.inclusions];
    newInclusions[index] = value;
    setFormData(prev => ({ ...prev, inclusions: newInclusions }));
  };

  const addInclusion = () => {
    setFormData(prev => ({ ...prev, inclusions: [...prev.inclusions, ''] }));
  };

  const removeInclusion = (index) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    if (!formData.offerPrice || parseFloat(formData.offerPrice) <= 0) {
      toast.error('Please enter a valid offer price');
      return false;
    }
    if (parseFloat(formData.offerPrice) > parseFloat(formData.price)) {
      toast.error('Offer price cannot be greater than regular price');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isSaving) return; // Prevent double submission

    const payload = {
      ...formData,
      merchantId: merchant._id,
      categoryType: behaviour.type,
      price: parseFloat(formData.price),
      offerPrice: parseFloat(formData.offerPrice),
      discount: Math.round(((formData.price - formData.offerPrice) / formData.price) * 100),
    };

    try {
      setIsSaving(true);
      await onSave(payload);
      // Modal will be closed by parent component after successful save
    } catch (error) {
      // Error already handled by parent, just reset saving state
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="merchant-modal-overlay">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="merchant-modal-backdrop"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="merchant-modal-content"
        >
          {/* Header */}
          <div className="merchant-modal-header">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner text-white">
                {isProductBased ? <Inventory2RoundedIcon /> : <SpaRoundedIcon />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-lg leading-tight truncate">
                  {editingProduct ? 'Edit' : 'Add New'} {isProductBased ? 'Product' : 'Service'}
                </h2>
                <p className="text-white/70 text-xs font-medium truncate">
                  {behaviour.icon} {merchant?.category} • {behaviour.type.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-xl transition-colors ml-2"
            >
              <CloseRoundedIcon className="text-white/80" sx={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Form Content */}
          <div className="merchant-modal-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div>
                <label className="merchant-label">
                  {isProductBased ? 'Product' : 'Service/Plan'} Name *
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={isProductBased ? 'e.g. Margherita Pizza' : 'e.g. 3-Month Gym Membership'}
                  className="merchant-input"
                />
              </div>

              <div>
                <label className="merchant-label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={isProductBased ? 'Describe your product...' : 'Describe what\'s included...'}
                  rows="3"
                  className="merchant-input resize-none"
                />
              </div>

              {/* Image Upload (NEW) */}
              <div>
                <label className="merchant-label">
                  {isProductBased ? 'Product' : 'Service'} Image
                  <span className="text-xs text-gray-400 font-normal ml-2">(Optional)</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="merchant-input"
                  />
                  <p className="text-xs text-gray-400 ml-1">
                    Recommended: 800x600px, Max 5MB (JPG, PNG, WebP)
                  </p>

                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-primary p-3 bg-primary/5 rounded-xl">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Uploading image...
                    </div>
                  )}

                  {formData.imagePreview && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product-Based Specific Fields */}
              {isProductBased && behaviour.showVeg && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl shadow-sm">
                  <input
                    type="checkbox"
                    id="isVeg"
                    checked={formData.isVeg}
                    onChange={(e) => handleChange('isVeg', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isVeg" className="text-sm font-bold text-green-900 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 grid place-items-center">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    This is a Vegetarian Item
                  </label>
                </div>
              )}

              {/* Service-Based Specific Fields */}
              {isServiceBased && (
                <div className="space-y-6">
                  <div>
                    <label className="merchant-label flex items-center gap-1.5">
                      <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                      Duration/Validity
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      className="merchant-input"
                    >
                      <option value="30 mins">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="2 hours">2 hours</option>
                      <option value="1 day">1 day</option>
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="1 year">1 year</option>
                    </select>
                  </div>

                  <div>
                    <label className="merchant-label">
                      What's Included
                    </label>
                    <div className="space-y-3">
                      {formData.inclusions.map((inclusion, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={inclusion}
                            onChange={(e) => handleInclusionChange(index, e.target.value)}
                            placeholder={`Inclusion ${index + 1}`}
                            className="merchant-input flex-1"
                          />
                          {formData.inclusions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInclusion(index)}
                              className="px-3 bg-rose-50 text-accent-rose rounded-xl hover:bg-accent-rose hover:text-white transition-all font-bold"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInclusion}
                        className="text-sm text-primary font-bold hover:underline"
                      >
                        + Add Inclusion
                      </button>
                    </div>
                  </div>

                  {behaviour.requiresBooking && (
                    <div>
                      <label className="merchant-label">
                        Max Bookings Per Day
                      </label>
                      <input
                        type="number"
                        value={formData.maxBookings}
                        onChange={(e) => handleChange('maxBookings', e.target.value)}
                        placeholder="e.g. 10"
                        className="merchant-input"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="merchant-label flex items-center gap-1">
                    <AttachMoneyRoundedIcon sx={{ fontSize: 16 }} />
                    Regular Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="0.00"
                      className="merchant-input pl-8 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="merchant-label flex items-center gap-1">
                    <AttachMoneyRoundedIcon sx={{ fontSize: 16 }} />
                    Offer Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.offerPrice}
                      onChange={(e) => handleChange('offerPrice', e.target.value)}
                      placeholder="0.00"
                      className="merchant-input pl-8 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Preview */}
              <AnimatePresence>
                {formData.price && formData.offerPrice && parseFloat(formData.offerPrice) < parseFloat(formData.price) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-bold text-primary">Discount Applied</span>
                    <span className="text-2xl font-black text-primary font-mono">
                      {Math.round(((formData.price - formData.offerPrice) / formData.price) * 100)}% OFF
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="btn-merchant w-full !mt-6"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  `${editingProduct ? 'Update' : 'Add'} ${isProductBased ? 'Product' : 'Service'}`
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;
