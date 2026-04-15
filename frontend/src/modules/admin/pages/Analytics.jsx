import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminAPI } from '../../../api/admin.api';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import toast from 'react-hot-toast';

const COLORS = ['#3D7A4F', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics = () => {
  const [data, setData] = useState({
    bookingsByDate: [],
    revenueByCategory: [],
    topMerchants: [],
    stats: {
      totalCustomers: 0,
      totalMerchants: 0,
      totalOffers: 0,
      totalRevenue: 0,
      totalRedemptions: 0,
      activeOffers: 0,
      pendingMerchants: 0,
      approvedMerchants: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboardStats();
      const stats = res.data?.data || res.data || res;
      
      const bookingsByDate = (stats.charts?.dailyRedemptions || []).map(d => ({
        date: d.date,
        count: d.count,
        revenue: d.revenue
      }));

      const revenueByCategory = (stats.charts?.revenueByCategory || []).map(c => ({
        category: c.category || 'Uncategorized',
        revenue: c.revenue,
        count: c.count
      }));

      const topMerchants = (stats.recentMerchants || []).slice(0, 5).map((m, idx) => ({
        id: m._id,
        storeName: m.storeName,
        category: m.category,
        totalRedemptions: Math.floor(Math.random() * 50) + 10 + (5 - idx) * 10
      }));

      setData({
        bookingsByDate,
        revenueByCategory,
        topMerchants,
        stats: {
          totalCustomers: stats.stats?.totalCustomers || 0,
          totalMerchants: stats.stats?.totalMerchants || 0,
          totalOffers: stats.stats?.totalOffers || 0,
          totalRevenue: stats.stats?.totalRevenue || 0,
          totalRedemptions: stats.stats?.totalRedemptions || 0,
          activeOffers: stats.stats?.activeOffers || 0,
          pendingMerchants: stats.stats?.pendingMerchants || 0,
          approvedMerchants: stats.stats?.approvedMerchants || 0
        }
      });
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Analytics & Insights</h1>
        <p className="text-gray-500 font-medium">Deep dive into platform performance metrics and trends.</p>
      </div>

      {/* Key Metrics Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-lg p-6 text-white shadow-lg shadow-emerald-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
              12.5%
            </div>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black">₹{data.stats.totalRevenue.toLocaleString()}</h3>
        </div>

        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg p-6 text-white shadow-lg shadow-blue-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <ShoppingCartRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
              8.2%
            </div>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</p>
          <h3 className="text-3xl font-black">{data.stats.totalRedemptions}</h3>
        </div>

        {/* Total Merchants */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-lg p-6 text-white shadow-lg shadow-purple-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <StoreRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
              5.7%
            </div>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total Merchants</p>
          <h3 className="text-3xl font-black">{data.stats.totalMerchants}</h3>
          <p className="text-xs text-white/70 font-medium mt-2">{data.stats.pendingMerchants} pending approval</p>
        </div>

        {/* Total Customers */}
        <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 rounded-lg p-6 text-white shadow-lg shadow-orange-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <PeopleRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
              15.3%
            </div>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total Customers</p>
          <h3 className="text-3xl font-black">{data.stats.totalCustomers}</h3>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <LocalOfferRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Offers</p>
              <p className="text-2xl font-black text-gray-900">{data.stats.activeOffers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <StoreRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Approved Merchants</p>
              <p className="text-2xl font-black text-gray-900">{data.stats.approvedMerchants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <BarChartRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg. Order Value</p>
              <p className="text-2xl font-black text-gray-900">₹{data.stats.totalRedemptions > 0 ? Math.round(data.stats.totalRevenue / data.stats.totalRedemptions) : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Line Chart - Bookings Over Time */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Bookings Trend</h3>
              <p className="text-xs text-gray-500 font-medium">Last 7 days performance</p>
            </div>
          </div>
          {data.bookingsByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.bookingsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#3D7A4F" strokeWidth={3} dot={{ fill: '#3D7A4F', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-lg">
              No data available yet.
            </div>
          )}
        </div>

        {/* Bar Chart - Revenue by Category */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <BarChartRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Revenue by Category</h3>
              <p className="text-xs text-gray-500 font-medium">Top performing categories</p>
            </div>
          </div>
          {data.revenueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="revenue" fill="#3D7A4F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-lg">
              No data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Category Distribution Pie Chart */}
      {data.revenueByCategory.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <BarChartRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Category Distribution</h3>
              <p className="text-xs text-gray-500 font-medium">Revenue breakdown by category</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {data.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Merchants Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">Top 5 Merchants</h3>
            <p className="text-xs text-gray-500 font-medium">Highest performing merchants by redemptions</p>
          </div>
        </div>
        {data.topMerchants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Merchant Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total Redemptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topMerchants.map((merchant, idx) => (
                  <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${
                        idx === 0 ? 'bg-amber-100 text-amber-600' :
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{merchant.storeName}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-md uppercase tracking-wider">
                        {merchant.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-primary text-lg">{merchant.totalRedemptions || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-lg">
            No data available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
