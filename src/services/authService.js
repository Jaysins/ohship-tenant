import api from '../utils/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and session tokens
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login/', { email, password });

    if (response.status === 'success' && response.data) {
      const { user: userData, session } = response.data;
      const token = session.access_token;

      // Store tokens and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', session.refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { user: userData, token };
    }

    throw new Error(response.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data and session tokens
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register/', userData);

    if (response.status === 'success' && response.data) {
      const { user: newUser, session } = response.data;
      const token = session.access_token;

      // Store tokens and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', session.refresh_token);
      localStorage.setItem('user', JSON.stringify(newUser));

      return { user: newUser, token };
    }

    throw new Error(response.message || 'Registration failed');
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * Get stored user data
 * @returns {Object|null} Stored user data or null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
