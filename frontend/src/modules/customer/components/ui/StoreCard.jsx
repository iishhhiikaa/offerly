import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

const StoreCard = ({ merchant, offerCount, variant = 'row' }) => {
  const navigate = useNavigate();
  const merchantId = merchant._id || merchant.id;

  if (variant === 'row') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/store/${merchantId}`)}
        className="flex items-center gap-3 bg-surface rounded-2xl shadow-card p-3 cursor-pointer"
      >
        {/* Store logo / category icon */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-light flex-shrink-0">
          {merchant.logo ? (
            <img src={merchant.logo} alt={merchant.storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{merchant.storeName.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate">{merchant.storeName}</span>
            {merchant.verified && (
              <VerifiedRoundedIcon sx={{ fontSize: 14 }} className="text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-text-secondary">{merchant.category}</p>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-0.5">
              <StarRoundedIcon sx={{ fontSize: 13 }} className="text-amber-400" />
              <span className="text-xs text-text-secondary font-medium">{merchant.avgRating}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <LocationOnRoundedIcon sx={{ fontSize: 13 }} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">{merchant.distance}</span>
            </div>
            {offerCount !== undefined && (
              <span className="text-xs text-primary font-medium">{offerCount} offers</span>
            )}
          </div>
        </div>

        <ChevronRightRoundedIcon sx={{ fontSize: 20 }} className="text-gray-300 flex-shrink-0" />
      </motion.div>
    );
  }

  // Card (vertical) variant
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/store/${merchantId}`)}
      className="bg-surface rounded-2xl shadow-card overflow-hidden cursor-pointer w-44 flex-shrink-0"
    >
      <div className="h-24 relative">
        <img
          src={merchant.coverImage}
          alt={merchant.storeName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {offerCount !== undefined && (
          <span className="absolute bottom-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            {offerCount} offers
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-text-primary truncate">{merchant.storeName}</p>
        <p className="text-xs text-text-secondary">{merchant.category}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <StarRoundedIcon sx={{ fontSize: 13 }} className="text-amber-400" />
          <span className="text-xs font-medium text-text-secondary">{merchant.avgRating}</span>
          <span className="text-xs text-text-secondary ml-1">{merchant.distance}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreCard;
