import { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTenantConfig } from '../../context/TenantConfigContext';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      required = false,
      leftIcon,
      rightIcon,
      type,
      ...props
    },
    ref
  ) => {
    const { theme, getBorderRadius } = useTenantConfig();
    const [showPassword, setShowPassword] = useState(false);

    // Determine actual input type
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    const baseStyles =
      'w-full px-4 py-2.5 border transition-all duration-200 outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed';

    const iconPaddingLeft = leftIcon ? 'pl-11' : '';
    const iconPaddingRight = rightIcon ? 'pr-11' : '';

    // Build inline styles for theming
    const inputStyles = {
      backgroundColor: theme.background.card,
      color: theme.text.primary,
      borderColor: error ? theme.danger_color : theme.border.color,
      '--focus-ring-color': error ? theme.danger_color : theme.primary_color,
    };

    const placeholderStyles = {
      '--placeholder-color': theme.text.muted,
    };

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: theme.text.primary }}
          >
            {label}
            {required && <span style={{ color: theme.danger_color }} className="ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.text.muted }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`${baseStyles} ${getBorderRadius()} ${iconPaddingLeft} ${iconPaddingRight} ${className} themed-input`}
            style={{ ...inputStyles, ...placeholderStyles }}
            {...props}
          />

          {/* Password visibility toggle */}
          {isPasswordField && !error && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              style={{ color: theme.text.muted }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {/* Right icon (only if not password field and no error) */}
          {rightIcon && !error && !isPasswordField && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.text.muted }}
            >
              {rightIcon}
            </div>
          )}

          {/* Error icon */}
          {error && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.danger_color }}
            >
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        {error && (
          <p
            className="mt-1.5 text-sm flex items-center gap-1"
            style={{ color: theme.danger_color }}
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            className="mt-1.5 text-sm"
            style={{ color: theme.text.secondary }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
