import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { useApp } from '../../context/AppContext';
import { getReferralHistory } from '../../data/localStorageUtils';
import PageTransition from '../../components/ui/PageTransition';
import toast from 'react-hot-toast';

const Referral = () => {
  const { user } = useApp();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getReferralHistory());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Referral code copied! 🎉');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Join Offerly!',
        text: `Use my referral code ${user?.referralCode} on Offerly and get exclusive local deals!`,
        url: 'https://app.offerly.com',
      });
    } catch {
      handleCopy();
    }
  };

  const totalEarned = history.reduce((sum, r) => sum + r.credits, 0);

  return (
    <PageTransition>
      <div className="px-4 py-4 pb-24 space-y-5">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-green rounded-3xl p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <CardGiftcardRoundedIcon sx={{ fontSize: 36 }} className="text-white" />
          </motion.div>
          <h2 className="text-white font-bold text-xl">Invite & Earn</h2>
          <p className="text-white/80 text-sm mt-1 leading-relaxed">
            Earn ₹50 credits for every friend who joins Offerly using your referral code
          </p>

          {/* Code display */}
          <div className="mt-4 bg-white/15 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-white/70 text-xs">Your Code</p>
              <p className="text-white font-bold text-2xl tracking-widest">{user?.referralCode}</p>
            </div>
            <div className="flex flex-col gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <ContentCopyRoundedIcon sx={{ fontSize: 20 }} className="text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"
              >
                <ShareRoundedIcon sx={{ fontSize: 20 }} className="text-primary" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface rounded-2xl shadow-card p-4 text-center"
          >
            <PeopleRoundedIcon sx={{ fontSize: 28 }} className="text-primary mb-1" />
            <p className="text-2xl font-bold text-text-primary">{history.length}</p>
            <p className="text-xs text-text-secondary">Friends Referred</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface rounded-2xl shadow-card p-4 text-center"
          >
            <span className="text-2xl mb-1 block">💰</span>
            <p className="text-2xl font-bold text-primary">₹{totalEarned}</p>
            <p className="text-xs text-text-secondary">Total Earned</p>
          </motion.div>
        </div>

        {/* Credit balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-light border border-primary/20 rounded-2xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-text-secondary">Available Credits</p>
            <p className="text-xl font-bold text-primary">₹{user?.credits || 0}</p>
          </div>
          <button className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl">
            Redeem
          </button>
        </motion.div>

        {/* How it works */}
        <div>
          <h3 className="section-title mb-3">How It Works</h3>
          <div className="space-y-3">
            {[
              { step: '1', label: 'Share your referral code with friends' },
              { step: '2', label: 'Friend signs up on Offerly using your code' },
              { step: '3', label: 'You earn ₹50 credits instantly!' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 bg-surface rounded-2xl shadow-card p-3">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{item.step}</span>
                </div>
                <p className="text-sm text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral history */}
        {history.length > 0 && (
          <div>
            <h3 className="section-title mb-3">Referral History</h3>
            <div className="space-y-2">
              {history.map((ref, idx) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-surface rounded-xl shadow-card p-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{ref.friendName.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{ref.friendName}</p>
                    <p className="text-xs text-text-secondary">{ref.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleRoundedIcon sx={{ fontSize: 14 }} className="text-green-600" />
                    <span className="text-sm font-bold text-green-600">+₹{ref.credits}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Referral;
