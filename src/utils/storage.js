/**
 * Storage Utilities
 * SessionStorage helpers for quote flow page transitions
 * LocalStorage helpers for persistent data
 */

// ============================================================================
// Type Definitions (JSDoc)
// ============================================================================

/**
 * @typedef {Object} QuoteRequest
 * @property {Object} origin
 * @property {string} origin.country - Country code (e.g., "NG", "US")
 * @property {string} origin.state - State name in lowercase
 * @property {string} [origin.city] - City name in lowercase
 * @property {Object} destination
 * @property {string} destination.country - Country code
 * @property {string} destination.state - State name in lowercase
 * @property {string} [destination.city] - City name in lowercase
 * @property {QuoteItem[]} items - Array of items to ship
 * @property {string} currency - Currency code (e.g., "NGN", "USD")
 * @property {boolean} is_insured - Whether shipment is insured
 * @property {string} [shipment_id] - Existing shipment ID (for updates)
 * @property {string} [quote_id] - Reserved for future use
 * @property {string} [promo_code] - Promo code to apply
 * @property {string} [preferred_service_type] - Preferred service type
 */

/**
 * @typedef {Object} QuoteItem
 * @property {string} category_id - Category ID
 * @property {string} category_name - Category name
 * @property {string} category_description - Category description
 * @property {string} category_hs_code - HS code
 * @property {string} category_group_tag - Group tag
 * @property {string} description - Item description
 * @property {string} package_type - Package type (box, envelope, etc.)
 * @property {number} quantity - Number of items
 * @property {number} weight - Weight in kg
 * @property {number} [length] - Length in cm
 * @property {number} [width] - Width in cm
 * @property {number} [height] - Height in cm
 * @property {number} declared_value - Value in currency
 */

/**
 * @typedef {Object} QuoteResponse
 * @property {string} status - "success" or "error"
 * @property {string} message - Response message
 * @property {Object} data - Response data
 * @property {Object} data.origin - Origin location
 * @property {string} data.origin.city - City name
 * @property {string} data.origin.state - State name
 * @property {string} data.origin.country - Country code
 * @property {string} [data.origin.address_line_1] - Address line 1
 * @property {string} [data.origin.address_line_2] - Address line 2
 * @property {string} [data.origin.postal_code] - Postal code
 * @property {Object} data.destination - Destination location
 * @property {string} data.destination.city - City name
 * @property {string} data.destination.state - State name
 * @property {string} data.destination.country - Country code
 * @property {string} [data.destination.address_line_1] - Address line 1
 * @property {string} [data.destination.address_line_2] - Address line 2
 * @property {string} [data.destination.postal_code] - Postal code
 * @property {QuoteItem[]} data.items - Items array
 * @property {boolean} data.is_insured - Insurance status
 * @property {string} [data.promo_code] - Applied promo code
 * @property {string} [data.quote_id] - Quote ID
 * @property {string} [data.preferred_service_type] - Preferred service type
 * @property {Quote[]} data.rates - Array of available quotes
 */

/**
 * @typedef {Object} Quote
 * @property {string} quote_id - Unique quote ID from backend
 * @property {string} carrier_code - Carrier code
 * @property {string} carrier_name - Carrier display name
 * @property {string} service_type - Service type (express, standard, etc.)
 * @property {string} display_name - Full display name
 * @property {string} service_name - Service name
 * @property {number} base_rate - Base rate amount
 * @property {Array<Object>} adjustments - Price adjustments
 * @property {Array<Object>} discounts - Applied discounts
 * @property {number} total_amount - Total amount
 * @property {string} currency - Currency code
 * @property {string} estimated_delivery_date - ISO date string
 * @property {number} estimated_days - Estimated delivery days
 * @property {string} expires_at - Quote expiry ISO date string
 * @property {string} created_at - Quote creation ISO date string
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [carrier_logo_url] - Carrier logo URL
 * @property {string} [description] - Service description
 */

/**
 * @typedef {Object} Address
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} address_line_1 - Address line 1
 * @property {string} [address_line_2] - Address line 2
 * @property {string} city - City name in lowercase
 * @property {string} state - State name in lowercase
 * @property {string} postal_code - Postal code
 * @property {string} country - Country code
 */

