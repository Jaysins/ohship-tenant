import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { AlertCircle } from 'lucide-react';

const GenericPayment = ({ paymentId, transactionData, shipment, selectedMethod }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <AlertCircle size={32} className="text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Method Not Supported</h1>
        <p className="text-slate-600 mt-2">
          The selected payment method is not currently supported
        </p>
      </div>

      <Card title="Payment Details" padding="default">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Shipment Code:</span>
            <span className="font-medium">{shipment.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Payment Method:</span>
            <span className="font-medium">{selectedMethod?.display_name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Amount:</span>
            <span className="font-bold text-indigo-600">
              {shipment.currency} {shipment.final_price.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          This payment method ({selectedMethod?.provider_code}) is not yet implemented.
          Please select a different payment method or contact support for assistance.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          onClick={() => navigate(`/shipments/${shipment.id}/payment/select-method`, {
            state: { shipment }
          })}
          className="w-full"
        >
          Choose Different Payment Method
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/shipments')}
          className="w-full"
        >
          Return to Shipments
        </Button>
      </div>
    </div>
  );
};

export default GenericPayment;
