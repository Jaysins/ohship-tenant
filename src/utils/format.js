/**
 * Format Utilities
 * Currency, date, and number formatting helpers
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD', 'NGN', 'GBP')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'NGN') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }

  const numAmount = parseFloat(amount);

  // Currency formatting options
  const currencyFormats = {
    USD: { locale: 'en-US', symbol: '$' },
    NGN: { locale: 'en-NG', symbol: '₦' },
    GBP: { locale: 'en-GB', symbol: '£' },
    EUR: { locale: 'en-EU', symbol: '€' },
    CAD: { locale: 'en-CA', symbol: 'CA$' },
  };

  const format = currencyFormats[currency] || { locale: 'en-US', symbol: currency };

  try {
    return new Intl.NumberFormat(format.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    // Fallback formatting
    return `${format.symbol}${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    USD: '$',
    NGN: '₦',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
  };

  return symbols[currency] || currency;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Include time in output
 * @param {string} options.locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const { includeTime = false, locale = 'en-US' } = options;

  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const formatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

    // For older dates, return formatted date
    return formatDate(dateObj);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Calculate delivery date from transit days
 * @param {number} transitDays - Number of transit days
 * @param {Date} startDate - Start date (default: today)
 * @returns {string} Formatted delivery date
 */
export const calculateDeliveryDate = (transitDays, startDate = new Date()) => {
  if (!transitDays || isNaN(transitDays)) return '';

  try {
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(deliveryDate.getDate() + parseInt(transitDays));

    return formatDate(deliveryDate);
  } catch (error) {
    console.error('Error calculating delivery date:', error);
    return '';
  }
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const numValue = parseFloat(num);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

/**
 * Format weight with unit
 * @param {number} weight - Weight value
 * @param {string} unit - Weight unit (kg, lb, oz, g)
 * @returns {string} Formatted weight string
 */
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight || isNaN(weight)) return `0 ${unit}`;

  const formatted = parseFloat(weight).toFixed(2);
  return `${formatted} ${unit}`;
};

/**
 * Format dimensions (L x W x H)
 * @param {Object} dimensions - Dimensions object
 * @param {number} dimensions.length - Length
 * @param {number} dimensions.width - Width
 * @param {number} dimensions.height - Height
 * @param {string} unit - Unit (cm, in, m)
 * @returns {string} Formatted dimensions string
 */
export const formatDimensions = (dimensions, unit = 'cm') => {
  if (!dimensions) return '';

  const { length, width, height } = dimensions;

  if (!length || !width || !height) return '';

  return `${length} × ${width} × ${height} ${unit}`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @param {string} format - Format pattern (default: US format)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return with basic formatting
  return phone;
};
