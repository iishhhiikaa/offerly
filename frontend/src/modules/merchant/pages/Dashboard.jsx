import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
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
import { getRedemptions } from '../../customer/data/localStorageUtils';

/* ─── Stat Card with Dark Gradients ─────────────── */
const StatCard = ({ title, value, subtitle, icon: Icon, gradientFrom, gradientTo, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg p-6 hover:-translate-y-1 transition-all duration-300 shadow-lg text-white relative overflow-hidden`}
  >
    {/* Background glow effect */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
    
    <div className="flex justify-between items-start relative z-10">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
        <Icon sx={{ fontSize: 24 }} className="text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white">
          <TrendingUpRoundedIcon sx={{ fontSize: 14 }} />
          <span>{trend}</span>
        </div>
      )}
    </div>
    
    <div className="mt-auto space-y-1 relative z-10 pt-6">
      <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{value}</h3>
      <p className="text-white/80 font-bold tracking-[0.15em] text-[9px] uppercase pt-1">{title}</p>
      {subtitle && (
        <p className="text-white/60 text-xs font-medium pt-1">{subtitle}</p>
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
    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all group bg-white shadow-sm"
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor} ${color}`}>
      <Icon sx={{ fontSize: 20 }} />
    </div>
    <span className="text-sm font-bold text-gray-700 group-hover:text-primary">{label}</span>
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
  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
    <div className={`w-10 h-10 rounded-lg ${bgColor} ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon sx={{ fontSize: 20 }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

/* ─── Main Dashboard ────────────────────────────── */
const MerchantDashboard = ({ merchant }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    fulfilled: 0,
    revenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    history: [],
    weeklyData: [],
    hourlyData: []
  });

  useEffect(() => {
    if (!merchant) return;
    const merchantId = merchant.id;

    const allBookings = getRedemptions().filter(r => r.merchantId === merchantId);
    const pending = allBookings.filter(r => r.status === 'pending');
    const fulfilled = allBookings.filter(r => r.status === 'completed' || r.status === 'fulfilled');
    const rev = fulfilled.reduce((sum, b) => sum + (b.totals?.final || 0), 0);
    
    // Calculate unique customers
    const uniqueCustomers = new Set(fulfilled.map(b => b.customerId || b.customerName)).size;
    
    // Calculate average order value
    const avgOrder = fulfilled.length > 0 ? Math.round(rev / fulfilled.length) : 0;

    // Build weekly chart data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dayName = days[date.getDay()];
      const dayRevenue = fulfilled
        .filter(b => {
          const bDate = new Date(b.scannedAt || b.createdAt);
          return bDate.toDateString() === date.toDateString();
        })
        .reduce((sum, b) => sum + (b.totals?.final || 0), 0);
      return { day: dayName, revenue: dayRevenue };
    });

    // Build hourly data for today
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourRevenue = fulfilled
        .filter(b => {
          const bDate = new Date(b.scannedAt || b.createdAt);
          return bDate.toDateString() === today.toDateString() && bDate.getHours() === hour;
        })
        .reduce((sum, b) => sum + (b.totals?.final || 0), 0);
      return { 
        hour: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`, 
        revenue: hourRevenue 
      };
    }).filter(h => h.revenue > 0); // Only show hours with activity

    setStats({
      pending: pending.length,
      fulfilled: fulfilled.length,
      revenue: rev,
      totalCustomers: uniqueCustomers,
      avgOrderValue: avgOrder,
      history: fulfilled.slice(0, 8).sort((a, b) => new Date(b.scannedAt || b.createdAt) - new Date(a.scannedAt || a.createdAt)),
      weeklyData,
      hourlyData
    });
  }, [merchant]);

  if (!merchant) return null;

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Welcome Header ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-1">
            <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">{greeting}, {merchant.storeName} 👋</h1>
          <p className="text-gray-400 font-medium mt-1">Here's how your store is performing.</p>
        </div>
      </motion.div>

      {/* ── Stat Cards Row ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          subtitle="Lifetime earnings"
          icon={TrendingUpRoundedIcon}
          gradientFrom="from-emerald-600"
          gradientTo="to-emerald-800"
          trend="+18%"
          delay={0.1}
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pending}
          subtitle="Awaiting customer arrival"
          icon={ReceiptLongRoundedIcon}
          gradientFrom="from-amber-600"
          gradientTo="to-amber-800"
          trend="Action Req."
          delay={0.15}
        />
        <StatCard
          title="Fulfilled Orders"
          value={stats.fulfilled}
          subtitle="Successfully completed"
          icon={CheckCircleRoundedIcon}
          gradientFrom="from-blue-600"
          gradientTo="to-blue-800"
          trend="+25%"
          delay={0.2}
        />
        <StatCard
          title="Store Rating"
          value={merchant.avgRating?.toFixed(1) || '0.0'}
          subtitle={`${merchant.totalReviews || 0} reviews`}
          icon={StarRoundedIcon}
          gradientFrom="from-purple-600"
          gradientTo="to-purple-800"
          trend="4.5+"
          delay={0.25}
        />
      </div>

      {/* ── Secondary Stats Row ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <MiniStatCard
          icon={PeopleRoundedIcon}
          label="Total Customers"
          value={stats.totalCustomers}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MiniStatCard
          icon={ShoppingBagRoundedIcon}
          label="Avg Order Value"
          value={`₹${stats.avgOrderValue}`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MiniStatCard
          icon={AccessTimeRoundedIcon}
          label="Today's Orders"
          value={stats.weeklyData[6]?.revenue > 0 ? Math.floor(stats.weeklyData[6].revenue / (stats.avgOrderValue || 1)) : 0}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </motion.div>

      {/* ── Charts Row ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Weekly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-lg p-8 shadow-sm border-2 border-gray-200"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Weekly Revenue</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 bg-primary-50 text-primary px-3 py-1.5 rounded-lg text-xs font-bold">
              <TrendingUpRoundedIcon sx={{ fontSize: 14 }} />
              This Week
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData} barSize={32}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D6A4F" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1B4332" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(v) => `₹${v}`}
                  width={60}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(45,106,79,0.05)', radius: 8 }} />
                <Bar
                  dataKey="revenue"
                  fill="url(#revenueGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200"
        >
          <h2 className="text-lg font-black text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction 
              icon={QrCodeScannerRoundedIcon} 
              label="Scan QR Code" 
              onClick={() => navigate('/merchant/scanner')} 
              color="text-green-600"
              bgColor="bg-green-50"
              delay={0.45} 
            />
            <QuickAction 
              icon={AddRoundedIcon} 
              label="Add Product" 
              onClick={() => navigate('/merchant/products')} 
              color="text-blue-600"
              bgColor="bg-blue-50"
              delay={0.5} 
            />
            <QuickAction 
              icon={LocalOfferRoundedIcon} 
              label="Create New Offer" 
              onClick={() => navigate('/merchant/offers')} 
              color="text-amber-600"
              bgColor="bg-amber-50"
              delay={0.55} 
            />
            <QuickAction 
              icon={WorkspacePremiumRoundedIcon} 
              label="View My Plan" 
              onClick={() => {}} 
              color="text-purple-600"
              bgColor="bg-purple-50"
              delay={0.6} 
            />
          </div>

          {/* Mini Store Card */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/60 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <StorefrontRoundedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{merchant.storeName}</p>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{merchant.category}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 flex items-center gap-1">
                <CheckCircleRoundedIcon sx={{ fontSize: 10 }} /> Active
              </span>
              {merchant.subscription?.plan?.name && (
                <span className="text-text-secondary font-medium">{merchant.subscription.plan.name} Plan</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Recent Validations ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Recent Validations</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Latest fulfilled bookings</p>
          </div>
          <button
            onClick={() => navigate('/merchant/bookings')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
          >
            View All <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ReceiptLongRoundedIcon className="text-gray-200" sx={{ fontSize: 48 }} />
                      <p className="text-sm text-gray-400 font-medium">No recent validations yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                stats.history.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        #{b.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{b.customerName || 'Guest'}</td>
                    <td className="px-6 py-4 font-mono text-sm font-medium text-primary">₹{b.totals?.final}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(b.scannedAt || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 flex items-center gap-1 w-fit">
                        <CheckCircleRoundedIcon sx={{ fontSize: 10 }} /> Fulfilled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-50">
          {stats.history.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <ReceiptLongRoundedIcon className="text-gray-200 mb-2" sx={{ fontSize: 48 }} />
              <p className="text-sm text-gray-400 font-medium">No recent validations yet</p>
            </div>
          ) : (
            stats.history.map(b => (
              <div key={b.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-xs font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      #{b.id}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-1.5">{b.customerName || 'Guest'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600">Fulfilled</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-medium text-primary">₹{b.totals?.final}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(b.scannedAt || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MerchantDashboard;
