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
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const hoverClass = hover ? 'hover:shadow-medium transition-shadow duration-200' : '';

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-soft ${hoverClass} ${className}`}>
      {/* Header Section */}
      {(header || title) && (
        <div className="px-6 py-4 border-b border-slate-200">
          {header || (
            <div>
              {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
