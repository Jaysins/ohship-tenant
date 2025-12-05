import { useState } from 'react';
import { Package, Check, X } from 'lucide-react';

/**
 * Theme Preview Component
 * Shows how different theme configurations look in practice
 * Use this to visualize and test theme configurations
 */

const themePresets = {
  default: {
    name: 'OhShip Default',
    config: {
      primary_color: '#6366f1',
      secondary_color: '#8b5cf6',
      accent_color: '#10b981',
      success_color: '#22c55e',
      warning_color: '#f59e0b',
      danger_color: '#ef4444',
      background: { page: '#f8fafc', card: '#ffffff', subtle: '#f1f5f9' },
      text: { primary: '#0f172a', secondary: '#64748b', muted: '#94a3b8' },
      border: { color: '#e2e8f0', radius: 'lg' }
    }
  },
  ocean: {
    name: 'Ocean Blue',
    config: {
      primary_color: '#0ea5e9',
      secondary_color: '#06b6d4',
      accent_color: '#f59e0b',
      success_color: '#22c55e',
      warning_color: '#f59e0b',
      danger_color: '#ef4444',
      background: { page: '#f0f9ff', card: '#ffffff', subtle: '#e0f2fe' },
      text: { primary: '#0c4a6e', secondary: '#0369a1', muted: '#7dd3fc' },
      border: { color: '#bae6fd', radius: 'xl' }
    }
  },
  eco: {
    name: 'Eco Green',
    config: {
      primary_color: '#059669',
      secondary_color: '#10b981',
      accent_color: '#f59e0b',
      success_color: '#22c55e',
      warning_color: '#f59e0b',
      danger_color: '#ef4444',
      background: { page: '#f0fdf4', card: '#ffffff', subtle: '#dcfce7' },
      text: { primary: '#14532d', secondary: '#166534', muted: '#86efac' },
      border: { color: '#bbf7d0', radius: 'lg' }
    }
  },
  express: {
    name: 'Express Orange',
    config: {
      primary_color: '#f97316',
      secondary_color: '#fb923c',
      accent_color: '#eab308',
      success_color: '#22c55e',
      warning_color: '#f59e0b',
      danger_color: '#ef4444',
      background: { page: '#fffbeb', card: '#ffffff', subtle: '#fef3c7' },
      text: { primary: '#431407', secondary: '#9a3412', muted: '#fdba74' },
      border: { color: '#fed7aa', radius: 'lg' }
    }
  },
  luxury: {
    name: 'Luxury Purple',
    config: {
      primary_color: '#7c3aed',
      secondary_color: '#a78bfa',
      accent_color: '#ec4899',
      success_color: '#22c55e',
      warning_color: '#f59e0b',
      danger_color: '#ef4444',
      background: { page: '#faf5ff', card: '#ffffff', subtle: '#f3e8ff' },
      text: { primary: '#2e1065', secondary: '#5b21b6', muted: '#c4b5fd' },
      border: { color: '#ddd6fe', radius: '2xl' }
    }
  }
};

