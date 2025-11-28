import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, Truck, Calendar, DollarSign, Clock, FileText,
  CheckCircle2, Circle, User, Shield, FileDown, AlertCircle, Box, Weight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getShipmentById } from '../services/shipmentService';

const ShipmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShipment();
  }, [id]);

  const loadShipment = async () => {
    try {
      setLoading(true);
      const data = await getShipmentById(id);
      setShipment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      drafted: 'bg-amber-100 text-amber-800 border-amber-200',
      pending_payment: 'bg-orange-100 text-orange-800 border-orange-200',
      pending_payment_verification: 'bg-orange-100 text-orange-800 border-orange-200',
      pending_verification: 'bg-purple-100 text-purple-800 border-purple-200',
      pending_pickup: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatStatus = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  

const getStatusSteps = () => {
  const blockedStatuses = [
    "pending_payment",
    "drafted",
    "pending_verification",
    "pending_payment_verification"
  ];

  const isBlocked = blockedStatuses.includes(shipment.status);

  const steps = [
    { key: 'created', label: 'Order Created', date: shipment.created_at, completed: shipment.status == 'pending_pickup' },
    { key: 'payment', label: 'Payment Received', date: shipment.created_at, completed: shipment.payment_status == 'successful' },
    { key: 'pickup', label: 'Pickup Scheduled', date: shipment.pickup_scheduled_at, completed: !!shipment.pickup_scheduled_at },
    { key: 'picked_up', label: 'Picked Up', date: shipment.picked_up_at, completed: !!shipment.picked_up_at },
    { key: 'in_transit', label: 'In Transit', date: shipment.carrier_pickup_at, completed: shipment.status === 'in_transit' || shipment.status === 'delivered' },
    { key: 'delivered', label: 'Delivered', date: shipment.actual_delivery_date, completed: shipment.status === 'delivered' }
  ];

  // Apply the block rule
  return steps.map(step => ({
    ...step,
    completed: isBlocked
      ? step.key === "created" // only created can be true
      : step.completed         // use original logic
  }));
};
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/shipments')}
        >
          Back to Shipments
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error || 'Shipment not found'}</p>
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
            onClick={() => navigate('/shipments')}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{shipment.code}</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                {formatStatus(shipment.status)}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Created {formatDate(shipment.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck size={14} />
                <span className="capitalize">{shipment.shipment_type}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {shipment.status === 'drafted' && (
            <Button
              variant="primary"
              leftIcon={<DollarSign size={18} />}
              onClick={() => navigate(`/shipments/${shipment.id}/payment/select-method`, {
                state: { shipment }
              })}
            >
              Complete Payment
            </Button>
          )}
          {shipment.label_url && (
            <Button variant="outline" leftIcon={<FileDown size={18} />}>
              Download Label
            </Button>
          )}
        </div>
      </div>

      {/* Payment Required Alert */}
      {shipment.status === 'drafted' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Payment Required
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                This shipment is in draft status and requires payment to proceed. Complete the payment process to activate your shipment.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/shipments/${shipment.id}/payment/select-method`, {
                  state: { shipment }
                })}
              >
                Complete Payment Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <Card title="Shipment Timeline" padding="default">
        <div className="relative overflow-x-auto pb-2">
          <div className="flex min-w-[800px] px-4">
            {getStatusSteps().map((step, index) => (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Connecting Line */}
                {index < getStatusSteps().length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 h-0.5 ${
                      step.completed && getStatusSteps()[index + 1].completed ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                    style={{
                      width: 'calc(100% - 20px)',
                      marginLeft: '10px'
                    }}
                  />
                )}

                {/* Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 relative bg-white ${
                  step.completed ? 'ring-4 ring-green-500' : 'ring-4 ring-slate-200'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-500' : 'bg-slate-200'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 size={20} className="text-white" />
                    ) : (
                      <Circle size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="mt-2 text-center px-1">
                  <p className={`text-[11px] font-medium whitespace-nowrap ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                      {new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin Address */}
        <Card title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <MapPin size={16} className="text-indigo-600" />
            </div>
            <span>Origin Address</span>
          </div>
        } padding="default">
          <div className="space-y-3">
            {shipment.origin_address.name && (
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <User size={16} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-900">{shipment.origin_address.name}</p>
              </div>
            )}
            {shipment.origin_address.company && (
              <p className="text-sm font-medium text-slate-700">{shipment.origin_address.company}</p>
            )}
            <div className="space-y-1">
              <p className="text-sm text-slate-700">{shipment.origin_address.address_line_1}</p>
              {shipment.origin_address.address_line_2 && (
                <p className="text-sm text-slate-700">{shipment.origin_address.address_line_2}</p>
              )}
              <p className="text-sm text-slate-700">
                {shipment.origin_address.city}, {shipment.origin_address.state} {shipment.origin_address.postal_code}
              </p>
              <p className="text-sm font-medium text-slate-900">{shipment.origin_address.country}</p>
            </div>
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-xs text-slate-500 w-12">Phone:</span>
                <span>{shipment.origin_address.phone}</span>
              </div>
              {shipment.origin_address.email && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-xs text-slate-500 w-12">Email:</span>
                  <span>{shipment.origin_address.email}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Destination Address */}
        <Card title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <MapPin size={16} className="text-green-600" />
            </div>
            <span>Destination Address</span>
          </div>
        } padding="default">
          <div className="space-y-3">
            {shipment.destination_address.name && (
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <User size={16} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-900">{shipment.destination_address.name}</p>
              </div>
            )}
            {shipment.destination_address.company && (
              <p className="text-sm font-medium text-slate-700">{shipment.destination_address.company}</p>
            )}
            <div className="space-y-1">
              <p className="text-sm text-slate-700">{shipment.destination_address.address_line_1}</p>
              {shipment.destination_address.address_line_2 && (
                <p className="text-sm text-slate-700">{shipment.destination_address.address_line_2}</p>
              )}
              <p className="text-sm text-slate-700">
                {shipment.destination_address.city}, {shipment.destination_address.state} {shipment.destination_address.postal_code}
              </p>
              <p className="text-sm font-medium text-slate-900">{shipment.destination_address.country}</p>
            </div>
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-xs text-slate-500 w-12">Phone:</span>
                <span>{shipment.destination_address.phone}</span>
              </div>
              {shipment.destination_address.email && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-xs text-slate-500 w-12">Email:</span>
                  <span>{shipment.destination_address.email}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Shipment Items */}
      {shipment.items && shipment.items.length > 0 && (
        <Card title={
          <div className="flex items-center gap-2">
            <Box size={20} className="text-indigo-600" />
            <span>Shipment Items ({shipment.items.length})</span>
          </div>
        } padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">HS Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Weight (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dimensions (cm)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shipment.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-600">{index + 1}</span>
                        </div>
                        <p className="text-sm text-slate-900">{item.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-slate-900">{item.hs_code || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{item.quantity}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Weight size={14} className="text-slate-400" />
                        <p className="text-sm text-slate-900">{item.declared_weight}</p>
                      </div>
                      {item.verified_weight && item.verified_weight !== item.declared_weight && (
                        <p className="text-xs text-amber-600">Verified: {item.verified_weight}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.declared_length && item.declared_width && item.declared_height ? (
                        <p className="text-sm text-slate-900">
                          {item.declared_length} × {item.declared_width} × {item.declared_height}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">N/A</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {item.currency} {item.declared_value.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pricing Breakdown */}
      <Card title={
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-indigo-600" />
          <span>Pricing Breakdown</span>
        </div>
      } padding="default">
        <div className="space-y-4">
          {/* Base Price */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <p className="text-xs text-indigo-600 font-medium mb-1">Base Price</p>
            <p className="text-2xl font-bold text-indigo-900">{shipment.currency} {shipment.rate_base_price.toFixed(2)}</p>
          </div>

          {/* Adjustments */}
          {shipment.rate_adjustments && shipment.rate_adjustments.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Adjustments</p>
              <div className="space-y-2">
                {shipment.rate_adjustments.map((adjustment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{adjustment.description}</p>
                      {adjustment.calculation_type === 'percentage' && adjustment.rate && (
                        <p className="text-xs text-slate-500">{adjustment.rate}% of base price</p>
                      )}
                      {adjustment.calculation_type === 'fixed' && (
                        <p className="text-xs text-slate-500">Fixed fee</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      +{shipment.currency} {adjustment.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discounts */}
          {shipment.rate_discounts && shipment.rate_discounts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Discounts</p>
              <div className="space-y-2">
                {shipment.rate_discounts.map((discount, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">{discount.description}</p>
                      {discount.code && (
                        <p className="text-xs text-green-600">Code: {discount.code}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-green-900">
                      -{shipment.currency} {discount.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Declared Value */}
          {shipment.total_declared_value && (
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <p className="text-sm text-slate-600">Total Declared Value</p>
              <p className="text-sm font-semibold text-slate-900">
                {shipment.currency} {shipment.total_declared_value.toFixed(2)}
              </p>
            </div>
          )}

          {/* Final Price */}
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-slate-900">Final Price</p>
              <p className="text-2xl font-bold text-indigo-600">
                {shipment.currency} {shipment.final_price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Carrier & Service Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-indigo-600" />
            <span>Carrier & Service</span>
          </div>
        } padding="default">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Carrier Name</p>
              <p className="text-sm font-medium text-slate-900">{shipment.carrier_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Carrier Code</p>
              <p className="text-sm font-medium text-slate-900 uppercase">{shipment.carrier_code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Service Type</p>
              <p className="text-sm font-medium text-slate-900 capitalize">{shipment.service_type}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Shipment Type</p>
              <p className="text-sm font-medium text-slate-900 capitalize">{shipment.shipment_type}</p>
            </div>
            {shipment.awb_no && (
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">AWB Number</p>
                <p className="text-sm font-medium text-slate-900 font-mono">{shipment.awb_no}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title={
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            <span>Service Options</span>
          </div>
        } padding="default">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Insurance</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                shipment.is_insured ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {shipment.is_insured ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Signature Required</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                shipment.signature_required ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {shipment.signature_required ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Saturday Delivery</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                shipment.saturday_delivery ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {shipment.saturday_delivery ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Pickup Type</span>
              <span className="text-sm font-medium text-slate-900 capitalize">
                {shipment.pickup_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Notes Section */}
      {(shipment.customer_notes || shipment.internal_notes) && (
        <Card title={
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            <span>Notes</span>
          </div>
        } padding="default">
          <div className="space-y-4">
            {shipment.customer_notes && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-2">Customer Notes</p>
                <p className="text-sm text-blue-800">{shipment.customer_notes}</p>
              </div>
            )}
            {shipment.internal_notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-medium text-amber-900 mb-2">Internal Notes</p>
                <p className="text-sm text-amber-800">{shipment.internal_notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <Card title={
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-indigo-600" />
          <span>System Information</span>
        </div>
      } padding="default">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Shipment ID</p>
            <p className="text-xs font-mono text-slate-900 break-all">{shipment.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Channel</p>
            <p className="text-sm font-medium text-slate-900 uppercase">{shipment.channel_code}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Approval Required</p>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
              shipment.requires_customer_approval ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {shipment.requires_customer_approval ? 'Yes' : 'No'}
            </span>
          </div>
          {shipment.assigned_agent_id && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Assigned Agent</p>
              <p className="text-xs font-mono text-slate-900">{shipment.assigned_agent_id}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 mb-1">Created</p>
            <p className="text-sm text-slate-900">{formatDate(shipment.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Last Updated</p>
            <p className="text-sm text-slate-900">{formatDate(shipment.updated_at)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ShipmentDetail;
