import { useState, useEffect, useRef } from 'react';
import { Truck, Clock, CheckCircle, Zap, Package as PackageIcon, AlertCircle, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import { fetchShippingQuotes, buildQuoteRequest } from '../../services/quoteService';

const ServiceSelectionForm = ({ formData, updateFormData, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(formData.selectedQuote || null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double API call in development (React StrictMode)
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchQuotes();
    }
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestData = buildQuoteRequest(formData);
      const quotesData = await fetchShippingQuotes(requestData);

      setQuotes(quotesData);
      updateFormData({ quotes: quotesData });
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(err.message || 'Failed to fetch shipping quotes. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (quote) => {
    setSelectedQuote(quote);
    updateFormData({ selectedQuote: quote });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedQuote) {
      onNext();
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType?.toUpperCase()) {
      case 'EXPRESS':
        return Zap;
      case 'STANDARD':
        return PackageIcon;
      case 'ECONOMY':
        return Truck;
      default:
        return PackageIcon;
    }
  };

  const calculateSubtotal = (quote) => {
    let subtotal = quote.base_rate;
    if (quote.adjustments) {
      quote.adjustments.forEach(adj => {
        subtotal += adj.amount;
      });
    }
    return subtotal;
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Calculating shipping rates..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle size={24} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 mb-1">Error loading quotes</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" variant="primary" onClick={fetchQuotes}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <PackageIcon size={48} className="text-amber-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-amber-900 mb-1">No quotes available</p>
          <p className="text-sm text-amber-700">
            We couldn't find any shipping options for your package. Please try adjusting your details.
          </p>
        </div>
        <div className="flex justify-start gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to Package Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Truck size={18} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Select Shipping Service</h3>
          <p className="text-sm text-slate-600">
            Found {quotes.length} {quotes.length === 1 ? 'option' : 'options'} for your shipment
          </p>
        </div>
      </div>

      {/* Service Options */}
      <div className="space-y-4">
        {quotes.map((quote, index) => {
          const Icon = getServiceIcon(quote.service_type);
          const isSelected = selectedQuote?.quote_id === quote.quote_id;
          const isFastest = index === 0 && quote.service_type === 'EXPRESS';
          const hasDiscount = quote.discounts && quote.discounts.length > 0;

          return (
            <motion.div
              key={quote.quote_id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                type="button"
                onClick={() => handleSelectService(quote)}
                className={`
                  w-full text-left p-6 rounded-lg border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-indigo-600 bg-indigo-50 shadow-medium'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-soft'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center shrink-0
                    ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}
                  `}>
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {quote.display_name}
                          </h4>
                          {isFastest && (
                            <Badge variant="success" size="sm">Fastest</Badge>
                          )}
                          {hasDiscount && (
                            <Badge variant="warning" size="sm">
                              <Tag size={12} className="mr-1" />
                              Discount
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {quote.carrier_name} • {quote.service_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">
                          {quote.currency} {quote.total_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">Total</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} className="text-slate-400" />
                      <p className="text-sm text-slate-600">
                        {quote.estimated_days} {quote.estimated_days === 1 ? 'day' : 'days'}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-2">Price Details:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Base Rate</span>
                          <span>{quote.currency} {quote.base_rate.toFixed(2)}</span>
                        </div>
                        {quote.adjustments && quote.adjustments.map((adj, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-600">
                            <span>{adj.description}</span>
                            <span>
                              {adj.rate && `${adj.rate}% `}
                              {quote.currency} {adj.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}

                        {/* Discounts */}
                        {hasDiscount && (
                          <>
                            <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                              <span>Subtotal</span>
                              <span>{quote.currency} {calculateSubtotal(quote).toFixed(2)}</span>
                            </div>
                            {quote.discounts.map((discount, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-green-600 font-medium">
                                <span className="flex items-center gap-1">
                                  <Tag size={12} />
                                  {discount.description}
                                </span>
                                <span>-{quote.currency} {discount.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {quote.metadata && quote.metadata.billable_weight && (
                      <div className="mt-2 text-xs text-slate-500">
                        Billable weight: {quote.metadata.billable_weight} kg ({quote.metadata.weight_type})
                      </div>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="shrink-0"
                    >
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Error Message */}
      {!selectedQuote && (
        <p className="text-sm text-red-600">Please select a shipping service to continue</p>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={!selectedQuote}>
          Review Order
        </Button>
      </div>
    </form>
  );
};

export default ServiceSelectionForm;
