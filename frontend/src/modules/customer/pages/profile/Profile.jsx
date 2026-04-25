import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useApp } from '../../context/AppContext';
import { bookingAPI } from '../../../../api/booking.api';
import { userAPI } from '../../../../api/user.api';
import { cityAPI } from '../../../../api/city.api';
import PageTransition from '../../components/ui/PageTransition';
import BottomSheet from '../../components/ui/BottomSheet';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const menuSections = [
  {
    title: 'Activity',
    items: [
      { label: 'My Redemptions', icon: ReceiptLongRoundedIcon, path: '/redemptions' },
      { label: 'Saved Offers', icon: BookmarkRoundedIcon, path: '/saved' },
      { label: 'Referral Program', icon: CardGiftcardRoundedIcon, path: '/referral' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Notifications', icon: NotificationsRoundedIcon, path: '/notifications' },
    ],
  },
  {
    title: 'Help & Legal',
    items: [
      { label: 'Support Center', icon: HelpOutlineRoundedIcon, path: '/support' },
      { label: 'Contact Us', icon: PersonRoundedIcon, path: '/contact' },
      { label: 'About Offerly', icon: CardGiftcardRoundedIcon, path: '/about' },
      { label: 'Terms & Conditions', icon: ReceiptLongRoundedIcon, path: '/terms' },
      { label: 'Privacy Policy', icon: LocationOnRoundedIcon, path: '/privacy' },
    ],
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useApp();
  const [redemptionCount, setRedemptionCount] = useState(0);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    city: '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await bookingAPI.getCustomerRedemptions();
        if (res && res.success) {
          setRedemptionCount(res.data.length);
        }
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await cityAPI.getAll();
        setAvailableCities(response.cities || []);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Initialize form when user data is available or sheet opens
  useEffect(() => {
    if (user && editSheetOpen) {
      setEditForm({
        name: user.name || '',
        city: user.city || '',
      });
    }
  }, [user, editSheetOpen]);

  const savedCount = user?.savedOffers?.length || 0;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Referral code copied!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setEditSheetOpen(true);
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!editForm.city) {
      toast.error('Please select a city');
      return;
    }

    try {
      setSaving(true);
      const response = await userAPI.updateProfile({
        name: editForm.name.trim(),
        city: editForm.city,
      });

      if (response && response.user) {
        toast.success('Profile updated successfully!');
        await refreshUser(); // Refresh user data in context
        setEditSheetOpen(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="pb-24 bg-gray-50 min-h-screen">
        {/* Profile header - Reduced border radius */}
        <div className="gradient-hero-green px-6 pt-8 pb-10 rounded-b-3xl shadow-inset-glow relative overflow-hidden">
          {/* Decals */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 mix-blend-overlay pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg backdrop-blur-md">
              <span className="text-white text-3xl font-display font-black">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-display font-black text-2xl tracking-tight leading-none">{user?.name}</h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <LocationOnRoundedIcon sx={{ fontSize: 16 }} className="text-white/80" />
                <span className="text-white/90 text-sm font-medium">{user?.city}</span>
              </div>
              <p className="text-white/70 text-xs mt-1 font-mono">{user?.phone}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEditProfile}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"
            >
              <EditRoundedIcon sx={{ fontSize: 18 }} className="text-white" />
            </motion.button>
          </div>
        </div>

        <div className="px-5 -mt-5 relative z-20">
          {/* Stats card - Modern design with gradients and proper icons */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 grid grid-cols-3 gap-3 mb-5">
            {[
              { 
                label: 'Redeemed', 
                value: redemptionCount, 
                icon: ReceiptLongRoundedIcon,
                gradient: 'from-blue-50 to-blue-100',
                iconColor: 'text-blue-600',
                textColor: 'text-blue-900'
              },
              { 
                label: 'Saved', 
                value: savedCount, 
                icon: BookmarkRoundedIcon,
                gradient: 'from-amber-50 to-amber-100',
                iconColor: 'text-amber-600',
                textColor: 'text-amber-900'
              },
              { 
                label: 'Credits', 
                value: `₹${user?.credits || 0}`, 
                icon: AccountBalanceWalletRoundedIcon,
                gradient: 'from-emerald-50 to-emerald-100',
                iconColor: 'text-emerald-600',
                textColor: 'text-emerald-900'
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={stat.label} 
                  whileHover={{ y: -2 }}
                  className={`bg-gradient-to-br ${stat.gradient} rounded-lg p-3 text-center transition-all cursor-pointer`}
                >
                  <Icon sx={{ fontSize: 24 }} className={`${stat.iconColor} mb-1.5`} />
                  <p className={`text-lg font-bold ${stat.textColor} tracking-tight`}>{stat.value}</p>
                  <p className="text-[9px] font-bold tracking-wider text-gray-600 mt-0.5">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Referral code card - More compact and modern */}
          {user?.referralCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/60 rounded-xl p-4 mb-4 shadow-sm overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-[9px] font-bold tracking-wider text-emerald-700/70 mb-1">REFERRAL CODE</p>
                  <p className="text-xl font-mono font-black text-emerald-700 tracking-widest">
                    {user.referralCode}
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                     <CardGiftcardRoundedIcon sx={{ fontSize: 13 }}/> Earn ₹50 per referral
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyReferral}
                  className="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg flex items-center justify-center shadow-md shadow-emerald-600/30 text-white flex-shrink-0"
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Menu sections - Reduced padding and border radius */}
          {menuSections.map((section, sIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.08 }}
              className="mb-4"
            >
              <p className="text-[9px] font-bold text-gray-500 tracking-wider mb-2 px-1">
                {section.title}
              </p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      whileTap={{ backgroundColor: '#F9FAFB' }}
                      onClick={() => item.path && navigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-primary/10 transition-all">
                        <Icon sx={{ fontSize: 18 }} className="text-primary" />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-gray-800 text-left">
                        {item.label}
                      </span>
                      <ChevronRightRoundedIcon sx={{ fontSize: 18 }} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Logout - Reduced border radius */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-3.5 mt-2 transition-colors shadow-sm"
          >
            <LogoutRoundedIcon sx={{ fontSize: 19 }} className="text-red-600" />
            <span className="text-sm font-bold tracking-wide text-red-600">Logout</span>
          </motion.button>

          <p className="text-center text-[9px] font-semibold text-gray-400 mt-6 pb-4 tracking-wider">
            Offerly v1.0.0 · Customer Panel
          </p>
        </div>
      </div>

      {/* Edit Profile Bottom Sheet */}
      <BottomSheet
        isOpen={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        title="Edit Profile"
      >
        <div className="p-5 space-y-4 pb-8">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-sm font-medium"
            />
          </div>

          {/* City Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              City
            </label>
            <select
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-sm font-medium bg-white"
            >
              <option value="">Select City</option>
              {availableCities.map((city) => (
                <option key={city._id || city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={user?.phone || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-medium text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1.5">Phone number cannot be changed</p>
          </div>

          {/* Save Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveRoundedIcon sx={{ fontSize: 20 }} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </BottomSheet>
    </PageTransition>
  );
};

export default Profile;
