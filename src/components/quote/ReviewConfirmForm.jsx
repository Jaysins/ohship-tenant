import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Truck, CheckCircle, Tag } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ReviewConfirmForm = ({ formData, onBack }) => {
  const navigate = useNavigate();

  const selectedQuote = formData.selectedQuote;

  const handleConfirm = () => {
    // Navigate to shipment creation page with pre-filled data
    navigate('/shipments/create', {
      state: {
        formData: {
          originCity: formData.originCity,
          originState: formData.originState,
          originCountry: formData.originCountry,
          destinationCity: formData.destinationCity,
          destinationState: formData.destinationState,
          destinationCountry: formData.destinationCountry,
          packageType: formData.packageType,
          itemType: formData.itemType,
          weight: formData.weight,
          length: formData.length,
          width: formData.width,
          height: formData.height,
          shipmentValue: formData.shipmentValue,
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <CheckCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Review & Confirm</h3>
          <p className="text-sm text-slate-600">Please review your shipment details before confirming</p>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin */}
        <Card padding="default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
              <MapPin size={14} className="text-indigo-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Origin</h4>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p className="font-medium text-slate-900">{formData.originCountry}</p>
            <p>{formData.originState}</p>
            {formData.originCity && <p>{formData.originCity}</p>}
            {formData.originZip && <p>{formData.originZip}</p>}
          </div>
        </Card>

        {/* Destination */}
        <Card padding="default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
              <MapPin size={14} className="text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Destination</h4>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p className="font-medium text-slate-900">{formData.destinationCountry}</p>
            <p>{formData.destinationState}</p>
            {formData.destinationCity && <p>{formData.destinationCity}</p>}
            {formData.destinationZip && <p>{formData.destinationZip}</p>}
          </div>
        </Card>
      </div>

      {/* Package Details */}
      <Card padding="default">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center">
            <Package size={14} className="text-amber-600" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">Package Details</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Package Type</p>
            <p className="font-medium text-slate-900 capitalize">{formData.packageType}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Item Type</p>
            <p className="font-medium text-slate-900 capitalize">{formData.itemType}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Weight</p>
            <p className="font-medium text-slate-900">{formData.weight} kg</p>
          </div>
        </div>

        {/* Dimensions if provided */}
        {(formData.length || formData.width || formData.height) && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Dimensions (L × W × H)</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.length || '-'} × {formData.width || '-'} × {formData.height || '-'} cm
            </p>
          </div>
        )}

        {/* Shipment Value if provided */}
        {formData.shipmentValue && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Shipment Value</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.currency} {parseFloat(formData.shipmentValue).toFixed(2)}
            </p>
          </div>
        )}
      </Card>

      {/* Selected Service */}
      {selectedQuote && (
        <Card padding="default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Truck size={14} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Selected Shipping Service</h4>
          </div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-slate-900">{selectedQuote.display_name}</p>
              <p className="text-sm text-slate-600">{selectedQuote.carrier_name} • {selectedQuote.service_name}</p>
              <p className="text-sm text-slate-500 mt-1">
                Estimated delivery: {selectedQuote.estimated_days} {selectedQuote.estimated_days === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {selectedQuote.currency} {selectedQuote.total_amount.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-3">Price Breakdown:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Base Rate</span>
                <span>{selectedQuote.currency} {selectedQuote.base_rate.toFixed(2)}</span>
              </div>

              {/* Adjustments */}
              {selectedQuote.adjustments && selectedQuote.adjustments.map((adj, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{adj.description}</span>
                  <span>
                    {adj.rate && `${adj.rate}% `}
                    {selectedQuote.currency} {adj.amount.toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Discounts */}
              {selectedQuote.discounts && selectedQuote.discounts.length > 0 && (
                <>
                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                    <span>Subtotal</span>
                    <span>
                      {selectedQuote.currency} {(
                        selectedQuote.base_rate +
                        (selectedQuote.adjustments?.reduce((sum, adj) => sum + adj.amount, 0) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                  {selectedQuote.discounts.map((discount, idx) => (
                    <div key={idx} className="flex justify-between text-green-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {discount.description}
                      </span>
                      <span>-{selectedQuote.currency} {discount.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Total */}
              <div className="pt-3 mt-2 border-t-2 border-slate-300 flex justify-between">
                <span className="font-semibold text-slate-900">Total Amount</span>
                <span className="text-xl font-bold text-indigo-600">
                  {selectedQuote.currency} {selectedQuote.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {selectedQuote.metadata && selectedQuote.metadata.billable_weight && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Billable weight: {selectedQuote.metadata.billable_weight} kg ({selectedQuote.metadata.weight_type})
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleConfirm}
        >
          Continue to Shipment Details
        </Button>
      </div>
    </div>
  );
};

export default ReviewConfirmForm;
