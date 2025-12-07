import { createContext, useContext, useState, useEffect } from 'react';
import { getThemeConfig, getCacheInfo } from '../services/themeService';

const TenantConfigContext = createContext();

// Default configuration (fallback only)
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
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTenantConfig();
  }, []);

  const loadTenantConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log cache info for debugging
      const cacheInfo = getCacheInfo();
      console.log('Theme cache info:', cacheInfo);

      // Get theme config with efficient caching
      const themeData = await getThemeConfig();

      // Merge with default config to ensure all fields exist
      const mergedConfig = {
        branding: { ...defaultConfig.branding, ...themeData.branding },
        theme: { ...defaultConfig.theme, ...themeData.theme },
        content: { ...defaultConfig.content, ...themeData.content },
        links: { ...defaultConfig.links, ...themeData.links },
        features: { ...defaultConfig.features, ...themeData.features }
      };

      setConfig(mergedConfig);
      applyThemeToDOM(mergedConfig.theme);
      applyBrandingToDOM(mergedConfig.branding);

      console.log('Theme loaded successfully:', {
        branding: mergedConfig.branding.name,
        primaryColor: mergedConfig.theme.primary_color,
        version: themeData.version,
        cachedAt: themeData.updated_at
      });
    } catch (error) {
      console.error('Error loading tenant config:', error);
      setError(error.message || 'Failed to load theme configuration');

      // Fallback to default config
      console.log('Using default configuration as fallback');
      setConfig(defaultConfig);
      applyThemeToDOM(defaultConfig.theme);
      applyBrandingToDOM(defaultConfig.branding);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToDOM = (theme) => {
    const root = document.documentElement;

    // Apply CSS custom properties for easy access
    root.style.setProperty('--color-primary', theme.primary_color);
    root.style.setProperty('--color-secondary', theme.secondary_color);
    root.style.setProperty('--color-success', theme.success_color);
    root.style.setProperty('--color-warning', theme.warning_color);
    root.style.setProperty('--color-danger', theme.danger_color);
    root.style.setProperty('--color-info', theme.info_color);

    // Background colors
    root.style.setProperty('--bg-page', theme.background?.page || '#f8fafc');
    root.style.setProperty('--bg-card', theme.background?.card || '#ffffff');
    root.style.setProperty('--bg-subtle', theme.background?.subtle || '#f1f5f9');

    // Text colors
    root.style.setProperty('--text-primary', theme.text?.primary || '#0f172a');
    root.style.setProperty('--text-secondary', theme.text?.secondary || '#64748b');
    root.style.setProperty('--text-muted', theme.text?.muted || '#94a3b8');

    // Border
    root.style.setProperty('--border-color', theme.border?.color || '#e2e8f0');
    root.style.setProperty('--border-radius', theme.border?.radius || 'lg');

    // Apply font family to body
    const fontFamily = theme.font_family || 'Inter';
    if (fontFamily) {
      // Set CSS custom property
      root.style.setProperty('--font-family', fontFamily);
      // Actually apply to body
      document.body.style.fontFamily = `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
    }

    // Load custom font from URL if provided
    if (theme.font_url) {
      const existingFont = document.querySelector(`link[href="${theme.font_url}"]`);
      if (!existingFont) {
        const link = document.createElement('link');
        link.href = theme.font_url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    } else if (fontFamily) {
      // If no custom URL but font_family is specified, try to load from Google Fonts
      // Common fonts that should be loaded from Google Fonts
      const googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Raleway'];

      if (googleFonts.includes(fontFamily)) {
        const fontWeights = '300;400;500;600;700;800;900';
        const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@${fontWeights}&display=swap`;

        // Check if this font isn't already loaded
        const existingGoogleFont = document.querySelector(`link[href*="fonts.googleapis.com"][href*="${fontFamily.replace(' ', '+')}"]`);
        if (!existingGoogleFont) {
          const link = document.createElement('link');
          link.href = googleFontUrl;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
          console.log(`Loading Google Font: ${fontFamily}`);
        }
      }
    }
  };

  const applyBrandingToDOM = (branding) => {
    // Update favicon
    if (branding.favicon_url) {
      let favicon = document.querySelector("link[rel*='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = branding.favicon_url;
    }

    // Update document title with brand name
    if (branding.name) {
      document.title = `${branding.name} - Shipping Portal`;
    }
  };

  /**
   * Reload theme configuration
   * Useful for forcing a fresh fetch or after manual cache clear
   */
  const reloadTheme = () => {
    loadTenantConfig();
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
    loading,
    error,
    reloadTheme,
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
