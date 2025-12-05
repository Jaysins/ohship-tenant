import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useTenantConfig } from '../../context/TenantConfigContext';

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      className = '',
      required = false,
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
    const { theme, getBorderRadius } = useTenantConfig();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text.secondary }}>
            {label}
            {required && <span className="ml-1" style={{ color: theme.danger_color }}>*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-4 py-2.5 pr-10 ${getBorderRadius()} border appearance-none transition-all duration-200 outline-none disabled:cursor-not-allowed ${className}`}
            style={{
              backgroundColor: theme.background.card,
              color: theme.text.primary,
              borderColor: error ? theme.danger_color : theme.border.color,
            }}
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${error ? theme.danger_color : theme.primary_color}`;
              e.target.style.outlineOffset = '0px';
              e.target.style.borderColor = 'transparent';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.borderColor = error ? theme.danger_color : theme.border.color;
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle size={18} style={{ color: theme.danger_color }} />
            ) : (
              <ChevronDown size={18} style={{ color: theme.text.muted }} />
            )}
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-sm flex items-center gap-1" style={{ color: theme.danger_color }}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm" style={{ color: theme.text.muted }}>{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
