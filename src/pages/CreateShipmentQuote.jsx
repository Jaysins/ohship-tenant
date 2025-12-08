import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import { fetchShippingQuotes } from '../services/quoteService';
import { getItemCategories } from '../services/shipmentService';
import { extractErrorMessage } from '../utils/errorHandler';
import { setSessionItem, StorageKey } from '../utils/storage';
import { isRequired, isValidNumber } from '../utils/validation';
import { getAllCountries, getStatesOfCountry, getCountryOptions, getStateOptions } from '../data/countries';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import CityAutocomplete from '../components/ui/CityAutocomplete';
import ProgressBar from '../components/ui/ProgressBar';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * CreateShipmentQuote Page
 * Step 1: Enter origin, destination, and basic package details to get quotes
 */
const CreateShipmentQuote = () => {
  const navigate = useNavigate();
  const { theme, getBorderRadius } = useTenantConfig();

  // Form state
  const [originCountry, setOriginCountry] = useState('');
  const [originState, setOriginState] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destState, setDestState] = useState('');
  const [destCity, setDestCity] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [declaredValue, setDeclaredValue] = useState('');
  const [isInsured, setIsInsured] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getItemCategories();
      setCategories(cats || []);
      // Set first category as default
      if (cats && cats.length > 0) {
        setDefaultCategory(cats[0]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };


  // Get country and state options
  const countryOptions = getCountryOptions();
  const originStateOptions = getStateOptions(originCountry);
  const destStateOptions = getStateOptions(destCountry);

  const validateForm = () => {
    if (!isRequired(originCountry)) {
      setError('Please select origin country');
      return false;
    }

    if (!isRequired(originState)) {
      setError('Please select origin state');
      return false;
    }

    if (!isRequired(originCity)) {
      setError('Please enter origin city');
      return false;
    }

    if (!isRequired(destCountry)) {
      setError('Please select destination country');
      return false;
    }

    if (!isRequired(destState)) {
      setError('Please select destination state');
      return false;
    }

    if (!isRequired(destCity)) {
      setError('Please enter destination city');
      return false;
    }

    if (!isValidNumber(totalWeight, { min: 0.1 })) {
      setError('Please enter a valid weight (minimum 0.1 kg)');
      return false;
    }

    if (!isValidNumber(totalQuantity, { min: 1 })) {
      setError('Please enter a valid quantity (minimum 1)');
      return false;
    }

    if (declaredValue && !isValidNumber(declaredValue, { min: 0 })) {
      setError('Please enter a valid declared value');
      return false;
    }

    return true;
  };

  const handleGetQuotes = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!defaultCategory) {
      setError('Unable to load categories. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);

      // Build quote request with items array
      const quoteRequest = {
        origin: {
          country: originCountry,
          state: originState.toLowerCase(),
          city: originCity.toLowerCase(),
        },
        destination: {
          country: destCountry,
          state: destState.toLowerCase(),
          city: destCity.toLowerCase(),
        },
        items: [
          {
            quantity: parseInt(totalQuantity),
            weight: parseFloat(totalWeight),
            declared_value: declaredValue ? parseFloat(declaredValue) : undefined,
            // Use default category with all required fields
            category_id: defaultCategory.id,
            category_name: defaultCategory.name,
            category_description: defaultCategory.description || '',
            category_hs_code: defaultCategory.hs_code || '',
            category_group_tag: defaultCategory.group_tag || '',
            description: 'Package',
            package_type: 'box',
            length: undefined,
            width: undefined,
            height: undefined,
          }
        ],
        currency: 'NGN',
        is_insured: isInsured,
      };

      // Fetch quotes - response includes { status, message, data }
      const response = await fetchShippingQuotes(quoteRequest);

      if (!response.data.rates || response.data.rates.length === 0) {
        setError('No quotes available for this route. Please try different locations.');
        return;
      }

      // Store ENTIRE response.data in sessionStorage for next page
      // This includes: origin, destination, items, is_insured, rates[]
      setSessionItem(StorageKey.TEMP_QUOTE_RESPONSE, response.data);

      // Navigate to quote selection page
      navigate('/quote/select');
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(extractErrorMessage(err, 'Failed to fetch quotes. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress indicator */}
      <ProgressBar
        currentStep={1}
        totalSteps={4}
        stepLabels={['Route & Package', 'Select Quote', 'Details & Review', 'Payment']}
        className="mb-6"
      />

      <Card>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Get Shipping Quote
            </h1>
            <p style={{ color: theme.text.secondary }}>
              Enter your shipment details to get instant quotes from multiple carriers
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

          {/* Origin section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
              Origin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Country"
                value={originCountry}
                onChange={(e) => {
                  setOriginCountry(e.target.value);
                  setOriginState('');
                  setOriginCity('');
                }}
                options={countryOptions}
                placeholder="Select country"
                required
              />
              <Select
                label="State/Province"
                value={originState}
                onChange={(e) => {
                  setOriginState(e.target.value);
                  setOriginCity('');
                }}
                options={originStateOptions}
                placeholder="Select state"
                disabled={!originCountry}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium" style={{ color: theme.text.primary }}>
                City <span style={{ color: theme.danger_color }}>*</span>
              </label>
              <CityAutocomplete
                countryCode={originCountry}
                value={originCity}
                onChange={setOriginCity}
                placeholder="Enter city name"
              />
            </div>
          </div>

          {/* Destination section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
              Destination
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Country"
                value={destCountry}
                onChange={(e) => {
                  setDestCountry(e.target.value);
                  setDestState('');
                  setDestCity('');
                }}
                options={countryOptions}
                placeholder="Select country"
                required
              />
              <Select
                label="State/Province"
                value={destState}
                onChange={(e) => {
                  setDestState(e.target.value);
                  setDestCity('');
                }}
                options={destStateOptions}
                placeholder="Select state"
                disabled={!destCountry}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium" style={{ color: theme.text.primary }}>
                City <span style={{ color: theme.danger_color }}>*</span>
              </label>
              <CityAutocomplete
                countryCode={destCountry}
                value={destCity}
                onChange={setDestCity}
                placeholder="Enter city name"
              />
            </div>
          </div>

          {/* Package details section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
              Package Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Total Weight (kg)"
                type="number"
                value={totalWeight}
                onChange={(e) => setTotalWeight(e.target.value)}
                placeholder="0.0"
                min="0.1"
                step="0.1"
                required
              />
              <Input
                label="Quantity"
                type="number"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                placeholder="1"
                min="1"
                required
              />
              <Input
                label="Declared Value (NGN)"
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Insurance toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInsured}
                onChange={(e) => setIsInsured(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: theme.primary_color }}
              />
              <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                Add Insurance Coverage
              </span>
            </label>
            <p className="ml-6 text-xs mt-1" style={{ color: theme.text.muted }}>
              Protect your shipment against loss or damage
            </p>
          </div>

          {/* Error alert near button */}
          {error && (
            <Alert
              variant="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleGetQuotes}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Fetching Quotes...</span>
                </>
              ) : (
                'Get Quotes'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateShipmentQuote;
