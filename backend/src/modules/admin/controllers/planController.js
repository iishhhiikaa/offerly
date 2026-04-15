import Plan from '../models/Plan.js';

// @desc    Get all active plans (public)
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' })
      .select('-__v')
      .sort({ price: 1 });
    
    return res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch plans'
    });
  }
};

// @desc    Get plan by ID
// @route   GET /api/plans/:id
// @access  Public
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Get plan by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch plan'
    });
  }
};
