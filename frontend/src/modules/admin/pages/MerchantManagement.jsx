import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SlideOver from '../components/SlideOver';
import RejectionReasonModal from '../components/RejectionReasonModal';
import AdminEntityCard from '../components/AdminEntityCard';
import { adminAPI } from '../../../api/admin.api';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import toast from 'react-hot-toast';

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

const MerchantManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [viewingMerchant, setViewingMerchant] = useState(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [merchantToReject, setMerchantToReject] = useState(null);

  // 1. Fetch merchants with React Query
  const { data, isLoading: loading, isFetching, refetch } = useQuery({
    queryKey: ['adminMerchants', activeTab, debouncedSearch, page],
    queryFn: async () => {
      const params = {
        page,
        limit,
        status: activeTab === 'all' ? undefined : activeTab,
        q: debouncedSearch || undefined
      };
      const res = await adminAPI.getAllMerchants(params);
      return res.data || res;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const merchants = data?.merchants || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  const handleEntityView = (merchant) => {
    setViewingMerchant(merchant);
    setIsSlideOverOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.updateMerchantStatus(id, 'approved');
      toast.success('Merchant approved!');
      setIsSlideOverOpen(false);
      queryClient.invalidateQueries(['adminMerchants']);
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleReject = (id) => {
    setMerchantToReject(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async (reason) => {
    try {
      await adminAPI.updateMerchantStatus(merchantToReject, 'rejected', reason);
      toast.error('Merchant rejected');
      setIsRejectModalOpen(false);
      setIsSlideOverOpen(false);
      queryClient.invalidateQueries(['adminMerchants']);
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handleStatusToggle = async (merchant) => {
    const currentStatus = merchant.status;
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const action = newStatus === 'approved' ? 'Activated' : 'Restricted';
    
    try {
      await adminAPI.updateMerchantStatus(merchant.id || merchant._id, newStatus);
      toast.success(`Merchant ${action} successfully`);
      queryClient.invalidateQueries(['adminMerchants']);
    } catch (error) {
      toast.error(`Failed to update merchant status`);
    }
  };

  const TabButton = ({ id, label }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setPage(1); }}
        className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 rounded-md relative flex items-center gap-2 ${
          isActive 
            ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-1px]' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-text-primary -mt-6 -mx-8 px-10 pt-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white rounded-md shadow-sm border border-gray-100 flex items-center justify-center text-primary">
                <GroupRoundedIcon sx={{ fontSize: 32 }} />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight text-gray-900 leading-none">Merchant Oversight</h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 ml-1">Global management of business partners</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md border border-gray-200 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95 disabled:opacity-50"
              disabled={isFetching}
            >
              <RefreshRoundedIcon sx={{ fontSize: 18 }} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 rounded-md border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-md border border-gray-100 overflow-x-auto scrollbar-hide">
            <TabButton id="all" label="All" />
            <TabButton id="pending" label="Pending" />
            <TabButton id="approved" label="Active" />
            <TabButton id="rejected" label="Blocked" />
          </div>

          <div className="relative flex-1 max-w-xl group">
            <SearchRoundedIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" sx={{ fontSize: 22 }} />
            <input
              type="text"
              placeholder="Search merchants by name, owner or contact..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-gray-50 border border-transparent rounded-md py-4 pl-14 pr-6 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-[6px] focus:ring-primary/5 transition-all duration-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-500 font-black uppercase tracking-tighter text-xs">Syncing Cloud Database...</p>
          </div>
        ) : merchants.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {merchants.map(merchant => (
                <AdminEntityCard
                  key={merchant._id || merchant.id}
                  entity={merchant}
                  type="merchant"
                  onView={handleEntityView}
                  onStatusToggle={handleStatusToggle}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md border border-gray-100 shadow-sm mt-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, pagination.total)} of {pagination.total} Merchants
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                  >
                    <ChevronLeftRoundedIcon />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.pages)].map((_, i) => {
                      const p = i + 1;
                      // Only show current, first, last, and neighbours
                      if (p === 1 || p === pagination.pages || Math.abs(p - page) <= 1) {
                         return (
                           <button
                             key={p}
                             onClick={() => setPage(p)}
                             className={`w-10 h-10 flex items-center justify-center rounded-md text-[11px] font-black transition-all ${
                               page === p ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                             }`}
                           >
                             {p}
                           </button>
                         );
                      }
                      if (p === 2 || p === pagination.pages - 1) return <span key={p} className="text-gray-300">...</span>;
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                  >
                    <ChevronRightRoundedIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-md bg-white/50">
            <StorefrontRoundedIcon className="text-gray-300 mb-4" sx={{ fontSize: 64 }} />
            <h3 className="text-xl font-bold text-gray-400">No Merchants Found</h3>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title="Merchant Overview"
        subtitle={viewingMerchant?._id ? `REF: ${viewingMerchant._id}` : null}
        widthClass="max-w-3xl"
      >
        {viewingMerchant && (
          <div className="flex flex-col h-full font-sans">
            <div className="flex-1 overflow-y-auto space-y-10 pb-12 pr-2 custom-scrollbar">
              {/* Approval Actions - Moved to Top for better visibility if pending */}
              {viewingMerchant.status === 'pending' && (
                <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-800">
                    <HistoryRoundedIcon className="animate-pulse" />
                    <div>
                      <p className="font-black text-sm uppercase tracking-wider">Pending Review</p>
                      <p className="text-xs font-medium opacity-80">This store is waiting for your approval to go live.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button 
                      whileTap={{ scale: 0.98 }} 
                      onClick={() => handleReject(viewingMerchant._id || viewingMerchant.id)} 
                      className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-red-100 text-red-500 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 transition-all shadow-sm"
                    >
                      <CancelRoundedIcon sx={{ fontSize: 18 }} />
                      Decline
                    </motion.button>
                    <motion.button 
                      whileTap={{ scale: 0.98 }} 
                      onClick={() => handleApprove(viewingMerchant._id || viewingMerchant.id)} 
                      className="flex-[2] flex items-center justify-center gap-3 bg-primary text-white h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-dark shadow-[0_10px_20px_rgba(61,122,79,0.2)] transition-all"
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                      Approve Store
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="space-y-10">
            <div className="relative group/hero pt-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 px-2 relative z-10">
                <div className="w-36 h-36 bg-white rounded-md p-2 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 relative group-hover/hero:scale-[1.02] transition-transform duration-500">
                  <div className="w-full h-full bg-gray-50 rounded-md overflow-hidden border border-gray-100 flex items-center justify-center">
                    {viewingMerchant.logoUrl || viewingMerchant.logo ? (
                      <img src={viewingMerchant.logoUrl || viewingMerchant.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <StorefrontRoundedIcon sx={{ fontSize: 56 }} className="text-gray-300" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-md border-4 border-white flex items-center justify-center shadow-lg ${
                    viewingMerchant.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'
                  }`}>
                    {viewingMerchant.status === 'approved' ? <CheckCircleRoundedIcon sx={{ fontSize: 18 }} className="text-white" /> : <HourglassEmptyRoundedIcon sx={{ fontSize: 18 }} className="text-white animate-pulse" />}
                  </div>
                </div>
                <div className="pb-4 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{viewingMerchant.storeName}</h3>
                    <span className="px-4 py-1.5 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-widest rounded-md border border-primary/10 shadow-sm">{viewingMerchant.category || 'Business'}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                      <GroupRoundedIcon sx={{fontSize: 16}} className="text-primary/40" /> 
                      <span className="text-gray-600">{viewingMerchant.ownerName}</span>
                    </span>
                    <span className="flex items-center gap-2 text-primary/60"><VerifiedRoundedIcon sx={{fontSize: 16}} />{viewingMerchant.businessType || 'Verified Merchant'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50/50 rounded-md p-8 border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><InfoRoundedIcon sx={{fontSize: 16}} />Business Profile</h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About the Store</p>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed italic">"{viewingMerchant.description || 'No business description provided yet.'}"</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-primary shadow-sm border border-gray-100"><EmailRoundedIcon sx={{fontSize: 18}} /></div>
                        <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</p><p className="text-sm font-bold text-gray-900">{viewingMerchant.email}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-primary shadow-sm border border-gray-100"><PhoneRoundedIcon sx={{fontSize: 18}} /></div>
                        <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p><p className="text-sm font-bold text-gray-900">{viewingMerchant.phone}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-md p-8 border border-gray-100 shadow-sm relative overflow-hidden group/loc">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover/loc:bg-primary/10 transition-colors" />
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><LocationOnRoundedIcon sx={{fontSize: 16}} />Store Location</h4>
                  <div className="relative z-10">
                    <p className="text-lg font-black text-gray-900 leading-tight mb-2">{viewingMerchant.locality || 'Locality'}</p>
                    <p className="text-sm text-gray-500 font-bold">{viewingMerchant.address}, {viewingMerchant.city}, {viewingMerchant.state} - {viewingMerchant.pincode}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-md p-8 border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><HistoryRoundedIcon sx={{fontSize: 16}} />Operating Schedule</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const hours = viewingMerchant.businessHours?.[day];
                      return (
                        <div key={day} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">{day}</span>
                          <span className={`text-[11px] font-black ${hours?.isClosed ? 'text-red-400' : 'text-gray-900'}`}>{hours?.isClosed ? 'Closed' : `${hours?.open || '09:00'} - ${hours?.close || '21:00'}`}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-md p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8 px-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><InsertDriveFileRoundedIcon sx={{fontSize: 16}} />Verification Documents (KYB)</h4>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">{viewingMerchant.documents?.length || 0} Files</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {viewingMerchant.documents && viewingMerchant.documents.length > 0 ? (
                  viewingMerchant.documents.filter(doc => !!doc).map((doc, i) => (
                    <motion.a 
                      key={i} href={doc.url || doc.data} target="_blank" rel="noopener noreferrer" whileHover={{ y: -4 }}
                      className="flex flex-col bg-white border border-gray-100 rounded-md hover:border-primary/30 transition-all shadow-sm group/doc relative overflow-hidden h-64"
                    >
                      <div className="w-full h-full relative overflow-hidden bg-gray-50 flex items-center justify-center">
                        {doc.url || doc.data ? (<img src={doc.url || doc.data} alt="" className="w-full h-full object-cover group-hover/doc:scale-110 transition-transform duration-700" />) : (<div className="flex flex-col items-center gap-2 text-gray-300"><InsertDriveFileRoundedIcon sx={{fontSize: 48}} /><span className="text-[10px] font-black uppercase">No Preview Available</span></div>)}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover/doc:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">{doc.label || 'Document'}</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black truncate flex-1">{doc.name}</p>
                            <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center"><ArrowForwardRoundedIcon sx={{fontSize: 16}} className="text-white group-hover/doc:translate-x-1 transition-all" /></div>
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  ))
                ) : (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-md border border-dashed border-gray-200">
                    <InsertDriveFileRoundedIcon sx={{fontSize: 48}} className="opacity-20 mb-3" /><p className="text-xs font-bold uppercase tracking-widest">No documents found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><CategoryRoundedIcon sx={{fontSize: 16}} />Store Gallery</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max 4 Photos</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {((viewingMerchant.photos && viewingMerchant.photos.length > 0) || (viewingMerchant.storePhotos && viewingMerchant.storePhotos.length > 0)) ? (
                  (viewingMerchant.photos || viewingMerchant.storePhotos || []).filter(photo => !!photo).map((photo, i) => (
                    <div key={i} className="w-full aspect-square sm:aspect-[4/3] bg-gray-100 rounded-md overflow-hidden border-4 border-white shadow-lg hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in group/gallery relative">
                      <img src={typeof photo === 'string' ? photo : (photo?.url || photo?.data || '')} alt={`Store view ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-4 py-2 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 gap-2"><VisibilityRoundedIcon className="text-white" sx={{fontSize: 18}} /><span className="text-white font-black text-[10px] uppercase tracking-widest">Full View</span></div>
                      </div>
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10"><span className="text-white font-black text-[8px] uppercase tracking-widest">Photo {i + 1}</span></div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full aspect-video bg-gray-50 rounded-md border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                    <StorefrontRoundedIcon sx={{fontSize: 64}} className="opacity-10 mb-4" /><p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No Store Photos Uploaded</p>
                  </div>
                )}
              </div>
            </div>

              </div>
            </div>
          </div>
        )}
      </SlideOver>

      <RejectionReasonModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onSubmit={confirmReject} />
    </div>
  );
};

export default MerchantManagement;

