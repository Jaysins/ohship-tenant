import api from '../utils/api';

/**
 * Transaction Service
 * Handles all transaction-related API calls
 */

/**
 * Get all transactions with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 * @param {string} params.transaction_type - Filter by type
 * @returns {Promise<Object>} Transactions list with pagination
 */
export const getTransactions = async (params = {}) => {
  try {
    const response = await api.get('/admin-transactions/', { params });

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch transactions');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/admin-transactions/${id}/`);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch transaction');
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};

export default {
  getTransactions,
  getTransactionById
};
