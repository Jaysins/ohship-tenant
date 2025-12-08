/**
 * Package Types and Related Constants
 * Predefined package types, currencies, and shipping options
 */

/**
 * Package types for shipment items
 */
export const PACKAGE_TYPES = [
  { value: 'envelope', label: 'Envelope' },
  { value: 'box', label: 'Box' },
  { value: 'pallet', label: 'Pallet' },
  { value: 'tube', label: 'Tube' },
  { value: 'pak', label: 'Pak' },
  { value: 'crate', label: 'Crate' },
  { value: 'bag', label: 'Bag' },
  { value: 'roll', label: 'Roll' },
];

/**
 * Supported currencies
 */
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

/**
 * Weight units
 */
export const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'oz', label: 'Ounces (oz)' },
];

/**
 * Dimension units
 */
export const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'in', label: 'Inches (in)' },
  { value: 'm', label: 'Meters (m)' },
];

/**
 * Pickup types
 */
export const PICKUP_TYPES = [
  { value: 'scheduled_pickup', label: 'Scheduled Pickup', description: 'Carrier will pick up from your location' },
  { value: 'drop_off', label: 'Drop Off', description: 'You will drop off at carrier location' },
];

/**
 * Shipment types
 */
export const SHIPMENT_TYPES = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'international', label: 'International' },
];

/**
 * Service types
 */
export const SERVICE_TYPES = [
  { value: 'express', label: 'Express', color: 'warning' },
  { value: 'standard', label: 'Standard', color: 'info' },
  { value: 'economy', label: 'Economy', color: 'secondary' },
];

/**
 * Shipment statuses
 */
export const SHIPMENT_STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment', color: 'warning' },
  { value: 'pending_pickup', label: 'Pending Pickup', color: 'warning' },
  { value: 'in_transit', label: 'In Transit', color: 'info' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'info' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
  { value: 'failed', label: 'Failed', color: 'danger' },
];

/**
 * Payment statuses
 */
export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'processing', label: 'Processing', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'danger' },
  { value: 'refunded', label: 'Refunded', color: 'secondary' },
];

/**
 * Get package type label by value
 * @param {string} value - Package type value
 * @returns {string} Package type label
 */
export const getPackageTypeLabel = (value) => {
  const packageType = PACKAGE_TYPES.find(type => type.value === value);
  return packageType ? packageType.label : value;
};

/**
 * Get currency symbol by code
 * @param {string} code - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (code) => {
  const currency = CURRENCIES.find(curr => curr.code === code);
  return currency ? currency.symbol : code;
};

/**
 * Get status color by value
 * @param {string} value - Status value
 * @param {string} type - Status type ('shipment' or 'payment')
 * @returns {string} Status color
 */
export const getStatusColor = (value, type = 'shipment') => {
  const statuses = type === 'payment' ? PAYMENT_STATUSES : SHIPMENT_STATUSES;
  const status = statuses.find(s => s.value === value);
  return status ? status.color : 'secondary';
};

/**
 * Default form values for new shipment
 */
export const DEFAULT_SHIPMENT_FORM = {
  originCountry: '',
  originState: '',
  originCity: '',
  destinationCountry: '',
  destinationState: '',
  destinationCity: '',
  items: [
    {
      categoryId: '',
      description: '',
      packageType: 'box',
      quantity: 1,
      weight: '',
      length: '',
      width: '',
      height: '',
      declaredValue: '',
    }
  ],
  currency: 'NGN',
  isInsured: false,
};

/**
 * Default address form values
 */
export const DEFAULT_ADDRESS_FORM = {
  name: '',
  email: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
};
