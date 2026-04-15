import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { getNotifications, markAllRead, markNotificationRead } from '../../data/localStorageUtils';
import { useApp } from '../../context/AppContext';
import PageTransition from '../../components/ui/PageTransition';

const typeConfig = {
  redemption: { icon: ReceiptRoundedIcon, color: 'text-green-600', bg: 'bg-green-50' },
  review: { icon: NotificationsRoundedIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  offer: { icon: LocalOfferRoundedIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  referral: { icon: CardGiftcardRoundedIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
};

const Notifications = () => {
  const { refreshUnread } = useApp();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    markAllRead();
    setNotifications(getNotifications());
    refreshUnread();
  };

  const handleRead = (id) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
    refreshUnread();
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

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
    const config = typeConfig[notif.type] || typeConfig.offer;
    const Icon = config.icon;

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => handleRead(notif.id)}
        className={`w-full flex items-start gap-3 p-4 rounded-2xl transition-all text-left ${
          !notif.read ? 'bg-primary-light border border-primary/20' : 'bg-surface'
        } shadow-card`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Icon sx={{ fontSize: 20 }} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary">{notif.title}</p>
            {!notif.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{notif.body}</p>
          <p className="text-xs text-text-secondary/70 mt-1.5">{formatDate(notif.createdAt)}</p>
        </div>
      </motion.button>
    );
  };

  return (
    <PageTransition>
      <div className="px-4 py-3 pb-6">
        {/* Mark all read */}
        {unread.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold ml-auto mb-4"
          >
            <DoneAllRoundedIcon sx={{ fontSize: 16 }} />
            Mark all as read
          </motion.button>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <NotificationsRoundedIcon sx={{ fontSize: 36 }} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">No Notifications</h2>
            <p className="text-text-secondary text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <section className="mb-5">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">New</h3>
                <div className="space-y-2">
                  {unread.map((n, idx) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                    >
                      <NotifItem notif={n} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {read.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">Earlier</h3>
                <div className="space-y-2">
                  {read.map((n, idx) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
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
    </PageTransition>
  );
};

export default Notifications;
