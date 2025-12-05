import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useTenantConfig } from '../../context/TenantConfigContext';

/**
 * Configurable Button component that adapts to tenant theme
 * Maintains sleek design while respecting brand colors
 */
const ButtonConfigurable = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const { theme, getBorderRadius } = useTenantConfig();

    // Helper function to adjust color brightness
    const adjustBrightness = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = ((num >> 8) & 0x00ff) + amt;
      const B = (num & 0x0000ff) + amt;
      return (
        '#' +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    };

    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    // Get colors from theme
    const variantStyles = {
      primary: {
        backgroundColor: theme.primary_color,
        color: '#ffffff',
        hoverBg: adjustBrightness(theme.primary_color, -10),
        activeBg: adjustBrightness(theme.primary_color, -20),
        ringColor: theme.primary_color,
      },
      secondary: {
        backgroundColor: theme.secondary_color,
        color: '#ffffff',
        hoverBg: adjustBrightness(theme.secondary_color, -10),
        activeBg: adjustBrightness(theme.secondary_color, -20),
        ringColor: theme.secondary_color,
      },
      success: {
        backgroundColor: theme.success_color,
        color: '#ffffff',
        hoverBg: adjustBrightness(theme.success_color, -10),
        activeBg: adjustBrightness(theme.success_color, -20),
        ringColor: theme.success_color,
      },
      danger: {
        backgroundColor: theme.danger_color,
        color: '#ffffff',
        hoverBg: adjustBrightness(theme.danger_color, -10),
        activeBg: adjustBrightness(theme.danger_color, -20),
        ringColor: theme.danger_color,
      },
      warning: {
        backgroundColor: theme.warning_color,
        color: '#ffffff',
        hoverBg: adjustBrightness(theme.warning_color, -10),
        activeBg: adjustBrightness(theme.warning_color, -20),
        ringColor: theme.warning_color,
      },
      outline: {
        backgroundColor: theme.background.card,
        color: theme.text.primary,
        borderColor: theme.border.color,
        hoverBg: theme.background.subtle,
        activeBg: theme.background.page,
        ringColor: theme.primary_color,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.text.primary,
        hoverBg: theme.background.subtle,
        activeBg: theme.background.page,
        ringColor: theme.primary_color,
      },
    };

    const style = variantStyles[variant];

    // Size styles
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    // Build inline styles
    const inlineStyles = {
      backgroundColor: style.backgroundColor,
      color: style.color,
      ...(variant === 'outline' && { border: `2px solid ${style.borderColor}` }),
      '--hover-bg': style.hoverBg,
      '--active-bg': style.activeBg,
      '--ring-color': style.ringColor,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${sizes[size]}
          ${widthStyle}
          ${getBorderRadius()}
          ${className}
          hover:shadow-sm
          active:scale-[0.98]
          configurable-button
        `}
        style={inlineStyles}
        {...props}
      >
        {loading && (
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

ButtonConfigurable.displayName = 'ButtonConfigurable';

export default ButtonConfigurable;

// Add this CSS to your global styles to handle hover/active states
const styles = `
.configurable-button:hover:not(:disabled) {
  background-color: var(--hover-bg) !important;
}

.configurable-button:active:not(:disabled) {
  background-color: var(--active-bg) !important;
}

.configurable-button:focus-visible {
  --tw-ring-color: var(--ring-color);
}
`;
