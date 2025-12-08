import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight, Clock, Search, Calendar } from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import ShipmentDetailSidebar from '../components/shipments/ShipmentDetailSidebar';
import { getShipments } from '../services/shipmentService';

const Shipments = () => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar state
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    code: '',
    shipment_type: '',
    pickup_type: '',
    search: ''
  });

  // Local search input state (separate from filters)
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadShipments();
  }, [currentPage, itemsPerPage, filters]);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.status && { status: filters.status }),
        ...(filters.code && { code: filters.code }),
        ...(filters.shipment_type && { shipment_type: filters.shipment_type }),
        ...(filters.pickup_type && { pickup_type: filters.pickup_type }),
        ...(filters.search && { search: filters.search })
      };

      const data = await getShipments(params);
      setShipments(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.total_pages || Math.ceil((data.total || 0) / itemsPerPage));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
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

  const handleViewShipment = (shipmentId) => {
    setSelectedShipmentId(shipmentId);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedShipmentId(null);
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
            onClick={() => navigate('/quote/create')}
          >
            Create Shipment
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card padding="default">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.text.muted }} />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className={`w-full pl-10 pr-4 py-2 border ${getBorderRadius()} outline-none`}
                style={{
                  backgroundColor: theme.background.card,
                  color: theme.text.primary,
                  borderColor: theme.border.color
                }}
                onFocus={(e) => {
                  e.target.style.outline = `2px solid ${theme.primary_color}`;
                  e.target.style.outlineOffset = '0px';
                  e.target.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = theme.border.color;
                }}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`px-4 py-2 border ${getBorderRadius()} outline-none`}
            style={{
              backgroundColor: theme.background.card,
              color: theme.text.primary,
              borderColor: theme.border.color
            }}
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${theme.primary_color}`;
              e.target.style.outlineOffset = '0px';
              e.target.style.borderColor = 'transparent';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.borderColor = theme.border.color;
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending_pickup">Pending Pickup</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>

          {/* Shipment Type Filter */}
          <select
            value={filters.shipment_type}
            onChange={(e) => handleFilterChange('shipment_type', e.target.value)}
            className={`px-4 py-2 border ${getBorderRadius()} outline-none`}
            style={{
              backgroundColor: theme.background.card,
              color: theme.text.primary,
              borderColor: theme.border.color
            }}
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${theme.primary_color}`;
              e.target.style.outlineOffset = '0px';
              e.target.style.borderColor = 'transparent';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.borderColor = theme.border.color;
            }}
          >
            <option value="">All Shipment Types</option>
            <option value="parcel">Parcel</option>
            <option value="document">Document</option>
            <option value="freight">Freight</option>
          </select>

          {/* Pickup Type Filter */}
          <select
            value={filters.pickup_type}
            onChange={(e) => handleFilterChange('pickup_type', e.target.value)}
            className={`px-4 py-2 border ${getBorderRadius()} outline-none`}
            style={{
              backgroundColor: theme.background.card,
              color: theme.text.primary,
              borderColor: theme.border.color
            }}
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${theme.primary_color}`;
              e.target.style.outlineOffset = '0px';
              e.target.style.borderColor = 'transparent';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.borderColor = theme.border.color;
            }}
          >
            <option value="">All Pickup Types</option>
            <option value="scheduled_pickup">Scheduled Pickup</option>
            <option value="drop_off">Drop Off</option>
          </select>
        </div>
      </Card>

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
          onAction={() => navigate('/quote/create')}
        />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead style={{ backgroundColor: theme.background.subtle, borderBottom: `1px solid ${theme.border.color}` }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                  Shipment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                  Carrier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: theme.background.card, borderTop: `1px solid ${theme.border.color}` }}>
              {shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${theme.border.color}` }}
                  onClick={() => handleViewShipment(shipment.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.primary_color}dd)`,
                          borderRadius: getBorderRadius()
                        }}
                      >
                        <Package size={16} style={{ color: '#ffffff' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: theme.text.primary }}>
                          {shipment.code || 'N/A'}
                        </p>
                        <p className="text-xs truncate" style={{ color: theme.text.muted }}>
                          {shipment.service_type || 'Standard'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm min-w-0">
                      <span
                        className="truncate max-w-[80px]"
                        style={{ color: theme.text.primary }}
                        title={shipment.origin_address.city}
                      >
                        {shipment.origin_address.city}
                      </span>
                      <ArrowRight size={12} style={{ color: theme.text.muted }} className="flex-shrink-0" />
                      <span
                        className="truncate max-w-[80px]"
                        style={{ color: theme.text.primary }}
                        title={shipment.destination_address.city}
                      >
                        {shipment.destination_address.city}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                      {shipment.carrier_name || 'N/A'}
                    </p>
                    <span className="inline-flex items-center text-xs capitalize" style={{ color: theme.text.secondary }}>
                      {shipment.pickup_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold capitalize whitespace-nowrap ${getBorderRadius()}`}
                      style={getStatusStyle(shipment.status)}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm" style={{ color: theme.text.primary }}>
                      <Calendar size={12} style={{ color: theme.text.muted }} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewShipment(shipment.id);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-4 py-4" style={{ borderTop: `1px solid ${theme.border.color}` }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[10, 20, 50, 100]}
              />
            </div>
          )}
        </Card>
      )}

      {/* Shipment Detail Sidebar */}
      <ShipmentDetailSidebar
        shipmentId={selectedShipmentId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default Shipments;
