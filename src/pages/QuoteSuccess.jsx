import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import { getShipmentById } from '../services/shipmentService';
import { clearQuoteFlowStorage } from '../utils/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, Package, ArrowRight, Copy } from 'lucide-react';

/**
 * QuoteSuccess Page
 * Shipment creation success confirmation
 */
const QuoteSuccess = () => {
  const navigate = useNavigate();
  const { shipmentId } = useParams();
  const { theme, content } = useTenantConfig();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadShipment();
    // Clear quote flow storage since process is complete
    clearQuoteFlowStorage();
  }, [shipmentId]);

  const loadShipment = async () => {
    try {
      const data = await getShipmentById(shipmentId);
      setShipment(data);
    } catch (err) {
      console.error('Error loading shipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (shipment?.code) {
      navigator.clipboard.writeText(shipment.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackShipment = () => {
    if (shipment?.code) {
      window.open(`/tracking/${shipment.code}`, '_blank');
    }
  };

  const handleCreateNewShipment = () => {
    navigate('/quote/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="p-6 rounded-full"
              style={{ backgroundColor: `${theme.success_color}20` }}
            >
              <CheckCircle size={64} style={{ color: theme.success_color }} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-3" style={{ color: theme.text.primary }}>
            Shipment Created Successfully!
          </h1>

          <p className="text-lg mb-8" style={{ color: theme.text.secondary }}>
            {content?.shipment_success_message || 'Your shipment has been created and is ready for pickup'}
          </p>

          {/* Shipment Code */}
          {shipment?.code && (
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.muted }}>
                SHIPMENT TRACKING CODE
              </label>
              <div
                className="flex items-center justify-center gap-3 p-4 rounded-lg"
                style={{
                  backgroundColor: theme.background.subtle,
                  border: `2px solid ${theme.primary_color}`,
                }}
              >
                <Package size={24} style={{ color: theme.primary_color }} />
                <span className="text-2xl font-mono font-bold" style={{ color: theme.text.primary }}>
                  {shipment.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded transition-all"
                  style={{
                    backgroundColor: copied ? theme.success_color : theme.primary_color,
                    color: '#ffffff',
                  }}
                >
                  {copied ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Copy size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                Save this code to track your shipment
              </p>
            </div>
          )}

          {/* Payment Status */}
          {shipment?.payment_status && (
            <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: theme.background.subtle }}>
              <p className="text-sm mb-1" style={{ color: theme.text.muted }}>
                Payment Status
              </p>
              <p className="font-semibold capitalize" style={{ color: theme.text.primary }}>
                {shipment.payment_status.replace('_', ' ')}
              </p>
              {shipment.payment_status === 'pending' && (
                <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                  We'll notify you once your payment is confirmed
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleTrackShipment}
              className="w-full"
            >
              Track Shipment
              <ArrowRight size={18} className="ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={handleCreateNewShipment}
              className="w-full"
            >
              Create New Shipment
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${theme.border.color}` }}>
            <p className="text-sm mb-2" style={{ color: theme.text.muted }}>
              {content?.support_text || 'Need help?'}
            </p>
            <a
              href={content?.links?.support_url || 'mailto:support@example.com'}
              style={{ color: theme.primary_color }}
              className="font-medium hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuoteSuccess;
