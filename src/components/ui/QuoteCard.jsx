import React from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { Clock, Package, ArrowRight } from 'lucide-react';
import { formatCurrency, calculateDeliveryDate } from '../../utils/format';
import Badge from './Badge';
import PriceBreakdown from './PriceBreakdown';

/**
 * QuoteCard Component
 * Display individual quote with carrier info and pricing
 *
 * @param {Object} quote - Quote object
 * @param {string} quote.id - Quote ID
 * @param {string} quote.carrier_name - Carrier name
 * @param {string} quote.carrier_logo_url - Carrier logo URL
 * @param {string} quote.service_type - Service type (express/standard/economy)
 * @param {number} quote.transit_days - Transit time in days
 * @param {Object} quote.pricing - Pricing breakdown
 * @param {string} currency - Currency code
 * @param {boolean} selected - Is this quote selected
 * @param {function} onSelect - Select handler
 * @param {string} className - Additional CSS classes
 */
const QuoteCard = ({
  quote,
  currency = 'NGN',
  selected = false,
  onSelect,
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  if (!quote) return null;

  const deliveryDate = calculateDeliveryDate(quote.transit_days);

  const serviceTypeColors = {
    express: theme.warning_color,
    standard: theme.info_color,
    economy: theme.secondary_color,
  };

  const serviceColor = serviceTypeColors[quote.service_type?.toLowerCase()] || theme.text.secondary;

  return (
    <div
      onClick={() => onSelect && onSelect(quote)}
      className={`p-4 transition-all cursor-pointer ${getBorderRadius()} ${className}`}
      style={{
        backgroundColor: selected ? `${theme.primary_color}10` : theme.background.card,
        border: `2px solid ${selected ? theme.primary_color : theme.border.color}`,
        boxShadow: selected ? `0 4px 12px ${theme.primary_color}30` : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Carrier info */}
        <div className="flex-1">
          {/* Carrier logo and name */}
          <div className="flex items-center gap-3 mb-3">
            {quote.carrier_logo_url && (
              <img
                src={quote.carrier_logo_url}
                alt={quote.carrier_name}
                className="w-12 h-12 object-contain"
              />
            )}
            <div>
              <h3 className="font-semibold text-base" style={{ color: theme.text.primary }}>
                {quote.carrier_name}
              </h3>
              {quote.service_type && (
                <Badge
                  text={quote.service_type}
                  variant="custom"
                  customColor={serviceColor}
                  size="sm"
                  className="mt-1"
                />
              )}
            </div>
          </div>

          {/* Transit info */}
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: theme.text.muted }} />
              <span className="text-sm" style={{ color: theme.text.secondary }}>
                {quote.transit_days} {quote.transit_days === 1 ? 'day' : 'days'}
              </span>
            </div>
            {deliveryDate && (
              <div className="flex items-center gap-2">
                <Package size={16} style={{ color: theme.text.muted }} />
                <span className="text-sm" style={{ color: theme.text.secondary }}>
                  Delivery by {deliveryDate}
                </span>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <PriceBreakdown
            pricing={quote.pricing}
            currency={currency}
            defaultExpanded={false}
          />
        </div>

        {/* Right: Price */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs mb-1" style={{ color: theme.text.muted }}>
              Total
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: selected ? theme.primary_color : theme.text.primary }}
            >
              {formatCurrency(quote.pricing?.total || 0, currency)}
            </p>
          </div>

          {/* Select button */}
          {onSelect && (
            <button
              className={`flex items-center gap-1 px-4 py-2 mt-2 font-medium text-sm transition-all ${getBorderRadius()}`}
              style={{
                backgroundColor: selected ? theme.primary_color : theme.background.subtle,
                color: selected ? '#ffffff' : theme.text.primary,
              }}
            >
              {selected ? 'Selected' : 'Select'}
              {!selected && <ArrowRight size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
