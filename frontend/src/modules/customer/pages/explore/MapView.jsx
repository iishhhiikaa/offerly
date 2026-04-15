import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { merchantAPI } from '../../../../api/merchant.api';
import { offerAPI } from '../../../../api/offer.api';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PageTransition from '../../components/ui/PageTransition';
import StoreCard from '../../components/ui/StoreCard';
import { mockCategories } from '../../data/mockData';
import { categoryAPI } from '../../../../api/category.api';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Red marker for Stores
const redIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: #E74C3C;
    color: white;
    border-radius: 50% 50% 50% 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    transform: rotate(-45deg);
    border: 2px solid white;
  ">
    <span style="transform: rotate(45deg)">🏪</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Custom Dark Gray marker for the Customer (User)
const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: #333333;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 4px rgba(51,51,51,0.2);
    border: 2px solid white;
  ">
    <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Helper to parse distance string ('1.5 km', '900 m') to meters for sorting
const parseDistance = (distStr) => {
  if (!distStr) return Infinity;
  const val = parseFloat(distStr);
  if (distStr.includes('km')) return val * 1000;
  return val;
};

const MapView = () => {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [offerCounts, setOfferCounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // New States for Filtering
  const [selectedCategory, setSelectedCategory] = useState('All');

  const center = [26.5012, 93.9681]; // Golaghat, Assam

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [merchantRes, offersRes] = await Promise.all([
          merchantAPI.getAll({ status: 'approved' }),
          offerAPI.getAll({ status: 'active' })
        ]);

        const allMerchants = merchantRes.merchants || [];
        const allOffers = offersRes.offers || [];
        
        setMerchants(allMerchants);

        const counts = {};
        allOffers.forEach((o) => {
          const merchantId = o.merchantId?._id || o.merchantId;
          if (merchantId) {
            counts[merchantId] = (counts[merchantId] || 0) + 1;
          }
        });
        setOfferCounts(counts);
      } catch (error) {
        console.error('Failed to load map data:', error);
      }
    };
    loadMapData();
  }, []);

  // Compute filtered and sorted list
  const displayedMerchants = useMemo(() => {
    // 1. Filter
    let filtered = merchants;
    if (selectedCategory !== 'All') {
      filtered = merchants.filter(m => m.category === selectedCategory);
    }
    
    // 2. Sort by rating (descending), then nearby location (distance ascending)
    return [...filtered].sort((a, b) => {
      // Primary Sort: Rating
      if (b.avgRating !== a.avgRating) {
        return b.avgRating - a.avgRating;
      }
      // Secondary Sort: Distance
      const distA = parseDistance(a.distance);
      const distB = parseDistance(b.distance);
      return distA - distB;
    });
  }, [merchants, selectedCategory]);

  return (
    <PageTransition>
      <div className="flex flex-col h-full bg-background min-h-screen">
        
        {/* Category Filters (Horizontal Scroll) */}
        <div className="px-4 py-3 flex overflow-x-auto scrollbar-hide gap-2 bg-surface shadow-sm sticky top-0 z-30">
          <button
            onClick={() => { setSelectedCategory('All'); setSelected(null); }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
              selectedCategory === 'All'
                ? 'bg-primary text-white border-primary'
                : 'bg-transparent text-text-secondary border-border hover:border-primary/50'
            }`}
          >
            All Areas
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => { setSelectedCategory(cat.name); setSelected(null); }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                selectedCategory === cat.name
                  ? 'bg-primary text-white border-primary'
                  : 'bg-transparent text-text-secondary border-border hover:border-primary/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Map legend */}
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface rounded-full px-3 py-1.5 shadow-sm border border-border text-xs font-medium text-text-secondary">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E74C3C' }} />
            Stores ({displayedMerchants.length})
          </div>
          <div className="flex items-center gap-1.5 bg-surface rounded-full px-3 py-1.5 shadow-sm border border-border text-xs font-medium text-text-secondary">
            <LocationOnRoundedIcon sx={{ fontSize: 14 }} style={{ color: '#333333' }} />
            You
          </div>
        </div>

        {/* Map */}
        <div className="mx-4 mb-4 rounded-3xl overflow-hidden shadow-card border border-border/60 relative flex-shrink-0 h-[45vh] lg:h-[60vh]">
          {/* Re-render map completely if categories heavily change or just use key on container to force bounds check, but Leaflet usually handles dynamic markers well */}
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', zIndex: 10 }} zoomControl={false}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {/* User marker representing 'You' */}
            <Marker position={center} icon={userIcon}>
              <Popup>
                 <div className="text-center font-bold text-sm">You are here</div>
              </Popup>
            </Marker>

            {/* Store markers */}
            {displayedMerchants.map((merchant) => {
              if (!merchant.coordinates?.lat || !merchant.coordinates?.lng) return null;
              
              return (
                <Marker
                  key={merchant.id}
                  position={[merchant.coordinates.lat, merchant.coordinates.lng]}
                  icon={redIcon}
                  eventHandlers={{ click: () => setSelected(merchant) }}
                >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <img src={merchant.logo || merchant.coverImage} className="w-10 h-10 mx-auto rounded-full object-cover mb-2 shadow-sm" alt={merchant.storeName}/>
                    <p className="font-bold text-sm text-text-primary">{merchant.storeName}</p>
                    <p className="text-xs font-medium text-text-secondary">{merchant.category}</p>
                    <div className="flex justify-center items-center gap-1 mt-1 font-bold text-amber-500 text-xs">
                       ★ {merchant.avgRating}
                    </div>
                    <p className="text-xs text-primary font-semibold mt-2 bg-primary/10 px-2 py-1 rounded-md">
                      {offerCounts[merchant.id] || 0} active offers
                    </p>
                  </div>
                </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Selected store overlay or below-map list */}
        <div className="px-4 pb-8 space-y-3">
          {selected ? (
            <div>
               <div className="flex items-center justify-between section-title mb-3">
                 <h2>Selected Store</h2>
                 <button onClick={() => setSelected(null)} className="text-xs text-text-secondary hover:text-primary">Clear Selection</button>
               </div>
               <StoreCard merchant={selected} variant="row" offerCount={offerCounts[selected.id] || 0} />
            </div>
          ) : (
            <>
              <h2 className="section-title mb-3">Stores Based on Ratings & Near You</h2>
              {displayedMerchants.length > 0 ? (
                displayedMerchants.map((merchant) => (
                  <StoreCard
                    key={merchant.id}
                    merchant={merchant}
                    variant="row"
                    offerCount={offerCounts[merchant.id] || 0}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary text-sm bg-surface rounded-2xl shadow-sm border border-border">
                  No stores found in this category.
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </PageTransition>
  );
};

export default MapView;
