import api from '../utils/api';

/**
 * Quote Service
 * Handles all quote-related API calls
 */

/**
 * Fetch shipping quotes based on package and destination details
 * @param {Object} quoteData - The quote request data
 * @returns {Promise<Array>} Array of quote objects
 */
export const fetchShippingQuotes = async (quoteData) => {
  try {
    const response = await api.post('/quotes/', quoteData);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch quotes');
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
};

/**
 * Build quote request payload from form data
 * @param {Object} formData - Form data from quote wizard
 * @returns {Object} Formatted quote request
 */
export const buildQuoteRequest = (formData) => {
  // Build package object conditionally
  const packageData = {
    package_type: formData.packageType,
    weight: parseFloat(formData.weight),
  };

  // Add dimensions only if provided
  if (formData.length) packageData.length = parseFloat(formData.length);
  if (formData.width) packageData.width = parseFloat(formData.width);
  if (formData.height) packageData.height = parseFloat(formData.height);

  const requestData = {
    origin: {
      country: formData.originCountry,
      state: formData.originState.toLowerCase(),
    },
    destination: {
      country: formData.destinationCountry,
      state: formData.destinationState.toLowerCase(),
    },
    item_type: formData.itemType,
    package: packageData,
    currency: formData.currency,
  };

  // Add optional fields
  if (formData.originCity) requestData.origin.city = formData.originCity.toLowerCase();
  if (formData.destinationCity) requestData.destination.city = formData.destinationCity.toLowerCase();
  if (formData.shipmentValue) requestData.shipment_value = parseFloat(formData.shipmentValue);

  return requestData;
};
