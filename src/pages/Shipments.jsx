import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight, Clock, Search } from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { getShipments } from '../services/shipmentService';

const Shipments = () => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-4" style={{ borderTop: `1px solid ${theme.border.color}` }}>
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
    </div>
  );
};

export default Shipments;
