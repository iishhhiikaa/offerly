import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { QRCodeSVG } from 'qrcode.react';
import { bookingAPI } from '../../../api/booking.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../../../context/SocketContext';
import { playNotificationSound } from '../../../utils/notificationSound';

// ─── Booking Detail Modal ────────────────────────────────────────────────────
const BookingDetailModal = ({ booking, onClose, onFulfilled }) => {
  const [fulfilling, setFulfilling] = useState(false);
  const [fulfilled, setFulfilled] = useState(false);
  const [confirmFulfill, setConfirmFulfill] = useState(false);

  if (!booking) return null;

  const isPending = booking.status === 'pending';
  const isExpired = booking.qrExpiry && new Date(booking.qrExpiry) < new Date();

  const handleFulfill = async () => {
    if (!booking.qrToken) {
      toast.error('No QR token found for this booking');
      return;
    }
    setFulfilling(true);
    try {
      const res = await bookingAPI.verifyQR(booking.qrToken);
      if (res && res.success) {
        onFulfilled(booking._id);
        setFulfilled(true);
      } else {
        toast.error(res?.error || 'Failed to fulfill booking');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Verification failed';
      toast.error(errorMsg);
    } finally {
      setFulfilling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ── Success State ──
  if (fulfilled) {
    return (
      <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          {/* Confetti Header */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 200, opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#fff', '#fbbf24', '#60a5fa', '#f472b6'][i % 4],
                  }}
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
            >
              <CheckCircleRoundedIcon className="text-white" sx={{ fontSize: 48 }} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-white mb-1"
            >
              Payment Collected!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 font-medium text-sm"
            >
              Booking #{booking.internalId || booking._id?.slice(-6)} fulfilled
            </motion.p>
          </div>

          {/* Summary */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <PersonRoundedIcon className="text-gray-400" sx={{ fontSize: 18 }} />
                  <span className="text-sm font-bold text-gray-700">{booking.customerName || 'Guest'}</span>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase">Fulfilled</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500 font-medium">Amount Collected</span>
                <span className="text-2xl font-black text-primary font-mono">₹{(booking.totals?.final || 0).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mb-4">
              The customer has been notified about the fulfillment.
            </p>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-primary/20"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Normal Detail View ──
  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 flex justify-between items-center relative">
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1">Booking Details</p>
            <h2 className="text-2xl font-bold text-white font-mono leading-none">#{booking.internalId || booking._id?.slice(-6)}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold border backdrop-blur-sm ${
              isPending && !isExpired
                ? 'bg-amber-400/20 text-amber-100 border-amber-300/30'
                : booking.status === 'completed'
                ? 'bg-green-400/20 text-green-100 border-green-300/30'
                : 'bg-red-400/20 text-red-100 border-red-300/30'
            }`}>
              {isPending && !isExpired ? <HourglassEmptyRoundedIcon sx={{fontSize: 14}} /> :
               booking.status === 'completed' ? <CheckCircleRoundedIcon sx={{fontSize: 14}} /> :
               <AccessTimeRoundedIcon sx={{fontSize: 14}} />}
              {isExpired && isPending ? 'Expired' : booking.status}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <CloseRoundedIcon sx={{fontSize: 18}} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Customer Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                <PersonRoundedIcon />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Customer</p>
                <p className="font-semibold text-gray-900">{booking.customerName || 'Guest'}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <AccessTimeRoundedIcon sx={{fontSize: 14}} />
              <span>Booked: {formatDate(booking.createdAt)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="p-6 border-b border-dashed border-gray-200">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Items Ordered:</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {booking.items && booking.items.length > 0 ? booking.items.map((it, idx) => {
                const product = it.product || {};
                const name = product.name || 'Product';
                const unitPrice = product.offerPrice || product.price || 0;
                return (
                  <div key={idx} className="flex justify-between items-center font-medium">
                    <span className="text-gray-800 text-sm">{it.qty} × {name}</span>
                    <span className="text-gray-900 font-mono text-sm">₹{(it.qty * unitPrice).toLocaleString()}</span>
                  </div>
                );
              }) : (
                <p className="text-sm text-gray-400 text-center py-2">No items data available</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="p-6 border-b border-gray-100">
            <div className="space-y-2">
              {booking.totals?.original > 0 && booking.totals?.original !== booking.totals?.final && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Original Price</span>
                  <span className="text-gray-400 line-through font-mono">₹{booking.totals.original}</span>
                </div>
              )}
              {booking.totals?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600 font-mono font-bold">-₹{booking.totals.discount}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-900">Amount to Collect</span>
                <span className="text-2xl font-bold text-primary font-mono">₹{(booking.totals?.final || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* QR Token Display */}
          {booking.qrToken && isPending && !isExpired && (
            <div className="p-6 flex flex-col items-center border-b border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3">Customer's QR Code</p>
              <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-gray-100">
                <QRCodeSVG
                  value={booking.qrToken}
                  size={160}
                  fgColor="#111827"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3 bg-gray-50 px-4 py-1.5 rounded-full font-mono font-bold tracking-wider">
                {booking.internalId || booking._id?.slice(-6)}
              </p>
              {booking.qrExpiry && (
                <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                  <AccessTimeRoundedIcon sx={{fontSize: 12}} />
                  Expires: {formatDate(booking.qrExpiry)}
                </p>
              )}
            </div>
          )}

          {/* Completed Info */}
          {booking.status === 'completed' && booking.scannedAt && (
            <div className="p-6 bg-green-50/50 border-b border-green-100">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircleRoundedIcon sx={{fontSize: 20}} />
                <span className="font-bold text-sm">Fulfilled on {formatDate(booking.scannedAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors w-1/3"
          >
            Close
          </button>
          {isPending && !isExpired ? (
            confirmFulfill ? (
              <div className="flex-1 flex flex-col sm:flex-row justify-center items-center gap-2">
                <p className="text-sm font-bold text-red-600 mb-1 sm:mb-0">Are you sure?</p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setConfirmFulfill(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFulfill}
                    disabled={fulfilling}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    {fulfilling ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Yes, Fulfill'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmFulfill(true)}
                className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <CheckCircleRoundedIcon sx={{fontSize: 20}} />
                Collect Cash & Fulfill
              </button>
            )
          ) : isExpired && isPending ? (
            <div className="flex-1 py-4 bg-red-50 text-red-600 rounded-xl font-bold text-center border border-red-200">
              Pass Expired
            </div>
          ) : (
            <div className="flex-1 py-4 bg-green-50 text-green-700 rounded-xl font-bold text-center border border-green-200 flex items-center justify-center gap-2">
              <CheckCircleRoundedIcon sx={{fontSize: 20}} />
              Already Fulfilled
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Bookings Page ──────────────────────────────────────────────────────
const Bookings = ({ merchant }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { socket } = useSocket();

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMerchantRedemptions();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Failed to load live requests');
    }
  };

  useEffect(() => {
    if (merchant) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [merchant]);

  // Handle Realtime Updates
  useEffect(() => {
    if (!socket || !merchant) return;

    const handleNotification = (notif) => {
      if (notif.type === 'new_booking') {
        playNotificationSound({ type: 'chime' });

        toast.success(`New request from ${notif.data?.customerName || 'Customer'}!`, {
          icon: '⚡',
          duration: 4000
        });
        
        fetchBookings();
      }
    };

    socket.on('merchant_notification', handleNotification);
    
    return () => socket.off('merchant_notification', handleNotification);
  }, [socket, merchant]);

  const handleFulfilled = (bookingId) => {
    setBookings(prev => prev.map(b =>
      b._id === bookingId ? { ...b, status: 'completed', scannedAt: new Date().toISOString() } : b
    ));
  };

  const filtered = bookings.filter(b =>
    b.status === activeTab &&
    ((b.internalId || b._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed' || b.status === 'fulfilled').length;

  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'fulfilled')
    .reduce((sum, b) => sum + (b.totals?.final || 0), 0);

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
          <QrCodeScannerRoundedIcon sx={{ fontSize: 20 }} />
          SCAN QR CODE
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-lg border-2 border-gray-200 shadow-sm w-full md:w-auto">
          {[
            { key: 'pending', label: 'Live Requests', count: pendingCount },
            { key: 'completed', label: 'Fulfilled', count: completedCount },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.key ? 'bg-sidebar-dark text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${
                activeTab === tab.key ? 'bg-white/20 text-white/80' : 'bg-gray-100 text-gray-400'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
          <input type="text" placeholder="Search Booking ID or Customer..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </motion.div>

      {/* Table Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">

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
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center">
                          <ReceiptLongRoundedIcon sx={{ fontSize: 32 }} className="text-gray-300" />
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
                    <motion.tr key={booking._id || booking.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.04 }}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-gray-200">
                          #{booking.internalId || booking._id?.slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{booking.customerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{booking.items?.length || 0} Product{(booking.items?.length || 0) > 1 ? 's' : ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-base font-bold text-primary">₹{(booking.totals?.final || 0).toLocaleString()}</span>
                        {booking.totals?.original > 0 && booking.totals?.original !== booking.totals?.final && (
                          <p className="font-mono text-xs text-gray-300 line-through mt-0.5">₹{booking.totals.original}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-2 border-amber-100' : 'bg-green-50 text-green-600 border-2 border-green-100'
                        }`}>
                          {booking.status === 'pending' ? <HourglassEmptyRoundedIcon sx={{ fontSize: 12 }} /> : <CheckCircleRoundedIcon sx={{ fontSize: 12 }} />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }} title="View Details">
                            <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                          </button>
                          {booking.status === 'pending' && (
                            <button onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                              className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark border-2 border-primary hover:border-primary-dark transition-all duration-200 shadow-sm"
                              title="View & Fulfill">
                              <QrCodeScannerRoundedIcon sx={{ fontSize: 18 }} />
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-20 text-center">
                <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <ReceiptLongRoundedIcon sx={{ fontSize: 32 }} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No {activeTab} requests found</p>
                <p className="text-xs text-gray-300 mt-1">
                  {activeTab === 'pending' ? 'New bookings will appear here' : 'Completed bookings will appear here'}
                </p>
              </motion.div>
            ) : (
              filtered.map((booking, idx) => (
                <motion.div key={booking._id || booking.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.04 }}
                  className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border-2 border-gray-200">
                        #{booking.internalId || booking._id?.slice(-6)}
                      </span>
                      <p className="text-sm font-bold text-gray-900 mt-2">{booking.customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">{booking.items?.length || 0} Product{(booking.items?.length || 0) > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-2 border-amber-100' : 'bg-green-50 text-green-600 border-2 border-green-100'
                    }`}>
                      {booking.status === 'pending' ? <HourglassEmptyRoundedIcon sx={{ fontSize: 10 }} /> : <CheckCircleRoundedIcon sx={{ fontSize: 10 }} />}
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-widest">Total Bill</p>
                      <span className="font-mono text-base font-bold text-primary">₹{(booking.totals?.final || 0).toLocaleString()}</span>
                      {booking.totals?.original > 0 && booking.totals?.original !== booking.totals?.final && (
                        <p className="font-mono text-xs text-gray-300 line-through mt-0.5">₹{booking.totals.original}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t-2 border-gray-100">
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 transition-all text-sm font-bold"
                      onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}>
                      <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                      View
                    </button>
                    {booking.status === 'pending' && (
                      <button onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-white hover:bg-primary-dark border-2 border-primary hover:border-primary-dark transition-all text-sm font-bold shadow-sm">
                        <QrCodeScannerRoundedIcon sx={{ fontSize: 18 }} />
                        Fulfill
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onFulfilled={handleFulfilled}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;
