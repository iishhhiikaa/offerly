import Product from '../models/Product.js';
import Merchant from '../models/Merchant.js';
import mongoose from 'mongoose';
import { serializeProduct } from '../../../utils/serializers.js';

// Get all products for a merchant
export const getProductsByMerchant = async (req, res) => {
  try {
    let merchantId;
    const isSelfRequest = req.params.merchantId === 'me' || !req.params.merchantId;
    
    console.log('📍 Request params:', req.params);
    console.log('📍 Request user:', req.user ? {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    } : 'No user');
    
    // Handle 'me' route (authenticated merchant)
    if (isSelfRequest) {
      if (!req.user || !req.user._id) {
        console.log('❌ Authentication failed - no user in request');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      merchantId = req.user._id;
      console.log('✅ Authenticated merchant ID:', merchantId);
      console.log('✅ Merchant ID type:', typeof merchantId);
      console.log('✅ User role:', req.user.role);
    } else {
      // Handle specific merchant ID (public access)
      merchantId = req.params.merchantId;
      console.log('📍 Public access for merchant ID:', merchantId);
    }
    
    console.log('🔍 Fetching products for merchant:', merchantId);
    console.log('🔍 Query:', { merchantId, isActive: true });
    
    if (!isSelfRequest) {
      const publicMerchant = await Merchant.findOne({
        _id: merchantId,
        status: 'approved'
      }).select('_id');

      if (!publicMerchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }
    }

    const products = await Product.find({ 
      merchantId,
      isActive: true 
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${products.length} products`);
    if (products.length > 0) {
      console.log('📦 First product:', {
        id: products[0]._id,
        name: products[0].name,
        categoryType: products[0].categoryType,
        merchantId: products[0].merchantId,
        merchantIdType: typeof products[0].merchantId
      });
    } else {
      // Debug: Check if any products exist for this merchant without isActive filter
      const allMerchantProducts = await Product.find({ merchantId });
      console.log(`🔍 Total products for merchant (including inactive): ${allMerchantProducts.length}`);
      
      // Debug: Check if merchantId format is correct
      const allProducts = await Product.find({}).limit(5);
      console.log('🔍 Sample products in DB:', allProducts.map(p => ({
        name: p.name,
        merchantId: p.merchantId.toString(),
        isActive: p.isActive
      })));
    }

    return res.status(200).json({
      success: true,
      products: products.map(p => serializeProduct(p)),
      count: products.length
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!req.user) {
      const publicMerchant = await Merchant.findOne({
        _id: product.merchantId,
        status: 'approved'
      }).select('_id');

      if (!publicMerchant || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    }

    // Check if user has access to this product (only if authenticated)
    if (req.user && req.user.role !== 'admin' && product.merchantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const merchantId = req.user._id;

    // Check if merchant exists
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Check product limit based on subscription
    const productCount = await Product.countDocuments({ merchantId, isActive: true });
    const maxProducts = merchant.subscription?.plan?.maxProducts || 5;
    
    if (maxProducts !== 999 && productCount >= maxProducts) {
      return res.status(400).json({
        success: false,
        message: `Product limit reached. You can add maximum ${maxProducts} products. Upgrade your plan for more.`
      });
    }

    // Calculate discount
    const discount = req.body.price && req.body.offerPrice 
      ? Math.round(((req.body.price - req.body.offerPrice) / req.body.price) * 100)
      : 0;

    // Create product
    const product = await Product.create({
      ...req.body,
      merchantId,
      discount
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.merchantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate discount if prices are updated
    if (req.body.price || req.body.offerPrice) {
      const price = req.body.price || product.price;
      const offerPrice = req.body.offerPrice || product.offerPrice;
      req.body.discount = Math.round(((price - offerPrice) / price) * 100);
    }

    // Update product
    Object.assign(product, req.body);
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.merchantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get product statistics for merchant
export const getProductStats = async (req, res) => {
  try {
    const merchantId = req.user._id;

    const stats = await Product.aggregate([
      { $match: { merchantId: mongoose.Types.ObjectId(merchantId), isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgDiscount: { $avg: '$discount' },
          totalValue: { $sum: '$price' },
          totalOfferValue: { $sum: '$offerPrice' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalProducts: 0,
        avgDiscount: 0,
        totalValue: 0,
        totalOfferValue: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Debug endpoint to check authentication
export const debugAuth = async (req, res) => {
  try {
    const merchantId = req.user._id;
    
    console.log('🔍 DEBUG AUTH INFO:');
    console.log('User ID:', merchantId);
    console.log('User ID String:', merchantId.toString());
    console.log('User Role:', req.user.role);
    console.log('User Email:', req.user.email);
    console.log('User Name:', req.user.ownerName || req.user.name);
    
    // Get all products for this merchant
    const products = await Product.find({ merchantId });
    console.log(`Found ${products.length} products for merchant ${merchantId}`);
    
    // Get all products in database
    const allProducts = await Product.find({}).limit(10);
    console.log(`Total products in DB: ${allProducts.length}`);
    console.log('Sample products:', allProducts.map(p => ({
      name: p.name,
      merchantId: p.merchantId.toString(),
      categoryType: p.categoryType
    })));
    
    return res.status(200).json({
      success: true,
      debug: {
        authenticatedMerchantId: merchantId.toString(),
        role: req.user.role,
        email: req.user.email,
        name: req.user.ownerName || req.user.name,
        productsForThisMerchant: products.length,
        products: products.map(p => ({
          id: p._id,
          name: p.name,
          categoryType: p.categoryType,
          merchantId: p.merchantId.toString()
        })),
        sampleProductsInDB: allProducts.map(p => ({
          name: p.name,
          merchantId: p.merchantId.toString(),
          categoryType: p.categoryType
        }))
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// Search products for offer creation
export const searchProducts = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const searchQuery = req.query.q || '';

    const products = await Product.find({
      merchantId,
      isActive: true,
      name: { $regex: searchQuery, $options: 'i' }
    })
    .select('name price offerPrice images discount category')
    .limit(10)
    .sort({ name: 1 });

    // Get variants for each product
    const ProductVariant = (await import('../models/ProductVariant.js')).default;
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({
          productId: product._id,
          isActive: true
        }).select('name price offerPrice discount');

        return {
          ...product.toObject(),
          variants
        };
      })
    );

    return res.status(200).json({
      success: true,
      products: productsWithVariants
    });
  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};
