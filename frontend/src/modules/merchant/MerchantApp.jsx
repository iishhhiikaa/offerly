import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ContactSupportRoundedIcon from '@mui/icons-material/ContactSupportRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import { useApp } from '../customer/context/AppContext';
import { merchantAPI } from '../../api/merchant.api';
import OtpVerify from '../customer/pages/auth/OtpVerify';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

// Sub-modules (Lazy Loaded to prevent ad-blockers from crashing the app)
const MerchantLogin = lazy(() => import('./auth/MerchantLogin'));
const MerchantSignup = lazy(() => import('./auth/MerchantSignup'));
const StoreRegistration = lazy(() => import('./auth/StoreRegistration'));
const MerchantStatus = lazy(() => import('./auth/MerchantStatus'));
const MerchantRegistrationFlow = lazy(() => import('./auth/MerchantRegistrationFlow'));
const MerchantDashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Products = lazy(() => import('./pages/Products'));
const Offers = lazy(() => import('./pages/Offers'));
const Customers = lazy(() => import('./pages/Customers'));
const ScannerEntry = lazy(() => import('./pages/ScannerEntry'));

// Static Pages (Risk for Ad-Blockers)
const About = lazy(() => import('./pages/static/About'));
const LegalTerms = lazy(() => import('./pages/static/LegalTerms'));
const LegalPrivacy = lazy(() => import('./pages/static/LegalPrivacy'));
const Contact = lazy(() => import('./pages/static/Contact'));
const Support = lazy(() => import('./pages/static/Support'));

// Notifications & Profile
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));

