import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpCircle, ArrowDownCircle, Search, Filter, Calendar,
  CheckCircle2, XCircle, Clock, Eye
} from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getTransactions } from '../services/transactionService';
import { extractErrorMessage } from '../utils/errorHandler';

const Transactions = () => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    transaction_type: '',
    search: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions();
      setTransactions(data.items || []);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to load transactions');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
        return <CheckCircle2 size={16} style={{ color: theme.success_color }} />;
      case 'failed':
        return <XCircle size={16} style={{ color: theme.danger_color }} />;
      case 'attempted':
      case 'pending':
        return <Clock size={16} style={{ color: theme.warning_color }} />;
      default:
        return <Clock size={16} style={{ color: theme.text.muted }} />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'successful':
        return {
          backgroundColor: `${theme.success_color}1A`,
          color: theme.success_color,
          borderColor: `${theme.success_color}33`
        };
      case 'failed':
        return {
          backgroundColor: `${theme.danger_color}1A`,
          color: theme.danger_color,
          borderColor: `${theme.danger_color}33`
        };
      case 'attempted':
      case 'pending':
        return {
          backgroundColor: `${theme.warning_color}1A`,
          color: theme.warning_color,
          borderColor: `${theme.warning_color}33`
        };
      default:
        return {
          backgroundColor: theme.background.subtle,
          color: theme.text.muted,
          borderColor: theme.border.color
        };
    }
  };

  const getActionIcon = (action) => {
    return action === 'credit' ? (
      <ArrowUpCircle size={20} style={{ color: theme.success_color }} />
    ) : (
      <ArrowDownCircle size={20} style={{ color: theme.danger_color }} />
    );
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      payment: 'Payment',
      top_up: 'Top Up',
      settlement: 'Settlement',
      refund: 'Refund',
      withdrawal: 'Withdrawal'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, currency) => {
    return `${currency} ${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.transaction_type && transaction.transaction_type !== filters.transaction_type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        transaction.code.toLowerCase().includes(searchLower) ||
        transaction.reference.toLowerCase().includes(searchLower) ||
        transaction.narration.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>Transactions</h1>
          <p className="mt-1" style={{ color: theme.text.secondary }}>View and manage your transaction history</p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="default">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.text.muted }} />
            <input
              type="text"
              placeholder="Search by code, reference, or narration..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
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
            <option value="successful">Successful</option>
            <option value="attempted">Attempted</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.transaction_type}
            onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
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
            <option value="">All Types</option>
            <option value="payment">Payment</option>
            <option value="top_up">Top Up</option>
            <option value="settlement">Settlement</option>
            <option value="refund">Refund</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div
          className={`p-4 border ${getBorderRadius()}`}
          style={{
            backgroundColor: `${theme.danger_color}0D`,
            borderColor: `${theme.danger_color}33`
          }}
        >
          <p className="text-sm" style={{ color: theme.danger_color }}>{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: theme.background.subtle, borderBottom: `1px solid ${theme.border.color}` }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: theme.text.muted }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: theme.background.card }}>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p style={{ color: theme.text.muted }}>No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition-colors"
                    style={{ borderBottom: `1px solid ${theme.border.color}` }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Transaction Code & Narration */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getActionIcon(transaction.action)}
                        <div>
                          <p className="text-sm font-medium" style={{ color: theme.text.primary }}>{transaction.code}</p>
                          <p className="text-xs line-clamp-1" style={{ color: theme.text.muted }}>{transaction.narration}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${theme.primary_color}1A`,
                          color: theme.primary_color
                        }}
                      >
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono" style={{ color: theme.text.primary }}>{transaction.reference}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: transaction.action === 'credit' ? theme.success_color : theme.danger_color
                          }}
                        >
                          {transaction.action === 'credit' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
                        </p>
                        {transaction.paid !== transaction.amount && (
                          <p className="text-xs" style={{ color: theme.text.muted }}>
                            Paid: {formatAmount(transaction.paid, transaction.currency)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span
                          className="px-2 py-1 rounded text-xs font-medium border"
                          style={getStatusStyle(transaction.status)}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: theme.text.muted }} />
                        <p className="text-sm" style={{ color: theme.text.secondary }}>{formatDate(transaction.created_at)}</p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye size={16} />}
                        onClick={() => navigate(`/transactions/${transaction.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="default">
            <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Total Transactions</p>
            <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>{filteredTransactions.length}</p>
          </Card>
          <Card padding="default">
            <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Successful</p>
            <p className="text-2xl font-bold" style={{ color: theme.success_color }}>
              {filteredTransactions.filter(t => t.status === 'successful').length}
            </p>
          </Card>
          <Card padding="default">
            <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Pending</p>
            <p className="text-2xl font-bold" style={{ color: theme.warning_color }}>
              {filteredTransactions.filter(t => t.status === 'attempted' || t.status === 'pending').length}
            </p>
          </Card>
          <Card padding="default">
            <p className="text-xs mb-1" style={{ color: theme.text.muted }}>Failed</p>
            <p className="text-2xl font-bold" style={{ color: theme.danger_color }}>
              {filteredTransactions.filter(t => t.status === 'failed').length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Transactions;
