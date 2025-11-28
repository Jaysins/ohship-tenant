import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CreditCard } from 'lucide-react';

const CardPayment = ({ paymentId, transactionData, shipment }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <CreditCard size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Card Payment</h1>
        <p className="text-slate-600 mt-2">Card payment is coming soon</p>
      </div>

      <Card padding="default">
        <div className="text-center py-8">
          <p className="text-sm text-slate-600 mb-4">
            Card payment functionality is currently under development.
          </p>
          <p className="text-sm text-slate-600">
            Please use an alternative payment method or contact support for assistance.
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          onClick={() => navigate('/shipments')}
          className="w-full"
        >
          Return to Shipments
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default CardPayment;
