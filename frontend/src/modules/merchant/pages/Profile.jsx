import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../customer/context/AppContext';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import ContactSupportRoundedIcon from '@mui/icons-material/ContactSupportRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useEffect, useState } from 'react';
import { merchantAPI } from '../../../api/merchant.api';

const menuSections = [
  {
    title: 'Business Info',
    items: [
      { label: 'Store Details', icon: BusinessRoundedIcon, path: '/merchant/profile/store-details' },
      { label: 'Location & Hours', icon: LocationOnRoundedIcon, path: '/merchant/profile/location' },
      { label: 'Bank Details', icon: AccountBalanceRoundedIcon, path: '/merchant/profile/bank' },
    ],
  },
  {
    title: 'Account Settings',
    items: [
      { label: 'Change Password', icon: LockRoundedIcon, path: '/merchant/profile/change-password' },
      { label: 'Notification Preferences', icon: NotificationsRoundedIcon, path: '/merchant/profile/notifications-settings' },
      { label: 'Language & Region', icon: LanguageRoundedIcon, path: '/merchant/profile/language' },
    ],
  },
  {
    title: 'Help & Legal',
    items: [
      { label: 'About Offerly Business', icon: InfoRoundedIcon, path: '/merchant/about' },
      { label: 'Support Center', icon: HelpRoundedIcon, path: '/merchant/support' },
      { label: 'Contact Us', icon: ContactSupportRoundedIcon, path: '/merchant/contact' },
      { label: 'Terms & Conditions', icon: DescriptionRoundedIcon, path: '/merchant/terms' },
      { label: 'Privacy Policy', icon: SecurityRoundedIcon, path: '/merchant/privacy' },
    ],
  },
];

const Profile = ({ merchant }) => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    offers: 0,
    rating: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await merchantAPI.getDashboard();
        if (response && response.stats) {
          setStats({
            revenue: response.stats.revenue || 0,
            bookings: response.stats.bookingsCount || 0,
            offers: response.stats.offersCount || 0,
            rating: merchant?.avgRating || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      }
    };
    fetchStats();
  }, [merchant]);

  const handleLogout = () => {
    logout();
    navigate('/merchant/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowBackRoundedIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block px-8 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900">Merchant Profile</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your store and account settings</p>
      </div>

      {/* Profile Header */}
      <div className="gradient-dark-sidebar px-6 pt-10 pb-12 lg:mx-8 lg:mt-4 rounded-b-[2.5rem] lg:rounded-[2rem] shadow-xl relative overflow-hidden">
        {/* Decals */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/10 ring-2 ring-white/30 p-0.5 flex-shrink-0">
            {merchant?.logo ? (
              <img src={merchant.logo} className="w-full h-full object-cover rounded-xl" alt="" />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary-400 font-bold text-2xl sm:text-3xl rounded-xl">
                {merchant?.storeName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-display font-black text-xl sm:text-2xl tracking-tight leading-none truncate">
              {merchant?.storeName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-primary-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                {merchant?.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <LocationOnRoundedIcon sx={{ fontSize: 14 }} className="text-white/70" />
              <span className="text-white/80 text-xs sm:text-sm font-medium">{merchant?.city}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/merchant/profile/edit')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"
          >
            <EditRoundedIcon sx={{ fontSize: 18 }} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="px-5 lg:px-8 -mt-6 relative z-20">
        {/* Stats Card */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: 'text-green-600' },
            { label: 'Bookings', value: stats.bookings, icon: '📋', color: 'text-blue-600' },
            { label: 'Offers', value: stats.offers, icon: '🎁', color: 'text-amber-600' },
            { label: 'Rating', value: stats.rating.toFixed(1), icon: '⭐', color: 'text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group transition-transform hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
              <p className={`text-xl sm:text-2xl font-mono font-black ${stat.color} tracking-tight`}>
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Subscription Card */}
        {merchant?.subscription?.plan?.name && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 sm:p-6 mb-6 shadow-lg text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80">Current Plan</p>
                </div>
                <p className="text-2xl sm:text-3xl font-black tracking-tight">
                  {merchant.subscription.plan.name}
                </p>
                {merchant.remainingDays !== undefined && (
                  <p className="text-sm font-medium text-white/90 mt-2">
                    {merchant.remainingDays} days remaining
                  </p>
                )}
              </div>
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                Upgrade
              </button>
            </div>
          </motion.div>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.08 }}
            className="mb-5"
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
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
          Offerly Business v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Profile;
