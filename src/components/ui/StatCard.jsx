import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTenantConfig } from '../../context/TenantConfigContext';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
  loading = false
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  // Map color names to theme colors
  const getColorStyle = (colorName) => {
    const colorMap = {
      indigo: theme.primary_color,
      green: theme.success_color,
      amber: theme.warning_color,
      red: theme.danger_color,
      blue: theme.info_color
    };
    const baseColor = colorMap[colorName] || theme.primary_color;
    return {
      backgroundColor: `${baseColor}1A`, // 10% opacity
      color: baseColor
    };
  };

  if (loading) {
    return (
      <div
        className={`p-6 animate-pulse ${getBorderRadius()}`}
        style={{
          backgroundColor: theme.background.card,
          border: `1px solid ${theme.border.color}`
        }}
      >
        <div
          className="h-4 rounded w-1/2 mb-4"
          style={{ backgroundColor: theme.background.subtle }}
        />
        <div
          className="h-8 rounded w-3/4 mb-2"
          style={{ backgroundColor: theme.background.subtle }}
        />
        <div
          className="h-3 rounded w-1/3"
          style={{ backgroundColor: theme.background.subtle }}
        />
      </div>
    );
  }

  const iconStyle = getColorStyle(color);

  return (
    <div
      className={`p-6 hover:shadow-medium transition-shadow duration-200 ${getBorderRadius()}`}
      style={{
        backgroundColor: theme.background.card,
        border: `1px solid ${theme.border.color}`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
          {title}
        </p>
        {Icon && (
          <div
            className={`w-10 h-10 flex items-center justify-center shrink-0 ${getBorderRadius()}`}
            style={iconStyle}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-semibold break-words" style={{ color: theme.text.primary }}>
          {value}
        </h3>

        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium">
            {trend > 0 ? (
              <TrendingUp size={14} style={{ color: theme.success_color }} />
            ) : (
              <TrendingDown size={14} style={{ color: theme.danger_color }} />
            )}
            <span style={{ color: trend > 0 ? theme.success_color : theme.danger_color }}>
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="ml-1" style={{ color: theme.text.muted }}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
