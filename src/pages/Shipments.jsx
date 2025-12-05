import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight, Clock } from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getShipments } from '../services/shipmentService';

const Shipments = () => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await getShipments();
      setShipments(data.items || []);
    } catch (err) {
      setError(err.message);
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
      backgroundColor: `${colors.bg}1A`,
      color: colors.color
    };
  };

  const formatStatus = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
            Shipments
          </h1>
          <p style={{ color: theme.text.secondary }}>
            Manage and track all your shipments
          </p>
        </div>
        {shipments.length > 0 && (
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate('/shipments/create')}
          >
            Create Shipment
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div
          className={`p-4 border ${getBorderRadius()}`}
          style={{
            backgroundColor: `${theme.danger_color}0D`,
            borderColor: `${theme.danger_color}33`
          }}
        >
          <p className="text-sm" style={{ color: theme.danger_color }}>
            {error}
          </p>
        </div>
      )}

      {/* Shipments List */}
      {shipments.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No shipments yet"
          description="Start by creating your first shipment. Get quotes, select a service, and ship with ease."
          actionLabel="Create Shipment"
          onAction={() => navigate('/shipments/create')}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: theme.background.subtle, borderBottom: `1px solid ${theme.border.color}` }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Shipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: theme.background.card }}>
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: `1px solid ${theme.border.color}` }}
                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={16} style={{ color: theme.text.muted }} className="mr-2" />
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                            {shipment.code}
                          </div>
                          {shipment.awb_no && (
                            <div className="text-xs" style={{ color: theme.text.muted }}>
                              AWB: {shipment.awb_no}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} style={{ color: theme.text.muted }} />
                            <span className="font-medium" style={{ color: theme.text.primary }}>
                              {shipment.origin_address.city}, {shipment.origin_address.country}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowRight size={12} style={{ color: theme.text.muted }} />
                            <span style={{ color: theme.text.secondary }}>
                              {shipment.destination_address.city}, {shipment.destination_address.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: theme.text.primary }}>
                        {shipment.carrier_name}
                      </div>
                      <div className="text-xs capitalize" style={{ color: theme.text.muted }}>
                        {shipment.service_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={getStatusStyle(shipment.status)}
                      >
                        {formatStatus(shipment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {shipment.currency} {shipment.final_price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm" style={{ color: theme.text.muted }}>
                        <Clock size={12} />
                        <span>{formatDate(shipment.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shipments/${shipment.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Shipments;
