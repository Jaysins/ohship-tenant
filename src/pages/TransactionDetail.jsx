import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpCircle, ArrowDownCircle, Calendar, User,
  CheckCircle2, XCircle, Clock, FileText, DollarSign, CreditCard,
  Package, ImageIcon, Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getTransactionById } from '../services/transactionService';
import { extractErrorMessage } from '../utils/errorHandler';

const TransactionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactionById(id);
      setTransaction(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to load transaction');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'failed':
        return <XCircle size={24} className="text-red-600" />;
      case 'attempted':
      case 'pending':
        return <Clock size={24} className="text-orange-600" />;
      default:
        return <Clock size={24} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'attempted':
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      payment: 'Payment',
      top_up: 'Top Up',
      settlement: 'Settlement',
      refund: 'Refund',
      withdrawal: 'Withdrawal'
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      wallet: 'Wallet',
      bank_transfer: 'Bank Transfer',
      card: 'Card',
      virtual_account: 'Virtual Account'
    };
    return labels[method] || method;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, currency) => {
    return `${currency} ${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/transactions')}
        >
          Back to Transactions
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error || 'Transaction not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/transactions')}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{transaction.code}</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </div>
            </div>
            <p className="text-slate-600 mt-1">{transaction.narration}</p>
          </div>
        </div>
      </div>

      {/* Status & Amount Card */}
      <Card padding="default">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(transaction.status)}
            <div>
              <p className="text-sm text-slate-600">Transaction Status</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{transaction.status}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">Amount</p>
            <div className="flex items-center gap-2">
              {transaction.action === 'credit' ? (
                <ArrowUpCircle size={24} className="text-green-600" />
              ) : (
                <ArrowDownCircle size={24} className="text-red-600" />
              )}
              <p className={`text-3xl font-bold ${
                transaction.action === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.action === 'credit' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
              </p>
            </div>
            {transaction.paid !== transaction.amount && (
              <p className="text-sm text-slate-600 mt-1">
                Paid: {formatAmount(transaction.paid, transaction.currency)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card title={
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            <span>Transaction Details</span>
          </div>
        } padding="default">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Transaction Code</span>
              <span className="text-sm font-medium text-slate-900 font-mono">{transaction.code}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Reference</span>
              <span className="text-sm font-medium text-slate-900 font-mono">{transaction.reference}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Type</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {getTransactionTypeLabel(transaction.transaction_type)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Action</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.action === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {transaction.action === 'credit' ? 'Credit' : 'Debit'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-slate-600">Product</span>
              <span className="text-sm font-medium text-slate-900 capitalize">
                {transaction.product_sub_type || transaction.product_type}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Information */}
        <Card title={
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-indigo-600" />
            <span>Payment Information</span>
          </div>
        } padding="default">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Payment Method</span>
              <span className="text-sm font-medium text-slate-900">
                {getPaymentMethodLabel(transaction.payment_method)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Amount</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatAmount(transaction.amount, transaction.currency)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Paid</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatAmount(transaction.paid, transaction.currency)}
              </span>
            </div>
            {transaction.balance_before !== undefined && (
              <>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Balance Before</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatAmount(transaction.balance_before, transaction.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-slate-600">Balance After</span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {formatAmount(transaction.balance_after, transaction.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Payer Information */}
      {(transaction.payer_name || transaction.payer_email || transaction.payer_phone) && (
        <Card title={
          <div className="flex items-center gap-2">
            <User size={20} className="text-indigo-600" />
            <span>Payer Information</span>
          </div>
        } padding="default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transaction.payer_name && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="text-sm font-medium text-slate-900">{transaction.payer_name}</p>
              </div>
            )}
            {transaction.payer_email && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm font-medium text-slate-900">{transaction.payer_email}</p>
              </div>
            )}
            {transaction.payer_phone && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-slate-900">{transaction.payer_phone}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Proof of Payment */}
      {transaction.proof_of_payment_url && (
        <Card title={
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-indigo-600" />
            <span>Proof of Payment</span>
          </div>
        } padding="default">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-900 font-medium">Payment proof uploaded</p>
                <p className="text-xs text-slate-500 mt-1">
                  Uploaded on {formatDate(transaction.proof_uploaded_at)}
                </p>
              </div>
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={() => window.open(transaction.proof_of_payment_url, '_blank')}
              >
                View/Download
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Related Shipment */}
      {transaction.reference && transaction.reference.startsWith('SH') && (
        <Card title={
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            <span>Related Shipment</span>
          </div>
        } padding="default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Shipment Code</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{transaction.reference}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // Navigate to shipment if we have product_id
                if (transaction.product_id) {
                  navigate(`/shipments/${transaction.product_id}`);
                }
              }}
            >
              View Shipment
            </Button>
          </div>
        </Card>
      )}

      {/* Timestamps */}
      <Card title={
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" />
          <span>Timeline</span>
        </div>
      } padding="default">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Created At</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(transaction.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Updated At</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(transaction.updated_at)}</p>
          </div>
          {transaction.payment_date && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Payment Date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(transaction.payment_date)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* User Info (if available) */}
      {transaction.user && (
        <Card title="Performed By" padding="default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{transaction.user.full_name}</p>
              <p className="text-xs text-slate-500">{transaction.user.email}</p>
            </div>
            <span className="ml-auto px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 capitalize">
              {transaction.user.role}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetail;
