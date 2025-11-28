import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, CreditCard, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shipment = location.state?.shipment;
  const paymentId = location.state?.paymentId;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <XCircle size={48} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-slate-600">We couldn't process your payment</p>
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
                <span className="text-sm text-slate-600">Amount:</span>
                <span className="font-bold text-slate-900">
                  {shipment.currency} {shipment.final_price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">
              Your shipment has been created but payment was not successful.
            </p>
            <p className="text-sm text-slate-600">
              You can retry the payment or choose a different payment method.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          leftIcon={<RefreshCw size={18} />}
          onClick={() => {
            if (shipment) {
              // Go back to payment processing to retry with same method
              navigate(`/shipments/${shipment.id}/payment/select-method`, {
                state: { shipment }
              });
            } else {
              navigate('/shipments');
            }
          }}
          className="w-full"
        >
          Try Again with Same Method
        </Button>

        <Button
          variant="outline"
          leftIcon={<CreditCard size={18} />}
          onClick={() => {
            if (shipment) {
              navigate(`/shipments/${shipment.id}/payment/select-method`, {
                state: { shipment }
              });
            } else {
              navigate('/shipments');
            }
          }}
          className="w-full"
        >
          Change Payment Method
        </Button>

        <Button
          variant="outline"
          leftIcon={<Package size={18} />}
          onClick={() => navigate('/shipments')}
          className="w-full"
        >
          View Shipments
        </Button>
      </div>
    </div>
  );
};

export default PaymentFailed;
