import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { initiatePayment } from '../../services/paymentService';
import { extractErrorMessage } from '../../utils/errorHandler';

const PaymentConfirmation = () => {
  const { shipment_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const shipment = location.state?.shipment;
  const selectedMethod = location.state?.selectedMethod;
  const selectedQuote = location.state?.selectedQuote;
  console.log(shipment)
  const [payerInfo, setPayerInfo] = useState({
    payer_name: '',
    payer_email: '',
    payer_phone: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shipment || !selectedMethod) {
      // If no required data, redirect back
      navigate('/shipments');
      return;
    }

    // Pre-fill payer info based on user role
    const defaultPayerInfo = getDefaultPayerInfo();
    setPayerInfo(defaultPayerInfo);
  }, [shipment, selectedMethod, navigate]);

  const getDefaultPayerInfo = () => {
    if (!shipment) return { payer_name: '', payer_email: '', payer_phone: '' };

    // If user is a customer, use their info
    if (shipment.user?.role === 'customer') {
      return {
        payer_name: shipment.user.full_name || '',
        payer_email: shipment.user.email || '',
        payer_phone: shipment.user.phone || ''
      };
    }

    // Otherwise (owner/admin/staff), use origin address info
    return {
      payer_name: shipment.origin_address?.name || '',
      payer_email: shipment.origin_address?.email || '',
      payer_phone: shipment.origin_address?.phone || ''
    };
  };

  const handleProceedToPayment = async () => {
    // Validate payer info
    if (!payerInfo.payer_name || !payerInfo.payer_email || !payerInfo.payer_phone) {
      setError('Please fill in all payer information');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Initiate payment with payer info
      const paymentResponse = await initiatePayment(shipment.payment_id, payerInfo);

      // Navigate to payment processing screen
      navigate(`/shipments/${shipment_id}/payment/process`, {
        state: {
          paymentId: shipment.payment_id,
          transactionData: paymentResponse.transaction_data,
          shipment,
          selectedMethod,
          checkoutExpiresAt: paymentResponse.checkout_expires_at,
          checkoutValidDuration: paymentResponse.checkout_valid_duration_minutes
        }
      });
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to initiate payment. Please try again.');
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setProcessing(false);
    }
  };

  const updatePayerInfo = (field, value) => {
    setPayerInfo(prev => ({ ...prev, [field]: value }));
  };

  if (!shipment || !selectedMethod) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirm Payment Details</h1>
        <p className="text-slate-600 mt-1">Review and confirm your payment information</p>
      </div>

      {/* Shipment Summary */}
      <Card title="Shipment Summary" padding="default">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Shipment Code:</span>
            <span className="font-bold text-slate-900">{shipment.code}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Carrier:</span>
            <span className="font-medium text-slate-900">{shipment.carrier_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Service:</span>
            <span className="font-medium text-slate-900">{shipment.service_type}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-sm text-slate-600">Amount to Pay:</span>
            <span className="text-xl font-bold text-indigo-600">
              {shipment.currency} {shipment.final_price.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Payment Method:</span>
            <span className="font-medium text-slate-900">{selectedMethod.payment_method?.name || selectedMethod.provider_name}</span>
          </div>
        </div>
      </Card>

      {/* Route Information */}
      <Card title="Route" padding="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 mb-2">From</p>
            <p className="text-sm font-medium text-slate-900">
              {shipment.origin_address.city}, {shipment.origin_address.state}
            </p>
            <p className="text-xs text-slate-600">{shipment.origin_address.country}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 mb-2">To</p>
            <p className="text-sm font-medium text-slate-900">
              {shipment.destination_address.city}, {shipment.destination_address.state}
            </p>
            <p className="text-xs text-slate-600">{shipment.destination_address.country}</p>
          </div>
        </div>
      </Card>

      {/* Payer Information */}
      <Card title="Payer Information" padding="default">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Please confirm or update the payer details below
          </p>

          <Input
            label="Full Name"
            value={payerInfo.payer_name}
            onChange={(e) => updatePayerInfo('payer_name', e.target.value)}
            placeholder="Enter payer's full name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={payerInfo.payer_email}
            onChange={(e) => updatePayerInfo('payer_email', e.target.value)}
            placeholder="Enter payer's email"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={payerInfo.payer_phone}
            onChange={(e) => updatePayerInfo('payer_phone', e.target.value)}
            placeholder="Enter payer's phone number"
            required
          />
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/shipments/${shipment_id}/payment/select-method`, {
            state: { shipment, selectedQuote }
          })}
          disabled={processing}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleProceedToPayment}
          disabled={
            !payerInfo.payer_name ||
            !payerInfo.payer_email ||
            !payerInfo.payer_phone ||
            processing
          }
          loading={processing}
        >
          {processing ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
