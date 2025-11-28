import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaymentUploadSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shipment = location.state?.shipment;

  if (!shipment) {
    // If no shipment data, redirect to shipments list
    navigate('/shipments');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      {/* Success Icon */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Payment Proof Uploaded Successfully!
        </h1>
        <p className="text-slate-600 text-lg">
          Your shipment is being processed
        </p>
      </div>

      {/* Information Card */}
      <Card padding="default">
        <div className="space-y-6">
          {/* Status Message */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Clock size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Payment Under Review
                </p>
                <p className="text-sm text-blue-800">
                  Our team will review your payment proof and confirm your shipment within the next few hours.
                  You'll receive an email notification once your payment is verified.
                </p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 mb-3">
              <Package size={20} />
              <h3 className="font-semibold">Shipment Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Shipment Code</p>
                <p className="font-medium text-slate-900">{shipment.code}</p>
              </div>
              <div>
                <p className="text-slate-600">Status</p>
                <p className="font-medium text-orange-600">Payment Pending Verification</p>
              </div>
              <div>
                <p className="text-slate-600">Carrier</p>
                <p className="font-medium text-slate-900">{shipment.carrier_name}</p>
              </div>
              <div>
                <p className="text-slate-600">Service</p>
                <p className="font-medium text-slate-900">{shipment.service_type}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">What Happens Next?</h4>
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="font-semibold text-indigo-600">1.</span>
                <span>Our team verifies your payment proof</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-indigo-600">2.</span>
                <span>Once confirmed, we'll prepare your shipment for pickup</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-indigo-600">3.</span>
                <span>You'll receive tracking information via email</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-indigo-600">4.</span>
                <span>Your package will be picked up and delivered to the destination</span>
              </li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => navigate(`/shipments/${shipment.id}`)}
          className="flex-1"
        >
          View Shipment Details
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/shipments')}
          className="flex-1"
        >
          Back to Shipments
        </Button>
      </div>

      {/* Help Section */}
      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">
          Need help? Contact our support team if you have any questions about your payment or shipment.
        </p>
      </div>
    </div>
  );
};

export default PaymentUploadSuccess;
