import City from '../models/City.js';

// @desc    Get all active cities (public)
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res) => {
  try {
    const cities = await City.find({ status: 'active' })
      .select('name status coordinates zones')
      .sort({ name: 1 });
    
    return res.status(200).json({
      success: true,
      count: cities.length,
      cities
    });
  } catch (error) {
    console.error('Get cities error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch cities'
    });
  }
};

// @desc    Get all cities (admin - including inactive)
// @route   GET /api/admin/cities
// @access  Private/Admin
export const getAllCities = async (req, res) => {
  try {
    const cities = await City.find()
      .sort({ name: 1 });
    
    return res.status(200).json({
      success: true,
      count: cities.length,
      cities
    });
  } catch (error) {
    console.error('Get all cities error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch cities'
    });
  }
};

// @desc    Get city by ID
// @route   GET /api/cities/:id
// @access  Public
export const getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      city
    });
  } catch (error) {
    console.error('Get city by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch city'
    });
  }
};
