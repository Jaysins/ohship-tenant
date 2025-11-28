import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, CheckCircle2, AlertCircle, Clock, Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { extractErrorMessage } from '../../utils/errorHandler';

const BankTransferPayment = ({
  paymentId,
  transactionData,
  shipment,
  selectedMethod,
  checkoutExpiresAt,
  checkoutValidDuration
}) => {
  const navigate = useNavigate();
  const { shipment_id } = useParams();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const timerIntervalRef = useRef(null);

  const WARNING_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

  const virtualAccount = transactionData.virtual_account;
  const transactionId = transactionData.transaction_id;

  useEffect(() => {
    // Start countdown timer
    if (checkoutExpiresAt) {
      startCountdownTimer();
    }

    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [checkoutExpiresAt]);

  const startCountdownTimer = () => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(checkoutExpiresAt).getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        // Expired
        clearInterval(timerIntervalRef.current);
        navigate(`/shipments/${shipment_id}/payment/expired`, {
          state: { shipment }
        });
        return;
      }

      // Show warning if less than 10 minutes remaining
      if (difference <= WARNING_THRESHOLD && !showWarning) {
        setShowWarning(true);
      }

      setTimeRemaining(difference);
    };

    updateTimer(); // Initial call
    timerIntervalRef.current = setInterval(updateTimer, 1000);
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return '';

    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a PDF, PNG, JPG, or JPEG file');
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
  // Debug logs
  console.log('Selected file:', selectedFile);
  console.log('FormData entries:', Array.from(formData.entries()));
      const response = await api.upload(
        `/transactions/${transactionId}/upload-proof/`,
        formData
      );

      if (response.status === 'success') {
        // Navigate to upload success page
        navigate(`/shipments/${shipment_id}/payment/upload-success`, {
          state: { shipment }
        });
      } else {
        throw new Error(response.message || 'Failed to upload proof of payment');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to upload proof of payment. Please try again.');
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Complete Your Payment</h1>
        <p className="text-slate-600 mt-2">Transfer to the account below and upload proof of payment</p>
      </div>

      {/* Countdown Timer */}
      {timeRemaining !== null && (
        <div className={`p-4 rounded-lg border-2 ${
          showWarning
            ? 'bg-yellow-50 border-yellow-400'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <Clock size={20} className={showWarning ? 'text-yellow-600' : 'text-blue-600'} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                showWarning ? 'text-yellow-900' : 'text-blue-900'
              }`}>
                {showWarning
                  ? 'Rate expires soon! Complete payment within:'
                  : 'Complete payment within:'
                }
              </p>
              <p className={`text-2xl font-bold ${
                showWarning ? 'text-yellow-700' : 'text-blue-700'
              }`}>
                {formatTimeRemaining(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provider Message */}
      {transactionData.provider_message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{transactionData.provider_message}</p>
        </div>
      )}

      {/* Bank Account Details */}
      <Card title="Bank Account Details" padding="default">
        <div className="space-y-4">
          <DetailRow
            label="Bank Name"
            value={virtualAccount.bank_name}
            onCopy={() => copyToClipboard(virtualAccount.bank_name, 'bank')}
            copied={copiedField === 'bank'}
          />
          <DetailRow
            label="Account Name"
            value={virtualAccount.account_name}
            onCopy={() => copyToClipboard(virtualAccount.account_name, 'name')}
            copied={copiedField === 'name'}
          />
          <DetailRow
            label="Account Number"
            value={virtualAccount.account_number}
            onCopy={() => copyToClipboard(virtualAccount.account_number, 'number')}
            copied={copiedField === 'number'}
            highlight
          />
          <DetailRow
            label="Amount"
            value={`${virtualAccount.currency} ${parseFloat(virtualAccount.amount).toFixed(2)}`}
            onCopy={() => copyToClipboard(virtualAccount.amount, 'amount')}
            copied={copiedField === 'amount'}
            highlight
          />
          <DetailRow
            label="Reference"
            value={virtualAccount.reference}
            onCopy={() => copyToClipboard(virtualAccount.reference, 'reference')}
            copied={copiedField === 'reference'}
          />
        </div>
      </Card>

      {/* Transaction Info */}
      <Card title="Transaction Information" padding="default">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Shipment Code:</span>
            <span className="font-medium">{shipment.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Transaction Reference:</span>
            <span className="font-medium">{transactionData.txref}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Payment Method:</span>
            <span className="font-medium">{selectedMethod?.payment_method?.name || selectedMethod?.provider_name}</span>
          </div>
        </div>
      </Card>

      {/* Upload Proof of Payment */}
      <Card title="Upload Proof of Payment" padding="default">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            After completing the bank transfer, please upload your payment receipt or proof of payment below.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="proof-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="proof-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload size={48} className="text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">
                {selectedFile ? selectedFile.name : 'Click to upload proof of payment'}
              </p>
              <p className="text-xs text-slate-500">
                PDF, PNG, JPG, or JPEG (Max 5MB)
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <p className="text-sm text-green-800">
                  File selected: {selectedFile.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Message */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          onClick={handleUploadProof}
          disabled={!selectedFile || uploading}
          loading={uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Proof of Payment'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/shipments')}
          disabled={uploading}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Helper Component
const DetailRow = ({ label, value, onCopy, copied, highlight }) => (
  <div className={`flex justify-between items-center p-3 rounded-lg ${
    highlight ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50'
  }`}>
    <div>
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-indigo-900' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
    <button
      onClick={onCopy}
      className="p-2 hover:bg-white rounded-lg transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle2 size={18} className="text-green-600" />
      ) : (
        <Copy size={18} className="text-slate-400" />
      )}
    </button>
  </div>
);

export default BankTransferPayment;
