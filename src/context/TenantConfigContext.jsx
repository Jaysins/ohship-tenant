import { createContext, useContext, useState, useEffect } from 'react';

const TenantConfigContext = createContext();

// Default configuration
const defaultConfig = {
  branding: {
    name: 'Someship',
    tagline: 'a description',
    logo_url: null,
    favicon_url: null,
    hero_image_url: 'https://images.unsplash.com/photo-1578575437980-04aa37127db6?w=800&h=450&fit=crop'
  },
  theme: {
    primary_color: "#0ea5e9", // Sky Blue
    secondary_color: "#06b6d4", // Cyan
    success_color: "#10b981", // Emerald
    warning_color: "#f59e0b", // Amber
    danger_color: "#ef4444", // Red
    info_color: "#3b82f6", // Blue
    // info_color: '#3b82f6',
    background: {
      page: '#f8fafc',
      card: '#ffffff',
      subtle: '#f1f5f9'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      muted: '#94a3b8'
    },
    border: {
      color: '#e2e8f0',
      radius: 'lg'
    },
    font_family: 'Inter',
    font_url: null
  },
  content: {
    login_header: 'Welcome back',
    login_subtitle: 'Sign in to access your shipping portal',
    signup_header: 'Create your account',
    signup_subtitle: 'Start shipping smarter today',
    dashboard_greeting: "Welcome back! Here's what's happening with your shipments.",
    support_text: 'Need help?',
    support_subtext: 'Contact our support team',
    support_button: 'Get Support',
    hero_title: 'Ship Smarter, Not Harder',
    hero_subtitle: 'Compare quotes from top carriers and book your shipment in minutes',
    cta_button: 'Get Started'
  },
  links: {
    terms_url: '/terms',
    privacy_url: '/privacy',
    support_url: 'mailto:support@ohship.com',
    support_phone: null
  },
  features: {
    show_support_section: true,
    enable_remember_me: true,
    show_wallet_balance: true,
    show_dashboard_charts: true,
    enable_quick_actions: true
  }
};

// Helper function to generate color shades from a base color
const generateColorShades = (baseColor) => {
  // This is a simplified version - you might want to use a library like chroma-js for better results
  return {
    50: baseColor + '0D',   // 5% opacity
    100: baseColor + '1A',  // 10% opacity
    200: baseColor + '33',  // 20% opacity
    300: baseColor + '4D',  // 30% opacity
    400: baseColor + '80',  // 50% opacity
    500: baseColor,         // Base color
    600: baseColor,         // You'd darken this
    700: baseColor,         // You'd darken this more
    800: baseColor,         // You'd darken this even more
    900: baseColor,         // Darkest shade
  };
};

export const TenantConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenantConfig();
  }, []);

  const loadTenantConfig = async () => {
    try {
      // In production, this would fetch from your API
      // const response = await fetch('/api/tenant/config');
      // const data = await response.json();

      // For now, use default config or localStorage
      const savedConfig = localStorage.getItem('tenantConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig });
        applyThemeToDOM(parsedConfig.theme);
      } else {
        applyThemeToDOM(defaultConfig.theme);
      }
    } catch (error) {
      console.error('Error loading tenant config:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToDOM = (theme) => {
    const root = document.documentElement;

    // Apply CSS custom properties for easy access
    root.style.setProperty('--color-primary', theme.primary_color);
    root.style.setProperty('--color-secondary', theme.secondary_color);
    root.style.setProperty('--color-accent', theme.accent_color);
    root.style.setProperty('--color-success', theme.success_color);
    root.style.setProperty('--color-warning', theme.warning_color);
    root.style.setProperty('--color-danger', theme.danger_color);
    root.style.setProperty('--color-info', theme.info_color);

    // Background colors
    root.style.setProperty('--bg-page', theme.background.page);
    root.style.setProperty('--bg-card', theme.background.card);
    root.style.setProperty('--bg-subtle', theme.background.subtle);

    // Text colors
    root.style.setProperty('--text-primary', theme.text.primary);
    root.style.setProperty('--text-secondary', theme.text.secondary);
    root.style.setProperty('--text-muted', theme.text.muted);

    // Border
    root.style.setProperty('--border-color', theme.border.color);
    root.style.setProperty('--border-radius', theme.border.radius);

    // Font family
    if (theme.font_family) {
      root.style.setProperty('--font-family', theme.font_family);
    }

    // Load custom font if URL provided
    if (theme.font_url) {
      const link = document.createElement('link');
      link.href = theme.font_url;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Update favicon
    if (theme.favicon_url) {
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon) {
        favicon.href = theme.favicon_url;
      }
    }
  };

  const updateConfig = (newConfig) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('tenantConfig', JSON.stringify(updatedConfig));
    if (newConfig.theme) {
      applyThemeToDOM(updatedConfig.theme);
    }
  };

  // Helper function to get border radius class
  const getBorderRadius = (size = 'default') => {
    const radiusMap = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      default: `rounded-${config.theme.border.radius}`
    };
    return radiusMap[size === 'default' ? config.theme.border.radius : size];
  };

  const value = {
    config,
    updateConfig,
    loading,
    getBorderRadius,
    branding: config.branding,
    theme: config.theme,
    content: config.content,
    links: config.links,
    features: config.features
  };

  return (
    <TenantConfigContext.Provider value={value}>
      {children}
    </TenantConfigContext.Provider>
  );
};

export const useTenantConfig = () => {
  const context = useContext(TenantConfigContext);
  if (!context) {
    throw new Error('useTenantConfig must be used within TenantConfigProvider');
  }
  return context;
};
