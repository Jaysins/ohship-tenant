/**
 * Validation Utilities
 * Form field validators and file upload validation
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number (at least 10 digits)
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return false;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if at least 10 digits
  return digits.length >= 10;
};

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  return !!value;
};

/**
 * Validate numeric value
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @returns {boolean} True if valid number within range
 */
export const isValidNumber = (value, options = {}) => {
  const num = parseFloat(value);

  if (isNaN(num)) return false;

  if (options.min !== undefined && num < options.min) return false;
  if (options.max !== undefined && num > options.max) return false;

  return true;
};

/**
 * Validate postal code format
 * @param {string} postalCode - Postal code to validate
 * @param {string} country - Country code (optional for country-specific validation)
 * @returns {boolean} True if valid format
 */
export const isValidPostalCode = (postalCode, country = null) => {
  if (!postalCode || typeof postalCode !== 'string') return false;

  const trimmed = postalCode.trim();

  // Basic validation: at least 3 characters
  if (trimmed.length < 3) return false;

  // Country-specific validation can be added here
  if (country === 'US') {
    // US ZIP code: 5 digits or 5+4 format
    return /^\d{5}(-\d{4})?$/.test(trimmed);
  }

  if (country === 'CA') {
    // Canadian postal code: A1A 1A1 format
    return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(trimmed);
  }

  // Generic validation
  return true;
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @param {number} options.maxSizeMB - Maximum file size in MB
 * @returns {Object} Validation result { valid: boolean, error: string|null }
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'],
    maxSizeMB = 5,
  } = options;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions}`
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate address form data
 * @param {Object} address - Address object to validate
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validateAddress = (address) => {
  const errors = {};

  if (!isRequired(address.name)) {
    errors.name = 'Name is required';
  }

  if (!isRequired(address.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(address.email)) {
    errors.email = 'Invalid email address';
  }

  if (!isRequired(address.phone)) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhoneNumber(address.phone)) {
    errors.phone = 'Invalid phone number (minimum 10 digits)';
  }

  if (!isRequired(address.address_line_1)) {
    errors.address_line_1 = 'Address is required';
  }

  if (!isRequired(address.city)) {
    errors.city = 'City is required';
  }

  if (!isRequired(address.state)) {
    errors.state = 'State is required';
  }

  if (!isRequired(address.postal_code)) {
    errors.postal_code = 'Postal code is required';
  }

  if (!isRequired(address.country)) {
    errors.country = 'Country is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate shipment item
 * @param {Object} item - Shipment item to validate
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validateShipmentItem = (item) => {
  const errors = {};

  if (!isRequired(item.categoryId)) {
    errors.categoryId = 'Category is required';
  }

  if (!isRequired(item.description)) {
    errors.description = 'Description is required';
  }

  if (!isRequired(item.packageType)) {
    errors.packageType = 'Package type is required';
  }

  if (!isValidNumber(item.quantity, { min: 1 })) {
    errors.quantity = 'Quantity must be at least 1';
  }

  if (!isValidNumber(item.weight, { min: 0.1 })) {
    errors.weight = 'Weight must be greater than 0';
  }

  if (!item.declaredValue || !isValidNumber(item.declaredValue, { min: 0 })) {
    errors.declaredValue = 'Declared value must be a positive number';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
