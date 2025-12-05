import { useTenantConfig } from '../../context/TenantConfigContext';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const { theme } = useTenantConfig();

  // Map variants to theme colors
  const getVariantStyle = () => {
    const variantMap = {
      default: {
        backgroundColor: `${theme.text.secondary}1A`, // 10% opacity
        color: theme.text.secondary
      },
      primary: {
        backgroundColor: `${theme.primary_color}1A`,
        color: theme.primary_color
      },
      success: {
        backgroundColor: `${theme.success_color}1A`,
        color: theme.success_color
      },
      warning: {
        backgroundColor: `${theme.warning_color}1A`,
        color: theme.warning_color
      },
      danger: {
        backgroundColor: `${theme.danger_color}1A`,
        color: theme.danger_color
      },
      info: {
        backgroundColor: `${theme.info_color}1A`,
        color: theme.info_color
      }
    };
    return variantMap[variant] || variantMap.default;
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizes[size]} ${className}`}
      style={getVariantStyle()}
    >
      {children}
    </span>
  );
};

export default Badge;
