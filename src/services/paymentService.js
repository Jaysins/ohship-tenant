import api from '../utils/api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

/**
 * Get available payment methods for tenant
 * @returns {Promise<Array>} List of payment methods
 */
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/payment-methods/tenant/');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch payment methods');
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

/**
 * Initiate payment process with payer information
 * @param {string} paymentId - Payment ID from shipment creation
 * @param {Object} payerInfo - Payer information
 * @param {string} payerInfo.payer_name - Payer's full name
 * @param {string} payerInfo.payer_email - Payer's email
 * @param {string} payerInfo.payer_phone - Payer's phone number
 * @returns {Promise<Object>} Payment transaction data
 */
export const initiatePayment = async (paymentId, payerInfo) => {
  try {
    const response = await api.post(`/checkouts/${paymentId}/pay/`, payerInfo);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to initiate payment');
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

/**
 * Validate payment status (used for polling)
 * @param {string} paymentId - Payment ID to validate
 * @returns {Promise<Object>} Payment validation result
 */
export const validatePayment = async (paymentId) => {
  try {
    const response = await api.get(`/checkouts/${paymentId}/validate/`);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to validate payment');
  } catch (error) {
    console.error('Error validating payment:', error);
    throw error;
  }
};
