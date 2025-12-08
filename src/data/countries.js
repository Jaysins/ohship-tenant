/**
 * Countries, States, and Cities Data
 * Uses country-state-city package for comprehensive location data
 */

// Note: Install country-state-city package
// npm install country-state-city

import { Country, State, City } from 'country-state-city';

/**
 * Get all countries
 * @returns {Array} Array of country objects
 */
export const getAllCountries = () => {
  return Country.getAllCountries();
};

/**
 * Get country by code
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {Object|null} Country object
 */
export const getCountryByCode = (countryCode) => {
  return Country.getCountryByCode(countryCode);
};

/**
 * Get states of a country
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {Array} Array of state objects
 */
export const getStatesOfCountry = (countryCode) => {
  return State.getStatesOfCountry(countryCode);
};

/**
 * Get cities of a state
 * @param {string} countryCode - ISO 2-letter country code
 * @param {string} stateCode - State code
 * @returns {Array} Array of city objects
 */
export const getCitiesOfState = (countryCode, stateCode) => {
  return City.getCitiesOfCountry(countryCode).filter(
    city => city.stateCode === stateCode
  );
};

/**
 * Search cities by name
 * @param {string} countryCode - ISO 2-letter country code
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching city objects
 */
export const searchCities = (countryCode, searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const cities = City.getCitiesOfCountry(countryCode);
  const lowerSearch = searchTerm.toLowerCase();

  return cities.filter(city =>
    city.name.toLowerCase().includes(lowerSearch)
  ).slice(0, 10); // Limit to 10 results
};

/**
 * Commonly used countries (can be customized based on business needs)
 */
export const COMMON_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
];

/**
 * Get formatted country options for select dropdown
 * @returns {Array} Array of { value, label } objects
 */
export const getCountryOptions = () => {
  const countries = getAllCountries();
  return countries.map(country => ({
    value: country.isoCode,
    label: country.name,
    flag: country.flag,
  }));
};

/**
 * Get formatted state options for select dropdown
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {Array} Array of { value, label } objects
 */
export const getStateOptions = (countryCode) => {
  if (!countryCode) return [];

  const states = getStatesOfCountry(countryCode);
  return states.map(state => ({
    value: state.name,  // Use state name instead of isoCode
    label: state.name,
  }));
};

/**
 * Get formatted city options for select dropdown
 * @param {string} countryCode - ISO 2-letter country code
 * @param {string} stateCode - State code
 * @returns {Array} Array of { value, label } objects
 */
export const getCityOptions = (countryCode, stateCode) => {
  if (!countryCode || !stateCode) return [];

  const cities = getCitiesOfState(countryCode, stateCode);
  return cities.map(city => ({
    value: city.name,
    label: city.name,
  }));
};
