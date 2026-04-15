import { useState, useEffect } from 'react';
import AdminModal from '../components/AdminModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { adminAPI } from '../../../api/admin.api';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import toast from 'react-hot-toast';

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanTypeModalOpen, setIsPlanTypeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    price: 0, 
    duration: 'Monthly', 
    maxProducts: 5, 
    maxOffers: 5,
    features: [], 
    status: 'active',
    planType: 'merchant' // 'merchant' or 'advertisement'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPlans();
      const loadedPlans = res.data?.plans || res.plans || res.data || [];
      setPlans(loadedPlans.sort((a, b) => a.price - b.price));
    } catch (error) {
      toast.error('Failed to load plans from server');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsPlanTypeModalOpen(true);
  };

  const handlePlanTypeSelect = (type) => {
    setSelectedPlan(null);
    setFormData({ 
      name: '', 
      price: 0, 
      duration: 'Monthly', 
      maxProducts: 5, 
      maxOffers: 5,
      features: [{ id: 'f1', text: '' }], 
      status: 'active',
      planType: type
    });
    setIsPlanTypeModalOpen(false);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({ 
      ...plan, 
      planType: plan.planType || 'merchant',
      features: plan.features?.length > 0 ? plan.features.map((f, i) => ({ id: `f${i}`, text: f })) : [{ id: 'f1', text: '' }]
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id: selectedPlan?._id || selectedPlan?.id,
      features: formData.features.map(f => f.text).filter(t => t.trim() !== '')
    };

    try {
      await adminAPI.savePlan(payload);
      toast.success(selectedPlan ? 'Plan updated successfully' : 'Plan added successfully');
      setIsModalOpen(false);
      loadPlans();
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const confirmDelete = async () => {
    try {
      await adminAPI.deletePlan(selectedPlan._id || selectedPlan.id);
      toast.success('Plan deleted');
      setIsDeleteModalOpen(false);
      loadPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const merchantPlans = plans.filter(p => p.planType === 'merchant' || !p.planType);
  const advertisementPlans = plans.filter(p => p.planType === 'advertisement');

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">Subscription Plans</h1>
          <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest bg-gray-100 inline-block px-3 py-1 rounded-lg">Managed via MongoDB Backend</p>
        </div>
        
        <button 
          onClick={handleAdd}
          className="bg-[#3D7A4F] hover:bg-[#2B5738] text-white px-6 py-3 rounded-lg font-black text-sm flex items-center gap-2 shadow-xl shadow-[#3D7A4F]/25 transition-all whitespace-nowrap active:scale-95 uppercase tracking-widest"
        >
          <AddRoundedIcon sx={{ fontSize: 20 }} />
          Create New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-[#3D7A4F] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Merchant Plans Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Merchant Plans</h2>
              <p className="text-sm text-gray-500 font-medium">Regular subscription plans for merchants</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchantPlans.length > 0 ? merchantPlans.map((plan) => (
                <div key={plan._id || plan.id} className="relative bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/40 transition-all group">
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${plan.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {plan.status}
                    </span>
                  </div>

                  {/* Edit/Delete Floating Actions */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEdit(plan)}
                      className="w-8 h-8 bg-white shadow-md rounded-md flex items-center justify-center text-gray-400 hover:text-primary transition-colors border border-gray-200"
                    >
                      <EditRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(plan)}
                      className="w-8 h-8 bg-white shadow-md rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-200"
                    >
                      <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="p-5 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 24 }} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                        /{plan.duration}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 bg-white">
                    <div className="space-y-2.5 mb-5">
                       <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <Inventory2RoundedIcon sx={{ fontSize: 18 }} className="text-primary" />
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Limit</p>
                             <p className="text-xs">{plan.maxProducts === 999 ? 'Unlimited' : `${plan.maxProducts} SKU`}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <LocalOfferRoundedIcon sx={{ fontSize: 18 }} className="text-primary" />
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Limit</p>
                             <p className="text-xs">{plan.maxOffers === 999 ? 'Unlimited' : `${plan.maxOffers} Offers`}</p>
                          </div>
                       </div>
                    </div>
                    
                    {plan.features?.length > 0 && (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Features</p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                              <CheckCircleRoundedIcon sx={{ fontSize: 14 }} className="text-primary mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">No merchant plans available</p>
                </div>
              )}
            </div>
          </div>

          {/* Advertisement Plans Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Advertisement Plans</h2>
              <p className="text-sm text-gray-500 font-medium">Special plans for advertisement campaigns</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advertisementPlans.length > 0 ? advertisementPlans.map((plan) => (
                <div key={plan._id || plan.id} className="relative bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/40 transition-all group">
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${plan.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {plan.status}
                    </span>
                  </div>

                  {/* Edit/Delete Floating Actions */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEdit(plan)}
                      className="w-8 h-8 bg-white shadow-md rounded-md flex items-center justify-center text-gray-400 hover:text-primary transition-colors border border-gray-200"
                    >
                      <EditRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(plan)}
                      className="w-8 h-8 bg-white shadow-md rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-200"
                    >
                      <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="p-5 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 24 }} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                        /{plan.duration}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 bg-white">
                    <div className="space-y-2.5 mb-5">
                       <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <Inventory2RoundedIcon sx={{ fontSize: 18 }} className="text-primary" />
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Limit</p>
                             <p className="text-xs">{plan.maxProducts === 999 ? 'Unlimited' : `${plan.maxProducts} SKU`}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <LocalOfferRoundedIcon sx={{ fontSize: 18 }} className="text-primary" />
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Limit</p>
                             <p className="text-xs">{plan.maxOffers === 999 ? 'Unlimited' : `${plan.maxOffers} Offers`}</p>
                          </div>
                       </div>
                    </div>
                    
                    {plan.features?.length > 0 && (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Features</p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                              <CheckCircleRoundedIcon sx={{ fontSize: 14 }} className="text-primary mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">No advertisement plans available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Type Selection Modal */}
      {isPlanTypeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsPlanTypeModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Select Plan Type</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Choose the type of plan you want to create</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handlePlanTypeSelect('merchant')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <WorkspacePremiumRoundedIcon className="text-primary" sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-base">Merchant Plans</p>
                    <p className="text-xs text-gray-500 font-medium">Regular subscription plans</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePlanTypeSelect('advertisement')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <LocalOfferRoundedIcon className="text-primary" sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-base">Advertisement Plans</p>
                    <p className="text-xs text-gray-500 font-medium">Special ad campaign plans</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsPlanTypeModalOpen(false)}
              className="w-full mt-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AdminModal for Add/Edit */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlan ? "Edit Subscription Plan" : `Create New ${formData.planType === 'advertisement' ? 'Advertisement' : 'Merchant'} Plan`}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-lg text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
            <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
              {selectedPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            {/* Plan Type (read-only when editing) */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Plan Type</label>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm font-bold">
                {formData.planType === 'advertisement' ? '📢 Advertisement Plan' : '🏪 Merchant Plan'}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Plan Identification</label>
              <input 
                type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all" 
                placeholder="e.g. Professional Hub"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Monthly Cost (₹)</label>
                <input 
                  type="number" required min="0" value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Billing Cycle</label>
                <select 
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">SKU Limit</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="number" min="1" 
                  value={formData.maxProducts === 999 ? '' : formData.maxProducts}
                  disabled={formData.maxProducts === 999}
                  onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none disabled:opacity-30"
                  placeholder="Items count"
                />
                <label className="flex items-center gap-2 px-3 py-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.maxProducts === 999}
                    onChange={(e) => setFormData({ ...formData, maxProducts: e.target.checked ? 999 : 5 })}
                    className="accent-primary"
                  />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unlimited</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Offer Limit</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="number" min="1" 
                  value={formData.maxOffers === 999 ? '' : formData.maxOffers}
                  disabled={formData.maxOffers === 999}
                  onChange={(e) => setFormData({ ...formData, maxOffers: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none disabled:opacity-30"
                  placeholder="Offers count"
                />
                <label className="flex items-center gap-2 px-3 py-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.maxOffers === 999}
                    onChange={(e) => setFormData({ ...formData, maxOffers: e.target.checked ? 999 : 5 })}
                    className="accent-primary"
                  />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unlimited</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-50">
             <div className="flex justify-between items-center mb-4 px-1">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Marketing Features</label>
               <button 
                 type="button" 
                 onClick={() => setFormData({ ...formData, features: [...formData.features, { id: Date.now().toString(), text: '' }] })}
                 className="text-[10px] font-black text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
               >
                 + Add Feature
               </button>
             </div>
             
             <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={feature.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={feature.text}
                      placeholder="e.g. Social Shoutout"
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index].text = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                       className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newFeatures = formData.features.filter((f) => f.id !== feature.id);
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="text-gray-300 hover:text-red-500 p-2"
                    >
                      <CloseRoundedIcon sx={{ fontSize: 20 }} />
                    </button>
                  </div>
                ))}
                {formData.features.length === 0 && (
                  <p className="text-xs font-medium text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No marketing features added.</p>
                )}
             </div>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Archive '${selectedPlan?.name}'?`}
        message="Merchants currently on this plan will not be penalized, but it will be hidden from new registrations immediately."
      />
    </div>
  );
};

export default SubscriptionManagement;
