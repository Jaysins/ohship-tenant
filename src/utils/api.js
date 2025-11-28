// API utility with tenant ID header management

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

/**
 * Create headers with X-TENANT-ID automatically included from environment
 */
const createHeaders = (additionalHeaders = {}, isUpload = false) => {
  const headers = {};

  // Only set Content-Type for non-upload requests
  if (!isUpload) {
    headers['Content-Type'] = 'application/json';
  }

  // Always include tenant ID from environment variable
  if (TENANT_ID) {
    headers['X-TENANT-ID'] = TENANT_ID;
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge additional headers (but remove Content-Type for uploads)
  Object.keys(additionalHeaders).forEach(key => {
    if (!isUpload || key.toLowerCase() !== 'content-type') {
      headers[key] = additionalHeaders[key];
    }
  });

  return headers;
};
/**
 * Generic fetch wrapper with tenant ID header
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Check if body is FormData
  const isFormData = options.body instanceof FormData;

  const config = {
    ...options,
    headers: createHeaders(options.headers, isFormData),
  };

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Unauthorized - clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      throw {
        status: response.status,
        message: data.message || data || 'An error occurred',
        data,
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }

    // Network or other errors
    throw {
      status: 0,
      message: error.message || 'Network error occurred',
      data: null,
    };
  }
};

/**
 * API methods
 */
export const api = {
  // GET request
  get: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  // POST request
  post: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // PATCH request
  patch: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  // Upload file (multipart/form-data)
  upload: (endpoint, formData, options = {}) => {
    const headers = { ...options.headers };
    delete headers['Content-Type']; // Let browser set it with boundary

    // Include tenant ID from environment
    if (TENANT_ID) {
      headers['X-TENANT-ID'] = TENANT_ID;
    }

    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    options["isUpload"]=true
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });
  },
};

export default api;
