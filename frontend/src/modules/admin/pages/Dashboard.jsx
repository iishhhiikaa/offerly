import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { adminAPI } from '../../../api/admin.api';

const AdminStatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend, trendColor }) => (
  <div className="bg-white rounded-md p-6 hover:-translate-y-1 transition-all duration-300 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px] group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex justify-between items-start relative z-10">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgClass} shadow-sm border border-white/50`}>
        <Icon sx={{ fontSize: 24 }} className={colorClass} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-gray-50 border border-gray-100 ${trendColor}`}>
          <TrendingUpRoundedIcon sx={{ fontSize: 14 }} />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="mt-auto space-y-1 relative z-10">
      <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{value}</h3>
      <p className="text-gray-400 font-bold tracking-[0.15em] text-[9px] uppercase pt-1">{title}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold">
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm">
            {p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats?.stats || {};
  const charts = stats?.charts || {};

  // Format chart data with short day names
  const signupData = (charts.dailySignups || []).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: item.count,
  }));

  const redemptionData = (charts.dailyRedemptions || []).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: item.count,
    revenue: item.revenue || 0,
  }));

  const categoryData = (charts.revenueByCategory || []).map(item => ({
    category: item.category || 'Other',
    revenue: item.revenue || 0,
  }));

  // Ensure we have 7 days of data for charts
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
  }

  const filledSignups = last7Days.map(day => {
    const found = signupData.find(s => s.date === day);
    return { date: day, count: found?.count || 0 };
  });

  const filledRedemptions = last7Days.map(day => {
    const found = redemptionData.find(r => r.date === day);
    return { date: day, count: found?.count || 0, revenue: found?.revenue || 0 };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Admin Dashboard</h1>
          <p className="text-gray-400 font-medium mt-1">Track and manage your platform performance.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          title="Total Merchants"
          value={s.totalMerchants || 0}
          icon={StorefrontRoundedIcon}
          bgClass="bg-[#3D7A4F]/20"
          colorClass="text-[#3D7A4F]"
          trend="+12%"
          trendColor="text-[#3D7A4F]"
        />
        <AdminStatCard
          title="Pending Approvals"
          value={s.pendingMerchants || 0}
          icon={HourglassEmptyRoundedIcon}
          bgClass="bg-[#EAB308]/20"
          colorClass="text-[#EAB308]"
          trend="Action Req."
          trendColor="text-[#EAB308]"
        />
        <AdminStatCard
          title="Total Customers"
          value={s.totalCustomers || 0}
          icon={GroupRoundedIcon}
          bgClass="bg-[#3B82F6]/20"
          colorClass="text-[#3B82F6]"
          trend="+25%"
          trendColor="text-[#3B82F6]"
        />
        <AdminStatCard
          title="Total Revenue"
          value={`₹${(s.totalRevenue || 0).toLocaleString()}`}
          icon={TrendingUpRoundedIcon}
          bgClass="bg-[#8B5CF6]/20"
          colorClass="text-[#8B5CF6]"
          trend="+18%"
          trendColor="text-[#8B5CF6]"
        />
      </div>

      {/* Pending Approvals Banner */}
      {s.pendingMerchants > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-md p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center">
              <HourglassEmptyRoundedIcon sx={{ fontSize: 26 }} />
            </div>
            <div>
              <h3 className="font-black text-amber-900 text-base">
                {s.pendingMerchants} Merchant{s.pendingMerchants > 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-sm text-amber-700/70 font-medium">Review and verify new business applications</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/merchants')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-md font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            Review Now
            <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart - Signup Activity */}
        <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Platform Growth</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Daily New Signups</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={filledSignups} barSize={24}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D7A4F" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2B5738" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#9CA3AF' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#9CA3AF' }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb', radius: 4 }}
                content={<CustomTooltip />} 
              />
              <Bar 
                dataKey="count" 
                fill="url(#growthGradient)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Redemption Activity */}
        <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Redemptions</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Daily Offer Usage</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={filledRedemptions} barSize={24}>
              <defs>
                <linearGradient id="redemptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#9CA3AF' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#9CA3AF' }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb', radius: 4 }}
                content={<CustomTooltip />} 
              />
              <Bar 
                dataKey="count" 
                fill="url(#redemptionGradient)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Revenue Breakdown */}
        <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Category performance</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} barSize={32}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 8, fontWeight: 800, fill: '#9CA3AF' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#9CA3AF' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb', radius: 4 }}
                content={<CustomTooltip />} 
              />
              <Bar 
                name="revenue"
                dataKey="revenue" 
                fill="url(#revenueGradient)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section: Recent Merchants + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Merchants Table */}
        <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900">Recent Merchants</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Track and manage latest applications</p>
            </div>
            <button
              onClick={() => navigate('/admin/merchants')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
            >
              View All <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Name</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">City</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentMerchants || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium text-sm">
                      No merchants registered yet.
                    </td>
                  </tr>
                ) : (
                  (stats?.recentMerchants || []).map((m) => (
                    <tr key={m._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/merchants')}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{m.storeName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{m.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{m.city}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          m.status === 'approved' ? 'bg-green-50 text-green-600' :
                          m.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="w-8 h-8 rounded-md bg-gray-50 hover:bg-primary/10 flex items-center justify-center transition-colors group">
                          <OpenInNewRoundedIcon sx={{ fontSize: 16 }} className="text-gray-400 group-hover:text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity Feed */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-black text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Create Notification', icon: GroupRoundedIcon, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/notifications' },
              { label: 'Manage Categories', icon: LocalOfferRoundedIcon, color: 'text-purple-600', bg: 'bg-purple-50', path: '/admin/categories' },
              { label: 'Platform Settings', icon: TrendingUpRoundedIcon, color: 'text-gray-600', bg: 'bg-gray-50', path: '/admin/settings' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-4 p-4 rounded-md border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all group"
              >
                <div className={`w-10 h-10 rounded-md ${action.bg} flex items-center justify-center ${action.color}`}>
                  <action.icon sx={{ fontSize: 20 }} />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
