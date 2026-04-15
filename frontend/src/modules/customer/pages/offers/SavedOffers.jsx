import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { userAPI } from '../../../../api/user.api';
import { useApp } from '../../context/AppContext';
import OfferCard from '../../components/ui/OfferCard';
import PageTransition from '../../components/ui/PageTransition';
import toast from 'react-hot-toast';

const SavedOffers = () => {
  const { isLoggedIn } = useApp();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await userAPI.getSavedOffers();
      setSaved(response.offers || []);
    } catch (error) {
      console.error('Failed to load saved offers:', error);
      toast.error('Failed to load saved offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSaved(); }, [isLoggedIn]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 py-4 pb-6">
        {saved.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <BookmarkRoundedIcon sx={{ fontSize: 36 }} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">No Saved Offers</h2>
            <p className="text-text-secondary text-sm mt-2">
              Bookmark offers you love to access them quickly
            </p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-4 font-medium">
              {saved.length} saved offer{saved.length !== 1 ? 's' : ''}
            </p>
            <AnimatePresence>
              <div className="space-y-3">
                {saved.map((offer, idx) => (
                  <motion.div
                    key={offer.id || offer._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <OfferCard offer={offer} variant="list" onSaveToggle={loadSaved} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default SavedOffers;
