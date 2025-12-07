import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Tracking = () => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();

    const code = trackingCode.trim();

    if (!code) {
      setError('Please enter a tracking number');
      return;
    }

    // Clear error and navigate to tracking detail page
    setError('');
    navigate(`/tracking/${code}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setTrackingCode(value);
    if (error) setError('');
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${theme.primary_color}1A`
            }}
          >
            <Search size={48} style={{ color: theme.primary_color }} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: theme.text.primary }}>
            Track Your Shipment
          </h1>
          <p className="mt-3 text-lg" style={{ color: theme.text.secondary }}>
            Enter your tracking number to get real-time updates
          </p>
        </div>

        {/* Search Form */}
        <Card padding="default">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={trackingCode}
                onChange={handleInputChange}
                placeholder="Enter tracking number (e.g., SH13651729)"
                className={`w-full h-14 text-lg pr-4 pl-4 border ${getBorderRadius()} outline-none`}
                style={{
                  backgroundColor: theme.background.card,
                  color: theme.text.primary,
                  borderColor: error ? theme.danger_color : theme.border.color
                }}
                onFocus={(e) => {
                  e.target.style.outline = `2px solid ${error ? theme.danger_color : theme.primary_color}`;
                  e.target.style.outlineOffset = '0px';
                  e.target.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = error ? theme.danger_color : theme.border.color;
                }}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: theme.danger_color }}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!trackingCode.trim()}
              leftIcon={<Search size={18} />}
            >
              Track Shipment
            </Button>
          </form>
        </Card>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <p className="text-sm" style={{ color: theme.text.muted }}>
            Track your shipment using the tracking number provided in your shipment confirmation email.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <button
              onClick={() => navigate('/shipments')}
              className="font-medium hover:underline"
              style={{ color: theme.primary_color }}
            >
              View All Shipments
            </button>
            <a
              href="mailto:support@ohship.com"
              className="font-medium hover:underline"
              style={{ color: theme.primary_color }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
