import api from '../utils/api';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

/**
 * Get dashboard statistics
 * @param {Object} params - Query parameters (optional)
 * @param {string} params.date_range - Date range filter
 * @returns {Promise<Object>} Dashboard data
 */
export const getDashboardStats = async (params = {}) => {
  try {
    const response = await api.get('/dashboard/stats/', { params });

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch dashboard stats');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export default {
  getDashboardStats
};
