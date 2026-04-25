import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';

import { useApp } from '../../context/AppContext';
import BottomSheet from '../../components/ui/BottomSheet';
import StoreCard from '../../components/ui/StoreCard';
import PageTransition from '../../components/ui/PageTransition';
import { categoryAPI } from '../../../../api/category.api';
import { offerAPI } from '../../../../api/offer.api';
import { merchantAPI } from '../../../../api/merchant.api';
import { cityAPI } from '../../../../api/city.api';
import { adAPI } from '../../../../api/adRequest.api';
import OfferCard from '../../components/ui/OfferCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Reusable animated Section Header
const SectionHeader = ({ title, icon: Icon, onAction, actionText = 'View All' }) => (
  <div className="flex items-center justify-between mb-4 px-1">
    <div className="flex items-center gap-1.5">
      {Icon && <Icon sx={{ fontSize: 20 }} className="text-primary" />}
      <h2 className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
    </div>
    {onAction && (
      <motion.button
        whileHover={{ x: 3 }}
        onClick={onAction}
        className="text-xs text-primary font-semibold flex items-center bg-primary-light/50 px-2 py-1 rounded-lg transition-colors hover:bg-primary-light"
      >
        {actionText} <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
      </motion.button>
    )}
  </div>
);

// Modern Category Icon mapper with proper MUI icons
const getIconForCategory = (label) => {
  const map = {
    'Food': RestaurantRoundedIcon,
    'Saloon': ContentCutRoundedIcon,
    'Shops': ShoppingCartRoundedIcon,
    'Gym': FitnessCenterRoundedIcon,
    'Services': BuildRoundedIcon,
    'Cafe': LocalCafeRoundedIcon,
    'Health': MedicalServicesRoundedIcon,
    'Other': StorefrontRoundedIcon,
  };
  return map[label] || StorefrontRoundedIcon;
};

// Map colors for categories to make them look vibrant and distinct
const getColorForCategory = (label) => {
  const map = {
    'Food': 'text-orange-500 bg-orange-50 hover:border-orange-200',
    'Saloon': 'text-purple-500 bg-purple-50 hover:border-purple-200',
    'Shops': 'text-blue-500 bg-blue-50 hover:border-blue-200',
    'Gym': 'text-red-500 bg-red-50 hover:border-red-200',
    'Services': 'text-amber-500 bg-amber-50 hover:border-amber-200',
    'Cafe': 'text-amber-700 bg-amber-50 hover:border-amber-200',
    'Health': 'text-teal-500 bg-teal-50 hover:border-teal-200',
  };
  return map[label] || 'text-primary bg-primary-light hover:border-primary/30';
};

