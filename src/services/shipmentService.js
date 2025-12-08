import api from '../utils/api';

/**
 * Shipment Service
 * Handles all shipment-related API calls
 */

/**
 * Get saved addresses for the current user
 * @returns {Promise<Array>} List of saved addresses
 */
export const getSavedAddresses = async () => {
  try {
    const response = await api.get('/addresses/');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch saved addresses');
  } catch (error) {
    console.error('Error fetching saved addresses:', error);
    throw error;
  }
};

/**
 * Create a new shipment
 * @param {import('../utils/storage').CreateShipmentRequest} shipmentData - Complete shipment data
 * @returns {Promise<Object>} Created shipment
 */
export const createShipment = async (shipmentData) => {
  try {
    const response = await api.post('/shipments/', shipmentData);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create shipment');
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
};

/**
 * Get shipments with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.status - Filter by status
 * @param {string} params.code - Filter by shipment code
 * @param {string} params.shipment_type - Filter by shipment type
 * @param {string} params.pickup_type - Filter by pickup type
 * @param {string} params.search - Search by name
 * @returns {Promise<Object>} Paginated shipments response with items and metadata
 */
export const getShipments = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.code) queryParams.append('code', params.code);
    if (params.shipment_type) queryParams.append('shipment_type', params.shipment_type);
    if (params.pickup_type) queryParams.append('pickup_type', params.pickup_type);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/shipments/${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch shipments');
  } catch (error) {
    console.error('Error fetching shipments:', error);
    throw error;
  }
};

/**
 * Get shipment by ID
 * @param {string} shipmentId - Shipment ID
 * @returns {Promise<Object>} Shipment details
 */
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await api.get(`/shipments/${shipmentId}/`);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch shipment');
  } catch (error) {
    console.error('Error fetching shipment:', error);
    throw error;
  }
};

/**
 * Get shipment tracking information by code
 * @param {string} shipmentCode - Shipment code
 * @returns {Promise<Object>} Tracking data with events and status progression
 */
export const getShipmentTracking = async (shipmentCode) => {
  try {
    const response = await api.get(`/shipments/${shipmentCode}/track/`);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch tracking information');
  } catch (error) {
    console.error('Error fetching tracking information:', error);
    throw error;
  }
};

/**
 * Get item categories for shipments
 * @returns {Promise<Array>} List of item categories
 */
export const getItemCategories = async () => {
  try {
    const response = await api.get('/categories/');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch item categories');
  } catch (error) {
    console.error('Error fetching item categories:', error);
    throw error;
  }
};

/**
 * Update an existing shipment (used in review mode)
 * @param {string} shipmentId - Shipment ID to update
 * @param {import('../utils/storage').UpdateShipmentRequest} updateData - Data to update (can include quote_id, addresses, items, etc.)
 * @returns {Promise<Object>} Updated shipment or error with new quotes
 */
export const updateShipment = async (shipmentId, updateData) => {
  try {
    const response = await api.patch(`/shipments/${shipmentId}/`, updateData);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update shipment');
  } catch (error) {
    // Check if it's a quote price changed error
    if (error.response?.data?.code === 'QUOTE_PRICE_CHANGED') {
      // Return the error data which includes old_price and new_quotes
      throw {
        code: 'QUOTE_PRICE_CHANGED',
        message: error.response.data.message,
        data: error.response.data.data
      };
    }

    console.error('Error updating shipment:', error);
    throw error;
  }
};

/**
 * Build shipment request from form data
 * @param {Object} formData - Form data from shipment creation
 * @param {string} quoteId - Selected quote ID
 * @param {Array} categories - List of item categories
 * @param {string} shipmentId - Optional shipment ID for updates
 * @returns {Object} Formatted shipment request
 */
export const buildShipmentRequest = (formData, quoteId, categories = [], shipmentId = null) => {
  const request = {
    quote_id: quoteId,
    channel_code: 'web',
    is_insured: formData.isInsured,
    save_origin_address: formData.saveOriginAddress || false,
    save_destination_address: formData.saveDestinationAddress || false,
    items: formData.items.map(item => {
      // Find the category details from the categories array
      const category = categories.find(cat => cat.id === item.categoryId);

      return {
        category_id: item.categoryId,
        category_name: category?.name || '',
        category_description: category?.description || '',
        category_group_tag: category?.group_tag || '',
        category_hs_code: category?.hs_code || '',
        description: item.description,
        package_type: item.packageType,
        quantity: parseInt(item.quantity),
        weight: parseFloat(item.weight),
        length: item.length ? parseFloat(item.length) : undefined,
        width: item.width ? parseFloat(item.width) : undefined,
        height: item.height ? parseFloat(item.height) : undefined,
        declared_value: item.declaredValue ? parseFloat(item.declaredValue) : undefined,
      };
    }),
    origin_address: {
      name: formData.originName,
      address_line_1: formData.originAddressLine1,
      address_line_2: formData.originAddressLine2 || null,
      city: formData.originCity,
      state: formData.originState,
      postal_code: formData.originPostalCode,
      country: formData.originCountry,
      phone: formData.originPhone,
      email: formData.originEmail || null,
    },
    destination_address: {
      name: formData.destinationName,
      address_line_1: formData.destinationAddressLine1,
      address_line_2: formData.destinationAddressLine2 || null,
      city: formData.destinationCity,
      state: formData.destinationState,
      postal_code: formData.destinationPostalCode,
      country: formData.destinationCountry,
      phone: formData.destinationPhone,
      email: formData.destinationEmail || null,
    },
    pickup_type: formData.pickupType || 'scheduled_pickup',
    pickup_scheduled_at: formData.pickupScheduledAt || null,
    customer_notes: formData.customerNotes || null,
  };

  // Add shipment_id if updating existing shipment
  if (shipmentId) {
    request.shipment_id = shipmentId;
  }

  return request;
};
