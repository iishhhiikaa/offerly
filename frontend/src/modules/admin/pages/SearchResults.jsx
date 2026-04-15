import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { adminAPI } from '../../../api/admin.api';
import toast from 'react-hot-toast';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');
  
  const [results, setResults] = useState({ merchants: [], users: [], cities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const res = await adminAPI.globalSearch(q);
      setResults(res.data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const hasResults = results.merchants.length > 0 || results.users.length > 0 || results.cities.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Search Results</h1>
        <p className="text-gray-500 font-medium">Showing matches for <span className="text-[#3D7A4F] font-bold">"{query}"</span></p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[#3D7A4F] rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Searching platform...</p>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
          <SearchOffRoundedIcon sx={{ fontSize: 64 }} className="text-gray-300" />
          <p className="text-lg font-bold text-gray-500">No matches found for your search.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Merchants Section */}
          {results.merchants.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <StorefrontRoundedIcon className="text-[#3D7A4F]" sx={{ fontSize: 24 }} />
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Merchants ({results.merchants.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.merchants.map(m => (
                  <div 
                    key={m._id} 
                    onClick={() => navigate(`/admin/merchants?id=${m._id}`)}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#3D7A4F]/20 transition-all cursor-pointer"
                  >
                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{m.storeName}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.category} • {m.city}</p>
                    <p className="text-sm font-medium text-gray-600 mt-2">{m.ownerName}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {results.users.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <GroupRoundedIcon className="text-blue-500" sx={{ fontSize: 24 }} />
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Users ({results.users.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.users.map(u => (
                  <div 
                    key={u._id}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-black text-lg uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{u.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{u.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cities Section */}
          {results.cities.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapRoundedIcon className="text-orange-500" sx={{ fontSize: 24 }} />
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Cities ({results.cities.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.cities.map(c => (
                  <div 
                    key={c._id} 
                    onClick={() => navigate('/admin/cities')}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{c.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.zones?.length || 0} Zones Covered</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
