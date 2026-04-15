import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  getOffersByMerchant, 
  saveOffer, 
  deleteOffer,
  getAllOffers,
  lsSet
} from '../../customer/data/localStorageUtils';
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

const OfferModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="merchant-modal-overlay">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
          <div className="merchant-modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
               <CloseRoundedIcon className="text-white/80" sx={{ fontSize: 20 }} />
            </button>
          </div>
          <div className="merchant-modal-body">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Offers = ({ merchant }) => {
  const [offers, setOffers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeConfig, setStoreConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    validTo: '',
    maxRedemptions: '',
    category: merchant?.category || 'Food',
    status: 'active',
    image: '',
    imagePreview: null,
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    refreshOffers();
    loadStoreConfig();
  }, [merchant]);

  const loadStoreConfig = async () => {
    setLoadingConfig(true);
    console.log('🔧 Loading store config...');
    
    try {
      const response = await merchantAPI.getStoreConfig();
      console.log('📦 Store Config API Response:', response);
      
      if (response && response.config) {
        console.log('✅ Using API config:', response.config);
        setStoreConfig(response.config);
        setLoadingConfig(false);  // ✅ Added this line
        return;
      }
    } catch (error) {
      console.error('❌ Store config API failed:', error);
    }
    
    // Fallback: Determine config based on merchant category
    const isServiceCategory = ['Gym', 'Hotel', 'Spa', 'Salon', 'Tours'].includes(merchant?.category);
    const defaultConfig = { 
      offer_mode: isServiceCategory ? 'service' : 'product', 
      requires_booking: isServiceCategory,
      category: merchant?.category
    };
    
    console.log('🔧 Using fallback config:', defaultConfig);
    setStoreConfig(defaultConfig);
    setLoadingConfig(false);
  };

  const refreshOffers = async () => {
    if (!merchant) {
      console.log('⚠️ No merchant data, skipping offers fetch');
      return;
    }
    
    try {
      console.log('🔄 Fetching offers from API...');
      console.log('🔑 Merchant ID:', merchant._id || merchant.id);
      console.log('🔑 Token exists:', !!localStorage.getItem('offerly_merchant_token'));
      
      const response = await offerAPI.getMyOffers();
      console.log('✅ API Response:', response);
      
      if (response && response.offers) {
        const sortedOffers = response.offers.sort((a, b) => 
          new Date(b.updatedAt || b.validFrom || 0) - new Date(a.updatedAt || a.validFrom || 0)
        );
        setOffers(sortedOffers);
        console.log('📊 Loaded offers:', sortedOffers.length);
        
        if (sortedOffers.length === 0) {
          console.log('ℹ️ No offers found. Create your first offer using "CREATE OFFER" button');
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch offers:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
      } else {
        toast.error('Failed to load offers');
      }
      setOffers([]);
    }
  };

  const handleOpenModal = (o = null) => {
    if (o) {
      setEditingOffer(o);
      setFormData({ 
        ...o, 
        validTo: o.validTo.split('T')[0],
        image: o.image || '',
        imagePreview: o.image || null
      });
    } else {
      setEditingOffer(null);
      setFormData({ 
        title: '', description: '', discountType: 'percentage', discountValue: '', 
        validTo: '', maxRedemptions: '100', category: merchant?.category, status: 'active',
        image: '',
        imagePreview: null
      });
    }
    setUploadingImage(false);
    setIsModalOpen(true);
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
      
      const imageUrl = response?.url || response;
      
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      setFormData(prev => ({
        ...prev,
        imagePreview: null,
        image: ''
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
      imagePreview: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.discountValue || !formData.validTo) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.image) {
      toast.error('Please upload an offer image');
      return;
    }

    try {
      const payload = {
        ...formData,
        offerType: 'generic',
        discountValue: Number(formData.discountValue),
        maxRedemptions: Number(formData.maxRedemptions),
        currentRedemptions: editingOffer?.currentRedemptions || 0,
        image: formData.image,
        terms: editingOffer?.terms || ['Valid on all items', 'Cannot be clubbed with other offers'],
        isTrending: editingOffer?.isTrending || false,
        isNew: editingOffer?.isNew || true,
        validFrom: editingOffer?.validFrom || new Date().toISOString(),
      };

      if (editingOffer) {
        await offerAPI.update(editingOffer.id, payload);
        toast.success('Offer updated!');
      } else {
        await offerAPI.create(payload);
        toast.success('Offer launched successfully!');
      }
      
      setIsModalOpen(false);
      refreshOffers();
    } catch (error) {
      console.error('❌ Save offer error:', error);
      toast.error(error.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to end this offer?')) {
      try {
        await offerAPI.delete(id);
        toast.success('Offer removed');
        refreshOffers();
      } catch (error) {
        console.error('❌ Delete offer error:', error);
        toast.error('Failed to delete offer');
      }
    }
  };

  const filtered = offers.filter(o => o.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const liveCount = offers.filter(o => o.status === 'active').length;
  const totalRedeemed = offers.reduce((s, o) => s + o.currentRedemptions, 0);

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
          {filtered.length === 0 ? (
            <div className="lg:col-span-2 py-20 text-center merchant-card">
              <LocalOfferRoundedIcon className="text-gray-200 mb-4" sx={{fontSize: 64}} />
              <p className="text-gray-400 font-bold text-sm">No promotional offers found.</p>
              <p className="text-gray-300 text-sm mt-1">Launch your first campaign to attract customers</p>
            </div>
          ) : (
            filtered.map((offer, idx) => (
              <motion.div 
                key={offer.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                className="merchant-card p-0 overflow-hidden flex flex-col md:flex-row group card-lift"
              >
                {/* Image */}
                <div className="w-full md:w-40 h-40 md:h-auto overflow-hidden flex-shrink-0 relative">
                  <img src={offer.image} className="w-full h-full object-cover" alt="" />
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
                      {/* Store Name */}
                      {merchant?.businessName && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500 font-medium">📍 {merchant.businessName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => handleOpenModal(offer)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all duration-200">
                        <EditRoundedIcon sx={{fontSize: 16}} />
                      </button>
                      <button onClick={() => handleDelete(offer.id)} className="p-2 bg-rose-50 text-accent-rose rounded-xl hover:bg-accent-rose hover:text-white transition-all duration-200">
                        <DeleteRoundedIcon sx={{fontSize: 16}} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">{offer.description}</p>

                  {/* Pricing Details - Enhanced for all offer types */}
                  {(offer.productId || offer.servicePlanId) && (
                    <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 font-medium block mb-1">
                            {offer.offerType === 'service' ? 'Service Price' : 'Product Price'}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Discounted Price */}
                            <span className="text-xl font-mono font-black text-primary">
                              ₹{offer.discountType === 'percentage' 
                                ? Math.round((offer.productPrice || offer.servicePlanPrice || 0) * (1 - offer.discountValue / 100))
                                : Math.round((offer.productPrice || offer.servicePlanPrice || 0) - offer.discountValue)
                              }
                            </span>
                            {/* Original Price */}
                            <span className="text-sm text-gray-400 line-through font-medium">
                              ₹{offer.productPrice || offer.servicePlanPrice || 0}
                            </span>
                            {/* Discount Badge */}
                            <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-lg shadow-sm">
                              {offer.discountType === 'percentage' 
                                ? `${offer.discountValue}% OFF` 
                                : `₹${offer.discountValue} OFF`
                              }
                            </span>
                          </div>
                          {/* Savings Amount */}
                          <span className="text-xs text-green-600 font-semibold mt-1 block">
                            You save ₹{offer.discountType === 'percentage'
                              ? Math.round((offer.productPrice || offer.servicePlanPrice || 0) * (offer.discountValue / 100))
                              : offer.discountValue
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between w-36">
                        <span className="text-micro text-gray-400">Redemptions</span>
                        <span className="text-micro text-primary font-mono">{Math.round((offer.currentRedemptions/offer.maxRedemptions)*100)}%</span>
                      </div>
                      <div className="w-36 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(offer.currentRedemptions/offer.maxRedemptions)*100}%` }}
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
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Offer Modal - Smart Flow Selection */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/90 px-8 py-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                    </h2>
                    <p className="text-white/80 text-sm font-medium mt-1">
                      {editingOffer 
                        ? `Editing ${editingOffer.offerType || 'generic'} offer`
                        : storeConfig?.offer_mode === 'product' ? 'Product-based offer' : 'Service-based offer'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <CloseRoundedIcon className="text-white" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  {loadingConfig ? (
                    <div className="py-20 text-center">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Loading configuration...</p>
                    </div>
                  ) : editingOffer && editingOffer.offerType === 'generic' ? (
                    // Legacy offer - use old modal
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="merchant-label">Offer Headline *</label>
                        <input 
                          type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g. BOGO Sunday Night"
                          className="merchant-input"
                        />
                      </div>
                      <div>
                        <label className="merchant-label">Description</label>
                        <textarea 
                          value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Details of the offer..."
                          rows="2"
                          className="merchant-input resize-none"
                        />
                      </div>
                      
                      {/* Image Upload Section */}
                      <div>
                        <label className="merchant-label">
                          Offer Image *
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
                       
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="merchant-label">Discount Type</label>
                          <select 
                            value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                            className="merchant-input"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat Discount (₹)</option>
                          </select>
                        </div>
                        <div>
                          <label className="merchant-label">Value ({formData.discountType === 'percentage' ? '%' : '₹'}) *</label>
                          <input 
                            type="number" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                            placeholder="0"
                            className="merchant-input font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="merchant-label">Valid Until *</label>
                          <input 
                            type="date" value={formData.validTo} onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                            className="merchant-input"
                          />
                        </div>
                        <div>
                          <label className="merchant-label">Max Redemptions</label>
                          <input 
                            type="number" value={formData.maxRedemptions} onChange={(e) => setFormData({...formData, maxRedemptions: e.target.value})}
                            placeholder="100"
                            className="merchant-input font-mono"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="btn-merchant w-full !mt-6"
                      >
                        {editingOffer ? 'Save Changes' : 'Launch Campaign'}
                      </button>
                    </form>
                  ) : storeConfig?.offer_mode === 'product' || editingOffer?.offerType === 'product' ? (
                    <ProductOfferForm
                      merchant={merchant}
                      onSuccess={() => {
                        setIsModalOpen(false);
                        refreshOffers();
                      }}
                      onCancel={() => setIsModalOpen(false)}
                    />
                  ) : (
                    <ServiceOfferForm
                      merchant={merchant}
                      storeConfig={storeConfig}
                      onSuccess={() => {
                        setIsModalOpen(false);
                        refreshOffers();
                      }}
                      onCancel={() => setIsModalOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Offers;