const ThemePreview = () => {
  const [selectedTheme, setSelectedTheme] = useState('default');
  const theme = themePresets[selectedTheme].config;

  const getBorderRadiusClass = (radius) => {
    const map = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl' };
    return map[radius] || 'rounded-lg';
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: theme.background.page }}>
      {/* Theme Selector */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text.primary }}>
          Theme Preview
        </h1>
        <div className="flex flex-wrap gap-3">
          {Object.entries(themePresets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setSelectedTheme(key)}
              className={`px-4 py-2 font-medium transition-all ${getBorderRadiusClass(theme.border.radius)}`}
              style={{
                backgroundColor: selectedTheme === key ? theme.primary_color : theme.background.card,
                color: selectedTheme === key ? '#ffffff' : theme.text.primary,
                border: `2px solid ${selectedTheme === key ? theme.primary_color : theme.border.color}`
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Card Preview */}
        <div
          className={`p-6 shadow-lg ${getBorderRadiusClass(theme.border.radius)}`}
          style={{ backgroundColor: theme.background.card }}
        >
          <div className="text-center mb-6">
            <div
              className={`w-12 h-12 mx-auto flex items-center justify-center mb-3 ${getBorderRadiusClass('2xl')}`}
              style={{ backgroundColor: `${theme.primary_color}1A` }}
            >
              <Package style={{ color: theme.primary_color }} size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Welcome back
            </h2>
            <p style={{ color: theme.text.secondary }}>
              Sign in to access your shipping portal
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className={`w-full px-3 py-2 ${getBorderRadiusClass(theme.border.radius)}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`,
                  color: theme.text.primary
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-3 py-2 ${getBorderRadiusClass(theme.border.radius)}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`,
                  color: theme.text.primary
                }}
              />
            </div>

            <button
              className={`w-full py-2.5 font-medium ${getBorderRadiusClass(theme.border.radius)} transition-all hover:shadow-md`}
              style={{ backgroundColor: theme.primary_color, color: '#ffffff' }}
            >
              Sign in
            </button>

            <button
              className={`w-full py-2.5 font-medium ${getBorderRadiusClass(theme.border.radius)} transition-all`}
              style={{
                backgroundColor: theme.background.card,
                color: theme.text.primary,
                border: `2px solid ${theme.border.color}`
              }}
            >
              Create account
            </button>
          </div>
        </div>

        {/* Dashboard Card Preview */}
        <div
          className={`p-6 shadow-lg ${getBorderRadiusClass(theme.border.radius)}`}
          style={{ backgroundColor: theme.background.card }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Quick Stats
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Stat Card 1 */}
            <div
              className={`p-4 ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: theme.background.subtle, border: `1px solid ${theme.border.color}` }}
            >
              <p className="text-sm mb-1" style={{ color: theme.text.secondary }}>
                Total Shipments
              </p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                1,234
              </p>
              <p className="text-xs mt-1" style={{ color: theme.success_color }}>
                +12% from last month
              </p>
            </div>

            {/* Stat Card 2 */}
            <div
              className={`p-4 ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: theme.background.subtle, border: `1px solid ${theme.border.color}` }}
            >
              <p className="text-sm mb-1" style={{ color: theme.text.secondary }}>
                In Transit
              </p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                87
              </p>
              <p className="text-xs mt-1" style={{ color: theme.warning_color }}>
                5 delayed
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              className={`w-full py-2.5 font-medium ${getBorderRadiusClass(theme.border.radius)} flex items-center justify-center gap-2`}
              style={{ backgroundColor: theme.primary_color, color: '#ffffff' }}
            >
              <Package size={18} />
              Create Shipment
            </button>

            <button
              className={`w-full py-2.5 font-medium ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: theme.secondary_color, color: '#ffffff' }}
            >
              Get Quote
            </button>

            <button
              className={`w-full py-2.5 font-medium ${getBorderRadiusClass(theme.border.radius)}`}
              style={{
                backgroundColor: theme.background.card,
                color: theme.text.primary,
                border: `2px solid ${theme.border.color}`
              }}
            >
              View All Shipments
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div
          className={`p-6 shadow-lg ${getBorderRadiusClass(theme.border.radius)}`}
          style={{ backgroundColor: theme.background.card }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Status Indicators
          </h3>

          <div className="space-y-3">
            {/* Success */}
            <div
              className={`p-3 flex items-center gap-3 ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: `${theme.success_color}0D`, borderLeft: `4px solid ${theme.success_color}` }}
            >
              <Check size={20} style={{ color: theme.success_color }} />
              <div>
                <p className="font-medium" style={{ color: theme.text.primary }}>Delivered</p>
                <p className="text-sm" style={{ color: theme.text.secondary }}>Package delivered successfully</p>
              </div>
            </div>

            {/* Warning */}
            <div
              className={`p-3 flex items-center gap-3 ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: `${theme.warning_color}0D`, borderLeft: `4px solid ${theme.warning_color}` }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.warning_color }}
              />
              <div>
                <p className="font-medium" style={{ color: theme.text.primary }}>Delayed</p>
                <p className="text-sm" style={{ color: theme.text.secondary }}>Shipment delayed by 1 day</p>
              </div>
            </div>

            {/* Danger */}
            <div
              className={`p-3 flex items-center gap-3 ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: `${theme.danger_color}0D`, borderLeft: `4px solid ${theme.danger_color}` }}
            >
              <X size={20} style={{ color: theme.danger_color }} />
              <div>
                <p className="font-medium" style={{ color: theme.text.primary }}>Failed</p>
                <p className="text-sm" style={{ color: theme.text.secondary }}>Delivery attempt failed</p>
              </div>
            </div>

            {/* Info */}
            <div
              className={`p-3 flex items-center gap-3 ${getBorderRadiusClass(theme.border.radius)}`}
              style={{ backgroundColor: `${theme.primary_color}0D`, borderLeft: `4px solid ${theme.primary_color}` }}
            >
              <Package size={20} style={{ color: theme.primary_color }} />
              <div>
                <p className="font-medium" style={{ color: theme.text.primary }}>In Transit</p>
                <p className="text-sm" style={{ color: theme.text.secondary }}>On the way to destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette Display */}
        <div
          className={`p-6 shadow-lg ${getBorderRadiusClass(theme.border.radius)}`}
          style={{ backgroundColor: theme.background.card }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Color Palette
          </h3>

          <div className="space-y-4">
            {/* Primary */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${getBorderRadiusClass(theme.border.radius)} border`}
                style={{ backgroundColor: theme.primary_color, borderColor: theme.border.color }}
              />
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text.primary }}>Primary</p>
                <p className="text-xs font-mono" style={{ color: theme.text.muted }}>{theme.primary_color}</p>
              </div>
            </div>

            {/* Secondary */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${getBorderRadiusClass(theme.border.radius)} border`}
                style={{ backgroundColor: theme.secondary_color, borderColor: theme.border.color }}
              />
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text.primary }}>Secondary</p>
                <p className="text-xs font-mono" style={{ color: theme.text.muted }}>{theme.secondary_color}</p>
              </div>
            </div>

            {/* Success */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${getBorderRadiusClass(theme.border.radius)} border`}
                style={{ backgroundColor: theme.success_color, borderColor: theme.border.color }}
              />
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text.primary }}>Success</p>
                <p className="text-xs font-mono" style={{ color: theme.text.muted }}>{theme.success_color}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${getBorderRadiusClass(theme.border.radius)} border`}
                style={{ backgroundColor: theme.warning_color, borderColor: theme.border.color }}
              />
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text.primary }}>Warning</p>
                <p className="text-xs font-mono" style={{ color: theme.text.muted }}>{theme.warning_color}</p>
              </div>
            </div>

            {/* Danger */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${getBorderRadiusClass(theme.border.radius)} border`}
                style={{ backgroundColor: theme.danger_color, borderColor: theme.border.color }}
              />
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text.primary }}>Danger</p>
                <p className="text-xs font-mono" style={{ color: theme.text.muted }}>{theme.danger_color}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Configuration Display */}
      <div className="max-w-7xl mx-auto mt-8">
        <div
          className={`p-6 shadow-lg ${getBorderRadiusClass(theme.border.radius)}`}
          style={{ backgroundColor: theme.background.card }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Current Theme Configuration
          </h3>
          <pre
            className={`p-4 overflow-x-auto text-sm ${getBorderRadiusClass(theme.border.radius)}`}
            style={{
              backgroundColor: theme.background.subtle,
              color: theme.text.primary,
              border: `1px solid ${theme.border.color}`
            }}
          >
            {JSON.stringify(theme, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
