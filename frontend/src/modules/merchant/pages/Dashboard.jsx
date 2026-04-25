import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { merchantAPI } from '../../../api/merchant.api';

/* ─── Stat Card with Dark Gradients ─────────────── */
const StatCard = ({ title, value, subtitle, icon: Icon, gradientFrom, gradientTo, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg p-4 sm:p-5 lg:p-6 hover:-translate-y-1 transition-all duration-300 shadow-lg text-white relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
    <div className="flex justify-between items-start relative z-10">
      <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
        <Icon sx={{ fontSize: { xs: 20, sm: 22, lg: 24 } }} className="text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/20 backdrop-blur-sm text-white">
          <TrendingUpRoundedIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
          <span className="hidden sm:inline">{trend}</span>
        </div>
      )}
    </div>
    <div className="mt-auto space-y-0.5 sm:space-y-1 relative z-10 pt-4 sm:pt-5 lg:pt-6">
      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-none">{value}</h3>
      <p className="text-white/80 font-bold tracking-[0.1em] sm:tracking-[0.15em] text-[8px] sm:text-[9px] uppercase pt-0.5 sm:pt-1">{title}</p>
      {subtitle && (
        <p className="text-white/60 text-[10px] sm:text-xs font-medium pt-0.5 sm:pt-1 line-clamp-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

/* ─── Quick Action Button ───────────────────────── */
const QuickAction = ({ icon: Icon, label, onClick, color, bgColor, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all group bg-white shadow-sm"
  >
    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${bgColor} ${color} flex-shrink-0`}>
      <Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />
    </div>
    <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-gray-700 group-hover:text-primary text-center lg:text-left leading-tight">{label}</span>
  </motion.button>
);

/* ─── Custom Tooltip for chart ──────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-bold">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="font-mono">₹{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

/* ─── Mini Stat Card ────────────────────────────── */
const MiniStatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${bgColor} ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-lg sm:text-xl font-black text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

/* ─── Loading Skeleton ──────────────────────────── */
const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-72 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-48" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-36 bg-gray-200 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg" />
      ))}
    </div>
    <div className="h-72 bg-gray-100 rounded-lg" />
  </div>
);

/* ─── Main Dashboard ────────────────────────────── */
const MerchantDashboard = ({ merchant }) => {
  const navigate = useNavigate();

  // 1. React Query integration for dashboard statistics
  const { data: dashboardData, isLoading: isDashboardLoading, error } = useQuery({
    queryKey: ['merchantDashboard', merchant?._id],
    queryFn: () => merchantAPI.getDashboard(),
    enabled: !!merchant?._id,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  // 2. Computed statistics with memoization
  const stats = useMemo(() => {
    if (!dashboardData) return {
      pending: 0, fulfilled: 0, revenue: 0, totalCustomers: 0, avgOrderValue: 0,
      history: [], weeklyData: [], hourlyData: []
    };

    const apiStats = dashboardData.stats || {};
    const recentBookings = dashboardData.recentBookings || [];

    // Weekly data computation
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dayName = days[date.getDay()];
      const dayRevenue = recentBookings
        .filter(b => new Date(b.scannedAt || b.createdAt).toDateString() === date.toDateString())
        .reduce((sum, b) => sum + (b.totals?.final || 0), 0);
      return { day: dayName, revenue: dayRevenue };
    });

    const revenue = apiStats.revenue || 0;
    const fulfilled = apiStats.bookingsCount || 0;

    return {
      pending: apiStats.pendingBookingsCount || 0,
      fulfilled,
      revenue,
      totalCustomers: apiStats.customersCount || 0,
      avgOrderValue: fulfilled > 0 ? Math.round(revenue / fulfilled) : 0,
      history: recentBookings.slice(0, 8),
      weeklyData
    };
  }, [dashboardData]);

  if (!merchant) return null;
  if (isDashboardLoading) return <DashboardSkeleton />;
  if (error) return (
    <div className="p-12 text-center text-red-500 font-bold bg-red-50 rounded-xl border-2 border-red-100">
      Failed to load dashboard. Please refresh the page.
    </div>
  );

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-1">
            <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">{greeting}, {merchant.storeName} 👋</h1>
          <p className="text-gray-400 font-medium mt-1">Here's how your store is performing.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} subtitle="Lifetime earnings" icon={TrendingUpRoundedIcon} gradientFrom="from-emerald-600" gradientTo="to-emerald-800" trend="+18%" delay={0.1} />
        <StatCard title="Pending Bookings" value={stats.pending} subtitle="Awaiting customer arrival" icon={ReceiptLongRoundedIcon} gradientFrom="from-amber-600" gradientTo="to-amber-800" trend="Action Req." delay={0.15} />
        <StatCard title="Fulfilled Orders" value={stats.fulfilled} subtitle="Successfully completed" icon={CheckCircleRoundedIcon} gradientFrom="from-blue-600" gradientTo="to-blue-800" trend="+25%" delay={0.2} />
        <StatCard title="Store Rating" value={merchant.avgRating?.toFixed(1) || '0.0'} subtitle={`${merchant.totalReviews || 0} reviews`} icon={StarRoundedIcon} gradientFrom="from-purple-600" gradientTo="to-purple-800" trend="4.5+" delay={0.25} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <MiniStatCard icon={PeopleRoundedIcon} label="Total Customers" value={stats.totalCustomers} color="text-blue-600" bgColor="bg-blue-50" />
        <MiniStatCard icon={ShoppingBagRoundedIcon} label="Avg Order Value" value={`₹${stats.avgOrderValue}`} color="text-green-600" bgColor="bg-green-50" />
        <MiniStatCard icon={AccessTimeRoundedIcon} label="Today's Orders" value={stats.weeklyData[6]?.revenue > 0 ? Math.floor(stats.weeklyData[6].revenue / (stats.avgOrderValue || 1)) : 0} color="text-purple-600" bgColor="bg-purple-50" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Weekly Revenue</h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 bg-primary-50 text-primary px-3 py-1.5 rounded-lg text-xs font-bold w-fit">
              <TrendingUpRoundedIcon sx={{ fontSize: 14 }} /> This Week
            </div>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData} barSize={32}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D6A4F" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1B4332" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `₹${v}`} width={60} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(45,106,79,0.05)', radius: 8 }} />
                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg p-4 sm:p-5 lg:p-6 shadow-sm border-2 border-gray-200">
          <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
            <QuickAction icon={QrCodeScannerRoundedIcon} label="Scan QR Code" onClick={() => navigate('/merchant/scanner')} color="text-green-600" bgColor="bg-green-50" delay={0.45} />
            <QuickAction icon={AddRoundedIcon} label="Add Product" onClick={() => navigate('/merchant/products')} color="text-blue-600" bgColor="bg-blue-50" delay={0.5} />
            <QuickAction icon={LocalOfferRoundedIcon} label="Create New Offer" onClick={() => navigate('/merchant/offers')} color="text-amber-600" bgColor="bg-amber-50" delay={0.55} />
            <QuickAction icon={WorkspacePremiumRoundedIcon} label="View My Plan" onClick={() => {}} color="text-purple-600" bgColor="bg-purple-50" delay={0.6} />
          </div>
          <div className="mt-4 sm:mt-6 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <StorefrontRoundedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{merchant.storeName}</p>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{merchant.category}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Recent Validations</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Latest fulfilled bookings</p>
          </div>
          <button onClick={() => navigate('/merchant/bookings')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
            View All <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bill</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.history.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">No recent validations yet</td></tr>
              ) : (
                stats.history.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4"><span className="font-mono text-xs font-medium bg-gray-50 px-2 py-1 rounded border">#{b.internalId || b._id}</span></td>
                    <td className="px-6 py-4 text-sm font-semibold">{b.customerName || 'Guest'}</td>
                    <td className="px-6 py-4 font-mono text-sm text-primary">₹{b.totals?.final}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.scannedAt || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded text-[10px] font-black uppercase bg-green-50 text-green-600">Fulfilled</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default MerchantDashboard;
