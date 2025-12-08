import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Package, MapPin, User, Phone, Mail, Truck, Calendar, Download, XCircle, Navigation, CreditCard } from 'lucide-react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { getShipmentById } from '../../services/shipmentService';
import { extractErrorMessage } from '../../utils/errorHandler';
import { formatCurrency } from '../../utils/format';
import { setSessionItem, StorageKey } from '../../utils/storage';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';

/**
 * ShipmentDetailSidebar Component
 * Slide-in sidebar showing complete shipment details
 */
const ShipmentDetailSidebar = ({ shipmentId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && shipmentId) {
      loadShipmentDetails();
    }
  }, [isOpen, shipmentId]);

  const loadShipmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShipmentById(shipmentId);
      setShipment(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load shipment details'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const statusMap = {
      pending_pickup: { bg: theme.warning_color, color: theme.warning_color },
      in_transit: { bg: theme.info_color, color: theme.info_color },
      delivered: { bg: theme.success_color, color: theme.success_color },
      cancelled: { bg: theme.danger_color, color: theme.danger_color },
      failed: { bg: theme.danger_color, color: theme.danger_color },
    };
    const colors = statusMap[status] || { bg: theme.text.secondary, color: theme.text.secondary };
    return {
      backgroundColor: `${colors.bg}20`,
      color: colors.color,
      border: `1px solid ${colors.color}40`
    };
  };

  const formatStatus = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleTrackShipment = () => {
    if (shipment?.code) {
      window.open(`/tracking/${shipment.code}`, '_blank');
    }
  };

  const handleDownloadWaybill = () => {
    // TODO: Implement waybill download
    alert('Download waybill functionality to be implemented');
  };

  const handleCancelShipment = () => {
    // TODO: Implement cancel shipment
    if (confirm('Are you sure you want to cancel this shipment?')) {
      alert('Cancel shipment functionality to be implemented');
    }
  };

  const handleCompletePayment = () => {
    if (!shipment) return;

    // Store shipment data in sessionStorage for review mode
    // We need to construct formData from the shipment object
    const formData = {
      // Sender information
      senderName: shipment.origin_address.name,
      senderEmail: shipment.origin_address.email || '',
      senderPhone: shipment.origin_address.phone,
      senderCountry: shipment.origin_address.country,
      senderState: shipment.origin_address.state,
      senderCity: shipment.origin_address.city,
      senderAddress: shipment.origin_address.address_line_1,
      senderAddress2: shipment.origin_address.address_line_2 || '',
      senderPostalCode: shipment.origin_address.postal_code,

      // Receiver information
      receiverName: shipment.destination_address.name,
      receiverEmail: shipment.destination_address.email || '',
      receiverPhone: shipment.destination_address.phone,
      receiverCountry: shipment.destination_address.country,
      receiverState: shipment.destination_address.state,
      receiverCity: shipment.destination_address.city,
      receiverAddress: shipment.destination_address.address_line_1,
      receiverAddress2: shipment.destination_address.address_line_2 || '',
      receiverPostalCode: shipment.destination_address.postal_code,

      // Items
      items: shipment.items,

      // Pickup details
      pickupType: shipment.pickup_type,
      pickupDate: shipment.pickup_scheduled_at || '',

      // Other
      isInsured: shipment.is_insured,
      customerNotes: shipment.customer_notes || ''
    };

    setSessionItem(StorageKey.CREATED_SHIPMENT_DATA, {
      shipment: shipment,
      formData: formData
    });

    // Navigate to checkout in review mode
    navigate('/quote/checkout?mode=review');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[700px] z-50 overflow-y-auto shadow-2xl"
        style={{ backgroundColor: theme.background.card }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4"
          style={{
            backgroundColor: theme.background.card,
            borderBottom: `1px solid ${theme.border.color}`
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.primary_color}dd)`,
                  borderRadius: getBorderRadius()
                }}
              >
                <Package size={20} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
                  Shipment Details
                </h2>
                {shipment && (
                  <p className="text-xs" style={{ color: theme.text.muted }}>
                    {shipment.code || 'N/A'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {shipment && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold capitalize ${getBorderRadius()}`}
                  style={getStatusStyle(shipment.status)}
                >
                  {formatStatus(shipment.status)}
                </span>
              )}
              <button
                onClick={onClose}
                className={`p-2 transition-colors ${getBorderRadius()}`}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.text.muted
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4" style={{ color: theme.text.secondary }}>
                  Loading shipment details...
                </p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="error" message={error} />
          ) : shipment ? (
            <>
              {/* Action Buttons */}
              {shipment.status === 'drafted' ? (
                // For drafted shipments, only show Complete Payment button
                <div className="w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCompletePayment}
                    leftIcon={<CreditCard size={14} />}
                    className="w-full"
                  >
                    Complete Payment
                  </Button>
                </div>
              ) : (
                // For other statuses, show regular action buttons
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleTrackShipment}
                    leftIcon={<Navigation size={14} />}
                  >
                    Track
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadWaybill}
                    leftIcon={<Download size={14} />}
                  >
                    Waybill
                  </Button>
                  {shipment.status !== 'cancelled' && shipment.status !== 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelShipment}
                      leftIcon={<XCircle size={14} />}
                      className="border-red-200 hover:bg-red-50"
                      style={{ color: theme.danger_color }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}

              {/* Price Summary - Prioritized */}
              <div
                className={`p-4 ${getBorderRadius()}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium" style={{ color: theme.text.muted }}>
                      Total Price
                    </p>
                    <p className="text-2xl font-bold mt-0.5" style={{ color: theme.primary_color }}>
                      {formatCurrency(shipment.final_price || 0, shipment.currency)}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3" style={{ borderTop: `1px solid ${theme.border.color}` }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: theme.text.secondary }}>Base Rate</span>
                    <span className="font-semibold" style={{ color: theme.text.primary }}>
                      {formatCurrency(shipment.rate_base_price || 0, shipment.currency)}
                    </span>
                  </div>

                  {shipment.rate_adjustments && shipment.rate_adjustments.length > 0 && (
                    <>
                      {shipment.rate_adjustments.map((adjustment, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span style={{ color: theme.text.secondary }}>
                            {adjustment.description}
                            {adjustment.calculation_type === 'percentage' && adjustment.rate && (
                              <span className="text-xs ml-1" style={{ color: theme.text.muted }}>
                                ({(adjustment.rate * 100).toFixed(1)}%)
                              </span>
                            )}
                          </span>
                          <span className="font-semibold" style={{ color: theme.text.primary }}>
                            +{formatCurrency(adjustment.amount || 0, shipment.currency)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {shipment.rate_discounts && shipment.rate_discounts.length > 0 && (
                    <>
                      {shipment.rate_discounts.map((discount, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span style={{ color: theme.success_color }}>
                            {discount.description}
                            {discount.calculation_type === 'percentage' && discount.rate && (
                              <span className="text-xs ml-1" style={{ color: theme.text.muted }}>
                                ({(discount.rate * 100).toFixed(1)}%)
                              </span>
                            )}
                          </span>
                          <span className="font-semibold" style={{ color: theme.success_color }}>
                            -{formatCurrency(Math.abs(discount.amount) || 0, shipment.currency)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div
                className={`p-4 space-y-4 ${getBorderRadius()}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`
                }}
              >
                <h3 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                  Shipping Route
                </h3>

                {/* Origin */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} style={{ color: theme.info_color }} />
                    <h4 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                      From (Origin)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User size={14} style={{ color: theme.text.muted }} className="mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {shipment.origin_address.name}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} style={{ color: theme.text.muted }} className="mt-0.5 flex-shrink-0" />
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        <p>{shipment.origin_address.address_line_1}</p>
                        {shipment.origin_address.address_line_2 && <p>{shipment.origin_address.address_line_2}</p>}
                        <p>
                          {shipment.origin_address.city}, {shipment.origin_address.state}{' '}
                          {shipment.origin_address.postal_code}
                        </p>
                        <p>{shipment.origin_address.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: theme.text.muted }} className="flex-shrink-0" />
                      <p className="text-sm" style={{ color: theme.text.secondary }}>
                        {shipment.origin_address.phone}
                      </p>
                    </div>
                    {shipment.origin_address.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} style={{ color: theme.text.muted }} className="flex-shrink-0" />
                        <p className="text-sm" style={{ color: theme.text.secondary }}>
                          {shipment.origin_address.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div className="pt-3" style={{ borderTop: `1px solid ${theme.border.color}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={14} style={{ color: theme.success_color }} />
                    <h4 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                      To (Destination)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User size={14} style={{ color: theme.text.muted }} className="mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {shipment.destination_address.name}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} style={{ color: theme.text.muted }} className="mt-0.5 flex-shrink-0" />
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        <p>{shipment.destination_address.address_line_1}</p>
                        {shipment.destination_address.address_line_2 && (
                          <p>{shipment.destination_address.address_line_2}</p>
                        )}
                        <p>
                          {shipment.destination_address.city}, {shipment.destination_address.state}{' '}
                          {shipment.destination_address.postal_code}
                        </p>
                        <p>{shipment.destination_address.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: theme.text.muted }} className="flex-shrink-0" />
                      <p className="text-sm" style={{ color: theme.text.secondary }}>
                        {shipment.destination_address.phone}
                      </p>
                    </div>
                    {shipment.destination_address.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} style={{ color: theme.text.muted }} className="flex-shrink-0" />
                        <p className="text-sm" style={{ color: theme.text.secondary }}>
                          {shipment.destination_address.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Carrier Info */}
              <div
                className={`p-4 space-y-3 ${getBorderRadius()}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`
                }}
              >
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.text.primary }}>
                  <Truck size={14} style={{ color: theme.text.muted }} />
                  Carrier Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>Carrier</p>
                    <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {shipment.carrier_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>Service Type</p>
                    <p className="text-sm font-medium capitalize" style={{ color: theme.text.primary }}>
                      {shipment.service_type || 'Standard'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>Pickup Type</p>
                    <p className="text-sm font-medium capitalize" style={{ color: theme.text.primary }}>
                      {shipment.pickup_type.replace('_', ' ')}
                    </p>
                  </div>
                  {shipment.pickup_scheduled_at && (
                    <div>
                      <p className="text-xs" style={{ color: theme.text.muted }}>Pickup Date</p>
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {new Date(shipment.pickup_scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div
                className={`p-4 space-y-3 ${getBorderRadius()}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`
                }}
              >
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.text.primary }}>
                  <Package size={14} style={{ color: theme.text.muted }} />
                  Items ({shipment.items.length})
                </h3>
                <div className="space-y-2">
                  {shipment.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 ${getBorderRadius()}`}
                      style={{ backgroundColor: theme.background.subtle }}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${getBorderRadius()}`}
                        style={{ backgroundColor: `${theme.primary_color}20` }}
                      >
                        <Package size={16} style={{ color: theme.primary_color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: theme.text.primary }}>
                          {item.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: theme.text.secondary }}>
                          Qty: {item.quantity} • {item.weight}kg
                          {item.length && item.width && item.height && (
                            <> • {item.length}×{item.width}×{item.height}cm</>
                          )}
                        </p>
                        {item.declared_value && (
                          <p className="text-xs mt-0.5" style={{ color: theme.text.muted }}>
                            Value: {formatCurrency(item.declared_value, shipment.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {shipment.customer_notes && (
                <div
                  className={`p-4 ${getBorderRadius()}`}
                  style={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.color}`
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                    Customer Notes
                  </h3>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    {shipment.customer_notes}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div
                className={`p-4 space-y-3 ${getBorderRadius()}`}
                style={{
                  backgroundColor: theme.background.card,
                  border: `1px solid ${theme.border.color}`
                }}
              >
                <h3 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Created</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} style={{ color: theme.text.muted }} />
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Last Updated</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} style={{ color: theme.text.muted }} />
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {new Date(shipment.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Insurance</p>
                    <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {shipment.is_insured ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {shipment.awb_no && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: theme.text.muted }}>AWB Number</p>
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {shipment.awb_no}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ShipmentDetailSidebar;
