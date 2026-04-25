import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { offerAPI } from '../../../../api/offer.api';
import OfferCard from '../../components/ui/OfferCard';
import PageTransition from '../../components/ui/PageTransition';
import { useApp } from '../../context/AppContext';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const initial = searchParams.get('q') || '';
  const { user, selectedCity } = useApp();
  const cityFilter = selectedCity !== 'Select City' ? selectedCity : (user?.city || undefined);

  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [recent] = useState(['Royal Restaurant', 'Gym', 'Fashion', 'Cafe']);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim()) {
        try {
          if (!cityFilter) {
            setResults([]);
            return;
          }
          const res = await offerAPI.getAll({ search: query, status: 'active', city: cityFilter });
          setResults(res.offers || []);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        }
      } else {
        try {
          if (!cityFilter) {
            setAllOffers([]);
            return;
          }
          const res = await offerAPI.getAll({ status: 'active', city: cityFilter, limit: 6 });
          setAllOffers(res.offers || []);
        } catch (error) {
          console.error('Failed to fetch all offers:', error);
        }
        setResults([]);
      }
    };
    fetchResults();
  }, [query, cityFilter]);

  return (
    <PageTransition>
      <div className="px-4 py-3 pb-6">
        {/* Search input */}
        <div className="flex items-center gap-2 bg-surface border-2 border-primary rounded-2xl px-4 py-3 shadow-card mb-4">
          <SearchRoundedIcon sx={{ fontSize: 20 }} className="text-primary" />
          <input
            type="text"
            placeholder="Search offers, stores, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-primary font-medium">
              Clear
            </button>
          )}
        </div>

        {/* No query — show recent searches */}
        {!query && (
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => setQuery(r)}
                  className="bg-surface border border-border rounded-full px-3 py-1.5 text-sm text-text-secondary"
                >
                  {r}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3 mt-6">All Offers</h3>
            <div className="space-y-3">
              {!cityFilter && (
                <p className="text-xs text-text-secondary">Please select a city to load offers.</p>
              )}
              {allOffers.map((offer, idx) => (
                <motion.div
                  key={offer._id || offer.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <OfferCard offer={offer} variant="list" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div>
            <p className="text-xs text-text-secondary font-medium mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            {results.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl mb-4">😔</span>
                <h3 className="text-base font-bold text-text-primary">Nothing found</h3>
                <p className="text-text-secondary text-sm mt-1">
                  Try searching for a different keyword
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((offer, idx) => (
                  <motion.div
                    key={offer._id || offer.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <OfferCard offer={offer} variant="list" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default SearchResults;
