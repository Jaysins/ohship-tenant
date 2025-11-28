import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getShipments } from '../services/shipmentService';

const Shipments = () => {
  const navigate = useNavigate();
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

  const getStatusColor = (status) => {
    const statusColors = {
      pending_pickup: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-slate-900">Shipments</h1>
          <p className="text-slate-600">Manage and track all your shipments</p>
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
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
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Shipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={16} className="text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {shipment.code}
                          </div>
                          {shipment.awb_no && (
                            <div className="text-xs text-slate-500">
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
                            <MapPin size={12} className="text-slate-400" />
                            <span className="text-slate-900 font-medium">
                              {shipment.origin_address.city}, {shipment.origin_address.country}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowRight size={12} className="text-slate-400" />
                            <span className="text-slate-600">
                              {shipment.destination_address.city}, {shipment.destination_address.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{shipment.carrier_name}</div>
                      <div className="text-xs text-slate-500 capitalize">{shipment.service_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {formatStatus(shipment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {shipment.currency} {shipment.final_price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
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
