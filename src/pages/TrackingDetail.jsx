import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Printer, Package, Truck, CheckCircle2, AlertCircle,
  Clock, PackageCheck, ArrowRight, Circle, MapPin, Calendar, Navigation
} from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getShipmentTracking } from '../services/shipmentService';
import { extractErrorMessage } from '../utils/errorHandler';

const TrackingDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();

  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (code) {
      loadTracking();
    }
  }, [code]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShipmentTracking(code);
      setTracking(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to load tracking information');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!tracking) return 0;
    const { current_step, total_steps } = tracking.status_progression;
    return (current_step / total_steps) * 100;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEstimatedDelivery = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEventIcon = (eventType, isException, isLatest) => {
    if (isException) {
      return <AlertCircle size={16} style={{ color: theme.danger_color }} />;
    }
    if (isLatest) {
      return <CheckCircle2 size={16} style={{ color: theme.success_color }} />;
    }

    const iconMap = {
      pickup: <Clock size={16} style={{ color: theme.primary_color }} />,
      picked_up: <PackageCheck size={16} style={{ color: theme.primary_color }} />,
      in_transit: <Truck size={16} style={{ color: theme.primary_color }} />,
      out_for_delivery: <Truck size={16} style={{ color: theme.primary_color }} />,
      delivered: <CheckCircle2 size={16} style={{ color: theme.primary_color }} />,
      exception: <AlertCircle size={16} style={{ color: theme.primary_color }} />,
      info: <Package size={16} style={{ color: theme.primary_color }} />
    };
    return iconMap[eventType] || iconMap.info;
  };

  const getStatusStyle = (status) => {
    const statusMap = {
      pending_pickup: { bg: theme.warning_color, color: theme.warning_color },
      picked_up_by_carrier: { bg: theme.info_color, color: theme.info_color },
      in_transit: { bg: theme.info_color, color: theme.info_color },
      out_for_delivery: { bg: theme.primary_color, color: theme.primary_color },
      delivered: { bg: theme.success_color, color: theme.success_color },
      cancelled: { bg: theme.danger_color, color: theme.danger_color },
      exception: { bg: theme.danger_color, color: theme.danger_color }
    };
    const colors = statusMap[status] || { bg: theme.text.secondary, color: theme.text.secondary };
    return {
      backgroundColor: `${colors.bg}1A`,
      color: colors.color
    };
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Shipment ${code}`,
          text: `Track your shipment: ${code}`,
          url: url
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Tracking link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/tracking')}
        >
          Back to Tracking
        </Button>
        <div
          className={`p-4 border ${getBorderRadius()}`}
          style={{
            backgroundColor: `${theme.danger_color}0D`,
            borderColor: `${theme.danger_color}33`
          }}
        >
          <p className="text-sm" style={{ color: theme.danger_color }}>
            {error || 'Shipment not found'}
          </p>
        </div>
      </div>
    );
  }

  const { shipment, events, status_progression } = tracking;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/tracking')}
          >
            Back
          </Button>
          <div>
            <p className="text-sm font-medium" style={{ color: theme.text.muted }}>Tracking #</p>
            <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
              {tracking.shipment_code}
            </h1>
            {tracking.awb_number && (
              <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                AWB: {tracking.awb_number}
              </p>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 ${getBorderRadius()}`}
          style={getStatusStyle(shipment.current_status)}
        >
          <Navigation size={20} />
          <p className="text-base font-bold capitalize">{getStatusLabel(shipment.current_status)}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Progress and Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress Tracker */}
          <Card padding="default">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p className="text-lg font-bold" style={{ color: theme.text.primary }}>
                  {shipment.actual_delivery_date
                    ? `Delivered: ${formatEstimatedDelivery(shipment.actual_delivery_date)}`
                    : `Estimated Delivery: ${formatEstimatedDelivery(shipment.estimated_delivery_date)}`
                  }
                </p>
                {events.length > 0 && (
                  <p className="text-sm" style={{ color: theme.text.muted }}>
                    Updated {formatDate(events[0].event_time)}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div
                className="relative h-2 w-full rounded-full"
                style={{ backgroundColor: theme.background.subtle }}
              >
                <div
                  className="absolute h-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: theme.primary_color,
                    width: `${getProgressPercentage()}%`
                  }}
                />
              </div>

              {/* Progress Steps */}
              <div
                className="grid text-center text-xs font-medium"
                style={{
                  gridTemplateColumns: `repeat(${status_progression.steps.length}, 1fr)`,
                  color: theme.text.muted
                }}
              >
                {status_progression.steps.map((step) => (
                  <div
                    key={step.status}
                    style={{ color: step.completed ? theme.primary_color : theme.text.muted }}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Tracking History */}
          <Card padding="default">
            <h2 className="mb-4 text-lg font-bold" style={{ color: theme.text.primary }}>
              Tracking History
            </h2>
            {events.length === 0 ? (
              <p className="text-center py-8" style={{ color: theme.text.muted }}>
                No tracking events yet
              </p>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8" role="list">
                  {events.map((event, index) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {index !== events.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-4 top-4 -ml-px h-full w-0.5"
                            style={{ backgroundColor: theme.border.color }}
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          {/* Event Icon */}
                          <div>
                            <div className="relative px-1">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ring-8`}
                                style={{
                                  backgroundColor: event.is_exception
                                    ? theme.danger_color
                                    : index === 0
                                    ? theme.success_color
                                    : theme.background.subtle,
                                  ringColor: theme.background.card
                                }}
                              >
                                {getEventIcon(event.event_type, event.is_exception, index === 0)}
                              </div>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="min-w-0 flex-1 py-1.5">
                            <div className="text-sm">
                              <p
                                className="font-medium"
                                style={{
                                  color: event.is_exception ? theme.danger_color : theme.text.primary
                                }}
                              >
                                {event.event_description}
                              </p>
                              {event.description && event.description !== event.event_description && (
                                <p className="mt-1" style={{ color: theme.text.secondary }}>
                                  {event.description}
                                </p>
                              )}
                              {(event.location_city || event.location_description) && (
                                <p className="mt-1 flex items-center gap-1" style={{ color: theme.text.secondary }}>
                                  <MapPin size={12} />
                                  {event.location_description && `${event.location_description}, `}
                                  {event.location_city && `${event.location_city}, `}
                                  {event.location_state}
                                  {event.location_country && `, ${event.location_country}`}
                                </p>
                              )}
                              <p className="mt-1 text-xs" style={{ color: theme.text.muted }}>
                                {formatDate(event.event_time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Info Cards & Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Action Buttons */}
          <Card padding="default">
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Share2 size={18} />}
                onClick={handleShare}
              >
                Share Tracking Link
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Printer size={18} />}
                onClick={() => window.print()}
              >
                Print Details
              </Button>
            </div>
          </Card>

          {/* Origin & Destination */}
          <Card padding="default">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>
                  Origin
                </p>
                <p className="font-semibold" style={{ color: theme.text.primary }}>
                  {shipment.origin_address}
                </p>
                <p className="text-sm capitalize" style={{ color: theme.text.secondary }}>
                  {shipment.origin_city}, {shipment.origin_state}, {shipment.origin_country}
                </p>
              </div>
              <div className="relative flex items-center">
                <div
                  className="flex-grow border-t border-dashed"
                  style={{ borderColor: theme.border.color }}
                />
                <span className="mx-2 flex-shrink" style={{ color: theme.text.muted }}>
                  <ArrowRight size={16} />
                </span>
                <div
                  className="flex-grow border-t border-dashed"
                  style={{ borderColor: theme.border.color }}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>
                  Destination
                </p>
                <p className="font-semibold" style={{ color: theme.text.primary }}>
                  {shipment.destination_address}
                </p>
                <p className="text-sm capitalize" style={{ color: theme.text.secondary }}>
                  {shipment.destination_city}, {shipment.destination_state}, {shipment.destination_country}
                </p>
              </div>
            </div>
          </Card>

          {/* Shipment Details */}
          <Card padding="default">
            <h2 className="mb-4 text-lg font-bold" style={{ color: theme.text.primary }}>
              Shipment Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt style={{ color: theme.text.muted }}>Carrier:</dt>
                <dd className="font-medium" style={{ color: theme.text.primary }}>
                  {shipment.carrier_name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: theme.text.muted }}>Service:</dt>
                <dd className="font-medium capitalize" style={{ color: theme.text.primary }}>
                  {shipment.service_type}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: theme.text.muted }}>Type:</dt>
                <dd className="font-medium capitalize" style={{ color: theme.text.primary }}>
                  {shipment.shipment_type}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: theme.text.muted }}>Weight:</dt>
                <dd className="font-medium" style={{ color: theme.text.primary }}>
                  {shipment.total_weight} {shipment.weight_unit}
                </dd>
              </div>
              {shipment.dimensions && (
                <div className="flex justify-between">
                  <dt style={{ color: theme.text.muted }}>Dimensions:</dt>
                  <dd className="font-medium" style={{ color: theme.text.primary }}>
                    {shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height}{' '}
                    {shipment.dimensions.unit}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt style={{ color: theme.text.muted }}>Packages:</dt>
                <dd className="font-medium" style={{ color: theme.text.primary }}>
                  {shipment.package_count}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: theme.text.muted }}>Insurance:</dt>
                <dd className="font-medium" style={{ color: theme.text.primary }}>
                  {shipment.is_insured ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Items List */}
          {shipment.items && shipment.items.length > 0 && (
            <Card padding="default">
              <h2 className="mb-4 text-lg font-bold" style={{ color: theme.text.primary }}>
                Package Contents
              </h2>
              <ul className="space-y-3">
                {shipment.items.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium" style={{ color: theme.text.primary }}>
                        {item.description}
                      </p>
                      <p style={{ color: theme.text.muted }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ color: theme.text.muted }}>{item.weight} kg</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingDetail;
