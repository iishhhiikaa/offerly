import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRedemptionsByMerchant, markRedemptionComplete } from '../../customer/data/localStorageUtils';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Bookings = ({ merchant }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!merchant) return;
    const all = getRedemptionsByMerchant(merchant.id);
    setBookings(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [merchant]);

  const filtered = bookings.filter(b => 
    b.status === activeTab &&
    (b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed' || b.status === 'fulfilled').length;
  
  // Calculate stats
  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'fulfilled')
    .reduce((sum, b) => sum + (b.totals?.final || 0), 0);
  const uniqueCustomers = new Set(bookings.map(b => b.customerName)).size;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Bookings & Requests</h1>
          <p className="text-gray-400 font-medium mt-1">Manage and fulfill your customer offer requests.</p>
        </div>
        <button 
          onClick={() => navigate('/merchant/scanner')}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/20 w-full md:w-auto justify-center"
        >
          <QrCodeScannerRoundedIcon sx={{fontSize: 20}} />
          VERIFY QR CODE
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HourglassEmptyRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Pending</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{pendingCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Fulfilled</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{completedCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUpRoundedIcon sx={{ fontSize: 24 }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Revenue</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex bg-white p-1.5 rounded-lg border-2 border-gray-200 shadow-sm w-full md:w-auto">
          {[
            { key: 'pending', label: 'Live Requests', count: pendingCount },
            { key: 'completed', label: 'Fulfilled', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.key 
                ? 'bg-sidebar-dark text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${
                activeTab === tab.key 
                ? 'bg-white/20 text-white/80' 
                : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
          <input 
            type="text" 
            placeholder="Search Booking ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </motion.div>

      {/* Table Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden"
      >
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bill</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center">
                          <ReceiptLongRoundedIcon sx={{fontSize: 32}} className="text-gray-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-400">No {activeTab} requests found</p>
                          <p className="text-xs text-gray-300 mt-1">
                            {activeTab === 'pending' ? 'New bookings will appear here' : 'Completed bookings will appear here'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filtered.map((booking, idx) => (
                    <motion.tr 
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-gray-200">
                          #{booking.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{booking.customerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{booking.items.length} Product{booking.items.length > 1 ? 's' : ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-base font-bold text-primary">₹{booking.totals.final.toLocaleString()}</span>
                        <p className="font-mono text-xs text-gray-300 line-through mt-0.5">₹{booking.totals.original}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                          booking.status === 'pending' 
                            ? 'bg-amber-50 text-amber-600 border-2 border-amber-100' 
                            : 'bg-green-50 text-green-600 border-2 border-green-100'
                        }`}>
                          {booking.status === 'pending' ? <HourglassEmptyRoundedIcon sx={{fontSize: 12}} /> : <CheckCircleRoundedIcon sx={{fontSize: 12}} />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                            onClick={() => toast.success('Booking Details arriving soon!')}
                            title="View Details"
                          >
                            <VisibilityRoundedIcon sx={{fontSize: 18}} />
                          </button>
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => navigate('/merchant/scanner')}
                              className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark border-2 border-primary hover:border-primary-dark transition-all duration-200 shadow-sm"
                              title="Scan QR Code"
                            >
                              <QrCodeScannerRoundedIcon sx={{fontSize: 18}} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-50">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="px-4 py-20 text-center"
              >
                <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <ReceiptLongRoundedIcon sx={{fontSize: 32}} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No {activeTab} requests found</p>
                <p className="text-xs text-gray-300 mt-1">
                  {activeTab === 'pending' ? 'New bookings will appear here' : 'Completed bookings will appear here'}
                </p>
              </motion.div>
            ) : (
              filtered.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border-2 border-gray-200">#{booking.id}</span>
                      <p className="text-sm font-bold text-gray-900 mt-2">{booking.customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">{booking.items.length} Product{booking.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      booking.status === 'pending' 
                        ? 'bg-amber-50 text-amber-600 border-2 border-amber-100' 
                        : 'bg-green-50 text-green-600 border-2 border-green-100'
                    }`}>
                      {booking.status === 'pending' ? <HourglassEmptyRoundedIcon sx={{fontSize: 10}} /> : <CheckCircleRoundedIcon sx={{fontSize: 10}} />}
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-widest">Total Bill</p>
                      <span className="font-mono text-base font-bold text-primary">₹{booking.totals.final.toLocaleString()}</span>
                      <p className="font-mono text-xs text-gray-300 line-through mt-0.5">₹{booking.totals.original}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t-2 border-gray-100">
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 transition-all text-sm font-bold"
                      onClick={() => toast.success('Booking Details arriving soon!')}
                    >
                      <VisibilityRoundedIcon sx={{fontSize: 18}} />
                      View
                    </button>
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => navigate('/merchant/scanner')}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-white hover:bg-primary-dark border-2 border-primary hover:border-primary-dark transition-all text-sm font-bold shadow-sm"
                      >
                        <QrCodeScannerRoundedIcon sx={{fontSize: 18}} />
                        Scan QR
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Bookings;
