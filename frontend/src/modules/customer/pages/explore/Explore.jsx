import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import { categoryAPI } from '../../../../api/category.api';
import { offerAPI } from '../../../../api/offer.api';
import { cityAPI } from '../../../../api/city.api';
import { CategoryChip } from '../../components/ui/CategoryChip';
import OfferCard from '../../components/ui/OfferCard';
import PageTransition from '../../components/ui/PageTransition';
import { useApp } from '../../context/AppContext';

const Explore = () => {
  const navigate = useNavigate();
  const { selectedCity, selectedCategory, setSelectedCategory } = useApp();
  
  const [viewMode, setViewMode] = useState('list');
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchText, setSearchText] = useState('');
  const [currentCityZones, setCurrentCityZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allCities, setAllCities] = useState([]);

  // 1. Initial Load (Categories & Cities)
  useEffect(() => {
    const loadBasics = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          categoryAPI.getAll(),
          cityAPI.getAll()
        ]);
        
        const categoryNames = catRes.categories.map(c => c.name);
        setCategories(['All', ...categoryNames]);
        setAllCities(cityRes.cities || []);
      } catch (error) {
        console.error('Failed to load basics:', error);
      }
    };
    loadBasics();
  }, []);

  // 2. Filter-based Data Load
  useEffect(() => {
    const loadOffers = async () => {
      setIsLoading(true);
      try {
        const params = {
          status: 'active',
          city: selectedCity !== 'Select City' ? selectedCity : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchText.trim() || undefined
        };

        const response = await offerAPI.getAll(params);
        setOffers(response.offers || []);
        
        // Load zones for current city from our local cache of all cities
        const cityObj = allCities.find(c => c.name === selectedCity);
        setCurrentCityZones(cityObj?.zones || []);

      } catch (error) {
        console.error('Failed to load offers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search text if needed, but for now simple fetch
    const timeout = setTimeout(loadOffers, searchText ? 500 : 0);
    return () => clearTimeout(timeout);
  }, [selectedCategory, selectedCity, searchText, allCities]);

  // Derived states
  const trendingOffers = offers.filter((o) => o.isTrending);
  const newOffers = offers.filter((o) => o.isNew);

  return (
    <PageTransition>
      <div className="px-4 py-3 space-y-4 pb-6">

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl px-4 py-3 shadow-card focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <SearchRoundedIcon sx={{ fontSize: 18 }} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search places, offers or services"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="text-xs text-primary font-bold bg-primary/5 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1 pt-1">
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isActive={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* View toggle + count */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
            {isLoading ? 'Searching...' : `${offers.length} offers in ${selectedCity}`}
          </p>
          <div className="flex items-center gap-1 bg-surface-variant/30 rounded-xl border border-border p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-text-primary'}`}
            >
              <ViewListRoundedIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-text-primary'}`}
            >
              <GridViewRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Loader Skeletons */}
        {isLoading && (
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Content sections */}
        {!isLoading && (
          <>
            {/* Trending section */}
            {trendingOffers.length > 0 && !searchText && (
              <section>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-tight">Trending Near You</h2>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                  {trendingOffers.map((offer) => (
                    <OfferCard key={offer._id || offer.id} offer={offer} variant={viewMode === 'grid' ? 'grid' : 'list'} />
                  ))}
                </div>
              </section>
            )}

            {/* New section */}
            {newOffers.length > 0 && !searchText && (
              <section className="pt-2">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-tight">New on Offerly</h2>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                  {newOffers.map((offer) => (
                    <OfferCard key={offer._id || offer.id} offer={offer} variant={viewMode === 'grid' ? 'grid' : 'list'} />
                  ))}
                </div>
              </section>
            )}

            {/* General Results / Search Results */}
            {((searchText || (trendingOffers.length === 0 && newOffers.length === 0)) && offers.length > 0) && (
              <section className="pt-2">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-tight mb-3 px-1">
                  {searchText ? 'Search Results' : 'Recommended for You'}
                </h2>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                  {offers.map((offer) => (
                    <OfferCard key={offer._id || offer.id} offer={offer} variant={viewMode === 'grid' ? 'grid' : 'list'} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {offers.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-primary-light/30 rounded-full flex items-center justify-center mb-4">
                  <SearchRoundedIcon sx={{ fontSize: 40 }} className="text-primary/40" />
                </div>
                <h3 className="font-bold text-text-primary mb-1">No offers found</h3>
                <p className="text-xs text-text-secondary px-8">We couldn't find any offers matching your criteria in {selectedCity}. Try a different city or category!</p>
                <button 
                  onClick={() => { setSearchText(''); setSelectedCategory('All'); }}
                  className="mt-6 text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-full active:scale-95 transition-transform"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Browse by area */}
        {!searchText && !isLoading && currentCityZones.length > 0 && (
          <section className="pt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-tight">Browse by Area</h2>
            </div>
            <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {currentCityZones.map((zone) => (
                <motion.button
                  key={zone._id || zone.id}
                  whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="w-full flex items-center justify-between px-4 py-4 group"
                  onClick={() => setSearchText(zone.name)}
                >
                  <div className="flex flex-col items-start translate-x-0 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-semibold text-text-primary">{zone.name}</span>
                    <span className="text-[10px] text-text-secondary">{zone.merchantCount || 0} merchants</span>
                  </div>
                  <ChevronRightRoundedIcon sx={{ fontSize: 20 }} className="text-gray-300 group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
};

export default Explore;
