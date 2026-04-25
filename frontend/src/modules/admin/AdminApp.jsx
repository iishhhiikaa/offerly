import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

// Admin Pages (Lazy Loaded for performance and ad-blocker resilience)
const AdminDashboard = lazy(() => import('./pages/Dashboard'));
const MerchantManagement = lazy(() => import('./pages/MerchantManagement'));
const BookingLedger = lazy(() => import('./pages/BookingLedger'));
const CityManagement = lazy(() => import('./pages/CityManagement'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const SubscriptionManagement = lazy(() => import('./pages/SubscriptionManagement'));
const PromotionRequest = lazy(() => import('./pages/PromotionRequest'));
const Analytics = lazy(() => import('./pages/Analytics'));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
import { STORAGE_KEYS } from '../../config/constants';
import { useApp } from '../customer/context/AppContext';
import { adminAPI } from '../../api/admin.api';
import { useSocket } from '../../hooks/useSocket';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useApp();
  const navigate = useNavigate();
  const [merchantsExpanded, setMerchantsExpanded] = useState(
    location.pathname.includes('/admin/merchants')
  );

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: SpaceDashboardRoundedIcon },
    {
      name: 'Merchants',
      icon: StorefrontRoundedIcon,
      path: '/admin/merchants',
    },
    { name: 'Customers', path: '/admin/users', icon: GroupRoundedIcon },
    { name: 'Categories', path: '/admin/categories', icon: CategoryRoundedIcon },
    { name: 'Subscriptions', path: '/admin/plans', icon: PaymentsRoundedIcon },
    { name: 'Cities & Zones', path: '/admin/cities', icon: MapRoundedIcon },
    { name: 'Ad Requests', path: '/admin/ads', icon: CampaignRoundedIcon },
    { name: 'Ledger', path: '/admin/ledger', icon: ViewListRoundedIcon },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChartRoundedIcon },
  ];

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <div className="w-[260px] bg-[#0E1015] h-screen fixed left-0 top-0 flex flex-col border-r border-[#1F232B] z-50 text-gray-300 shadow-2xl">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-[#1F232B]/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br from-[#3D7A4F] to-[#2B5738] shadow-lg shadow-[#3D7A4F]/20">
              <span className="text-white text-base">O</span>
            </div>
            Offerly
          </h1>
          <p className="text-[9px] font-bold text-[#3D7A4F] uppercase tracking-[.35em] mt-1.5 ml-10">Control Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto no-scrollbar space-y-1">
        <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">Main Menu</p>
        {navItems.map((item) => {
          if (item.expandable) {
            const isParentActive = location.pathname.includes('/admin/merchants');
            return (
              <div key={item.name} className="mb-2">
                <button
                  onClick={item.onToggle}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all text-sm font-bold ${
                    isParentActive
                      ? 'text-white bg-[#1A1D24]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1A1D24]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon sx={{ fontSize: 20 }} className={isParentActive ? 'text-[#3D7A4F]' : 'opacity-70'} />
                    <span>{item.name}</span>
                  </div>
                  <KeyboardArrowDownRoundedIcon
                    sx={{ fontSize: 18 }}
                    className={`transition-transform duration-300 ${item.expanded ? 'rotate-180' : ''} ${isParentActive ? 'text-white' : 'opacity-50'}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${item.expanded ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                  <div className="ml-5 pl-4 border-l-2 border-[#1F232B] space-y-1 py-1">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname + location.search === child.path || (child.path === '/admin/merchants' && location.pathname === '/admin/merchants' && !location.search);
                      return (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`block px-4 py-2.5 rounded-md text-xs font-bold transition-all relative ${
                            isChildActive
                              ? 'text-white bg-[#3D7A4F]/10'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1D24]/50'
                          }`}
                        >
                          {isChildActive && (
                            <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3D7A4F] shadow-[0_0_8px_rgba(61,122,79,0.8)]" />
                          )}
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-bold group relative overflow-hidden ${
                active
                  ? 'bg-gradient-to-r from-[#3D7A4F]/20 to-transparent text-white border-l-2 border-[#3D7A4F] shadow-[inset_4px_0_0_0_#3D7A4F]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1D24]/50 border-l-2 border-transparent'
              }`}
            >
              <item.icon
                sx={{ fontSize: 20 }}
                className={active ? 'text-[#3D7A4F]' : 'opacity-70 group-hover:text-white group-hover:opacity-100 transition-colors'}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F232B]/50 bg-[#0A0C0F]">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
        >
          <LogoutRoundedIcon sx={{ fontSize: 18 }} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const AdminHeader = () => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { socket } = useSocket();
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await adminAPI.getNotifications();
        const unread = res.data?.filter(n => !n.isRead).length || 0;
        setPendingCount(unread);
      } catch (err) {}
    };
    fetchPending();

    if (socket) {
      socket.on('admin_notification', () => {
        setPendingCount(prev => prev + 1);
      });
      return () => socket.off('admin_notification');
    }
  }, [socket]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 px-8 py-4 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 shadow-sm">
      {/* Left: Page Title Breadcrumb Style */}
      <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
        <span>Admin</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900">Dashboard</span>
      </div>

      {/* Center: Search (Command Palette Simulation) */}
      <div className="relative w-96 hidden lg:block group">
        <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3D7A4F] transition-colors" sx={{ fontSize: 20 }} />
        <input
          type="text"
          placeholder="Search merchants, users, or cities (Enter)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyPress}
          className="w-full bg-gray-100/80 border border-gray-200/50 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-[#3D7A4F]/20 focus:border-[#3D7A4F] transition-all outline-none shadow-inner shadow-gray-200/30"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded font-mono">⌘</kbd>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded font-mono">K</kbd>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Date Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200/50">
          <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{currentDate}</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/admin/notifications')}
          className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <NotificationsRoundedIcon sx={{ fontSize: 22 }} className="text-gray-600" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-200" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-gray-900 leading-none group-hover:text-[#3D7A4F] transition-colors">Super Admin</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">System Owner</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3D7A4F] to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-[#3D7A4F]/20">
            <AccountCircleRoundedIcon sx={{ fontSize: 22 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <AdminHeader />
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

const AdminApp = () => {
  const { user, isLoggedIn, authStatus } = useApp();

  // Check if user is authenticated as admin
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const storedUser = (() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch { 
      return null; 
    }
  })();

  // Debug logging
  console.log('🔍 AdminApp Auth Check:', {
    hasToken: !!token,
    isLoggedIn,
    authStatus,
    userRole: user?.role,
    storedUserRole: storedUser?.role,
    pathname: window.location.pathname
  });

  const isAdmin = (
    (isLoggedIn && (user?.role === 'admin' || user?.type === 'admin')) || 
    (token && storedUser && (storedUser?.role === 'admin' || storedUser?.type === 'admin'))
  );

  console.log('✅ Is Admin:', isAdmin);

  // Not authenticated as admin → show login
  if (!isAdmin) {
    console.log('❌ Not admin, showing login page');
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  // Authenticated as admin → show dashboard
  console.log('✅ Admin authenticated, showing dashboard');
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Initializing Portal...</div>}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/cities" element={<CityManagement />} />
          <Route path="/merchants" element={<MerchantManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/plans" element={<SubscriptionManagement />} />
          <Route path="/ads" element={<PromotionRequest />} />
          <Route path="/ledger" element={<BookingLedger />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AdminApp;
