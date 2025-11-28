import BankTransferPayment from './BankTransferPayment';

// Virtual Account payment flow is identical to Bank Transfer
// Both use virtual_account details from transaction_data
const VirtualAccountPayment = (props) => {
  return <BankTransferPayment {...props} />;
};

export default VirtualAccountPayment;
