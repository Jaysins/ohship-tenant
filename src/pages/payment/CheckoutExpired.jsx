import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, RefreshCw, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const CheckoutExpired = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shipment = location.state?.shipment;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
          <Clock size={48} className="text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Window Expired</h1>
        <p className="text-slate-600">Your payment time has run out</p>
      </div>

      <Card padding="default">
        <div className="space-y-4">
          {shipment && (
            <div className="pb-4 border-b border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Shipment Code:</span>
                <span className="font-medium text-slate-900">{shipment.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Original Amount:</span>
                <span className="font-bold text-slate-900">
                  {shipment.currency} {shipment.final_price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">
              Your rate guarantee has expired. Shipping rates may have changed.
            </p>
            <p className="text-sm text-slate-600">
              To continue, you'll need to get new shipping rates and proceed with payment.
            </p>
          </div>
        </div>
      </Card>

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-sm text-orange-800">
          Note: The new shipping rates may differ from your original quote due to market conditions.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          leftIcon={<RefreshCw size={18} />}
          onClick={() => {
            if (shipment) {
              navigate(`/shipments/${shipment.id}`);
            } else {
              navigate('/shipments');
            }
          }}
          className="w-full"
        >
          Get New Rate & Continue
        </Button>

        <Button
          variant="outline"
          leftIcon={<Package size={18} />}
          onClick={() => navigate('/shipments')}
          className="w-full"
        >
          Return to Shipments
        </Button>
      </div>
    </div>
  );
};

export default CheckoutExpired;
