import { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AdminEntityCard from '../components/AdminEntityCard';
import { adminAPI } from '../../../api/admin.api';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'suspended'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers();
      const fetchedUsers = res.data?.users || res.users || res.data || [];
      const sortedUsers = Array.isArray(fetchedUsers) 
        ? fetchedUsers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        : [];
      // Strictly filter for customers only as per previous requirement
      setUsers(sortedUsers.filter(user => user.role === 'customer'));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminAPI.updateUserStatus(user._id || user.id, newStatus);
      toast.success(`User ${newStatus}`);
      loadUsers();
    } catch (error) {
       toast.error('Update status failed');
    }
  };

  const filteredUsers = users.filter(user => {
    // Tab Filter
    const tabMatch = activeTab === 'all' || user.status === activeTab;
    
    // Search Query
    const searchMatch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const TabButton = ({ id, label }) => {
    const count = users.filter(u => id === 'all' ? true : u.status === id).length;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all relative ${
          activeTab === id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {label} ({count})
        {activeTab === id && (
          <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(61,122,79,0.4)]" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background text-text-primary -mt-6 -mx-8 px-8 pt-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GroupRoundedIcon className="text-primary" />
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Customer Oversight</h1>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              Oversight and lifecycle management of registered platform users
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={loadUsers}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 transition-all text-sm font-bold shadow-sm"
            >
              <RefreshRoundedIcon sx={{ fontSize: 18 }} />
              Refresh
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <SettingsSuggestRoundedIcon sx={{ fontSize: 18 }} />
              User Criteria
            </button>
          </div>
        </div>

        {/* Toolbar: Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <TabButton id="all" label="All" />
            <TabButton id="active" label="Active" />
            <TabButton id="suspended" label="Blocked" />
          </div>

          <div className="relative flex-1 max-w-md">
            <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
            <input 
              type="text" 
              placeholder="Search customers by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>

        {/* Dynamic Card List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-500 font-black uppercase tracking-tighter text-xs">Syncing Customer Base...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map(user => (
              <AdminEntityCard 
                key={user._id || user.id}
                entity={user}
                type="customer"
                onView={() => toast.success('Detail view coming soon')}
                onStatusToggle={() => handleToggleStatus(user)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
            <PersonRemoveRoundedIcon className="text-gray-300 mb-4" sx={{ fontSize: 64 }} />
            <h3 className="text-xl font-bold text-gray-400">No Customers Found</h3>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {}} // Not implemented yet
        title={`Revoke Access for ${selectedUser?.name || 'this customer'}?`}
        message="Permanently delete this customer from the platform. They will lose all access immediately. All historical data will remain as logs but will be unlinked."
      />
    </div>
  );
};

export default UserManagement;

