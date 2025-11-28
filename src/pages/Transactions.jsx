import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpCircle, ArrowDownCircle, Search, Filter, Calendar,
  CheckCircle2, XCircle, Clock, Eye
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getTransactions } from '../services/transactionService';
import { extractErrorMessage } from '../utils/errorHandler';

const Transactions = () => {
  const navigate = useNavigate();

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
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'attempted':
      case 'pending':
        return <Clock size={16} className="text-orange-600" />;
      default:
        return <Clock size={16} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'attempted':
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getActionIcon = (action) => {
    return action === 'credit' ? (
      <ArrowUpCircle size={20} className="text-green-600" />
    ) : (
      <ArrowDownCircle size={20} className="text-red-600" />
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
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">View and manage your transaction history</p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="default">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, reference, or narration..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-slate-500">No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    {/* Transaction Code & Narration */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getActionIcon(transaction.action)}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{transaction.code}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{transaction.narration}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-slate-900">{transaction.reference}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div>
                        <p className={`text-sm font-semibold ${
                          transaction.action === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.action === 'credit' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
                        </p>
                        {transaction.paid !== transaction.amount && (
                          <p className="text-xs text-slate-500">
                            Paid: {formatAmount(transaction.paid, transaction.currency)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <p className="text-sm text-slate-600">{formatDate(transaction.created_at)}</p>
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
            <p className="text-xs text-slate-600 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
          </Card>
          <Card padding="default">
            <p className="text-xs text-slate-600 mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredTransactions.filter(t => t.status === 'successful').length}
            </p>
          </Card>
          <Card padding="default">
            <p className="text-xs text-slate-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {filteredTransactions.filter(t => t.status === 'attempted' || t.status === 'pending').length}
            </p>
          </Card>
          <Card padding="default">
            <p className="text-xs text-slate-600 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredTransactions.filter(t => t.status === 'failed').length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Transactions;
