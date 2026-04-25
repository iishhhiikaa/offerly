import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { merchantAPI } from '../../../api/merchant.api';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';

const Customers = ({ merchant }) => {
  const [customerData, setCustomerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchant) {
      setLoading(false);
      return;
    }
    loadCustomers();
  }, [merchant]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await merchantAPI.getCustomers();
      
      if (response?.customers) {
        // Map API response to match existing UI expectations
        const mapped = response.customers.map(c => ({
          id: c.id,
          name: c.name || 'Guest User',
          phone: c.phone || 'N/A',
          email: c.email || '',
          totalRedemptions: c.visits || 0,
          totalSpend: c.spend || 0,
          lastVisit: c.lastVisit
        }));
        setCustomerData(mapped.sort((a, b) => b.totalSpend - a.totalSpend));
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomerData([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customerData.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const totalRevenue = customerData.reduce((s, c) => s + c.totalSpend, 0);
  const avgSpend = customerData.length > 0 ? Math.round(totalRevenue / customerData.length) : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="merchant-page-title">Customer Directory</h1>
        <p className="merchant-page-subtitle">Insights and history of your store's redeemers.</p>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="merchant-input-with-icon"
          />
        </div>
        <div className="flex items-center gap-5 bg-white rounded-2xl px-6 py-3.5 border border-gray-100 shadow-card">
          <div>
            <p className="text-micro text-gray-400 uppercase">Total Reach</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{customerData.length} <span className="text-sm text-gray-400 font-medium">Users</span></p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <p className="text-micro text-gray-400 uppercase">Avg Spend</p>
            <p className="text-lg font-bold text-primary leading-tight font-mono">₹{avgSpend}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="merchant-card overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="merchant-table">
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th>Visits</th>
                <th className="text-center">Total Revenue</th>
                <th>Last Activity</th>
                <th className="text-right">Badge</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="!py-20 text-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-medium text-sm">Loading customers...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="!py-20 text-center">
                    <PeopleAltRoundedIcon className="text-gray-200 mb-2" sx={{fontSize: 48}} />
                    <p className="text-gray-400 font-medium text-sm">No customer history available.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer, idx) => (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group"
                  >
                    <td>
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold uppercase text-base border ${
                          customer.totalSpend > 5000 
                            ? 'bg-amber-50 text-amber-600 border-amber-200' 
                            : customer.totalRedemptions > 3 
                            ? 'bg-blue-50 text-accent-cool border-blue-200' 
                            : 'bg-primary-50 text-primary border-primary-200'
                        }`}>
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{customer.name}</p>
                          <p className="text-micro text-gray-400 mt-0.5">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <LocalOfferRoundedIcon sx={{fontSize: 14}} className="text-accent-warm" />
                        <span className="text-sm font-semibold text-gray-700">{customer.totalRedemptions} Redemptions</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="font-mono text-sm font-medium text-primary bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 inline-flex items-center gap-1">
                        ₹{customer.totalSpend.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs font-medium text-gray-600">{new Date(customer.lastVisit).toLocaleDateString()}</p>
                      <p className="text-micro text-gray-400 mt-0.5">{new Date(customer.lastVisit).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="text-right">
                      {customer.totalSpend > 5000 ? (
                        <span className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-micro font-bold px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm inline-flex items-center gap-1">
                          👑 VIP ROYAL
                        </span>
                      ) : customer.totalRedemptions > 3 ? (
                        <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-micro font-bold px-3 py-1.5 rounded-xl border border-blue-200 inline-flex items-center gap-1">
                          💎 LOYALIST
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-400 text-micro font-bold px-3 py-1.5 rounded-xl border border-gray-100 inline-flex items-center gap-1">
                          REGULAR
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-100/80">
          {loading ? (
            <div className="px-4 py-20 text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-sm">Loading customers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-20 text-center">
              <PeopleAltRoundedIcon className="text-gray-200 mb-2" sx={{fontSize: 48}} />
              <p className="text-gray-400 font-medium text-sm">No customer history available.</p>
            </div>
          ) : (
            filtered.map((customer, idx) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold uppercase text-base border flex-shrink-0 ${
                    customer.totalSpend > 5000 
                      ? 'bg-amber-50 text-amber-600 border-amber-200' 
                      : customer.totalRedemptions > 3 
                      ? 'bg-blue-50 text-accent-cool border-blue-200' 
                      : 'bg-primary-50 text-primary border-primary-200'
                  }`}>
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                    <p className="text-micro text-gray-400 mt-0.5">{customer.phone}</p>
                    <div className="mt-2">
                      {customer.totalSpend > 5000 ? (
                        <span className="bg-amber-50 text-amber-700 text-micro font-bold px-2.5 py-1 rounded-lg border border-amber-200">👑 VIP</span>
                      ) : customer.totalRedemptions > 3 ? (
                        <span className="bg-blue-50 text-blue-700 text-micro font-bold px-2.5 py-1 rounded-lg border border-blue-200">💎 LOYALIST</span>
                      ) : (
                        <span className="bg-gray-50 text-gray-400 text-micro font-bold px-2.5 py-1 rounded-lg">REGULAR</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-micro text-gray-400 mb-1">Visits</p>
                    <div className="flex items-center gap-1.5">
                      <LocalOfferRoundedIcon sx={{fontSize: 14}} className="text-accent-warm" />
                      <span className="text-sm font-semibold text-gray-700">{customer.totalRedemptions}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-micro text-gray-400 mb-1">Revenue</p>
                    <span className="font-mono text-sm font-medium text-primary">₹{customer.totalSpend.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-micro text-gray-400 mb-1">Last Activity</p>
                    <p className="text-xs font-medium text-gray-600">{new Date(customer.lastVisit).toLocaleDateString()} • {new Date(customer.lastVisit).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
