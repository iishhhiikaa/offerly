import axiosInstance from './axios';
import { API_ENDPOINTS } from '../config/constants';

export const merchantAPI = {
  // Get all merchants with optional filters
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.GET_MERCHANTS, { params });
  },

  // Get merchant by ID (or 'me' for current user's merchant)
  getById: async (id) => {
    if (id === 'me') {
      return axiosInstance.get('/merchants/me');
    }
    return axiosInstance.get(API_ENDPOINTS.GET_MERCHANT.replace(':id', id));
  },

  // Create merchant (store registration)
  create: async (data) => {
    return axiosInstance.post('/merchants/register', data);
  },

  // Update onboarding (Step-by-step progress)
  updateOnboarding: async (step, data) => {
    return axiosInstance.patch('/merchants/me/onboarding', { step, data });
  },

  // Get current user's subscription
  getMySubscription: async () => {
    return axiosInstance.get('/merchants/me/subscription');
  },

  // 4-Step Registration APIs
  updateBusinessDetails: async (data) => {
    return axiosInstance.post('/merchants/me/registration/business-details', data);
  },

  updateKYBDocuments: async (data) => {
    return axiosInstance.post('/merchants/me/registration/kyb-documents', data);
  },

  updateLocationHours: async (data) => {
    return axiosInstance.post('/merchants/me/registration/location-hours', data);
  },

  // Get store configuration for offer creation
  getStoreConfig: async () => {
    try {
      const response = await axiosInstance.get('/merchants/me/store-config');
      return response; // axios interceptor already returns response.data
    } catch (error) {
      console.error('Get store config error:', error);
      throw error;
    }
  },

  // Search products for offer creation
  searchProducts: async (query) => {
    try {
      const response = await axiosInstance.get('/products/search', {
        params: { q: query }
      });
      return response; // axios interceptor already returns response.data
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  },
};
