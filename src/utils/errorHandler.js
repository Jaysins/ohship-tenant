/**
 * Extract user-friendly error message from various error formats
 * @param {Error|Object|string} error - Error object from API or other source
 * @param {string} fallbackMessage - Default message if extraction fails
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error, fallbackMessage = 'An error occurred. Please try again.') => {
  // Try to extract the most user-friendly message
  if (error?.response?.data?.data?.detail?.message) {
    // Backend format: response.data.data.detail.message
    return error.response.data.data.detail.message;
  }

  if (error?.response?.data?.message?.detail?.message) {
    // Alternative format: response.data.message.detail.message
    return error.response.data.message.detail.message;
  }

  if (error?.response?.data?.message && typeof error.response.data.message === 'string') {
    // Simple string message in response.data.message
    return error.response.data.message;
  }

  if (error?.response?.data?.detail && typeof error.response.data.detail === 'string') {
    // FastAPI validation error format
    return error.response.data.detail;
  }

  if (error?.message && typeof error.message === 'string') {
    // Error.message string
    return error.message;
  }

  if (typeof error === 'string') {
    // Direct string error
    return error;
  }

  // Fallback
  return fallbackMessage;
};
