import { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, Clock, Calculator, MapPin, FileText, Wallet, ArrowUpRight, CreditCard } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getWallets } from '../services/walletService';
import { getDashboardStats } from '../services/dashboardService';
import { extractErrorMessage } from '../utils/errorHandler';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, content, features, getBorderRadius } = useTenantConfig();
  const [wallets, setWallets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWallets();
    loadDashboard();
  }, []);

  const loadWallets = async () => {
    try {
      setLoadingWallets(true);
      const walletsData = await getWallets();
      setWallets(walletsData);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoadingWallets(false);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setError(null);
      const data = await getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to load dashboard data');
      setError(errorMessage);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const formatBalance = (balance, currency) => {
    return `${currency} ${parseFloat(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'success',
      warning: 'warning',
      info: 'info',
      danger: 'danger'
    };
    return colors[status] || 'info';
  };

  // Generate stats from dashboard data
  const getStats = () => {
    if (!dashboardData?.summary) return [];

    const { summary } = dashboardData;
    return [
      {
        title: 'Total Shipments',
        value: summary.total_shipments.toLocaleString(),
        icon: Package,
        trend: summary.total_shipments_trend,
        trendLabel: 'vs last period',
        color: 'indigo'
      },
      {
        title: 'In Transit',
        value: summary.in_transit_shipments.toLocaleString(),
        icon: TrendingUp,
        trend: summary.in_transit_trend,
        trendLabel: 'vs last period',
        color: 'amber'
      },
      {
        title: 'Total Spent',
        value: `${summary.total_spent_currency} ${summary.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        trend: summary.total_spent_trend,
        trendLabel: 'vs last period',
        color: 'green'
      },
      {
        title: 'Avg Delivery Time',
        value: summary.avg_delivery_days > 0 ? `${summary.avg_delivery_days} days` : 'N/A',
        icon: Clock,
        trend: summary.avg_delivery_trend,
        trendLabel: summary.avg_delivery_trend < 0 ? 'faster than avg' : 'slower than avg',
        color: 'blue'
      }
    ];
  };

  const quickActions = [
    { label: 'Create Shipment', icon: Package, path: '/shipments/create', color: 'primary' },
    { label: 'Get Quote', icon: Calculator, path: '/quote', color: 'secondary' },
    { label: 'Track Package', icon: MapPin, path: '/tracking', color: 'outline' }
  ];

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
          Dashboard
        </h1>
        <p style={{ color: theme.text.secondary }}>
          {content.dashboard_greeting}
        </p>
      </div>

      {/* Error Display */}
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

      {/* Wallet Cards */}
      {!loadingWallets && wallets.length > 0 && features.show_wallet_balance && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wallets.map((wallet) => (
            <Card key={wallet.id} padding="default">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: wallet.is_primary ? `${theme.primary_color}1A` : theme.background.subtle
                    }}
                  >
                    <Wallet
                      size={24}
                      style={{
                        color: wallet.is_primary ? theme.primary_color : theme.text.muted
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                        {wallet.wallet_type === 'account' ? 'Account Wallet' : 'Tenant Wallet'}
                      </p>
                      {wallet.is_primary && (
                        <Badge variant="success" size="sm">Primary</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold mt-1" style={{ color: theme.text.primary }}>
                      {formatBalance(wallet.balance, wallet.currency)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                      {wallet.key}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowUpRight size={16} />}
                  onClick={() => navigate('/transactions')}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      {dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStats().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}

      {/* Charts Row */}
      {dashboardData && features.show_dashboard_charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipment Volume Chart */}
          <Card title="Shipment Volume" subtitle="Last 7 days">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.shipment_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border.color} />
                <XAxis
                  dataKey="day"
                  stroke={theme.text.secondary}
                  fontSize={12}
                />
                <YAxis stroke={theme.text.secondary} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.color}`,
                    borderRadius: '8px',
                    color: theme.text.primary
                  }}
                  labelFormatter={(value) => {
                    const item = dashboardData.shipment_volume.find(d => d.day === value);
                    return item ? `${item.day_full}, ${item.date}` : value;
                  }}
                  formatter={(value) => [value, 'Shipments']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={theme.primary_color}
                  strokeWidth={2}
                  dot={{ fill: theme.primary_color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cost Analysis Chart */}
        <Card title="Spending Analysis" subtitle="Last 7 days">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.spending}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border.color} />
                <XAxis
                  dataKey="day"
                  stroke={theme.text.secondary}
                  fontSize={12}
                />
                <YAxis stroke={theme.text.secondary} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.background.card,
                    border: `1px solid ${theme.border.color}`,
                    borderRadius: '8px',
                    color: theme.text.primary
                  }}
                  labelFormatter={(value) => {
                    const item = dashboardData.spending.find(d => d.day === value);
                    return item ? `${item.day_full}, ${item.date}` : value;
                  }}
                  formatter={(value) => [`${dashboardData.summary.total_spent_currency} ${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill={theme.success_color} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      )}

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        {dashboardData && dashboardData.recent_activity && dashboardData.recent_activity.length > 0 && (
          <Card title="Recent Activity" className="lg:col-span-2" padding="none">
            <div style={{ borderTop: `1px solid ${theme.border.color}` }}>
              {dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id}
                  className="px-6 py-4 transition-colors cursor-pointer"
                  style={{
                    borderBottom: index < 4 ? `1px solid ${theme.border.color}` : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    if (activity.type === 'shipment' && activity.reference_id) {
                      navigate(`/shipments/${activity.reference_id}`);
                    } else if (activity.type === 'payment' && activity.reference_id) {
                      navigate(`/transactions/${activity.id}`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {activity.type === 'payment' && (
                        <CreditCard size={18} style={{ color: theme.text.muted }} />
                      )}
                      {activity.type === 'shipment' && (
                        <Package size={18} style={{ color: theme.text.muted }} />
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                          {activity.title}
                        </p>
                        <p className="text-xs mt-1" style={{ color: theme.text.secondary }}>
                          {activity.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(activity.status)} size="sm">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty state for no activity */}
        {dashboardData && (!dashboardData.recent_activity || dashboardData.recent_activity.length === 0) && (
          <Card title="Recent Activity" className="lg:col-span-2" padding="default">
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: theme.text.muted }}>
                No recent activity
              </p>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {features.enable_quick_actions && (
          <Card title="Quick Actions">
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.color}
                    fullWidth
                    leftIcon={<Icon size={18} />}
                    onClick={() => navigate(action.path)}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {features.show_support_section && (
              <div
                className={`mt-6 p-4 ${getBorderRadius()}`}
                style={{ backgroundColor: `${theme.primary_color}0D` }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  {content.support_text}
                </p>
                <p className="text-xs mb-3" style={{ color: theme.text.secondary }}>
                  {content.support_subtext}
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  {content.support_button}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
