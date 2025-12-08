import api from '../utils/api';

/**
 * Theme Service
 * Handles theme configuration with efficient caching and version checking
 */

const CACHE_KEY = 'themeConfig';
const CACHE_VERSION_KEY = 'themeConfigVersion';
const CACHE_TIMESTAMP_KEY = 'themeConfigTimestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Check if cached theme is still fresh (less than 30 minutes old)
 * @returns {boolean}
 */
const isCacheFresh = () => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const age = Date.now() - parseInt(timestamp, 10);
  return age < CACHE_DURATION;
};

/**
 * Get cached theme configuration
 * @returns {Object|null}
 */
const getCachedTheme = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached theme:', error);
    return null;
  }
};

/**
 * Get cached version number
 * @returns {number|null}
 */
const getCachedVersion = () => {
  try {
    const version = localStorage.getItem(CACHE_VERSION_KEY);
    return version ? parseInt(version, 10) : null;
  } catch (error) {
    console.error('Error reading cached version:', error);
    return null;
  }
};

/**
 * Save theme to cache with timestamp and version
 * @param {Object} themeConfig - Full theme configuration
 * @param {number} version - Theme version number
 */
const saveToCache = (themeConfig, version) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(themeConfig));
    localStorage.setItem(CACHE_VERSION_KEY, version.toString());
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving theme to cache:', error);
  }
};

/**
 * Update cache timestamp without changing theme data
 * Used when version hasn't changed
 */
const refreshCacheTimestamp = () => {
  try {
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error refreshing cache timestamp:', error);
  }
};

/**
 * Fetch current theme version from API
 * @returns {Promise<{version: number, updated_at: string}>}
 */
export const getThemeVersion = async () => {
  try {
    const response = await api.get('/theme-config/version/');

    if (response.status === 'success' && response.data) {
      return {
        version: response.data.version,
        updated_at: response.data.updated_at
      };
    }

    throw new Error(response.message || 'Failed to fetch theme version');
  } catch (error) {
    console.error('Error fetching theme version:', error);
    throw error;
  }
};

/**
 * Fetch full theme configuration from API
 * @returns {Promise<Object>}
 */
export const getFullThemeConfig = async () => {
  try {
    const response = await api.get('/theme-config/');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch theme configuration');
  } catch (error) {
    console.error('Error fetching theme configuration:', error);
    throw error;
  }
};

/**
 * Transform API theme response to match app structure
 * The API returns flat theme properties, we need to add background/text/border structure
 * @param {Object} apiTheme - Theme object from API
 * @returns {Object} Transformed theme object
 */
const transformThemeData = (apiTheme) => {
  return {
    ...apiTheme,
    // Add background structure if not present
    background: apiTheme.background || {
      page: '#f8fafc',
      card: '#ffffff',
      subtle: '#f1f5f9'
    },
    // Add text structure if not present
    text: apiTheme.text || {
      primary: '#0f172a',
      secondary: '#64748b',
      muted: '#94a3b8'
    },
    // Add border structure if not present
    border: apiTheme.border || {
      color: '#e2e8f0',
      radius: apiTheme.border_radius || 'lg'
    }
  };
};

/**
 * Main function to get theme configuration with caching
 * Implements the efficient version-check flow:
 * 1. Check if cache is fresh -> use it
 * 2. If cache is stale, check version
 * 3. If version unchanged -> refresh timestamp and use cache
 * 4. If version changed -> fetch full theme and update cache
 *
 * @returns {Promise<Object>} Theme configuration
 */
export const getThemeConfig = async () => {
  // Step 1: Check if we have fresh cache
  const cachedTheme = getCachedTheme();
  const cachedVersion = getCachedVersion();

  if (cachedTheme && isCacheFresh()) {
    console.log('✓ Using fresh cached theme (< 30 min old)');
    return cachedTheme;
  }

  console.log('Cache is stale or missing, checking version...');

  try {
    // Step 2: Get current version from API (lightweight request)
    const { version: currentVersion } = await getThemeVersion();
    console.log(`Current version: ${currentVersion}, Cached version: ${cachedVersion}`);

    // Step 3: Compare versions
    if (cachedTheme && cachedVersion === currentVersion) {
      console.log('✓ Version unchanged, refreshing cache timestamp');
      refreshCacheTimestamp();
      return cachedTheme;
    }

    // Step 4: Version changed or no cache, fetch full theme
    console.log('Version changed or no cache, fetching full theme...');
    const fullTheme = await getFullThemeConfig();

    // Transform theme data to match app structure
    const transformedTheme = {
      ...fullTheme,
      theme: transformThemeData(fullTheme.theme)
    };

    // Step 5: Save to cache
    saveToCache(transformedTheme, currentVersion);
    console.log('✓ Theme fetched and cached successfully');

    return transformedTheme;
  } catch (error) {
    console.error('Error in getThemeConfig:', error);

    // Fallback to cached theme if available, even if stale
    if (cachedTheme) {
      console.log('Using stale cache as fallback due to error');
      return cachedTheme;
    }

    // Last resort: return null and let the app use defaults
    throw error;
  }
};

/**
 * Clear theme cache
 * Useful for debugging or forcing a fresh fetch
 */
export const clearThemeCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('Theme cache cleared');
  } catch (error) {
    console.error('Error clearing theme cache:', error);
  }
};

/**
 * Get cache info for debugging
 * @returns {Object} Cache information
 */
export const getCacheInfo = () => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const version = getCachedVersion();
  const age = timestamp ? Date.now() - parseInt(timestamp, 10) : null;

  return {
    hasCache: !!getCachedTheme(),
    version,
    age: age ? Math.floor(age / 1000) : null, // in seconds
    isFresh: isCacheFresh(),
    expiresIn: age ? Math.max(0, Math.floor((CACHE_DURATION - age) / 1000)) : null // in seconds
  };
};
