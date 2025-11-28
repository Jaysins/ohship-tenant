import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BankTransferPayment from './BankTransferPayment';
import VirtualAccountPayment from './VirtualAccountPayment';
import CardPayment from './CardPayment';
import GenericPayment from './GenericPayment';

const PaymentProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    paymentId,
    transactionData,
    shipment,
    selectedMethod,
    checkoutExpiresAt,
    checkoutValidDuration
  } = location.state || {};

  // Redirect if no required data
  useEffect(() => {
    if (!transactionData || !paymentId || !shipment) {
      navigate('/shipments');
    }
  }, [transactionData, paymentId, shipment, navigate]);

  if (!transactionData || !paymentId) {
    return null;
  }

  const paymentMethod = transactionData.payment_method;
  const pageType = transactionData.page; // 'redirect' or 'upload_proof'

  // Common props to pass to all payment screens
  const commonProps = {
    paymentId,
    transactionData,
    shipment,
    selectedMethod,
    checkoutExpiresAt,
    checkoutValidDuration
  };

  // Route to appropriate payment screen based on page type and payment method
  const renderPaymentScreen = () => {
    // If page type is 'upload_proof', route to bank transfer (manual upload)
    if (pageType === 'upload_proof') {
      return <BankTransferPayment {...commonProps} />;
    }

    // If page type is 'redirect', use automatic polling (virtual account)
    if (pageType === 'redirect') {
      return <VirtualAccountPayment {...commonProps} />;
    }

    // Fallback: Route based on payment method
    switch (paymentMethod) {
      case 'bank_transfer':
      case 'manual_bank':
        return <BankTransferPayment {...commonProps} />;

      case 'virtual_account':
        return <VirtualAccountPayment {...commonProps} />;

      case 'card':
        return <CardPayment {...commonProps} />;

      default:
        return <GenericPayment {...commonProps} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {renderPaymentScreen()}
    </div>
  );
};

export default PaymentProcessor;
