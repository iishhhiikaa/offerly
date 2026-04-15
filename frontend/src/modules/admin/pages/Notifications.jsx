import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { adminAPI } from '../../../api/admin.api';
import toast from 'react-hot-toast';
import { useSocket } from '../../../hooks/useSocket'; // I'll need to create this hook

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('admin_notification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        toast.success(`New Notification: ${newNotification.title}`);
      });
      return () => socket.off('admin_notification');
    }
  }, [socket]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminAPI.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Notifications</h1>
          <p className="text-gray-500 font-medium">Real-time alerts and platform updates.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <div className="w-10 h-10 border-4 border-gray-100 border-t-[#3D7A4F] rounded-full animate-spin" />
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching Alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
            <NotificationsRoundedIcon sx={{ fontSize: 64 }} className="text-gray-300" />
            <p className="text-lg font-bold text-gray-500">All caught up! No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {notifications.map((n) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-6 flex items-start gap-4 transition-colors ${!n.isRead ? 'bg-[#3D7A4F]/5' : 'hover:bg-gray-50/50'}`}
                >
                  <div className={`mt-1.5 p-2 rounded-xl flex items-center justify-center ${
                    !n.isRead ? 'bg-[#3D7A4F] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h3 className={`text-base font-black truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed mb-3 ${!n.isRead ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {n.body}
                    </p>
                    
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3D7A4F] hover:text-[#2B5738] transition-colors"
                      >
                        <DoneAllRoundedIcon sx={{ fontSize: 14 }} />
                        Mark as Read
                      </button>
                    )}
                  </div>

                  {!n.isRead && (
                    <div className="mt-2">
                       <CircleRoundedIcon sx={{ fontSize: 8 }} className="text-[#3D7A4F]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
