import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import { uploadPaymentProof } from '../services/paymentService';
import { extractErrorMessage } from '../utils/errorHandler';
import { formatCurrency } from '../utils/format';
import { removeSessionItem, StorageKey } from '../utils/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import FileUpload from '../components/ui/FileUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building2, Copy, CheckCircle } from 'lucide-react';

/**
 * BankTransferDetails Page
 * Bank transfer instructions and payment proof upload
 */
const BankTransferDetails = () => {
  const navigate = useNavigate();
  const { shipmentId } = useParams();
  const location = useLocation();
  const { theme, getBorderRadius } = useTenantConfig();

  // Transaction data from navigation state
  const transaction = location.state?.transaction;

  // Payment proof file
  const [proofFile, setProofFile] = useState(null);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitProof = async () => {
    if (!proofFile) {
      setError('Please upload payment proof before submitting');
      return;
    }

    if (!transaction?.id) {
      setError('Transaction information not found');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      await uploadPaymentProof(transaction.id, proofFile);

      // Clean up sessionStorage - payment is complete
      removeSessionItem(StorageKey.CREATED_SHIPMENT_DATA);
      removeSessionItem(StorageKey.SELECTED_QUOTE_DATA);
      removeSessionItem(StorageKey.TEMP_QUOTE_RESPONSE);

      // Navigate to success page
      navigate(`/quote/success/${shipmentId}`);
    } catch (err) {
      console.error('Error uploading payment proof:', err);
      setError(extractErrorMessage(err, 'Failed to upload payment proof. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  if (!transaction) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert
          variant="error"
          title="Transaction Not Found"
          message="Transaction information could not be loaded. Please try again."
        />
        <Button onClick={() => navigate(`/quote/payment/${shipmentId}`)} className="mt-4">
          Back to Payment
        </Button>
      </div>
    );
  }

  const bankDetails = transaction.bank_details || {};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
          Bank Transfer Payment
        </h1>
        <p style={{ color: theme.text.secondary }}>
          Complete your payment using the bank details below
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

      {/* Instructions */}
      <Alert
        variant="info"
        title="Payment Instructions"
        className="mb-6"
      >
        <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: theme.text.secondary }}>
          <li>Transfer the exact amount to the bank account below</li>
          <li>Use the reference number provided to ensure your payment is tracked</li>
          <li>Upload your payment receipt or proof of transfer</li>
          <li>Our team will verify your payment within 24 hours</li>
        </ol>
      </Alert>

      {/* Bank Account Details */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${theme.primary_color}15` }}
            >
              <Building2 size={24} style={{ color: theme.primary_color }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
              Bank Account Details
            </h2>
          </div>

          <div className="space-y-4">
            {/* Bank Name */}
            {bankDetails.bank_name && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>
                  BANK NAME
                </label>
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: theme.background.subtle }}>
                  <span className="font-medium" style={{ color: theme.text.primary }}>
                    {bankDetails.bank_name}
                  </span>
                </div>
              </div>
            )}

            {/* Account Number */}
            {bankDetails.account_number && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>
                  ACCOUNT NUMBER
                </label>
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: theme.background.subtle }}>
                  <span className="font-medium text-lg" style={{ color: theme.text.primary }}>
                    {bankDetails.account_number}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(bankDetails.account_number, 'account')}
                    className="p-2 rounded transition-colors"
                    style={{
                      backgroundColor: copiedField === 'account' ? theme.success_color : theme.primary_color,
                      color: '#ffffff',
                    }}
                  >
                    {copiedField === 'account' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Account Name */}
            {bankDetails.account_name && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>
                  ACCOUNT NAME
                </label>
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: theme.background.subtle }}>
                  <span className="font-medium" style={{ color: theme.text.primary }}>
                    {bankDetails.account_name}
                  </span>
                </div>
              </div>
            )}

            {/* Account Name */}
            {bankDetails.reference && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>
                  Reference
                </label>
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: theme.background.subtle }}>
                  <span className="font-medium" style={{ color: theme.text.primary }}>
                    {bankDetails.reference}
                  </span>
                </div>
              </div>
            )}
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>
                AMOUNT TO TRANSFER
              </label>
              <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: `${theme.primary_color}15` }}>
                <span className="font-bold text-2xl" style={{ color: theme.primary_color }}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
                <button
                  onClick={() => handleCopyToClipboard(transaction.amount.toString(), 'amount')}
                  className="p-2 rounded transition-colors"
                  style={{
                    backgroundColor: copiedField === 'amount' ? theme.success_color : theme.primary_color,
                    color: '#ffffff',
                  }}
                >
                  {copiedField === 'amount' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Reference Number */}
            {transaction.reference && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>
                  REFERENCE NUMBER
                </label>
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: theme.background.subtle }}>
                  <span className="font-mono font-medium" style={{ color: theme.text.primary }}>
                    {transaction.reference}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(transaction.reference, 'reference')}
                    className="p-2 rounded transition-colors"
                    style={{
                      backgroundColor: copiedField === 'reference' ? theme.success_color : theme.primary_color,
                      color: '#ffffff',
                    }}
                  >
                    {copiedField === 'reference' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                  Include this reference number in your transfer
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Upload Payment Proof */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
            Upload Payment Proof
          </h2>

          <FileUpload
            onFileSelect={setProofFile}
            label="Select Payment Receipt"
            description="PDF, PNG, or JPEG (max 5MB)"
          />

          {proofFile && (
            <Alert
              variant="success"
              className="mt-4"
            >
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                File ready to upload: <strong>{proofFile.name}</strong>
              </p>
            </Alert>
          )}
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/quote/payment/${shipmentId}`)}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmitProof}
          disabled={!proofFile || uploading}
          className="flex-1"
        >
          {uploading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Uploading...</span>
            </>
          ) : (
            'Submit Payment Proof'
          )}
        </Button>
      </div>

      {/* Support info */}
      <div className="mt-6 p-4 rounded" style={{ backgroundColor: theme.background.subtle }}>
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          Need help? Contact support at{' '}
          <a
            href="mailto:support@example.com"
            style={{ color: theme.primary_color }}
            className="font-medium hover:underline"
          >
            support@example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default BankTransferDetails;
