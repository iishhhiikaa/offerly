import { useState, useEffect } from 'react';
import CityHorizontalCard from '../components/CityHorizontalCard';
import CityDetailModal from '../components/CityDetailModal';
import SlideOver from '../components/SlideOver';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { adminAPI } from '../../../api/admin.api';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import toast from 'react-hot-toast';

const CityManagement = () => {
  const [cities, setCities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [formData, setFormData] = useState({ name: '', zones: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCities();
      setCities(res.cities || []);
    } catch (error) {
      toast.error('Failed to load cities from server');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCity(null);
    setFormData({ name: '', zones: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (city) => {
    setSelectedCity(city);
    setFormData({ ...city });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (city) => {
    setSelectedCity(city);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.saveCity({ ...formData, id: selectedCity?._id || selectedCity?.id });
      toast.success(selectedCity ? 'City updated successfully' : 'City added successfully');
      setIsModalOpen(false);
      loadCities();
    } catch (error) {
      toast.error('Failed to save city');
    }
  };

  const confirmDelete = async () => {
    try {
      await adminAPI.deleteCity(selectedCity._id || selectedCity.id);
      toast.success('City deleted');
      setIsDeleteModalOpen(false);
      loadCities();
    } catch (error) {
      toast.error('Failed to delete city');
    }
  };

  const filteredCities = cities.filter(city => 
    city.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExplore = (city) => {
    setSelectedCity(city);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Operational Oversight</h1>
          <p className="text-gray-500 font-medium">Manage regions and operational zones across the Offerly network.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by city name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#3D7A4F]/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
           <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Total Regions:</span>
           <span className="text-sm font-black text-[#3D7A4F]">{cities.length}</span>
        </div>
      </div>

      {/* City Cards List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="w-full h-24 bg-gray-50 animate-pulse rounded-3xl"></div>
          ))
        ) : filteredCities.length > 0 ? (
          filteredCities.map((city) => (
            <CityHorizontalCard 
              key={city._id || city.id}
              city={city}
              onExplore={handleExplore}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
             <MapRoundedIcon sx={{ fontSize: 48 }} className="text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No cities found matching your search</p>
          </div>
        )}
      </div>

      <CityDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        city={selectedCity}
      />

      <SlideOver
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCity ? "Edit City" : "Add New City"}
        subtitle="Manage city zones and operating regions."
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-all">Cancel</button>
            <button onClick={handleSave} className="bg-[#3D7A4F] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-[#3D7A4F]/20 hover:bg-[#2B5738] transition-all">Save City</button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">City Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#3D7A4F]/20 focus:border-[#3D7A4F] outline-none"
              placeholder="e.g. Guwahati"
            />
          </div>
          
          <div>
             <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Associated Zones</label>
             <p className="text-xs text-gray-500 italic mb-3">Add comma-separated zones for this city.</p>
             <textarea 
               rows={5}
               value={formData.zones?.map(z => z.name).join(', ')}
               onChange={(e) => {
                  const names = e.target.value.split(',').map(s => s.trim()).filter(s => !!s);
                  setFormData({ ...formData, zones: names.map((n, i) => ({ id: `z_${i}`, name: n, merchantCount: 0 })) });
               }}
               className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#3D7A4F]/20 focus:border-[#3D7A4F] outline-none resize-none"
               placeholder="e.g. Beltola, GS Road, Six Mile"
             />
          </div>
        </form>
      </SlideOver>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${selectedCity?.name}?`}
        message="Deleting this city will remove its zones from the selection list for new merchants. This cannot be undone."
      />
    </div>
  );
};

export default CityManagement;
