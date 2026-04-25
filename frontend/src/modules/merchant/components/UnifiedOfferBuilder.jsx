import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import toast from 'react-hot-toast';
import { productAPI } from '../../../api/product.api';
import { offerAPI } from '../../../api/offer.api';

const UnifiedOfferBuilder = ({ isOpen, onClose, merchant, preSelectedProduct = null, onSuccess }) => {
  // If a product is already selected (from the Quick Action table button), skip Phase 1
  const isQuickOfferMode = !!preSelectedProduct;
  const isProductBased = merchant?.category !== 'Gym' && merchant?.category !== 'Hotel' && merchant?.category !== 'Spa' && merchant?.category !== 'Salon' && merchant?.category !== 'Tours';

  // Section A: Core Details (Product mapping)
  const [coreData, setCoreData] = useState({
    name: '',
    description: '',
    price: '',
    imagePreview: null,
    imageFile: null,
    imageUrl: null,
  });

  // Section B: Offer Details
  const [runOffer, setRunOffer] = useState(true);
  const [offerData, setOfferData] = useState({
    discountType: 'percentage',
    discountValue: '',
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
    maxRedemptions: '100',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initialize Core Data if editing/quick-offering an existing product
  useEffect(() => {
    if (preSelectedProduct) {
      setCoreData({
        name: preSelectedProduct.name,
        description: preSelectedProduct.description || '',
        price: preSelectedProduct.price || '',
        imagePreview: preSelectedProduct.image || null,
        imageUrl: preSelectedProduct.image || null,
      });
      // Force offer ON in Quick Mode
      setRunOffer(true);
    } else {
      setCoreData({ name: '', description: '', price: '', imagePreview: null, imageFile: null, imageUrl: null });
    }
  }, [preSelectedProduct, isOpen]);

  const handleCoreChange = (f, v) => setCoreData(p => ({ ...p, [f]: v }));
  const handleOfferChange = (f, v) => setOfferData(p => ({ ...p, [f]: v }));

  const applyPreset = (discount) => {
    handleOfferChange('discountType', 'percentage');
    handleOfferChange('discountValue', discount.toString());
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image size must be < 5MB');

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onloadend = () => handleCoreChange('imagePreview', reader.result);
      reader.readAsDataURL(file);

      const { uploadAPI } = await import('../../../api/upload.api');
      const response = await uploadAPI.uploadImage(file);
      const url = response?.url || response;
      handleCoreChange('imageUrl', url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Image upload failed');
      handleCoreChange('imagePreview', null);
    } finally {
      setUploadingImage(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!coreData.price) return null;
    const base = parseFloat(coreData.price);
    if (isNaN(base)) return null;

    if (!offerData.discountValue) return base;
    const val = parseFloat(offerData.discountValue);
    if (isNaN(val)) return base;

    if (offerData.discountType === 'percentage') {
      return Math.max(0, base - (base * (val / 100))).toFixed(0);
    } else if (offerData.discountType === 'flat') {
      return Math.max(0, base - val).toFixed(0);
    }
    return base;
  };

  const finalPrice = calculateFinalPrice();

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (!isQuickOfferMode && (!coreData.name || !coreData.price)) {
      return toast.error(`Please provide a name and regular price for the ${isProductBased ? 'Product' : 'Service'}`);
    }

    if (runOffer && !offerData.discountValue) {
      return toast.error('Please provide a discount value, or disable the Offer toggle');
    }

    setLoading(true);

    try {
      let activeProductId = preSelectedProduct?._id || preSelectedProduct?.id;

      // 1. STEP A: CREATE PRODUCT (If not Quick Mode)
      if (!isQuickOfferMode) {
        const productPayload = {
          name: coreData.name,
          description: coreData.description,
          price: parseFloat(coreData.price),
          offerPrice: finalPrice ? parseFloat(finalPrice) : parseFloat(coreData.price),
          discount: offerData.discountValue && offerData.discountType === 'percentage' ? parseInt(offerData.discountValue) : 0,
          categoryType: isProductBased ? 'product_based' : 'service_based',
          category: merchant.category || 'General',
          images: coreData.imageUrl ? [coreData.imageUrl] : [],
          merchantId: merchant._id || merchant.id,
        };

        const prodRes = await productAPI.create(productPayload);
        activeProductId = prodRes?.product?._id || prodRes?.data?.product?._id || prodRes?._id;
        
        if (!activeProductId) throw new Error("Failed to initialize base product ID.");
      }

      // 2. STEP B: CREATE OFFER (If toggled)
      if (runOffer) {
        const offerPayload = {
          title: `Special Offer on ${coreData.name}`,
          description: coreData.description || `Get amazing discounts on ${coreData.name}!`,
          discountType: offerData.discountType,
          discountValue: parseFloat(offerData.discountValue),
          validTo: offerData.validTo,
          maxRedemptions: parseInt(offerData.maxRedemptions) || 100,
          category: merchant.category,
          
          // Data Mapping
          offerType: isProductBased ? 'product' : 'service',
          productId: isProductBased ? activeProductId : null,
          servicePlanId: !isProductBased ? activeProductId : null,
          
          // Smart Image Inheritance
          image: coreData.imageUrl || '',
          useCustomImage: false // Inherits safely from base item
        };

        await offerAPI.create(offerPayload);
      }

      toast.success(runOffer ? '🚀 Offer Successfully Launched!' : 'Inventory Item Created!');
      onSuccess?.();
      onClose();

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="merchant-modal-overlay">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={!loading ? onClose : null} className="merchant-modal-backdrop" />
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="merchant-modal-content overflow-y-auto max-h-[90vh]">
          
          <div className="merchant-modal-header bg-gradient-to-r from-gray-900 to-gray-800 border-none rounded-t-[2rem]">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm text-emerald-400">
                <AutoAwesomeRoundedIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-black text-xl tracking-tight">
                  {isQuickOfferMode ? 'Quick Launch Offer' : 'Unified Flow'}
                </h2>
                <p className="text-white/60 text-xs font-medium">Create inventory & campaigns seamlessly</p>
              </div>
            </div>
            <button onClick={!loading ? onClose : null} className="p-2 hover:bg-white/10 rounded-xl transition-colors ml-2">
              <CloseRoundedIcon className="text-white/80" sx={{ fontSize: 20 }} />
            </button>
          </div>

          <div className="merchant-modal-body p-6 bg-gray-50/50">
            <form onSubmit={handleLaunch} className="space-y-6">
              
              {/* SECTION A: Base Product (Disabled if Quick Mode) */}
              <div className={`space-y-5 bg-white p-5 rounded-3xl border ${isQuickOfferMode ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Inventory2RoundedIcon sx={{ fontSize: 18 }} className="text-gray-400" />
                  <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">Core Item Details</h3>
                </div>

                <div>
                  <label className="merchant-label">Item Name *</label>
                  <input type="text" value={coreData.name} onChange={(e) => handleCoreChange('name', e.target.value)} placeholder="e.g. Premium Spa Session" className="merchant-input bg-gray-50" required={!isQuickOfferMode} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="merchant-label">Original Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input type="number" value={coreData.price} onChange={(e) => handleCoreChange('price', e.target.value)} placeholder="0.00" className="merchant-input pl-8 font-mono bg-gray-50" required={!isQuickOfferMode} />
                    </div>
                  </div>
                  <div>
                    <label className="merchant-label">Display Image</label>
                    {coreData.imagePreview ? (
                      <div className="relative h-[46px] w-full rounded-xl overflow-hidden border border-gray-200">
                        <img src={coreData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="relative h-[46px] w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors bg-gray-50 flex items-center justify-center">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <span className="text-xs font-bold text-gray-400">Click to Upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION B: Offer Engine */}
              <div className={`space-y-5 bg-white p-5 rounded-3xl border transition-all duration-300 ${runOffer ? 'border-emerald-200 shadow-lg shadow-emerald-900/5' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LocalOfferRoundedIcon sx={{ fontSize: 18 }} className={runOffer ? "text-emerald-500" : "text-gray-400"} />
                    <h3 className={`font-bold text-sm tracking-wide uppercase ${runOffer ? "text-emerald-700" : "text-gray-800"}`}>Campaign Engine</h3>
                  </div>
                  {!isQuickOfferMode && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={runOffer} onChange={(e) => setRunOffer(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  )}
                </div>

                <AnimatePresence>
                  {runOffer && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-5 pt-2">
                      
                      {/* Presets */}
                      <div className="flex gap-2">
                        {[10, 20, 30, 50].map(val => (
                          <button type="button" key={val} onClick={() => applyPreset(val)} className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black rounded-xl transition-colors border border-emerald-100">
                            {val}% OFF
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="merchant-label">Discount Value *</label>
                          <div className="relative">
                            <input type="number" value={offerData.discountValue} onChange={(e) => handleOfferChange('discountValue', e.target.value)} placeholder="e.g. 20" className="merchant-input pr-12 font-mono border-emerald-100 focus:ring-emerald-500" required={runOffer} />
                            <select value={offerData.discountType} onChange={(e) => handleOfferChange('discountType', e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-sm font-bold text-gray-500 border-none outline-none">
                              <option value="percentage">%</option>
                              <option value="flat">₹</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="merchant-label">Valid Until *</label>
                          <input type="date" value={offerData.validTo} onChange={(e) => handleOfferChange('validTo', e.target.value)} className="merchant-input border-emerald-100" required={runOffer} />
                        </div>
                      </div>

                      {/* Live Price Calculator */}
                      {finalPrice !== null && (
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-inner">
                          <div>
                            <p className="text-white/80 text-[10px] uppercase font-black tracking-widest mb-0.5">Final Payout</p>
                            <p className="text-xs font-medium">Customer pays you exactly</p>
                          </div>
                          <span className="text-3xl font-black font-mono tracking-tighter">₹{finalPrice}</span>
                        </motion.div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button type="submit" disabled={loading || uploadingImage} className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all ${loading ? 'opacity-80' : 'hover:scale-[1.02] active:scale-95'} ${runOffer ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30' : 'bg-gray-800 hover:bg-gray-900 shadow-gray-900/20'}`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing Sequence...
                  </span>
                ) : (
                  runOffer ? '🚀 Launch Campaign & Save' : '💾 Save to Inventory Only'
                )}
              </button>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnifiedOfferBuilder;
