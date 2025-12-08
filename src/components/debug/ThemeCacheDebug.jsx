import { useState, useEffect } from 'react';
import { getCacheInfo, clearThemeCache } from '../../services/themeService';
import { useTenantConfig } from '../../context/TenantConfigContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * Debug component to visualize theme caching
 * Only use in development - remove or hide in production
 */
const ThemeCacheDebug = () => {
  const { theme, reloadTheme, loading } = useTenantConfig();
  const [cacheInfo, setCacheInfo] = useState(null);

  const updateCacheInfo = () => {
    setCacheInfo(getCacheInfo());
  };

  useEffect(() => {
    updateCacheInfo();
    // Update every second to show live countdown
    const interval = setInterval(updateCacheInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    clearThemeCache();
    updateCacheInfo();
    alert('Cache cleared! Reload the page to fetch fresh theme.');
  };

  const handleReload = () => {
    reloadTheme();
    setTimeout(updateCacheInfo, 100);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!cacheInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card padding="default">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: theme.text.primary }}>
              Theme Cache Debug
            </h3>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: cacheInfo.isFresh ? theme.success_color : theme.warning_color
              }}
            />
          </div>

          <div className="space-y-2 text-xs" style={{ color: theme.text.secondary }}>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-mono font-semibold" style={{ color: theme.text.primary }}>
                {cacheInfo.hasCache ? (cacheInfo.isFresh ? 'Fresh' : 'Stale') : 'No Cache'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Version:</span>
              <span className="font-mono font-semibold" style={{ color: theme.text.primary }}>
                {cacheInfo.version || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Cache Age:</span>
              <span className="font-mono font-semibold" style={{ color: theme.text.primary }}>
                {formatTime(cacheInfo.age)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Expires In:</span>
              <span
                className="font-mono font-semibold"
                style={{
                  color: cacheInfo.expiresIn < 300 ? theme.warning_color : theme.text.primary
                }}
              >
                {formatTime(cacheInfo.expiresIn)}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2" style={{ borderTop: `1px solid ${theme.border.color}` }}>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleReload}
              loading={loading}
            >
              Reload Theme
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>
          </div>

          <div className="text-[10px] opacity-70" style={{ color: theme.text.muted }}>
            Cache refreshes every 30 minutes or when version changes
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThemeCacheDebug;
