import React from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

/**
 * Alert Component
 * Notification/warning component with different variants
 *
 * @param {string} variant - Alert variant (success, error, warning, info)
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {boolean} dismissible - Can be dismissed
 * @param {function} onDismiss - Dismiss handler
 * @param {React.ReactNode} children - Custom content
 * @param {string} className - Additional CSS classes
 */
const Alert = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  children,
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  const variants = {
    success: {
      icon: CheckCircle,
      backgroundColor: `${theme.success_color}15`,
      borderColor: theme.success_color,
      iconColor: theme.success_color,
      textColor: theme.text.primary,
    },
    error: {
      icon: XCircle,
      backgroundColor: `${theme.danger_color}15`,
      borderColor: theme.danger_color,
      iconColor: theme.danger_color,
      textColor: theme.text.primary,
    },
    warning: {
      icon: AlertCircle,
      backgroundColor: `${theme.warning_color}15`,
      borderColor: theme.warning_color,
      iconColor: theme.warning_color,
      textColor: theme.text.primary,
    },
    info: {
      icon: Info,
      backgroundColor: `${theme.info_color}15`,
      borderColor: theme.info_color,
      iconColor: theme.info_color,
      textColor: theme.text.primary,
    },
  };

  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div
      className={`p-4 ${getBorderRadius()} ${className}`}
      style={{
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={20} style={{ color: config.iconColor }} />
        </div>

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4
              className="font-semibold text-sm mb-1"
              style={{ color: config.textColor }}
            >
              {title}
            </h4>
          )}
          {message && (
            <p
              className="text-sm"
              style={{ color: theme.text.secondary }}
            >
              {message}
            </p>
          )}
          {children && (
            <div style={{ color: theme.text.secondary }}>
              {children}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded transition-colors"
            style={{
              color: config.iconColor,
              backgroundColor: 'transparent',
            }}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
