import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shipmentCode = searchParams.get('shipment_code');

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-slate-600">Your shipment has been created and payment confirmed</p>
      </div>

      <Card padding="default">
        <div className="text-center space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Shipment Reference</p>
            <p className="text-2xl font-bold text-indigo-600">{shipmentCode}</p>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              You can now track your shipment or view its details
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          leftIcon={<Package size={18} />}
          onClick={() => navigate('/shipments')}
          className="flex-1"
        >
          View All Shipments
        </Button>
        <Button
          variant="outline"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/shipments/create')}
          className="flex-1"
        >
          Create Another Shipment
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
