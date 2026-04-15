import axiosInstance from './axios';
import { API_ENDPOINTS } from '../config/constants';

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return axiosInstance.get(API_ENDPOINTS.GET_PROFILE);
  },
  
  // Update profile
  updateProfile: async (data) => {
    return axiosInstance.put(API_ENDPOINTS.GET_PROFILE, data);
  },
  
  // Get cities
  getCities: async () => {
    return axiosInstance.get(API_ENDPOINTS.GET_CITIES);
  },
  
  // Get plans
  getPlans: async () => {
    return axiosInstance.get(API_ENDPOINTS.GET_PLANS);
  },
  
  // Saved Offers
  getSavedOffers: async () => {
    return axiosInstance.get('/users/saved-offers');
  },
  
  toggleSavedOffer: async (offerId) => {
    return axiosInstance.post(`/users/saved-offers/${offerId}/toggle`);
  },
};
