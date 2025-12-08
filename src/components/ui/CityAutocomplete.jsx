import React, { useState, useEffect, useRef } from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { searchCities } from '../../data/countries';

/**
 * CityAutocomplete Component
 * Smart city search with autocomplete dropdown
 *
 * @param {string} countryCode - ISO country code
 * @param {string} value - Current value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Input placeholder
 * @param {boolean} disabled - Disabled state
 * @param {string} error - Error message
 * @param {string} className - Additional CSS classes
 */
const CityAutocomplete = ({
  countryCode,
  value = '',
  onChange,
  placeholder = 'Enter city name',
  disabled = false,
  error = '',
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search cities when input changes
  useEffect(() => {
    if (!inputValue || inputValue.length < 2 || !countryCode) {
      setSuggestions([]);
      return;
    }

    const results = searchCities(countryCode, inputValue);
    setSuggestions(results);
  }, [inputValue, countryCode]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    onChange(newValue);
  };

  const handleSelectCity = (city) => {
    setInputValue(city.name);
    onChange(city.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectCity(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        disabled={disabled || !countryCode}
        className={`w-full px-4 py-2.5 font-medium transition-all focus:outline-none ${getBorderRadius()}`}
        style={{
          backgroundColor: disabled ? theme.background.subtle : theme.background.card,
          color: theme.text.primary,
          border: `1px solid ${error ? theme.danger_color : theme.border.color}`,
        }}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className={`absolute z-50 w-full mt-1 shadow-lg max-h-60 overflow-y-auto ${getBorderRadius()}`}
          style={{
            backgroundColor: theme.background.card,
            border: `1px solid ${theme.border.color}`,
          }}
        >
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.stateCode}`}
              onClick={() => handleSelectCity(city)}
              className={`px-4 py-2.5 cursor-pointer transition-colors`}
              style={{
                backgroundColor: selectedIndex === index
                  ? `${theme.primary_color}15`
                  : 'transparent',
                color: theme.text.primary,
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium">{city.name}</div>
              {city.stateCode && (
                <div className="text-xs mt-0.5" style={{ color: theme.text.muted }}>
                  {city.stateCode}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No country selected message */}
      {!countryCode && (
        <p className="mt-1 text-xs" style={{ color: theme.text.muted }}>
          Select a country first
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs" style={{ color: theme.danger_color }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default CityAutocomplete;