// Reuse the loader from the main app or define a simple one
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const MerchantSidebar = ({ merchant, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const { logout } = useApp();
  const navigate = useNavigate();

  const mainNavItems = [
    { name: 'Dashboard', path: '/merchant', icon: DashboardRoundedIcon },
    { name: 'Live Bookings', path: '/merchant/bookings', icon: ReceiptLongRoundedIcon },
    { name: 'Verify QR', path: '/merchant/scanner', icon: QrCodeScannerRoundedIcon },
  ];

  const storeNavItems = [
    { name: 'Store Products', path: '/merchant/products', icon: Inventory2RoundedIcon },
    { name: 'Active Offers', path: '/merchant/offers', icon: LocalOfferRoundedIcon },
    { name: 'Customers', path: '/merchant/customers', icon: PeopleAltRoundedIcon },
  ];

  const accountNavItems = [
    { name: 'Notifications', path: '/merchant/notifications', icon: NotificationsRoundedIcon },
    { name: 'Profile', path: '/merchant/profile', icon: PersonRoundedIcon },
  ];

  const helpNavItems = [
    { name: 'About', path: '/merchant/about', icon: InfoRoundedIcon },
    { name: 'Support', path: '/merchant/support', icon: HelpRoundedIcon },
    { name: 'Contact', path: '/merchant/contact', icon: ContactSupportRoundedIcon },
    { name: 'Terms', path: '/merchant/terms', icon: DescriptionRoundedIcon },
    { name: 'Privacy', path: '/merchant/privacy', icon: SecurityRoundedIcon },
  ];

  const handleNavClick = () => {
    // Close mobile menu when navigation item is clicked
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path || (item.path !== '/merchant' && location.pathname.startsWith(item.path));
    return (
      <Link
        key={item.name}
        to={item.path}
        onClick={handleNavClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
            ? 'bg-white/10 text-white font-semibold'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.04] font-medium'
          }`}
      >
        {/* Active accent stripe */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-400 rounded-r-full" />
        )}
        <item.icon sx={{ fontSize: 20 }} className={isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-primary-400 transition-colors'} />
        <span className="text-sm">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className={`w-[260px] gradient-dark-sidebar h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
      {/* Mobile Close Button */}
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        aria-label="Close menu"
      >
        <CloseRoundedIcon sx={{ fontSize: 20 }} />
      </button>

      {/* ── Brand + Store Info ─────────────────── */}
      <div className="p-6 pb-5">
        <h1 className="text-xl font-display font-extrabold text-white tracking-tight uppercase">
          OFFERLY<span className="text-primary-400 italic">BIZ</span>
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/10 ring-2 ring-primary/30 p-0.5 flex-shrink-0">
            {merchant?.logo ? (
              <img src={merchant?.logo} className="w-full h-full object-cover rounded-lg" alt="" />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary-400 font-bold text-lg rounded-lg">
                {merchant?.storeName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{merchant?.storeName}</p>
            <p className="text-micro text-primary-400 uppercase mt-0.5">{merchant?.category}</p>
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────── */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      {/* ── Navigation ─────────────────────────── */}
      <nav className="flex-1 p-4 flex flex-col gap-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-micro text-gray-500 uppercase tracking-widest pl-4 mb-2 mt-2">Overview</p>
        {mainNavItems.map(renderNavItem)}

        <p className="text-micro text-gray-500 uppercase tracking-widest pl-4 mb-2 mt-5">Store Management</p>
        {storeNavItems.map(renderNavItem)}

        <p className="text-micro text-gray-500 uppercase tracking-widest pl-4 mb-2 mt-5">Account</p>
        {accountNavItems.map(renderNavItem)}

        <p className="text-micro text-gray-500 uppercase tracking-widest pl-4 mb-2 mt-5">Help & Legal</p>
        {helpNavItems.map(renderNavItem)}
      </nav>

      {/* ── Bottom Section ─────────────────────── */}
      <div className="p-4 space-y-2">
        {/* Subscription Badge */}
        {merchant?.subscription?.plan?.name && (
          <div className="mx-2 mb-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} className="text-primary-400" />
              <span className="text-xs font-semibold text-primary-400">{merchant.subscription.plan.name}</span>
            </div>
            {merchant.remainingDays !== undefined && (
              <p className="text-micro text-gray-500 mt-1 pl-6">{merchant.remainingDays} days remaining</p>
            )}
          </div>
        )}

        <div className="mx-2 h-px bg-gray-800/50" />

        <button
          onClick={() => { logout(); navigate('/merchant'); handleNavClick(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all font-medium text-sm"
        >
          <LogoutRoundedIcon sx={{ fontSize: 18 }} />
          Logout
        </button>
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 text-micro text-gray-500 hover:text-gray-300 px-4 tracking-widest transition-colors py-1.5">
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 10 }} /> Back to Offerly
        </Link>
      </div>
    </div>
  );
};

// Global Guard Wrapper
const MerchantApp = () => {
  const { user, isLoggedIn, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMerchant = async () => {
    if (isLoggedIn && user) {
      try {
        setLoading(true);
        // Fetch merchant and subscription info
        const [mRes, sRes] = await Promise.all([
          merchantAPI.getById('me'),
          merchantAPI.getMySubscription()
        ]);

        if (mRes.merchant) {
          const merchantData = mRes.merchant;
          // Calculate remaining days if subscription exists
          if (sRes.subscription) {
            const endDate = new Date(sRes.subscription.endDate);
            const now = new Date();
            merchantData.subscription = sRes.subscription;
            merchantData.isSubscriptionExpired = endDate < now;
            merchantData.remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
          }
          setMerchant(merchantData);
        }
        
        // Fetch unread notification count
        fetchUnreadCount();
      } catch (error) {
        console.error('Failed to fetch merchant data:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await merchantAPI.getNotifications();
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchMerchant();
  }, [isLoggedIn, user]);

  // Refresh merchant data when navigating to status page
  useEffect(() => {
    if (location.pathname === '/merchant/status' && isLoggedIn && user) {
      fetchMerchant();
    }
  }, [location.pathname, isLoggedIn, user]);

  // Handle Real-time Notifications & Approval (uses shared socket from SocketContext)
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !merchant?._id) return;

    const handleNotification = (notification) => {
      toast.success(notification.title, {
        description: notification.body,
        duration: 6000,
      });
      
      // Refresh unread count
      fetchUnreadCount();
      
      // If it's a status update, refresh the merchant data to unlock the dashboard
      if (notification.type === 'store_status') {
        fetchMerchant();
      }
    };

    socket.on('merchant_notification', handleNotification);

    return () => {
      socket.off('merchant_notification', handleNotification);
    };
  }, [socket, merchant?._id]);

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  // 1. Auth Guard
  if (!isLoggedIn || user?.type !== 'merchant') {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/merchant/login" replace />} />
        <Route path="/login" element={<MerchantLogin />} />
        <Route path="/signup" element={<MerchantSignup />} />
        <Route path="/verify" element={<OtpVerify />} />
        <Route path="*" element={<Navigate to="/merchant" replace />} />
      </Routes>
    );
  }

  // 2. Registration Status logic
  // Case: User logged in but never requested a store OR onboarding incomplete
  if (!merchant || !merchant.hasRequestedStore || (merchant.onboardingStep < 4)) {
    return (
      <Routes>
        <Route path="/register" element={<MerchantRegistrationFlow />} />
        <Route path="/status" element={<Navigate to="/merchant/register" replace />} />
        <Route path="*" element={<Navigate to="/merchant/register" replace />} />
      </Routes>
    );
  }

  // Case: Store is Pending or Rejected - Show Status Page
  if (merchant.status === 'pending' || merchant.status === 'rejected') {
    return (
      <Routes>
        <Route path="/status" element={<MerchantStatus merchant={merchant} onStatusChange={fetchMerchant} />} />
        <Route path="*" element={<Navigate to="/merchant/status" replace />} />
      </Routes>
    );
  }

  // Case: Subscription Expired - Redirect to Plans
  if (merchant.isSubscriptionExpired) {
    // For now, redirect to a placeholder or a plan selection page
    // We can add a Plans page later, but for now let's at least block the dashboard
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 40 }} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">SUBSCRIPTION EXPIRED</h1>
          <p className="text-gray-500 font-medium mb-8">Your trial period has ended. Please choose a subscription plan to continue growing your business with Offerly.</p>
          <button
            onClick={() => toast.info('Plan selection is coming soon! Contact support to renew.')}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg ring-4 ring-primary/10 mb-4"
          >
            Pick a Plan
          </button>
          <button
            onClick={() => { logout(); navigate('/merchant'); }}
            className="w-full text-gray-400 font-bold py-2"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Case: Store Approved -> Render Sidebar + Content
  if (merchant?.status === 'approved') {
    return (
      <div className="flex bg-merchant-bg min-h-screen font-sans">
        <MerchantSidebar merchant={merchant} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between z-40">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <MenuRoundedIcon sx={{fontSize: 22}} />
          </button>
          <h1 className="text-lg font-display font-extrabold text-gray-900 tracking-tight uppercase">
            OFFERLY<span className="text-primary italic">BIZ</span>
          </h1>
          
          {/* Notification & Profile Icons */}
          <div className="flex items-center gap-2">
            {/* Notification Icon */}
            <button
              onClick={() => navigate('/merchant/notifications')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <NotificationsRoundedIcon sx={{ fontSize: 22 }} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            {/* Profile Icon */}
            <button
              onClick={() => navigate('/merchant/profile')}
              className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20"
              aria-label="Profile"
            >
              <span className="text-primary font-bold text-sm">
                {merchant?.storeName?.charAt(0)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="flex-1 lg:ml-[260px] p-4 lg:p-8 pt-20 lg:pt-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-accent-cool/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<MerchantDashboard merchant={merchant} />} />
                <Route path="/bookings" element={<Bookings merchant={merchant} />} />
                <Route path="/scanner" element={<ScannerEntry merchant={merchant} />} />
                <Route path="/products" element={<Products merchant={merchant} />} />
                <Route path="/offers" element={<Offers merchant={merchant} />} />
                <Route path="/customers" element={<Customers merchant={merchant} />} />
                
                {/* Notifications & Profile */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile merchant={merchant} />} />
                
                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Support />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<LegalTerms />} />
                <Route path="/privacy" element={<LegalPrivacy />} />
                
                <Route path="*" element={<Navigate to="/merchant" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    );
  }

  // Case: Store Not Approved (Pending or Rejected)
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-0">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/status" element={<MerchantStatus merchant={merchant} onStatusChange={fetchMerchant} />} />
          
          <Route path="/" element={
            merchant?.hasRequestedStore 
              ? <Navigate to="/merchant/status" replace /> 
              : <StoreRegistration merchant={merchant} onStatusChange={fetchMerchant} />
          } />

          <Route path="*" element={<Navigate to="/merchant" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const Placeholder = ({ title }) => (
  <div className="bg-white rounded-3xl p-12 border border-blue-50/50 shadow-sm text-center">
    <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
      <Inventory2RoundedIcon sx={{ fontSize: 40 }} />
    </div>
    <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase">{title}</h1>
    <p className="text-gray-500 font-medium max-w-sm mx-auto">This section is being architected with full CRUD support for {title.toLowerCase()}. Stay tuned!</p>
  </div>
);

export default MerchantApp;
