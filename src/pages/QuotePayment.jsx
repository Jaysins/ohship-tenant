import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import { getShipmentById, updateShipment } from '../services/shipmentService';
import { getPaymentMethods, initiatePayment } from '../services/paymentService';
import { extractErrorMessage } from '../utils/errorHandler';
import { isValidEmail, isValidPhoneNumber, isRequired } from '../utils/validation';
import { formatCurrency } from '../utils/format';
import { removeSessionItem, StorageKey } from '../utils/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import Alert from '../components/ui/Alert';
import AddressCard from '../components/ui/AddressCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CreditCard, Building2, Package, ArrowLeft } from 'lucide-react';

/**
 * QuotePayment Page
 * Step 4: Payment method selection and initiation
 */
const QuotePayment = () => {
  const navigate = useNavigate();
  const { shipmentId } = useParams();
  const { theme, getBorderRadius } = useTenantConfig();

  // Shipment data
  const [shipment, setShipment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Payer information
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');

  // Selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [shipmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load shipment details
      const shipmentData = await getShipmentById(shipmentId);

      // Transform shipment data to include pricing object
      const transformedShipment = {
        ...shipmentData,
        pricing: {
          base_cost: shipmentData.rate_base_price || 0,
          insurance_fee: shipmentData.rate_adjustments?.find(adj => adj.type === 'insurance_fee')?.amount || 0,
          adjustments: shipmentData.rate_adjustments?.filter(adj => adj.type !== 'insurance_fee').reduce((sum, adj) => sum + adj.amount, 0) || 0,
          discounts: shipmentData.rate_discounts?.reduce((sum, disc) => sum + Math.abs(disc.amount), 0) || 0,
          total: shipmentData.final_price || 0,
        }
      };

      setShipment(transformedShipment);

      // Pre-fill payer info from sender
      if (shipmentData.origin_address) {
        setPayerName(shipmentData.origin_address.name || '');
        setPayerEmail(shipmentData.origin_address.email || '');
        setPayerPhone(shipmentData.origin_address.phone || '');
      }

      // Load payment methods
      const methodsData = await getPaymentMethods();

      // Transform payment methods to flatten the structure
      const transformedMethods = (methodsData || []).map(method => ({
        id: method.id,  // Tenant payment method ID (to be sent as selected_payment_method)
        name: method.payment_method.name,
        description: method.payment_method.description,
        type: method.payment_method.code,  // e.g., "bank_transfer"
        code: method.payment_method.code,
        is_enabled: method.is_enabled,
        provider_code: method.provider_code,
        provider_name: method.provider_name,
      }));

      setPaymentMethods(transformedMethods);

      // Pre-select first payment method
      if (transformedMethods && transformedMethods.length > 0) {
        setSelectedPaymentMethod(transformedMethods[0].id);
      }
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError(extractErrorMessage(err, 'Failed to load payment information'));
    } finally {
      setLoading(false);
    }
  };

  const validatePayerInfo = () => {
    if (!isRequired(payerName)) {
      setError('Please enter payer name');
      return false;
    }

    if (!isValidEmail(payerEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isValidPhoneNumber(payerPhone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    return true;
  };

  const handleProceedToPayment = async () => {
    setError(null);

    if (!validatePayerInfo()) {
      return;
    }

    try {
      setProcessing(true);

      // Update shipment with payment method
      const updatedShipment = await updateShipment(shipmentId, {
        selected_payment_method: selectedPaymentMethod,
      });

      // Extract payment_id from the update response
      const paymentId = updatedShipment.payment_id;

      if (!paymentId) {
        setError('Payment ID not found. Please try again.');
        return;
      }

      // Initiate payment
      const paymentData = {
        payer_name: payerName,
        payer_email: payerEmail,
        payer_phone: payerPhone,
      };

      const paymentResult = await initiatePayment(paymentId, paymentData);

      // Check payment method type
      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);

      if (selectedMethod?.type === 'bank_transfer') {
        // Transform transaction data for BankTransferDetails page
        const transactionData = {
          id: paymentResult.transaction_id,  // Use transaction_id for uploading proof
          bank_details: paymentResult.transaction_data?.virtual_account || {},
          ...paymentResult.transaction_data,  // Include other transaction data
        };

        // Navigate to bank transfer details page
        navigate(`/quote/payment/${shipmentId}/bank-transfer`, {
          state: { transaction: transactionData }
        });
      } else if (selectedMethod?.type === 'card' || selectedMethod?.type === 'gateway') {
        // Redirect to payment gateway
        if (paymentResult.payment_url) {
          window.location.href = paymentResult.payment_url;
        } else {
          setError('Payment URL not provided');
        }
      } else {
        setError('Unsupported payment method type');
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(extractErrorMessage(err, 'Failed to initiate payment. Please try again.'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert
          variant="error"
          title="Shipment Not Found"
          message="The requested shipment could not be found."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress indicator */}
      <ProgressBar
        currentStep={4}
        totalSteps={4}
        stepLabels={['Route & Package', 'Select Quote', 'Details & Review', 'Payment']}
        className="mb-6"
      />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/quote/checkout?mode=review')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
          Payment
        </h1>
        <p style={{ color: theme.text.secondary }}>
          Complete your payment to confirm your shipment
        </p>
      </div>

      {error && (
        <Alert
          variant="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipment info */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Shipment Details
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Package size={16} style={{ color: theme.text.muted }} />
                  <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                    Shipment Code: <span style={{ color: theme.text.primary }}>{shipment.code}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard size={16} style={{ color: theme.text.muted }} />
                  <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                    Carrier: <span style={{ color: theme.text.primary }}>{shipment.carrier_name}</span>
                  </span>
                </div>

                {shipment.service_type && (
                  <div className="text-sm" style={{ color: theme.text.secondary }}>
                    Service: <span style={{ color: theme.text.primary }}>{shipment.service_type}</span>
                  </div>
                )}
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AddressCard
                  title="From"
                  address={shipment.origin_address}
                  variant="origin"
                />
                <AddressCard
                  title="To"
                  address={shipment.destination_address}
                  variant="destination"
                />
              </div>
            </div>
          </Card>

          {/* Payer Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Payer Information
              </h2>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 rounded cursor-pointer border transition-all ${getBorderRadius()}`}
                    style={{
                      borderColor: selectedPaymentMethod === method.id ? theme.primary_color : theme.border.color,
                      backgroundColor: selectedPaymentMethod === method.id ? `${theme.primary_color}10` : theme.background.card,
                    }}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1"
                      style={{ accentColor: theme.primary_color }}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {method.type === 'bank_transfer' ? (
                          <Building2 size={20} style={{ color: theme.text.primary }} />
                        ) : (
                          <CreditCard size={20} style={{ color: theme.text.primary }} />
                        )}
                        <span className="font-semibold" style={{ color: theme.text.primary }}>
                          {method.name}
                        </span>
                      </div>

                      {method.description && (
                        <p className="text-sm" style={{ color: theme.text.muted }}>
                          {method.description}
                        </p>
                      )}
                    </div>

                    {method.logo_url && (
                      <img
                        src={method.logo_url}
                        alt={method.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Price Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: theme.text.secondary }}>
                    Shipping Cost
                  </span>
                  <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                    {formatCurrency(shipment.pricing?.base_cost || 0, shipment.currency)}
                  </span>
                </div>

                {shipment.pricing?.insurance_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      Insurance
                    </span>
                    <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {formatCurrency(shipment.pricing.insurance_fee, shipment.currency)}
                    </span>
                  </div>
                )}

                {shipment.pricing?.adjustments !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      Adjustments
                    </span>
                    <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {formatCurrency(shipment.pricing.adjustments, shipment.currency)}
                    </span>
                  </div>
                )}

                {shipment.pricing?.discounts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: theme.success_color }}>
                      Discount
                    </span>
                    <span className="text-sm font-medium" style={{ color: theme.success_color }}>
                      -{formatCurrency(shipment.pricing.discounts, shipment.currency)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 mb-6" style={{ borderTop: `2px solid ${theme.border.color}` }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold" style={{ color: theme.text.primary }}>
                    Total
                  </span>
                  <span className="text-2xl font-bold" style={{ color: theme.primary_color }}>
                    {formatCurrency(shipment.pricing?.total || 0, shipment.currency)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleProceedToPayment}
                disabled={processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotePayment;
