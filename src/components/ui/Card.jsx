import { useTenantConfig } from '../../context/TenantConfigContext';

const Card = ({
  children,
  header,
  title,
  subtitle,
  footer,
  className = '',
  padding = 'default',
  hover = false
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const hoverClass = hover ? 'hover:shadow-medium transition-shadow duration-200' : '';

  return (
    <div
      className={`shadow-soft ${hoverClass} ${className} ${getBorderRadius()}`}
      style={{
        backgroundColor: theme.background.card,
        border: `1px solid ${theme.border.color}`
      }}
    >
      {/* Header Section */}
      {(header || title) && (
        <div
          className="px-6 py-4"
          style={{ borderBottom: `1px solid ${theme.border.color}` }}
        >
          {header || (
            <div>
              {title && (
                <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Body Section */}
      <div className={paddingClasses[padding]}>
        {children}
      </div>

      {/* Footer Section */}
      {footer && (
        <div
          className={`px-6 py-4 ${getBorderRadius('bottom')}`}
          style={{
            backgroundColor: theme.background.subtle,
            borderTop: `1px solid ${theme.border.color}`
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
