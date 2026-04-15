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
import { useApp } from '../../context/AppContext';
import { bookingAPI } from '../../../../api/booking.api';
import PageTransition from '../../components/ui/PageTransition';
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
    title: 'Support',
    items: [
      { label: 'Help & FAQ', icon: HelpOutlineRoundedIcon, path: null },
    ],
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [redemptionCount, setRedemptionCount] = useState(0);

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

  const savedCount = user?.savedOffers?.length || 0;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Referral code copied!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageTransition>
      <div className="pb-24 bg-gray-50 min-h-screen">
        {/* Profile header */}
        <div className="gradient-hero-green px-6 pt-10 pb-12 rounded-b-[2.5rem] shadow-inset-glow relative overflow-hidden">
          {/* Decals */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 mix-blend-overlay pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg backdrop-blur-md">
              <span className="text-white text-3xl font-display font-black">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-display font-black text-2xl tracking-tight leading-none">{user?.name}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <LocationOnRoundedIcon sx={{ fontSize: 16 }} className="text-white/80" />
                <span className="text-white/90 text-sm font-medium">{user?.city}</span>
              </div>
              <p className="text-white/70 text-xs mt-1 font-mono">{user?.phone}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"
            >
              <EditRoundedIcon sx={{ fontSize: 18 }} className="text-white" />
            </motion.button>
          </div>
        </div>

        <div className="px-5 -mt-6 relative z-20">
          {/* Stats card */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Redeemed', value: redemptionCount, icon: '🎟️' },
              { label: 'Saved', value: savedCount, icon: '🔖' },
              { label: 'Credits', value: `₹${user?.credits || 0}`, icon: '💰' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group transition-transform hover:-translate-y-1">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-xl font-mono font-black text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Referral code card */}
          {user?.referralCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100/60 rounded-3xl p-5 mb-6 shadow-sm overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Your Referral Code</p>
                  <p className="text-2xl font-mono font-black text-emerald-700 mt-1 tracking-widest">
                    {user.referralCode}
                  </p>
                  <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                     <CardGiftcardRoundedIcon sx={{ fontSize: 14 }}/> Share & earn ₹50 per referral
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyReferral}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white"
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 20 }} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Menu sections */}
          {menuSections.map((section, sIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.08 }}
              className="mb-5"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-2">
                {section.title}
              </p>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      whileTap={{ backgroundColor: '#F9FAFB' }}
                      onClick={() => item.path && navigate(item.path)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                        <Icon sx={{ fontSize: 20 }} className="text-primary" />
                      </div>
                      <span className="flex-1 text-sm font-bold text-gray-800 text-left">
                        {item.label}
                      </span>
                      <ChevronRightRoundedIcon sx={{ fontSize: 20 }} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-2xl p-4 mt-2 transition-colors shadow-sm"
          >
            <LogoutRoundedIcon sx={{ fontSize: 20 }} className="text-red-600" />
            <span className="text-sm font-black uppercase tracking-widest text-red-600">Logout</span>
          </motion.button>

          <p className="text-center text-[10px] font-bold text-gray-400 mt-8 pb-4 uppercase tracking-widest">
            Offerly v1.0.0 · Customer Panel
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
