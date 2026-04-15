import { useState, useEffect } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { adminAPI } from '../../../api/admin.api';
import toast from 'react-hot-toast';

const BookingLedger = () => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllBookings();
      const loaded = res.data?.redemptions || res.redemptions || [];
      setBookings(loaded);
    } catch (err) {
      toast.error('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.merchant?.storeName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Pending' && b.status === 'pending') ||
      (statusFilter === 'Completed' && (b.status === 'completed' || b.status === 'fulfilled'));
    
    return matchesSearch && matchesStatus;
  });

  // Summary stats
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totals?.final || 0), 0);
  const pendingCount = filteredBookings.filter(b => b.status === 'pending').length;

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);



  return (
    <div className="max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Global Ledger</h1>
          <p className="text-gray-500 font-medium">Real-time platform booking history.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
            <input 
              type="text" 
              placeholder="Search IDs, Users, Stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-lg py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Bookings</p>
          <h3 className="text-3xl font-black text-gray-900">{totalBookings}</h3>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black text-primary">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Count</p>
          <h3 className="text-3xl font-black text-orange-600">{pendingCount}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        {loading ? (
           <div className="flex justify-center items-center py-24">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-[#3D7A4F] rounded-full animate-spin" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Booking ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedBookings.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No bookings found in the ledger.</td>
                </tr>
              ) : (
                paginatedBookings.map(b => (
                  <tr key={b.internalId || b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider">#{b.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-700 text-sm leading-tight">{b.customerName || 'Guest User'}</td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-bold text-gray-800">{b.merchant?.storeName || '—'}</span>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.merchant?.category}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-primary">₹{b.totals?.final}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()} at {new Date(b.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        b.status === 'pending' 
                          ? 'bg-orange-50 text-orange-600 border-orange-200' 
                          : 'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftRoundedIcon />
              </button>
              <span className="text-sm font-bold text-gray-700 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightRoundedIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingLedger;
