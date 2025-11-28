import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Building2, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getPaymentMethods, initiatePayment } from '../../services/paymentService';
import { updateShipment } from '../../services/shipmentService';
import { getPrimaryWallet } from '../../services/walletService';
import { extractErrorMessage } from '../../utils/errorHandler';

const PaymentMethodSelection = () => {
  const { shipment_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const shipment = location.state?.shipment;
  const selectedQuote = location.state?.selectedQuote;

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [payerInfo, setPayerInfo] = useState({
    payer_name: '',
    payer_email: '',
    payer_phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [priceChangeData, setPriceChangeData] = useState(null);
  const [newSelectedQuote, setNewSelectedQuote] = useState(null);

  useEffect(() => {
    if (!shipment) {
      // If no shipment in state, redirect to shipments list
      navigate('/shipments');
      return;
    }
    loadPaymentMethods();
    loadWallet();

    // Pre-fill payer info based on user role
    const defaultPayerInfo = getDefaultPayerInfo();
    setPayerInfo(defaultPayerInfo);
  }, [shipment, navigate]);

  const loadWallet = async () => {
    try {
      const primaryWallet = await getPrimaryWallet();
      setWallet(primaryWallet);
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

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

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to load payment methods. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (providerCode) => {
    switch (providerCode) {
      case 'card':
        return <CreditCard size={32} className="text-indigo-600" />;
      case 'manual_bank':
      case 'bank_transfer':
        return <Building2 size={32} className="text-indigo-600" />;
      case 'virtual_account':
        return <Wallet size={32} className="text-indigo-600" />;
      default:
        return <CreditCard size={32} className="text-indigo-600" />;
    }
  };

  const handleContinueToPayment = async () => {
    // Validate payment method selection
    if (!selectedMethod) {
      setError('Please select a payment method');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate payer info
    if (!payerInfo.payer_name || !payerInfo.payer_email || !payerInfo.payer_phone) {
      setError('Please fill in all payer information');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      // Update shipment with selected payment method
      const updatedShipment = await updateShipment(shipment_id, {
        selected_payment_method: selectedMethod.id
      });

      // Initiate payment with payer info
      const paymentResponse = await initiatePayment(updatedShipment.payment_id, payerInfo);

      // Navigate to payment processing screen
      navigate(`/shipments/${shipment_id}/payment/process`, {
        state: {
          paymentId: updatedShipment.payment_id,
          transactionData: paymentResponse.transaction_data,
          shipment: updatedShipment,
          selectedMethod,
          checkoutExpiresAt: paymentResponse.checkout_expires_at,
          checkoutValidDuration: paymentResponse.checkout_valid_duration_minutes
        }
      });
    } catch (err) {
      // Check if it's a price change error
      if (err.code === 'QUOTE_PRICE_CHANGED') {
        setPriceChangeData(err.data);
        setShowPriceChangeModal(true);
      } else {
        const errorMessage = extractErrorMessage(err, 'Failed to process payment. Please try again.');
        setError(errorMessage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setUpdating(false);
    }
  };

  const updatePayerInfo = (field, value) => {
    setPayerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleQuoteSelection = (quote) => {
    setNewSelectedQuote(quote);
  };

  const handleAcceptNewQuote = async () => {
    if (!newSelectedQuote) {
      setError('Please select a new quote');
      return;
    }

    setShowPriceChangeModal(false);
    setUpdating(true);

    try {
      // Update shipment with new quote and payment method
      const updatedShipment = await updateShipment(shipment_id, {
        quote_id: newSelectedQuote.quote_id,
        selected_payment_method: selectedMethod.id
      });

      // Initiate payment with payer info
      const paymentResponse = await initiatePayment(updatedShipment.payment_id, payerInfo);

      // Navigate to payment processing screen
      navigate(`/shipments/${shipment_id}/payment/process`, {
        state: {
          paymentId: updatedShipment.payment_id,
          transactionData: paymentResponse.transaction_data,
          shipment: { ...updatedShipment, final_price: newSelectedQuote.total_amount },
          selectedMethod,
          checkoutExpiresAt: paymentResponse.checkout_expires_at,
          checkoutValidDuration: paymentResponse.checkout_valid_duration_minutes
        }
      });
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to update shipment. Please try again.');
      setError(errorMessage);
      setShowPriceChangeModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="text-sm text-slate-600 mt-4">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Select Payment Method</h1>
        <p className="text-slate-600 mt-1">Choose how you'd like to pay for your shipment</p>
      </div>

      {/* Shipment Summary */}
      <Card title="Shipment Summary" padding="default">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Shipment Code:</span>
            <span className="font-medium text-slate-900">{shipment.code}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Amount:</span>
            <span className="text-lg font-bold text-indigo-600">
              {shipment.currency} {shipment.final_price.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Service:</span>
            <span className="font-medium text-slate-900">{shipment.carrier_name}</span>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Payment Methods */}
      <Card title="Payment Methods" padding="default">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-600">No payment methods available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method)}
                className={`relative p-6 border-2 rounded-lg transition-all duration-200 text-left ${
                  selectedMethod?.id === method.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {getPaymentMethodIcon(method.provider_code)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {method.payment_method?.name || method.provider_name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {method.provider_name}
                    </p>

                    {/* Show wallet balance if this is wallet payment */}
                    {method.provider_code === 'wallet' && wallet && (
                      <div className="mt-2 p-2 bg-indigo-50 rounded">
                        <p className="text-xs text-indigo-600 font-medium">
                          Balance: {wallet.currency} {parseFloat(wallet.balance).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        {wallet.balance < shipment.final_price && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertCircle size={12} className="text-orange-600" />
                            <span className="text-xs text-orange-600">Insufficient balance</span>
                          </div>
                        )}
                      </div>
                    )}

                    {method.is_verified && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    )}
                  </div>
                  {selectedMethod?.id === method.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 size={24} className="text-indigo-600" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
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

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/shipments')}
          disabled={updating}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleContinueToPayment}
          disabled={
            !selectedMethod ||
            !payerInfo.payer_name ||
            !payerInfo.payer_email ||
            !payerInfo.payer_phone ||
            updating
          }
          loading={updating}
        >
          {updating ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </div>

      {/* Price Change Modal */}
      {showPriceChangeModal && priceChangeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Shipping Rates Have Been Updated
              </h2>

              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  The shipping rates have changed since you created this shipment.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Previous Rate:</span>
                    <span className="font-bold text-slate-900 ml-2">
                      {shipment.currency} {priceChangeData.old_price.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Change:</span>
                    <span className={`font-bold ml-2 ${
                      priceChangeData.price_difference > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {priceChangeData.price_difference > 0 ? '+' : ''}
                      {shipment.currency} {priceChangeData.price_difference.toFixed(2)}
                      {' '}({priceChangeData.price_change_percentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Select a New Quote:
                </h3>
                <div className="space-y-3">
                  {priceChangeData.new_quotes.map((quote) => (
                    <button
                      key={quote.quote_id}
                      type="button"
                      onClick={() => handleQuoteSelection(quote)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        newSelectedQuote?.quote_id === quote.quote_id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-slate-900">{quote.display_name}</p>
                        <p className="text-lg font-bold text-slate-900">
                          {quote.currency} {quote.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600">{quote.carrier_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Estimated delivery: {quote.estimated_days} {quote.estimated_days === 1 ? 'day' : 'days'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPriceChangeModal(false);
                    setPriceChangeData(null);
                    setNewSelectedQuote(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAcceptNewQuote}
                  disabled={!newSelectedQuote || updating}
                  loading={updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Accept New Rate & Continue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
