import React, { useState } from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { MapPin, ChevronDown, Loader } from 'lucide-react';
import Button from './Button';

/**
 * SavedAddressSelector Component
 * Allows users to select from saved addresses or enter new address
 *
 * @param {string} label - Selector label
 * @param {function} onSelect - Handler when address is selected
 * @param {Array} savedAddresses - Array of saved addresses (passed from parent)
 * @param {boolean} loading - Loading state (passed from parent)
 * @param {string} addressType - Type of address ('origin' or 'destination')
 * @param {string} className - Additional CSS classes
 */
const SavedAddressSelector = ({
  label = 'Use Saved Address',
  onSelect,
  savedAddresses = [],
  loading = false,
  addressType = 'origin',
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectAddress = (address) => {
    if (onSelect) {
      onSelect(address);
    }
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-2 ${className}`}>
        <Loader size={16} className="animate-spin" style={{ color: theme.primary_color }} />
        <span className="text-sm" style={{ color: theme.text.muted }}>
          Loading saved addresses...
        </span>
      </div>
    );
  }

  if (savedAddresses.length === 0) {
    return null; // Don't show if no saved addresses
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <MapPin size={16} />
          {label}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Address list */}
          <div
            className={`absolute z-50 w-full mt-2 shadow-lg max-h-80 overflow-y-auto ${getBorderRadius()}`}
            style={{
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.border.color}`,
            }}
          >
            {savedAddresses.map((address, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(address)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-opacity-10 ${
                  index !== savedAddresses.length - 1 ? 'border-b' : ''
                }`}
                style={{
                  borderColor: theme.border.color,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.primary_color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="font-semibold text-sm mb-1" style={{ color: theme.text.primary }}>
                  {address.name}
                </div>
                <div className="text-xs space-y-0.5" style={{ color: theme.text.secondary }}>
                  <p>{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                </div>
                {address.phone && (
                  <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
                    {address.phone}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * SaveAddressCheckbox Component
 * Checkbox to save current address for future use
 *
 * @param {boolean} checked - Checked state
 * @param {function} onChange - Change handler
 * @param {string} label - Checkbox label
 * @param {string} className - Additional CSS classes
 */
export const SaveAddressCheckbox = ({
  checked = false,
  onChange,
  label = 'Save this address for future shipments',
  className = ''
}) => {
  const { theme } = useTenantConfig();

  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className="w-4 h-4 rounded cursor-pointer"
        style={{
          accentColor: theme.primary_color,
        }}
      />
      <span className="text-sm" style={{ color: theme.text.secondary }}>
        {label}
      </span>
    </label>
  );
};

export default SavedAddressSelector;
