import api from '../utils/api';

/**
 * Wallet Service
 * Handles all wallet-related API calls
 */

/**
 * Get all wallets for tenant
 * @returns {Promise<Array>} List of wallets
 */
export const getWallets = async () => {
  try {
    const response = await api.get('/wallets/?view=customer');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch wallets');
  } catch (error) {
    console.error('Error fetching wallets:', error);
    throw error;
  }
};

/**
 * Get primary wallet
 * @returns {Promise<Object>} Primary wallet
 */
export const getPrimaryWallet = async () => {
  try {
    const wallets = await getWallets();
    const primaryWallet = wallets.find(wallet => wallet.is_primary);

    if (!primaryWallet) {
      throw new Error('No primary wallet found');
    }

    return primaryWallet;
  } catch (error) {
    console.error('Error fetching primary wallet:', error);
    throw error;
  }
};

export default {
  getWallets,
  getPrimaryWallet
};
