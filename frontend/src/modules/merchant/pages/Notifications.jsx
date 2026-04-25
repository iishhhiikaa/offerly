import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { merchantAPI } from '../../../api/merchant.api';
import toast from 'react-hot-toast';

const typeConfig = {
  booking_new: { icon: ReceiptLongRoundedIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  booking_fulfilled: { icon: ReceiptLongRoundedIcon, color: 'text-green-600', bg: 'bg-green-50' },
  subscription_expiry: { icon: WorkspacePremiumRoundedIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  offer_approved: { icon: LocalOfferRoundedIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  payment: { icon: PaymentRoundedIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  store_status: { icon: StorefrontRoundedIcon, color: 'text-primary', bg: 'bg-primary-light' },
  general: { icon: NotificationsRoundedIcon, color: 'text-gray-600', bg: 'bg-gray-50' },
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await merchantAPI.getNotifications();
      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await merchantAPI.markAllNotificationsRead();
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleRead = async (id) => {
    try {
      const response = await merchantAPI.markNotificationRead(id);
      if (response.success) {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const NotifItem = ({ notif }) => {
    const config = typeConfig[notif.type] || typeConfig.general;
    const Icon = config.icon;

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => handleRead(notif._id)}
        className={`w-full flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl transition-all text-left ${
          !notif.isRead ? 'bg-primary-light border-2 border-primary/20' : 'bg-white border-2 border-gray-100'
        } shadow-sm hover:shadow-md`}
      >
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Icon sx={{ fontSize: { xs: 20, sm: 24 } }} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm sm:text-base font-bold text-gray-900">{notif.title}</p>
            {!notif.isRead && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">{notif.body}</p>
          <p className="text-xs text-gray-400 mt-2">{formatDate(notif.createdAt)}</p>
        </div>
      </motion.button>
    );
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowBackRoundedIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Notifications</h1>
        
        {/* Mark all read */}
        {unread.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-primary font-bold hover:underline"
          >
            <DoneAllRoundedIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
              <NotificationsRoundedIcon sx={{ fontSize: 40 }} className="text-primary" />
            </div>
            <h2 className="text-xl font-black text-gray-900">No Notifications</h2>
            <p className="text-gray-500 text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                  New ({unread.length})
                </h3>
                <div className="space-y-3">
                  {unread.map((n, idx) => (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <NotifItem notif={n} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {read.length > 0 && (
              <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                  Earlier
                </h3>
                <div className="space-y-3">
                  {read.map((n, idx) => (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <NotifItem notif={n} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
