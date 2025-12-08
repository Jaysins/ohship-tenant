import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

/**
 * PaymentFailed Page
 * Payment failure notification
 */
const PaymentFailed = () => {
  const navigate = useNavigate();
  const { shipmentId } = useParams();
  const { theme, content } = useTenantConfig();

  const handleTryAgain = () => {
    navigate(`/quote/payment/${shipmentId}`);
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    const supportUrl = content?.links?.support_url || 'mailto:support@example.com';
    window.location.href = supportUrl;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <div className="p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="p-6 rounded-full"
              style={{ backgroundColor: `${theme.danger_color}20` }}
            >
              <XCircle size={64} style={{ color: theme.danger_color }} />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-3" style={{ color: theme.text.primary }}>
            Payment Failed
          </h1>

          <p className="text-lg mb-4" style={{ color: theme.text.secondary }}>
            We couldn't process your payment at this time
          </p>

          <p className="text-sm mb-8" style={{ color: theme.text.muted }}>
            This could be due to insufficient funds, incorrect payment details, or a temporary issue with the payment gateway.
          </p>

          {/* Shipment Code if available */}
          {shipmentId && (
            <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: theme.background.subtle }}>
              <p className="text-sm mb-1" style={{ color: theme.text.muted }}>
                Shipment ID
              </p>
              <p className="font-mono font-semibold" style={{ color: theme.text.primary }}>
                {shipmentId}
              </p>
              <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                Your shipment has been created but payment is pending
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleTryAgain}
              className="w-full"
            >
              <RefreshCw size={18} />
              <span className="ml-2">Try Payment Again</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="w-full"
            >
              Contact Support
            </Button>

            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="w-full"
            >
              <ArrowLeft size={18} />
              <span className="ml-2">Back to Dashboard</span>
            </Button>
          </div>

          {/* Help Information */}
          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${theme.border.color}` }}>
            <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
              Common Solutions
            </h3>
            <ul className="text-sm space-y-2 text-left" style={{ color: theme.text.secondary }}>
              <li className="flex gap-2">
                <span style={{ color: theme.primary_color }}>•</span>
                <span>Check that you have sufficient funds in your account</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: theme.primary_color }}>•</span>
                <span>Verify your payment details are correct</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: theme.primary_color }}>•</span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: theme.primary_color }}>•</span>
                <span>Contact your bank to ensure the transaction is not blocked</span>
              </li>
            </ul>
          </div>

          {/* Support Contact */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${theme.info_color}15` }}>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Still having issues?{' '}
              <a
                href={content?.links?.support_url || 'mailto:support@example.com'}
                style={{ color: theme.primary_color }}
                className="font-medium hover:underline"
              >
                Contact our support team
              </a>
              {' '}for assistance
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentFailed;
