import axios from './axios';

export const servicePlanAPI = {
  // Get all service plans for logged-in merchant
  getAll: async () => {
    try {
      const response = await axios.get('/service-plans');
      return response.data;
    } catch (error) {
      console.error('Get service plans error:', error);
      throw error.response?.data || error;
    }
  },

  // Get single service plan by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`/service-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get service plan error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new service plan
  create: async (data) => {
    try {
      const response = await axios.post('/service-plans', data);
      return response.data;
    } catch (error) {
      console.error('Create service plan error:', error);
      throw error.response?.data || error;
    }
  },

  // Update service plan
  update: async (id, data) => {
    try {
      const response = await axios.put(`/service-plans/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update service plan error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete service plan (soft delete)
  delete: async (id) => {
    try {
      const response = await axios.delete(`/service-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete service plan error:', error);
      throw error.response?.data || error;
    }
  }
};
