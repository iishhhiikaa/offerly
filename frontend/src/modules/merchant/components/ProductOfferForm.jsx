import { useState } from 'react';
import { motion } from 'framer-motion';
import ProductSearchSelect from './ProductSearchSelect';
import VariantSelector from './VariantSelector';
import OfferPreviewCard from './OfferPreviewCard';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import toast from 'react-hot-toast';
import { offerAPI } from '../../../api/offer.api';

const ProductOfferForm = ({ merchant, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    // Step 1: Product Selection
    selectedProduct: null,
    
    // Step 2: Variant Selection
    selectedVariantId: null,
    applyToAllVariants: false,
    
    // Step 3: Discount Setup
    discountType: 'percentage',
    discountValue: '',
    
    // Step 4: Validity
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
    
    // Step 5: Claim Limit
    maxRedemptions: '100',
    unlimitedClaims: false,
    
    // Step 6: Image (NEW)
    useCustomImage: false,
    customImage: null,
    customImagePreview: null,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleProductSelect = (product) => {
    setFormData(prev => ({
      ...prev,
      selectedProduct: product,
      selectedVariantId: null,
      applyToAllVariants: false
    }));
  };

  const handleVariantSelect = (variantId) => {
    setFormData(prev => ({
      ...prev,
      selectedVariantId: variantId
    }));
  };

  const handleApplyToAllChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      applyToAllVariants: checked,
      selectedVariantId: checked ? null : prev.selectedVariantId
    }));
  };

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
          customImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Upload to server
      const uploadAPI = (await import('../../../api/upload.api')).uploadAPI;
      const response = await uploadAPI.uploadImage(file);
      
      // Handle response properly
      const imageUrl = response?.url || response;
      
      setFormData(prev => ({
        ...prev,
        customImage: imageUrl
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      setFormData(prev => ({
        ...prev,
        customImagePreview: null,
        customImage: null
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCustomImage = () => {
    setFormData(prev => ({
      ...prev,
      customImage: null,
      customImagePreview: null,
      useCustomImage: false
    }));
  };

  const setQuickValidity = (days) => {
    const today = new Date();
    const futureDate = new Date(today.setDate(today.getDate() + days));
    handleChange('validTo', futureDate.toISOString().split('T')[0]);
  };

  const validateForm = () => {
    if (!formData.selectedProduct) {
      toast.error('Please select a product');
      return false;
    }

    // Check if product has variants and none selected (and not applying to all)
    if (formData.selectedProduct.variants?.length > 0 && 
        !formData.selectedVariantId && 
        !formData.applyToAllVariants) {
      toast.error('Please select a variant or apply to all variants');
      return false;
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Please enter a valid discount value');
      return false;
    }

    if (!formData.validTo) {
      toast.error('Please select an end date');
      return false;
    }

    if (new Date(formData.validTo) <= new Date(formData.validFrom)) {
      toast.error('End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Determine which image to use
      let offerImage = formData.customImage || formData.selectedProduct.images?.[0];
      
      // Validate image exists
      if (!offerImage) {
        toast.error('Please upload a custom image or ensure product has an image');
        setLoading(false);
        return;
      }

      const payload = {
        offerType: 'product',
        productId: formData.selectedProduct.id || formData.selectedProduct._id,
        variantId: formData.selectedVariantId || null,
        applyToAllVariants: formData.applyToAllVariants,
        title: `${formData.discountValue}${formData.discountType === 'percentage' ? '%' : '₹'} OFF on ${formData.selectedProduct.name}`,
        description: `Get ${formData.discountValue}${formData.discountType === 'percentage' ? '%' : '₹'} discount on ${formData.selectedProduct.name}`,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        maxRedemptions: formData.unlimitedClaims ? 0 : parseInt(formData.maxRedemptions),
        category: merchant.category,
        image: offerImage,
        customImage: formData.customImage || null,
        useCustomImage: formData.useCustomImage,
        status: 'active',
        productPrice: formData.selectedProduct.offerPrice || formData.selectedProduct.price,
      };

      await offerAPI.create(payload);
      toast.success('Product offer created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Create offer error:', error);
      toast.error(error.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview data
  const getPreviewData = () => {
    if (!formData.selectedProduct) return null;

    const basePrice = formData.selectedProduct.offerPrice || formData.selectedProduct.price;
    
    return {
      title: `${formData.discountValue || 0}${formData.discountType === 'percentage' ? '%' : '₹'} OFF`,
      description: `Get amazing discount on ${formData.selectedProduct.name}`,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      validTo: formData.validTo,
      maxRedemptions: formData.unlimitedClaims ? 0 : parseInt(formData.maxRedemptions) || 100,
      image: formData.selectedProduct.images?.[0] || '',
      productName: formData.selectedProduct.name,
      productPrice: basePrice
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Product Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="merchant-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-lg font-black text-gray-900">Select Product</h3>
            </div>
            
            <ProductSearchSelect
              onSelect={handleProductSelect}
              selectedProduct={formData.selectedProduct}
            />
          </motion.div>

          {/* Step 2: Variant Selection (Conditional) */}
          {formData.selectedProduct?.variants?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="merchant-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                  2
                </div>
                <h3 className="text-lg font-black text-gray-900">Select Variant</h3>
              </div>
              
              <VariantSelector
                productId={formData.selectedProduct.id || formData.selectedProduct._id}
                selectedVariantId={formData.selectedVariantId}
                onSelect={handleVariantSelect}
                applyToAll={formData.applyToAllVariants}
                onApplyToAllChange={handleApplyToAllChange}
              />
            </motion.div>
          )}

          {/* Step 3: Discount Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="merchant-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                {formData.selectedProduct?.variants?.length > 0 ? '3' : '2'}
              </div>
              <h3 className="text-lg font-black text-gray-900">Discount Setup</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="merchant-label">Discount Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'percentage', label: 'Percentage Off', example: 'e.g. 20% off' },
                    { value: 'flat', label: 'Flat Amount Off', example: 'e.g. ₹10 off' },
                    { value: 'fixed', label: 'Fixed Price', example: 'e.g. at ₹45' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('discountType', type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.discountType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-sm text-gray-900 mb-1">{type.label}</div>
                      <div className="text-xs text-gray-400">{type.example}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="merchant-label">
                  Discount Value * ({formData.discountType === 'percentage' ? '%' : '₹'})
                </label>
                <div className="relative">
                  <PercentRoundedIcon 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                    sx={{ fontSize: 20 }} 
                  />
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="merchant-input pl-12 font-mono"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 4: Validity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="merchant-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                {formData.selectedProduct?.variants?.length > 0 ? '4' : '3'}
              </div>
              <h3 className="text-lg font-black text-gray-900">Validity Period</h3>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="merchant-label">Valid From *</label>
                  <div className="relative">
                    <CalendarMonthRoundedIcon 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                      sx={{ fontSize: 20 }} 
                    />
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => handleChange('validFrom', e.target.value)}
                      className="merchant-input pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="merchant-label">Valid Until *</label>
                  <div className="relative">
                    <CalendarMonthRoundedIcon 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                      sx={{ fontSize: 20 }} 
                    />
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => handleChange('validTo', e.target.value)}
                      min={formData.validFrom}
                      className="merchant-input pl-12"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="merchant-label text-xs">Quick Select</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { days: 7, label: '7 Days' },
                    { days: 15, label: '15 Days' },
                    { days: 30, label: '1 Month' },
                    { days: 90, label: '3 Months' }
                  ].map((option) => (
                    <button
                      key={option.days}
                      type="button"
                      onClick={() => setQuickValidity(option.days)}
                      className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 5: Claim Limit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="merchant-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                {formData.selectedProduct?.variants?.length > 0 ? '5' : '4'}
              </div>
              <h3 className="text-lg font-black text-gray-900">Claim Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="merchant-label">Maximum Claims</label>
                <input
                  type="number"
                  value={formData.maxRedemptions}
                  onChange={(e) => handleChange('maxRedemptions', e.target.value)}
                  placeholder="100"
                  min="0"
                  disabled={formData.unlimitedClaims}
                  className="merchant-input font-mono"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="unlimitedClaims"
                  checked={formData.unlimitedClaims}
                  onChange={(e) => handleChange('unlimitedClaims', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="unlimitedClaims" className="text-sm font-bold text-gray-700 cursor-pointer">
                  Unlimited claims (no limit on redemptions)
                </label>
              </div>
            </div>
          </motion.div>

          {/* Step 6: Custom Image (NEW - Optional) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="merchant-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-sm">
                {formData.selectedProduct?.variants?.length > 0 ? '6' : '5'}
              </div>
              <h3 className="text-lg font-black text-gray-900">Offer Image</h3>
              <span className="text-xs text-gray-400 font-medium">(Optional)</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <input
                  type="checkbox"
                  id="useProductImage"
                  checked={!formData.useCustomImage}
                  onChange={(e) => handleChange('useCustomImage', !e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="useProductImage" className="text-sm font-bold text-blue-900 cursor-pointer">
                  Use product image automatically
                </label>
              </div>

              {formData.useCustomImage && (
                <div className="space-y-3">
                  <div>
                    <label className="merchant-label">Upload Custom Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="merchant-input"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">
                      Recommended: 800x600px, Max 5MB (JPG, PNG, WebP)
                    </p>
                  </div>

                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Uploading image...
                    </div>
                  )}

                  {formData.customImagePreview && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={formData.customImagePreview}
                        alt="Custom offer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCustomImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!formData.useCustomImage && formData.selectedProduct?.images?.[0] && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-2">Product image will be used:</p>
                  <div className="w-full h-32 bg-white rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.selectedProduct.images[0]}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !formData.selectedProduct}
              className="flex-1 btn-merchant !py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Product Offer'
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <OfferPreviewCard
              offerData={getPreviewData()}
              merchant={merchant}
              offerType="product"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductOfferForm;
