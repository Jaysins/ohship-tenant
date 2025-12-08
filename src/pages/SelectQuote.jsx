import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import { getSessionItem, setSessionItem, removeSessionItem, StorageKey } from '../utils/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import QuoteCard from '../components/ui/QuoteCard';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import { Package, ArrowLeft } from 'lucide-react';

/**
 * SelectQuote Page
 * Step 2: Display and select from available shipping quotes
 * Loads data from sessionStorage (passed from Step 1)
 */
const SelectQuote = () => {
  const navigate = useNavigate();
  const { theme } = useTenantConfig();

  const [quotes, setQuotes] = useState([]);
  const [quoteResponseData, setQuoteResponseData] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load from sessionStorage (set by Step 1)
    const tempQuoteResponse = getSessionItem(StorageKey.TEMP_QUOTE_RESPONSE);

    if (!tempQuoteResponse) {
      // No data - user refreshed or navigated directly
      // Redirect to create shipment page
      navigate('/quote/create');
      return;
    }

    // Extract rates from response data
    const rates = tempQuoteResponse.rates || [];

    if (rates.length === 0) {
      setError('No quotes available for this route. Please try different locations.');
      return;
    }

    // Transform quotes to match QuoteCard expected format
    const transformedQuotes = rates.map(quote => ({
      id: quote.quote_id,
      quote_id: quote.quote_id,
      carrier_name: quote.carrier_name || quote.display_name,
      carrier_code: quote.carrier_code,
      carrier_logo_url: quote.carrier_logo_url,
      service_type: quote.service_type,
      service_name: quote.service_name,
      transit_days: quote.estimated_days,
      estimated_delivery_date: quote.estimated_delivery_date,
      pricing: {
        base_cost: quote.base_rate,
        adjustments: quote.adjustments || [], // Pass full array for detailed breakdown
        discounts: quote.discounts || [], // Pass full array for detailed breakdown
        total: quote.total_amount,
      },
      currency: quote.currency,
      metadata: quote.metadata,
    }));

    setQuotes(transformedQuotes);
    setQuoteResponseData(tempQuoteResponse);
  }, [navigate]);

  const handleSelectQuote = (quote) => {
    setSelectedQuoteId(quote.id);
  };

  const handleContinue = () => {
    const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

    if (!selectedQuote) {
      setError('Please select a quote to continue');
      return;
    }

    // Store BOTH the full quote data AND the selected quote_id
    setSessionItem(StorageKey.SELECTED_QUOTE_DATA, {
      quoteData: quoteResponseData, // Full response from Step 1
      selectedQuoteId: selectedQuote.quote_id // The selected rate's quote_id
    });

    // Clean up temporary storage
    removeSessionItem(StorageKey.TEMP_QUOTE_RESPONSE);

    // Navigate to checkout
    navigate('/quote/checkout');
  };

  const handleEditRoute = () => {
    navigate('/quote/create');
  };

  if (error && quotes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert
          variant="error"
          title="No Quotes Available"
          message={error}
          className="mb-4"
        />
        <Button onClick={handleEditRoute} variant="primary">
          <ArrowLeft size={18} />
          <span className="ml-2">Start New Quote</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress indicator */}
      <ProgressBar
        currentStep={2}
        totalSteps={4}
        stepLabels={['Route & Package', 'Select Quote', 'Details & Review', 'Payment']}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
          Available Quotes
        </h1>
        <p style={{ color: theme.text.secondary }}>
          Select a shipping option that best fits your needs
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert
          variant="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* Quotes list */}
      {quotes.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Quotes Available"
          message="We couldn't find any shipping options for this route."
        />
      ) : (
        <div className="space-y-4 mb-6">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              currency={quote.currency || quoteResponseData?.rates?.[0]?.currency || 'NGN'}
              selected={selectedQuoteId === quote.id}
              onSelect={handleSelectQuote}
            />
          ))}
        </div>
      )}

      {/* Action buttons */}
      {quotes.length > 0 && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleEditRoute}
            className="flex-1"
          >
            <ArrowLeft size={18} />
            <span className="ml-2">Back to Route</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedQuoteId}
            className="flex-1"
          >
            Continue to Checkout
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectQuote;
