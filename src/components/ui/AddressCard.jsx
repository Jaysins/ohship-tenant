import React from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { MapPin, Mail, Phone } from 'lucide-react';

/**
 * AddressCard Component
 * Displays address information in a beautiful card format
 *
 * @param {string} title - Card title (e.g., "Origin", "Destination")
 * @param {Object} address - Address object
 * @param {string} address.name - Recipient name
 * @param {string} address.email - Email address
 * @param {string} address.phone - Phone number
 * @param {string} address.address_line_1 - Address line 1
 * @param {string} address.address_line_2 - Address line 2
 * @param {string} address.city - City
 * @param {string} address.state - State
 * @param {string} address.postal_code - Postal code
 * @param {string} address.country - Country
 * @param {string} variant - Card variant ('origin' or 'destination')
 * @param {string} className - Additional CSS classes
 */
const AddressCard = ({
  title = 'Address',
  address,
  variant = 'default',
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  if (!address) return null;

  const variantColors = {
    origin: theme.primary_color,
    destination: theme.secondary_color,
    default: theme.text.secondary,
  };

  const accentColor = variantColors[variant] || variantColors.default;

  return (
    <div
      className={`p-4 ${getBorderRadius()} ${className}`}
      style={{
        backgroundColor: theme.background.card,
        border: `1px solid ${theme.border.color}`,
      }}
    >
      {/* Title with accent */}
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${accentColor}` }}>
        <MapPin size={18} style={{ color: accentColor }} />
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ color: accentColor }}>
          {title}
        </h3>
      </div>

      {/* Name */}
      <div className="mb-3">
        <p className="font-semibold text-base" style={{ color: theme.text.primary }}>
          {address.name}
        </p>
      </div>

      {/* Address lines */}
      <div className="mb-3 space-y-1">
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          {address.address_line_1}
        </p>
        {address.address_line_2 && (
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {address.address_line_2}
          </p>
        )}
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
          {address.country}
        </p>
      </div>

      {/* Contact info */}
      <div className="space-y-2 pt-3" style={{ borderTop: `1px solid ${theme.border.color}` }}>
        {address.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} style={{ color: theme.text.muted }} />
            <p className="text-xs" style={{ color: theme.text.secondary }}>
              {address.email}
            </p>
          </div>
        )}
        {address.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} style={{ color: theme.text.muted }} />
            <p className="text-xs" style={{ color: theme.text.secondary }}>
              {address.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
