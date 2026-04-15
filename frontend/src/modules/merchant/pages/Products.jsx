import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import toast from 'react-hot-toast';
import AddProductModal from '../components/AddProductModal';
import { productAPI } from '../../../api/product.api';

const Products = ({ merchant }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Merchant object in app can arrive as either {_id} or {id}.
    // If merchant is not ready yet, stop spinner to avoid infinite loading state.
    if (!merchant) {
      setLoading(false);
      return;
    }

    refreshProducts();
  }, [merchant?._id, merchant?.id]);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products for merchant:', merchant?._id);
      
      const response = await productAPI.getByMerchant('me');
      console.log('✅ Products API response:', response);
      
      // Handle different response structures
      const productsList = response?.products || response?.data?.products || response || [];
      console.log('📦 Products list:', productsList);
      
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        data: error?.data
      });
      
      // Show specific error message
      const errorMsg = error?.message || error?.error || 'Failed to load products';
      toast.error(errorMsg);
      setProducts([]);
    } finally {
      console.log('✅ Loading complete, setting loading to false');
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        await productAPI.update(editingProduct._id, productData);
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        await productAPI.create(productData);
        toast.success('Product added successfully!');
      }
      
      // Close modal first
      setIsModalOpen(false);
      setEditingProduct(null);
      
      // Then refresh products
      await refreshProducts();
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error?.message || error?.error || 'Failed to save product';
      toast.error(errorMessage);
      throw error; // Re-throw to let modal know save failed
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        toast.success('Product deleted successfully!');
        refreshProducts();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxProducts = merchant?.subscription?.plan?.maxProducts || 5;
  const isUnlimited = maxProducts === 999;
  const usagePercent = isUnlimited ? 0 : Math.round((products.length / maxProducts) * 100);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Store Products</h1>
          <p className="text-gray-400 font-medium mt-1">Manage your menu and catalog items</p>
        </div>
        <button 
          type="button"
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-sidebar-dark hover:bg-gray-900 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg w-full md:w-auto justify-center"
        >
          <AddRoundedIcon sx={{fontSize: 20}} />
          ADD PRODUCT
        </button>
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
        {loading ? (
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
                  key={product._id}
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
                        onClick={() => handleOpenModal(product)} 
                        className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-primary hover:text-white transition-all duration-200 border-2 border-gray-200 hover:border-primary"
                      >
                        <EditRoundedIcon sx={{fontSize: 16}} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(product._id)} 
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

      {/* Adaptive Product/Service Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        merchant={merchant}
        editingProduct={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Products;