const Home = () => {
  const navigate = useNavigate();
  const { user, selectedCity, setSelectedCity, setSelectedCategory } = useApp();
  const useUnifiedFeed = import.meta.env.VITE_USE_UNIFIED_FEED !== 'false';
  const [categories, setCategories] = useState([]);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [cityRequired, setCityRequired] = useState(false);
  
  // Sections data
  const [featuredBanners, setFeaturedBanners] = useState([]);
  const [trendingOffers, setTrendingOffers] = useState([]);
  const [nearbyOffers, setNearbyOffers] = useState([]);
  const [recommendedOffers, setRecommendedOffers] = useState([]);
  const [mostPopulatedStores, setMostPopulatedStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Get User Location on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error.message);
        }
      );
    }
  }, []);

  // 2. Load basic items (Categories & Cities) that don't depend on selection
  useEffect(() => {
    const loadBasics = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          categoryAPI.getAll(),
          cityAPI.getAll()
        ]);
        setCategories(catRes.categories || []);
        setAvailableCities(cityRes.cities || []);
      } catch (error) {
        console.error('Failed to load basics:', error);
      }
    };
    loadBasics();
  }, []);

  // 3. MAIN DATA SYNC: Reactive to selectedCity and userCoords
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const resolvedCity =
          selectedCity !== 'Select City' ? selectedCity : (user?.city || '');

        if (!resolvedCity) {
          setCityRequired(true);
          setFeaturedBanners([]);
          setTrendingOffers([]);
          setNearbyOffers([]);
          setRecommendedOffers([]);
          setMostPopulatedStores([]);
          setIsLoading(false);
          return;
        }

        setCityRequired(false);

        // Base query parameters
        const baseParams = { 
          city: resolvedCity,
          userLat: userCoords?.lat,
          userLng: userCoords?.lng
        };

        if (useUnifiedFeed) {
          const feedResponse = await offerAPI.getFeed(baseParams);
          const buckets = feedResponse?.buckets || {};

          setFeaturedBanners(feedResponse?.banners || []);
          setTrendingOffers(buckets.trendingOffers || []);
          setNearbyOffers(buckets.nearYouOffers || []);
          setMostPopulatedStores(buckets.mostPopulatedStores || []);
          setRecommendedOffers(buckets.recommendedOffers || []);
        } else {
          // Legacy fallback mode
          const [
            adsResponse,
            trendingOffersResponse, 
            nearbyOffersResponse,
            trendingMerchantsResponse
          ] = await Promise.all([
            adAPI.getApproved({ city: baseParams.city }),
            offerAPI.getAll({ ...baseParams, status: 'active', isTrending: true, limit: 5 }),
            offerAPI.getAll({ ...baseParams, status: 'active', limit: 4 }),
            merchantAPI.getAll({ 
              ...baseParams, 
              status: 'approved',
              sortBy: 'totalRedemptions',
              sortOrder: 'desc',
              limit: 3
            }),
          ]);

          const allAds = adsResponse.ads || [];
          const trendingOffersData = trendingOffersResponse.offers || [];
          const nearbyOffersData = nearbyOffersResponse.offers || [];
          const trendingStores = trendingMerchantsResponse.merchants || [];

          const adBanners = allAds.map(ad => ({
            ...ad,
            id: ad._id,
            title: ad.title || `${ad.storeName} Promotion`,
            image: ad.image,
            merchantId: ad.merchantId,
            isAd: true
          }));

          const organicTrending = trendingOffersData.map(o => ({
            ...o,
            id: o._id,
            isAd: false
          }));

          setFeaturedBanners([...adBanners, ...organicTrending].slice(0, 5));
          setTrendingOffers(trendingOffersData);
          setNearbyOffers(nearbyOffersData);
          setMostPopulatedStores(trendingStores);
          setRecommendedOffers([]);
        }

      } catch (error) {
        console.error('Failed to sync home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedCity, user?.city, userCoords, useUnifiedFeed]);

  // 4. Auto-sliding Carousel interval
  useEffect(() => {
    if (featuredBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredBanners.length]);

  const handleCategoryClick = (name) => {
    setSelectedCategory(name);
    navigate('/explore');
  };

  const displayCity = selectedCity !== 'Select City' ? selectedCity : (user?.city || 'Select City');

  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-4 space-y-8 pb-8">

        {/* 1. Hero Section */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <div className="bg-gradient-to-br from-primary via-[#356d45] to-[#1c3e26] rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0 opacity-20">
              <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop')" }}></div>
              <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop')" }}></div>
              <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop')" }}></div>
              <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop')" }}></div>
              <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=400&h=300&fit=crop')" }}></div>
              <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop')" }}></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-[#356d45]/80 to-[#1c3e26]/85"></div>
            
            <div className="relative z-10">
              <button
                onClick={() => setCitySheetOpen(true)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full mb-6 w-fit backdrop-blur-sm border border-white/10 text-xs font-semibold"
              >
                <LocationOnRoundedIcon sx={{ fontSize: 14 }} className="text-green-300" />
                <span>{displayCity}</span>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} className="text-white/80" />
              </button>

              <div className="mb-6 max-w-[85%]">
                <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight mb-2 text-white drop-shadow-md">
                   {user?.name ? `Hey ${user.name.split(' ')[0]}, ` : ''}Find the best deals near you.
                </h1>
                <p className="text-white/80 text-sm font-medium">Discover up to 50% off on your favorite local spots.</p>
              </div>

              <button
                onClick={() => navigate('/search')}
                className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-lg transition-transform hover:scale-[1.01] text-left group"
              >
                <SearchRoundedIcon sx={{ fontSize: 22 }} className="text-primary group-hover:text-primary-dark transition-colors" />
                <span className="text-text-secondary text-sm font-medium flex-1">Search for food, cafes, salons...</span>
              </button>
            </div>
          </div>
        </motion.section>

        {!isLoading && cityRequired && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <h3 className="text-sm font-bold text-amber-900">Select your city to see local offers</h3>
            <p className="text-xs text-amber-800 mt-1">
              Feed is city-based. Please choose your city to load Trending, Near You and Recommended offers.
            </p>
            <button
              onClick={() => setCitySheetOpen(true)}
              className="mt-3 text-xs font-semibold bg-amber-600 text-white px-3 py-2 rounded-lg"
            >
              Select City
            </button>
          </motion.section>
        )}

        {/* 2. Categories Section */}
        <motion.section variants={containerVariants} initial="hidden" animate="visible">
          <SectionHeader title="Explore Categories" onAction={() => navigate('/explore')} />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6 pb-4 pt-1 snap-x">
            {[...categories.slice(0, 7), { _id: 'more', name: 'More' }].map((cat, idx) => {
              const Icon = cat._id === 'more' ? MoreHorizRoundedIcon : getIconForCategory(cat.name);
              const customColors = cat._id === 'more' 
                ? 'text-gray-500 bg-gray-50 hover:border-gray-300' 
                : getColorForCategory(cat.name);

              return (
                <motion.button
                  key={cat._id || idx}
                  variants={itemVariants}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => cat._id === 'more' ? navigate('/explore') : handleCategoryClick(cat.name)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 snap-start group w-[72px]"
                >
                  <div className={`w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center border border-border/80 transition-all duration-300 group-hover:shadow-md ${customColors}`}>
                    <Icon sx={{ fontSize: 28 }} className="transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-xs font-bold text-text-primary text-center line-clamp-1 w-full px-1">
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* 3. Promotions Carousel */}
        {!isLoading && featuredBanners.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-2"
          >
            <SectionHeader title="Top Promotions" icon={LocalOfferRoundedIcon} onAction={() => navigate('/explore')} />
            <div className="relative h-44 sm:h-56 md:h-60 lg:h-64 rounded-[1.5rem] overflow-hidden shadow-card border border-border">
              <AnimatePresence mode="wait">
                  <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 cursor-pointer group"
                  onClick={() => {
                    const banner = featuredBanners[currentSlide];
                    if (banner.isAd) {
                      navigate(`/store/${banner.merchantId}`);
                    } else {
                      navigate(`/offer/${banner._id || banner.id}`);
                    }
                  }}
                >
                  <img
                    src={featuredBanners[currentSlide].image}
                    alt={featuredBanners[currentSlide].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className={`inline-block ${featuredBanners[currentSlide].isAd ? 'bg-indigo-600' : 'bg-primary'} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 shadow-sm`}>
                       {featuredBanners[currentSlide].isAd ? 'Sponsored' : 'Featured Deal'}
                    </div>
                    <h3 className="text-white text-xl md:text-2xl font-bold leading-tight line-clamp-1 mb-1 drop-shadow">
                      {featuredBanners[currentSlide].title}
                    </h3>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              {featuredBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full h-[5px] ${
                    idx === currentSlide ? 'bg-primary w-6' : 'bg-gray-300 w-[5px] hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* 4. Trending Offers */}
        {!isLoading && trendingOffers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeader title="Trending Offers" icon={TrendingUpRoundedIcon} onAction={() => navigate('/explore')} />
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6 gap-4 pb-4 snap-x">
              {trendingOffers.map((offer) => (
                <div key={offer._id || offer.id} className="w-[260px] flex-shrink-0 snap-start">
                  <OfferCard offer={offer} variant="grid" />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 5. Most Populated Stores */}
        {!isLoading && mostPopulatedStores.length > 0 && (
          <motion.section
             initial={{ opacity: 0, y: 16 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
          >
            <SectionHeader title="Most Populated Stores" icon={StorefrontRoundedIcon} onAction={() => navigate('/explore')} />
            <div className="space-y-3">
              {mostPopulatedStores.map((merchant, idx) => (
                <motion.div
                  key={merchant._id || merchant.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + idx * 0.07 }}
                >
                  <StoreCard 
                    merchant={merchant} 
                    variant="row" 
                    offerCount={merchant.offerCount || 0} 
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 6. Nearby Offers */}
        {!isLoading && nearbyOffers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <SectionHeader title="Deals Near You" onAction={() => navigate('/explore')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyOffers.map((offer, idx) => (
                <motion.div
                  key={offer._id || offer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.07 }}
                >
                  <OfferCard offer={offer} variant="list" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 7. Recommended Offers */}
        {!isLoading && recommendedOffers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SectionHeader title="Recommended for You" onAction={() => navigate('/explore')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedOffers.map((offer, idx) => (
                <motion.div
                  key={offer._id || offer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52 + idx * 0.06 }}
                >
                  <OfferCard offer={offer} variant="list" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-12 pt-4">
             <div className="h-44 bg-gray-100 rounded-[1.5rem] animate-pulse" />
             <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-4">
                   <div className="h-32 w-[260px] bg-gray-100 rounded-2xl animate-pulse" />
                   <div className="h-32 w-[260px] bg-gray-100 rounded-2xl animate-pulse" />
                </div>
             </div>
          </div>
        )}

      </div>

      {/* City selection bottom sheet */}
      <BottomSheet
        isOpen={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
        title="Select City"
      >
        <div className="p-4 grid grid-cols-2 gap-3 pb-10">
          {availableCities.map((city) => (
            <motion.button
              key={city._id || city.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedCity(city.name); setCitySheetOpen(false); }}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                displayCity === city.name
                  ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
                  : 'border-border text-text-secondary hover:border-gray-300'
              }`}
            >
              <LocationOnRoundedIcon sx={{ fontSize: 18 }} className={displayCity === city.name ? 'text-primary' : 'text-gray-400'} />
              {city.name}
            </motion.button>
          ))}
        </div>
      </BottomSheet>
    </PageTransition>
  );
};

export default Home;
