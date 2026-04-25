import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import toast from 'react-hot-toast';

import { merchantAPI } from '../../../api/merchant.api';
import { offerAPI } from '../../../api/offer.api';
import ProductOfferForm from '../components/ProductOfferForm';
import ServiceOfferForm from '../components/ServiceOfferForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { getOptimizedImageUrl } from '../../../utils/cloudinaryUtils';

/**
 * Custom hook for debounced value
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Offers = ({ merchant }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [confirmEndId, setConfirmEndId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    validTo: '',
    maxRedemptions: '100',
    category: merchant?.category || 'Food',
    status: 'active',
    image: '',
    imagePreview: null,
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);

  // 1. Fetch Store Config
  const { data: storeConfig, isLoading: loadingConfig } = useQuery({
    queryKey: ['storeConfig', merchant?._id],
    queryFn: async () => {
      try {
        const response = await merchantAPI.getStoreConfig();
        if (response?.config) return response.config;
      } catch (error) {
        console.error('Store config API failed, using fallback');
      }
      const isServiceCategory = ['Gym', 'Hotel', 'Spa', 'Salon', 'Tours'].includes(merchant?.category);
      return { 
        offer_mode: isServiceCategory ? 'service' : 'product', 
        requires_booking: isServiceCategory,
        category: merchant?.category
      };
    },
    enabled: !!merchant,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // 2. Fetch Merchant Offers
  const { data: rawOffers, isLoading: loadingOffers } = useQuery({
    queryKey: ['merchantOffers', merchant?._id],
    queryFn: async () => {
      const response = await offerAPI.getMyOffers();
      return response.offers || [];
    },
    enabled: !!merchant,
  });

  // 3. Mutations for state sync
  const deleteMutation = useMutation({
    mutationFn: (id) => offerAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['merchantOffers', merchant?._id]);
      toast.success('Offer removed');
    },
    onError: () => toast.error('Failed to delete offer'),
  });

  const offers = useMemo(() => {
    if (!rawOffers) return [];
    return [...rawOffers].sort((a, b) => 
      new Date(b.updatedAt || b.validFrom || 0) - new Date(a.updatedAt || a.validFrom || 0)
    );
  }, [rawOffers]);

  const filtered = useMemo(() => {
    return offers.filter(o => o.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [offers, debouncedSearch]);

  const liveCount = useMemo(() => offers.filter(o => o.status === 'active').length, [offers]);
  const totalRedeemed = useMemo(() => offers.reduce((s, o) => s + (o.currentRedemptions || 0), 0), [offers]);

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imagePreview: reader.result }));
      reader.readAsDataURL(file);

      const { uploadAPI } = await import('../../../api/upload.api');
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = response?.url || response;
      
      setFormData(prev => ({ ...prev, image: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      setFormData(prev => ({ ...prev, imagePreview: null, image: '' }));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => setFormData(prev => ({ ...prev, image: '', imagePreview: null }));

  const handleOpenModal = (o = null) => {
    if (o) {
      setEditingOffer(o);
      setFormData({ 
        ...o, 
        validTo: o.validTo ? o.validTo.split('T')[0] : '',
        image: o.image || '',
        imagePreview: o.image || null
      });
    } else {
      setEditingOffer(null);
      setFormData({ 
        title: '', description: '', discountType: 'percentage', discountValue: '', 
        validTo: '', maxRedemptions: '100', category: merchant?.category, status: 'active',
        image: '', imagePreview: null
      });
    }
    setUploadingImage(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.discountValue || !formData.validTo || !formData.image) {
      toast.error('Please fill in all required fields and upload an image');
      return;
    }

    try {
      const payload = {
        ...formData,
        offerType: 'generic',
        discountValue: Number(formData.discountValue),
        maxRedemptions: Number(formData.maxRedemptions),
        image: formData.image,
      };

      if (editingOffer) {
        await offerAPI.update(editingOffer._id || editingOffer.id, payload);
        toast.success('Offer updated!');
      } else {
        await offerAPI.create(payload);
        toast.success('Offer launched successfully!');
      }
      
      setIsModalOpen(false);
      queryClient.invalidateQueries(['merchantOffers', merchant?._id]);
    } catch (error) {
      toast.error(error.message || 'Failed to save offer');
    }
  };

  const confirmEnd = async () => {
    if (confirmEndId) {
      deleteMutation.mutate(confirmEndId);
      setConfirmEndId(null);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="merchant-page-title">Active Offers</h1>
          <p className="merchant-page-subtitle">Create and manage discounts across your store.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-merchant w-full md:w-auto"
        >
          <AddRoundedIcon sx={{fontSize: 20}} />
          CREATE OFFER
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
          <input 
            type="text" 
            placeholder="Search by offer title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="merchant-input-with-icon"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-card">
            <span className="text-micro text-gray-400 block mb-0.5">Live Offers</span>
            <span className="text-lg font-bold text-primary leading-none font-mono">{liveCount}</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-card">
            <span className="text-micro text-gray-400 block mb-0.5">Total Redeemed</span>
            <span className="text-lg font-bold text-gray-900 leading-none font-mono">{totalRedeemed}</span>
          </div>
        </div>
      </div>

      {/* Offer Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {loadingOffers ? (
             <div className="lg:col-span-2 py-20 text-center">
               <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
               <p className="text-gray-400">Loading your offers...</p>
             </div>
          ) : filtered.length === 0 ? (
            <div className="lg:col-span-2 py-20 text-center merchant-card">
              <LocalOfferRoundedIcon className="text-gray-200 mb-4" sx={{fontSize: 64}} />
              <p className="text-gray-400 font-bold text-sm">No promotional offers found.</p>
              <p className="text-gray-300 text-sm mt-1">Launch your first campaign to attract customers</p>
            </div>
          ) : (
            filtered.map((offer, idx) => (
              (() => {
                const maxRedemptions = Number(offer.maxRedemptions || 0);
                const currentRedemptions = Number(offer.currentRedemptions || 0);
                const redemptionPercent =
                  maxRedemptions > 0
                    ? Math.min(100, Math.round((currentRedemptions / maxRedemptions) * 100))
                    : 0;

                return (
              <motion.div 
                key={offer._id || offer.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                className="merchant-card p-0 overflow-hidden flex flex-col md:flex-row group card-lift"
              >
                {/* Image */}
                <div className="w-full md:w-40 h-40 md:h-auto overflow-hidden flex-shrink-0 relative">
                  <img src={getOptimizedImageUrl(offer.image, { width: 400, height: 400 })} className="w-full h-full object-cover" alt="" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-white text-gray-900 font-mono text-xs font-medium px-2 py-1 rounded-lg">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">{offer.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CalendarMonthRoundedIcon sx={{fontSize: 12}} className="text-gray-400" />
                        <span className="text-micro text-gray-400">Expires: {new Date(offer.validTo).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => handleOpenModal(offer)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all duration-200">
                        <EditRoundedIcon sx={{fontSize: 16}} />
                      </button>
                      <button onClick={() => setConfirmEndId(offer._id || offer.id)} className="p-2 bg-rose-50 text-accent-rose rounded-xl hover:bg-accent-rose hover:text-white transition-all duration-200">
                        <DeleteRoundedIcon sx={{fontSize: 16}} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">{offer.description}</p>

                  {(offer.productId || offer.servicePlanId) && (
                    <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 font-medium block mb-1">
                            {offer.offerType === 'service' ? 'Service Price' : 'Product Price'}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl font-mono font-black text-primary">
                              ₹{offer.discountType === 'percentage' 
                                ? Math.round((offer.productPrice || offer.servicePlanPrice || 0) * (1 - offer.discountValue / 100))
                                : Math.round((offer.productPrice || offer.servicePlanPrice || 0) - offer.discountValue)
                              }
                            </span>
                            <span className="text-sm text-gray-400 line-through font-medium">
                              ₹{offer.productPrice || offer.servicePlanPrice || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between w-36">
                        <span className="text-micro text-gray-400">Redemptions</span>
                        <span className="text-micro text-primary font-mono">
                          {maxRedemptions > 0 ? `${redemptionPercent}%` : 'Unlimited'}
                        </span>
                      </div>
                      <div className="w-36 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${redemptionPercent}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                    <span className={offer.status === 'active' ? 'merchant-badge-green' : 'merchant-badge-rose'}>
                      {offer.status}
                    </span>
                  </div>
                </div>
              </motion.div>
                );
              })()
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/90 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
                  <p className="text-white/80 text-sm font-medium mt-1">
                    {editingOffer ? `Editing ${editingOffer.offerType || 'generic'} offer` : storeConfig?.offer_mode === 'product' ? 'Product-based offer' : 'Service-based offer'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                  <CloseRoundedIcon className="text-white" />
                </button>
              </div>

              <div className="p-8">
                {loadingConfig ? (
                  <div className="py-20 text-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading configuration...</p>
                  </div>
                ) : editingOffer && editingOffer.offerType === 'generic' ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="merchant-label">Offer Headline *</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="merchant-input" />
                    </div>
                    <div>
                      <label className="merchant-label">Description</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="2" className="merchant-input resize-none" />
                    </div>
                    <div>
                      <label className="merchant-label">Offer Image *</label>
                      <div className="space-y-3">
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="merchant-input" />
                        {uploadingImage && <div className="text-primary text-sm">Uploading...</div>}
                        {formData.imagePreview && (
                          <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border">
                            <img src={formData.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded">×</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="merchant-label">Discount Type</label>
                        <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="merchant-input">
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Discount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="merchant-label">Value *</label>
                        <input type="number" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} className="merchant-input" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="merchant-label">Valid Until *</label>
                        <input type="date" value={formData.validTo} onChange={(e) => setFormData({...formData, validTo: e.target.value})} className="merchant-input" />
                      </div>
                      <div>
                        <label className="merchant-label">Max Redemptions</label>
                        <input type="number" value={formData.maxRedemptions} onChange={(e) => setFormData({...formData, maxRedemptions: e.target.value})} className="merchant-input" />
                      </div>
                    </div>
                    <button type="submit" className="btn-merchant w-full mt-6">{editingOffer ? 'Save Changes' : 'Launch Campaign'}</button>
                  </form>
                ) : storeConfig?.offer_mode === 'product' || editingOffer?.offerType === 'product' ? (
                  <ProductOfferForm merchant={merchant} onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries(['merchantOffers']); }} onCancel={() => setIsModalOpen(false)} />
                ) : (
                  <ServiceOfferForm merchant={merchant} storeConfig={storeConfig} onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries(['merchantOffers']); }} onCancel={() => setIsModalOpen(false)} />
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        isOpen={!!confirmEndId}
        title="Stop Offer"
        message="Are you sure you want to end this active offer?"
        confirmText="End Offer"
        onConfirm={confirmEnd}
        onCancel={() => setConfirmEndId(null)}
      />
    </div>
  );
};

export default Offers;
