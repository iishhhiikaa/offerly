import { useState, useEffect } from 'react';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import MiscellaneousServicesRoundedIcon from '@mui/icons-material/MiscellaneousServicesRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import toast from 'react-hot-toast';
import { categoryAPI } from '../../../api/category.api';
import { mockCategories } from '../../customer/data/mockData';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'product', 
    icon: '', 
    color: '#3D7A4F', 
    description: '', 
    order: 0,
    status: 'active' 
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAllAdmin();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to load categories from backend, using fallback');
      // Fallback to mock data
      setCategories(mockCategories.map((cat, index) => ({
        _id: cat.id,
        name: cat.label,
        type: cat.label === 'Gym' || cat.label === 'Saloon' || cat.label === 'Services' || cat.label === 'Health' ? 'service' : 'product',
        icon: cat.icon,
        color: cat.color,
        description: '',
        order: index + 1,
        status: 'active',
        merchantCount: 0,
        offerCount: 0,
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({ 
      name: '', 
      type: 'product', 
      icon: '', 
      color: '#3D7A4F', 
      description: '', 
      order: categories.length + 1,
      status: 'active' 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setFormData({ 
      name: cat.name, 
      type: cat.type, 
      icon: cat.icon || '', 
      color: cat.color || '#3D7A4F', 
      description: cat.description || '', 
      order: cat.order || 0,
      status: cat.status 
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      if (selectedCategory) {
        await categoryAPI.update(selectedCategory._id, formData);
        toast.success('Category updated successfully!');
      } else {
        await categoryAPI.create(formData);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await categoryAPI.delete(selectedCategory._id);
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  const productCategories = categories.filter(c => c.type === 'product');
  const serviceCategories = categories.filter(c => c.type === 'service');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Category Management</h1>
          <p className="text-gray-400 font-medium mt-1">Manage dynamic categories for merchants and offers.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <AddRoundedIcon sx={{ fontSize: 20 }} />
          Add Category
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-md p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Categories</p>
          <p className="text-3xl font-black text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-md p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Inventory2RoundedIcon sx={{ fontSize: 14 }} className="text-primary" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Based</p>
          </div>
          <p className="text-3xl font-black text-primary">{productCategories.length}</p>
        </div>
        <div className="bg-white rounded-md p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MiscellaneousServicesRoundedIcon sx={{ fontSize: 14 }} className="text-blue-600" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Based</p>
          </div>
          <p className="text-3xl font-black text-blue-600">{serviceCategories.length}</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">All Categories</h2>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <CategoryRoundedIcon className="text-gray-200 mb-4" sx={{ fontSize: 56 }} />
            <p className="text-gray-400 font-bold text-lg">No categories yet</p>
            <p className="text-gray-400 font-medium text-sm mt-1">Add your first category to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="border border-gray-100 rounded-md p-5 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${cat.type === 'service' ? 'bg-blue-50' : 'bg-primary/10'}`}>
                    {cat.type === 'service' ? (
                      <MiscellaneousServicesRoundedIcon sx={{ fontSize: 20 }} className="text-blue-600" />
                    ) : (
                      <Inventory2RoundedIcon sx={{ fontSize: 20 }} className="text-primary" />
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(cat)} className="w-8 h-8 rounded-md bg-gray-50 hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <EditRoundedIcon sx={{ fontSize: 16 }} className="text-gray-400 hover:text-primary" />
                    </button>
                    <button onClick={() => handleDeleteClick(cat)} className="w-8 h-8 rounded-md bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-colors">
                      <DeleteRoundedIcon sx={{ fontSize: 16 }} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <h3 className="font-black text-gray-900 text-base">{cat.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${cat.type === 'service' ? 'bg-blue-50 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                    {cat.type}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${cat.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-primary via-[#3d7a4f] to-[#2d5a3a] p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {selectedCategory ? '✏️ Edit Category' : '✨ Add New Category'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1 font-medium">
                    {selectedCategory ? 'Update category details' : 'Create a new category for merchants'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition-colors"
                >
                  <CloseRoundedIcon className="text-white" sx={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Food & Restaurants"
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              {/* Category Type */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Category Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'product' })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.type === 'product' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Inventory2RoundedIcon sx={{ fontSize: 28 }} />
                    <p className="text-xs font-black mt-2 uppercase tracking-widest">Product</p>
                    <p className="text-[10px] text-gray-400 mt-1">Cafe, Food, Shops</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'service' })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.type === 'service' 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <MiscellaneousServicesRoundedIcon sx={{ fontSize: 28 }} />
                    <p className="text-xs font-black mt-2 uppercase tracking-widest">Service</p>
                    <p className="text-[10px] text-gray-400 mt-1">Gym, Salon, Health</p>
                  </button>
                </div>
              </div>

              {/* Icon and Color Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icon Name */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. restaurant"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">Material icon name</p>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-14 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3D7A4F"
                      className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  rows="3"
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                  min="0"
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Lower numbers appear first</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3.5 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                {selectedCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DeleteRoundedIcon className="text-red-500" sx={{ fontSize: 28 }} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete "{selectedCategory?.name}"?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">This action cannot be undone. Merchants using this category will keep their existing category text.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
