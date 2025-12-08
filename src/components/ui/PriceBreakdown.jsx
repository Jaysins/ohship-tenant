import React, { useState } from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

/**
 * PriceBreakdown Component
 * Expandable price details with line items
 *
 * @param {Object} pricing - Pricing object
 * @param {number} pricing.base_cost - Base shipping cost
 * @param {Array} pricing.adjustments - Array of adjustment objects with type, description, amount
 * @param {Array} pricing.discounts - Array of discount objects with type, description, amount
 * @param {number} pricing.total - Total price
 * @param {string} currency - Currency code
 * @param {boolean} defaultExpanded - Initial expanded state
 * @param {string} className - Additional CSS classes
 */
const PriceBreakdown = ({
  pricing,
  currency = 'NGN',
  defaultExpanded = false,
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!pricing) return null;

  // Build line items with detailed adjustments and discounts
  const lineItems = [
    { label: 'Base Shipping Cost', amount: pricing.base_cost || 0 },
    // Add each adjustment individually
    ...(Array.isArray(pricing.adjustments)
      ? pricing.adjustments.map(adj => ({
          label: adj.description || adj.type,
          amount: adj.amount,
        }))
      : []
    ),
    // Add each discount individually
    ...(Array.isArray(pricing.discounts)
      ? pricing.discounts.map(disc => ({
          label: disc.description || disc.type,
          amount: disc.amount, // Backend should already have negative amounts
          isDiscount: true,
        }))
      : []
    ),
  ];

  return (
    <div className={className}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between w-full px-4 py-2 transition-colors ${getBorderRadius()}`}
        style={{
          backgroundColor: isExpanded ? `${theme.primary_color}10` : theme.background.subtle,
          color: theme.text.primary,
        }}
      >
        <span className="text-sm font-medium">Price Breakdown</span>
        {isExpanded ? (
          <ChevronUp size={18} style={{ color: theme.primary_color }} />
        ) : (
          <ChevronDown size={18} style={{ color: theme.text.muted }} />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className={`mt-2 p-4 ${getBorderRadius()}`}
          style={{
            backgroundColor: theme.background.card,
            border: `1px solid ${theme.border.color}`,
          }}
        >
          {/* Line items */}
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: theme.text.secondary }}>
                  {item.label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: item.isDiscount ? theme.success_color : theme.text.primary
                  }}
                >
                  {item.isDiscount && '- '}
                  {formatCurrency(Math.abs(item.amount), currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-3" style={{ borderTop: `1px solid ${theme.border.color}` }} />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold" style={{ color: theme.text.primary }}>
              Total
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: theme.primary_color }}
            >
              {formatCurrency(pricing.total || 0, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceBreakdown;