/**
 * @typedef {Object} CreateShipmentRequest
 * @property {string} quote_id - Selected quote ID from rate
 * @property {string} channel_code - Channel code (e.g., "web")
 * @property {boolean} is_insured - Insurance status
 * @property {boolean} save_origin_address - Whether to save origin address
 * @property {boolean} save_destination_address - Whether to save destination address
 * @property {QuoteItem[]} items - Shipment items
 * @property {Address} origin_address - Origin address
 * @property {Address} destination_address - Destination address
 * @property {string} pickup_type - "scheduled_pickup" or "drop_off"
 * @property {string} [pickup_scheduled_at] - ISO date string for pickup
 * @property {string} [selected_payment_method] - Payment method ID
 * @property {string} [customer_notes] - Customer notes
 */

/**
 * @typedef {Object} UpdateShipmentRequest
 * @property {string} [quote_id] - Updated quote ID
 * @property {string} [channel_code] - Channel code
 * @property {boolean} [is_insured] - Insurance status
 * @property {boolean} [save_origin_address] - Save origin address
 * @property {boolean} [save_destination_address] - Save destination address
 * @property {QuoteItem[]} [items] - Updated items
 * @property {Address} [origin_address] - Updated origin address
 * @property {Address} [destination_address] - Updated destination address
 * @property {string} [pickup_type] - Pickup type
 * @property {string} [pickup_scheduled_at] - Pickup date
 * @property {string} [selected_payment_method] - Payment method
 * @property {string} [customer_notes] - Customer notes
 */

/**
 * Storage keys for quote flow
 * SessionStorage keys are used for page transitions and cleared after use
 */
export const StorageKey = {
  // SessionStorage keys (for page transitions only)
  TEMP_QUOTE_RESPONSE: 'temp-quote-response',
  SELECTED_QUOTE_DATA: 'selected-quote-data',
  CREATED_SHIPMENT_DATA: 'created-shipment-data',
};

/**
 * Set item in localStorage with type safety
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export const setStorageItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Get item from localStorage with type safety
 * @param {string} key - Storage key
 * @returns {*|null} Parsed value or null if not found
 */
export const getStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all quote flow related storage
 */
export const clearQuoteFlowStorage = () => {
  Object.values(StorageKey).forEach(key => {
    removeStorageItem(key);
  });
};

/**
 * Set item in localStorage with expiry time
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} ttlMinutes - Time to live in minutes
 */
export const setStorageItemWithExpiry = (key, value, ttlMinutes) => {
  try {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + (ttlMinutes * 60 * 1000),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error saving to localStorage with expiry (${key}):`, error);
  }
};

/**
 * Get item from localStorage with expiry check
 * @param {string} key - Storage key
 * @returns {*|null} Value if not expired, null otherwise
 */
export const getStorageItemWithExpiry = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    // Check if expired
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error reading from localStorage with expiry (${key}):`, error);
    return null;
  }
};

/**
 * Check if a storage key exists and is not expired
 * @param {string} key - Storage key
 * @returns {boolean} True if exists and valid
 */
export const hasValidStorageItem = (key) => {
  const item = getStorageItem(key);
  return item !== null;
};

// ============================================================================
// SessionStorage Helpers (Primary for quote flow page transitions)
// ============================================================================

/**
 * Set item in sessionStorage with type safety
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export const setSessionItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving to sessionStorage (${key}):`, error);
  }
};

/**
 * Get item from sessionStorage with type safety
 * @param {string} key - Storage key
 * @returns {*|null} Parsed value or null if not found
 */
export const getSessionItem = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from sessionStorage (${key}):`, error);
    return null;
  }
};

/**
 * Remove item from sessionStorage
 * @param {string} key - Storage key
 */
export const removeSessionItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from sessionStorage (${key}):`, error);
  }
};

/**
 * Clear all quote flow related sessionStorage
 */
export const clearQuoteFlowSessionStorage = () => {
  Object.values(StorageKey).forEach(key => {
    removeSessionItem(key);
  });
};

/**
 * Check if a sessionStorage key exists
 * @param {string} key - Storage key
 * @returns {boolean} True if exists
 */
export const hasSessionItem = (key) => {
  const item = getSessionItem(key);
  return item !== null;
};
