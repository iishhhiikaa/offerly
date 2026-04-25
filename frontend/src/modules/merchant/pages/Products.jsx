import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import toast from 'react-hot-toast';

import AddProductModal from '../components/AddProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import UnifiedOfferBuilder from '../components/UnifiedOfferBuilder';
import { productAPI } from '../../../api/product.api';

/**
 * Custom hook for debounced value
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Products = ({ merchant }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Unified Flow States
  const [isUnifiedBuilderOpen, setIsUnifiedBuilderOpen] = useState(false);
  const [quickOfferProduct, setQuickOfferProduct] = useState(null);

  // 1. Fetch products with React Query
  const { data: rawProducts, isLoading: loading, error } = useQuery({
    queryKey: ['merchantProducts', merchant?._id],
    queryFn: async () => {
      const response = await productAPI.getByMerchant('me');
      const productsList = response?.products || response?.data?.products || response || [];
      return Array.isArray(productsList) ? productsList : [];
    },
    enabled: !!merchant,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    keepPreviousData: true,
  });

  const products = rawProducts || [];

  // 2. Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['merchantProducts', merchant?._id]);
      toast.success('Product deleted successfully!');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id || editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(productData);
        toast.success('Product added successfully!');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries(['merchantProducts', merchant?._id]);
    } catch (error) {
      const errorMessage = error?.message || error?.error || 'Failed to save product';
      toast.error(errorMessage);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      deleteMutation.mutate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    return products.filter(p => 
      p.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  const maxProducts = merchant?.subscription?.plan?.maxProducts || 5;
  const isUnlimited = maxProducts === 999;
  const usagePercent = isUnlimited ? 0 : Math.round((products.length / maxProducts) * 100);

  if (error) return (
    <div className="p-12 text-center text-rose-500 font-bold bg-rose-50 rounded-xl border border-rose-100">
      Error loading products. Please try refreshing.
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Store Products</h1>
          <p className="text-gray-400 font-medium mt-1">Manage your menu and catalog items</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm w-full md:w-auto justify-center"
          >
            <AddRoundedIcon sx={{fontSize: 20}} />
            ADD INVENTORY
          </button>
          <button 
            type="button"
            onClick={() => { setQuickOfferProduct(null); setIsUnifiedBuilderOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 w-full md:w-auto justify-center hover:-translate-y-0.5 active:translate-y-0"
          >
            🚀 LAUNCH CAMPAIGN
          </button>
        </div>
      </div>

      {/* Search & Usage Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <SearchRoundedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
          <input 
            type="text" 
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-3 bg-white rounded-lg px-5 py-3 border-2 border-gray-200 shadow-sm">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
              {products.length} / {isUnlimited ? '∞' : maxProducts} SLOTS
            </p>
            {!isUnlimited && (
              <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-rose-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
          </div>
          {usagePercent > 80 && !isUnlimited && (
            <WarningRoundedIcon sx={{fontSize: 18}} className="text-amber-500" />
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && !products.length ? (
          <div className="md:col-span-3 py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading products...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="md:col-span-3 py-20 text-center bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                <Inventory2RoundedIcon className="text-gray-200 mb-4" sx={{fontSize: 64}} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No products catalogued yet.</p>
                <p className="text-gray-300 text-sm mt-1">Click "Add Product" to get started</p>
              </div>
            ) : (
              filtered.map((product, idx) => (
                <motion.div 
                  key={product._id || product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-lg p-5 flex flex-col group hover:-translate-y-1 transition-all duration-300 shadow-sm border-2 border-gray-200 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {product.isVeg !== undefined && product.isVeg !== null && (
                        <div className={`w-3.5 h-3.5 border-2 grid place-items-center mb-2 ${product.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </div>
                      )}
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{product.category}</p>
                      {product.duration && (
                        <div className="flex items-center gap-1 mt-2 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg w-fit">
                          <AccessTimeRoundedIcon sx={{fontSize: 12}} />
                          {product.duration}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        type="button"
                        onClick={() => { setQuickOfferProduct(product); setIsUnifiedBuilderOpen(true); }} 
                        title="Quick Launch Offer"
                        className="px-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all duration-200 border-2 border-emerald-200 hover:border-emerald-500 flex items-center justify-center font-black"
                      >
                        ⚡
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} 
                        className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-primary hover:text-white transition-all duration-200 border-2 border-gray-200 hover:border-primary"
                      >
                        <EditRoundedIcon sx={{fontSize: 16}} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setConfirmDeleteId(product._id || product.id)} 
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 border-2 border-rose-200 hover:border-rose-600"
                      >
                        <DeleteRoundedIcon sx={{fontSize: 16}} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                       <span className="font-mono text-xl font-medium text-gray-900 leading-none">₹{product.offerPrice}</span>
                      {product.price > product.offerPrice && (
                        <span className="font-mono text-sm text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>
                    {product.discount > 0 && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 border-2 border-green-100">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        merchant={merchant}
        editingProduct={editingProduct}
        onSave={handleSaveProduct}
      />

      <UnifiedOfferBuilder
        isOpen={isUnifiedBuilderOpen}
        onClose={() => setIsUnifiedBuilderOpen(false)}
        merchant={merchant}
        preSelectedProduct={quickOfferProduct}
        onSuccess={() => queryClient.invalidateQueries(['merchantProducts'])}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Products;
