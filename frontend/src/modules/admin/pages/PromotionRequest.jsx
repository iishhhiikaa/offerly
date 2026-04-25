import { useState, useEffect } from 'react';
import AdminDataTable from '../components/AdminDataTable';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SlideOver from '../components/SlideOver';
import { adminAPI } from '../../../api/admin.api';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import toast from 'react-hot-toast';

const PromotionRequest = () => {
  const [ads, setAds] = useState([]);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdRequests();
      const allAds = (res.data?.ads || res.ads || [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setAds(allAds);
    } catch (err) {
      toast.error('Failed to load ad requests from server (Not implemented yet)');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (adId, status) => {
    try {
      await adminAPI.updateAdStatus(adId, status);
      toast.success(`Ad request ${status}`);
      loadAds();
    } catch (err) {
      toast.error('Update status not directly connected to backend router yet');
    }
  };

  const handleView = (ad) => {
    setSelectedAd(ad);
    setIsSlideOverOpen(true);
  };

  const handleDeleteClick = (ad) => {
    setSelectedAd(ad);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await adminAPI.deleteAd(selectedAd._id || selectedAd.id);
      toast.success('Ad deleted');
      setIsDeleteModalOpen(false);
      loadAds();
    } catch (err) {
      toast.error('Failed to delete ad request');
    }
  };

  const columns = [
    { 
      header: 'Store / Ad Type', 
      key: 'storeName',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <CampaignRoundedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-none">{row.storeName}</p>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5">{row.type} ADS</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Requested On', 
      key: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-widest">
           <AccessTimeRoundedIcon sx={{ fontSize: 14 }} className="text-gray-400" />
           {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (row) => {
        const styles = {
          approved: 'bg-green-100 text-green-700',
          pending: 'bg-amber-100 text-amber-700',
          rejected: 'bg-red-100 text-red-700'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-80 ${styles[row.status] || 'bg-gray-100 text-gray-700'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Action Hub',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
           {row.status === 'pending' && (
             <>
               <button 
                 onClick={() => handleUpdateStatus(row.id, 'approved')}
                 className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                 title="Approve"
               >
                 <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
               </button>
               <button 
                 onClick={() => handleUpdateStatus(row.id, 'rejected')}
                 className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                 title="Reject"
               >
                 <CancelRoundedIcon sx={{ fontSize: 18 }} />
               </button>
             </>
           )}
           <button 
             onClick={() => handleView(row)}
             className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
             title="View Details"
           >
             <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Requests</p>
          <h3 className="text-3xl font-black text-amber-600">{ads.filter(a => a.status === 'pending').length}</h3>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Approved Ads</p>
          <h3 className="text-3xl font-black text-green-600">{ads.filter(a => a.status === 'approved').length}</h3>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rejected Requests</p>
          <h3 className="text-3xl font-black text-red-600">{ads.filter(a => a.status === 'rejected').length}</h3>
        </div>
      </div>

      <AdminDataTable 
        title="Advertisement Queue"
        description="Review and manage campaign requests from merchants for home banners and search highlights."
        columns={columns}
        data={ads}
        onDelete={handleDeleteClick}
        searchKey="storeName"
        searchPlaceholder="Search by store name..."
      />

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title="Ad Campaign Details"
        subtitle="Review the submitted creative and targeting details."
        footer={
           <button onClick={() => setIsSlideOverOpen(false)} className="bg-gray-900 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-gray-800 shadow-lg shadow-gray-500/20">Close Preview</button>
        }
      >
        <div className="space-y-6 pt-2">
           <div className="bg-gray-50 rounded-lg p-4 overflow-hidden border border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ad Creative Preview</label>
              {selectedAd?.image ? (
                <img src={selectedAd.image} alt="Creative" className="w-full h-48 object-cover rounded-lg shadow-md" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold italic">No image provided</div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Campaign Type</label>
                <p className="text-sm font-bold text-gray-900 capitalize">{selectedAd?.type}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Store Reference</label>
                <p className="text-sm font-bold text-gray-900">{selectedAd?.storeName}</p>
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Expiry</label>
              <p className="text-sm font-bold text-gray-900">{selectedAd?.expiryAt ? new Date(selectedAd.expiryAt).toLocaleString() : 'N/A'}</p>
           </div>
        </div>
      </SlideOver>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Discard Ad Request?"
        message="This will permanently delete the advertisement request from the queue. The merchant will not be notified of the deletion."
      />
    </div>
  );
};

export default PromotionRequest;
