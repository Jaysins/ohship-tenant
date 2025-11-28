import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      });

      // Handle the API response structure: { status, message, data: { user, session } }
      if (response.status === 'success' && response.data) {
        const { user: userData, session } = response.data;
        const token = session.access_token;

        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', session.refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
      };
    }
  };

  /**
   * Signup function
   * @param {Object} userData - {name, email, password, company}
   */
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup/', userData);

      // Handle the API response structure
      if (response.status === 'success' && response.data) {
        const { user: newUser, session } = response.data;
        const token = session.access_token;

        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', session.refresh_token);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Update state
        setUser(newUser);
        setIsAuthenticated(true);

        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: error.message || 'Signup failed. Please try again.',
      };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update user data
   */
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
