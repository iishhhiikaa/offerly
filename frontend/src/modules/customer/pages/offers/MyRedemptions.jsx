import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import { bookingAPI } from '../../../../api/booking.api';
import PageTransition from '../../components/ui/PageTransition';

const statusConfig = {
  completed: { icon: CheckCircleRoundedIcon, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  pending: { icon: AccessTimeRoundedIcon, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  expired: { icon: CancelRoundedIcon, color: 'text-red-500', bg: 'bg-red-50', label: 'Expired' },
  invalid: { icon: CancelRoundedIcon, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Invalid' },
};

const MyRedemptions = () => {
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRedemptions = async () => {
      try {
        const res = await bookingAPI.getCustomerRedemptions();
        if (res && res.success) {
          setRedemptions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch redemptions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRedemptions();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="px-4 py-4 pb-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 py-4 pb-6">
        {redemptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <ReceiptLongRoundedIcon sx={{ fontSize: 36 }} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">No Redemptions Yet</h2>
            <p className="text-text-secondary text-sm mt-2">
              Redeem your first offer to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((redemption, idx) => {
              const offer = redemption.offerId;
              const merchant = redemption.merchantId;
              
              const isLocalExpired = redemption.status === 'pending' && new Date(redemption.qrExpiry) < new Date();
              const displayStatus = isLocalExpired ? 'expired' : redemption.status;
              
              const config = statusConfig[displayStatus] || statusConfig.pending;
              const StatusIcon = config.icon;
              const date = new Date(redemption.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });

              return (
                <motion.div
                  key={redemption._id || redemption.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="bg-surface rounded-2xl shadow-card p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Offer image */}
                    {offer?.image && (
                      <img
                        src={offer.image}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {offer?.title || 'Offer'}
                      </p>
                      <p className="text-xs text-text-secondary">{merchant?.storeName}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{date}</p>

                      {/* Status badge */}
                      <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full ${config.bg}`}>
                        <StatusIcon sx={{ fontSize: 13 }} className={config.color} />
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-2">
                      {redemption.status === 'completed' && !redemption.hasReview && (
                        <button
                          onClick={() => navigate(`/review/${redemption._id || redemption.id}`)}
                          className="flex items-center gap-1 text-xs text-primary font-semibold bg-primary-light px-2.5 py-1.5 rounded-lg"
                        >
                          <RateReviewRoundedIcon sx={{ fontSize: 13 }} />
                          Review
                        </button>
                      )}
                      {displayStatus === 'pending' && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/redeem/${redemption._id || redemption.id}`)}
                          className="flex items-center gap-1 text-xs text-white font-semibold bg-primary px-2.5 py-1.5 rounded-lg"
                        >
                          View QR
                          <ChevronRightRoundedIcon sx={{ fontSize: 13 }} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default MyRedemptions;
