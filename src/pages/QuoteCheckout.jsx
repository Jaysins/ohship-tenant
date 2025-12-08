import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenantConfig } from '../context/TenantConfigContext';
import { getSessionItem, setSessionItem, StorageKey } from '../utils/storage';
import { getItemCategories, createShipment, buildShipmentRequest, getSavedAddresses } from '../services/shipmentService';
import { fetchShippingQuotes } from '../services/quoteService';
import { extractErrorMessage } from '../utils/errorHandler';
import { validateAddress, validateShipmentItem } from '../utils/validation';
import { getCountryOptions, getStateOptions } from '../data/countries';
import { PACKAGE_TYPES, PICKUP_TYPES } from '../data/packageTypes';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import CityAutocomplete from '../components/ui/CityAutocomplete';
import ProgressBar from '../components/ui/ProgressBar';
import Alert from '../components/ui/Alert';
import AccordionSection from '../components/ui/AccordionSection';
import SavedAddressSelector, { SaveAddressCheckbox } from '../components/ui/SavedAddressSelector';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import QuoteCard from '../components/ui/QuoteCard';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

/**
 * QuoteCheckout Page
 * Step 3: Detailed shipment information and quote review
 */
const QuoteCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, getBorderRadius } = useTenantConfig();

  // Detect mode from URL params (normal vs review)
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode'); // 'review' or null

  // Navigation step (3A or 3B)
  const [checkoutStep, setCheckoutStep] = useState('details'); // 'details' or 'review'

  // Shipment ID (for review mode / updates)
  const [shipmentId, setShipmentId] = useState(null);

  // Quote data from previous step
  const [quoteData, setQuoteData] = useState(null);
  const [contextQuoteId, setContextQuoteId] = useState(null);

  // Categories and saved addresses from API
  const [categories, setCategories] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Items
  const [items, setItems] = useState([
    {
      categoryId: '',
      description: '',
      packageType: 'box',
      quantity: 1,
      weight: '',
      length: '',
      width: '',
      height: '',
      declaredValue: '',
    }
  ]);

  // Sender (Origin) Address
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddressLine1, setSenderAddressLine1] = useState('');
  const [senderAddressLine2, setSenderAddressLine2] = useState('');
  const [senderCity, setSenderCity] = useState('');
  const [senderState, setSenderState] = useState('');
  const [senderPostalCode, setSenderPostalCode] = useState('');
  const [senderCountry, setSenderCountry] = useState('');
  const [saveSenderAddress, setSaveSenderAddress] = useState(false);

  // Receiver (Destination) Address
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddressLine1, setReceiverAddressLine1] = useState('');
  const [receiverAddressLine2, setReceiverAddressLine2] = useState('');
  const [receiverCity, setReceiverCity] = useState('');
  const [receiverState, setReceiverState] = useState('');
  const [receiverPostalCode, setReceiverPostalCode] = useState('');
  const [receiverCountry, setReceiverCountry] = useState('');
  const [saveReceiverAddress, setSaveReceiverAddress] = useState(false);

  // Pickup & Delivery
  const [pickupType, setPickupType] = useState('scheduled_pickup');
  const [pickupDate, setPickupDate] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Quote review (Step 3B)
  const [refreshedQuotes, setRefreshedQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('items');

  // Load data on mount
  useEffect(() => {
    loadCategories();
    loadSavedAddresses();

    // Handle review mode vs normal flow
    if (mode === 'review') {
      loadReviewModeData();
    } else {
      loadNormalFlowData();
    }
  }, [mode]);

  const loadCategories = async () => {
    try {
      const cats = await getItemCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const addresses = await getSavedAddresses();
      setSavedAddresses(addresses || []);
    } catch (err) {
      console.error('Error loading saved addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  /**
   * Load data for normal flow (coming from quote selection)
   */
  const loadNormalFlowData = () => {
    // Load from sessionStorage (set by Step 2)
    const selectedQuoteDataStr = getSessionItem(StorageKey.SELECTED_QUOTE_DATA);

    if (!selectedQuoteDataStr) {
      // No data - redirect to start
      navigate('/quote/create');
      return;
    }

    const { quoteData: selectedQuoteData, selectedQuoteId } = selectedQuoteDataStr;

    // Set quote data in state
    setQuoteData(selectedQuoteData);
    setContextQuoteId(selectedQuoteId);

    // Prefill ONLY location data (country, state, city) from backend
    // User must fill everything else
    if (selectedQuoteData.origin) {
      const originCountry = selectedQuoteData.origin.country || '';
      setSenderCountry(originCountry);

      // Backend returns lowercase state names, need to match with proper case
      if (selectedQuoteData.origin.state && originCountry) {
        const originStates = getStateOptions(originCountry);
        const matchingState = originStates.find(
          s => s.value.toLowerCase() === selectedQuoteData.origin.state.toLowerCase()
        );
        setSenderState(matchingState?.value || selectedQuoteData.origin.state);
      }

      setSenderCity(selectedQuoteData.origin.city || '');
    }

    if (selectedQuoteData.destination) {
      const destCountry = selectedQuoteData.destination.country || '';
      setReceiverCountry(destCountry);

      // Backend returns lowercase state names, need to match with proper case
      if (selectedQuoteData.destination.state && destCountry) {
        const destStates = getStateOptions(destCountry);
        const matchingState = destStates.find(
          s => s.value.toLowerCase() === selectedQuoteData.destination.state.toLowerCase()
        );
        setReceiverState(matchingState?.value || selectedQuoteData.destination.state);
      }

      setReceiverCity(selectedQuoteData.destination.city || '');
    }
  };

  /**
   * Load data for review mode (coming back from payment)
   * Prefills ALL fields including addresses, items, and pickup details
   */
  const loadReviewModeData = () => {
    // Load from sessionStorage (set by Step 3 after shipment creation)
    const createdShipmentDataStr = getSessionItem(StorageKey.CREATED_SHIPMENT_DATA);

    if (!createdShipmentDataStr) {
      // No data - redirect to start
      navigate('/quote/create');
      return;
    }

    const { shipment, formData } = createdShipmentDataStr;

    // Set shipment ID for update flow
    setShipmentId(shipment.id);

    // Prefill ALL fields from formData (including location fields)
    // Items
    if (formData.items) {
      setItems(formData.items);
    }

    // Sender (ALL fields including location)
    setSenderName(formData.senderName || '');
    setSenderEmail(formData.senderEmail || '');
    setSenderPhone(formData.senderPhone || '');
    setSenderAddressLine1(formData.senderAddressLine1 || '');
    setSenderAddressLine2(formData.senderAddressLine2 || '');
    setSenderCity(formData.senderCity || '');
    setSenderState(formData.senderState || '');
    setSenderPostalCode(formData.senderPostalCode || '');
    setSenderCountry(formData.senderCountry || '');

    // Receiver (ALL fields including location)
    setReceiverName(formData.receiverName || '');
    setReceiverEmail(formData.receiverEmail || '');
    setReceiverPhone(formData.receiverPhone || '');
    setReceiverAddressLine1(formData.receiverAddressLine1 || '');
    setReceiverAddressLine2(formData.receiverAddressLine2 || '');
    setReceiverCity(formData.receiverCity || '');
    setReceiverState(formData.receiverState || '');
    setReceiverPostalCode(formData.receiverPostalCode || '');
    setReceiverCountry(formData.receiverCountry || '');

    // Pickup
    setPickupType(formData.pickupType || 'scheduled_pickup');
    setPickupDate(formData.pickupDate || '');
    setCustomerNotes(formData.customerNotes || '');

    // Build quote data for handleReviewQuotes
    // Use shipment data to populate quoteData context
    setQuoteData({
      origin: {
        city: formData.senderCity,
        state: formData.senderState,
        country: formData.senderCountry,
      },
      destination: {
        city: formData.receiverCity,
        state: formData.receiverState,
        country: formData.receiverCountry,
      },
      items: formData.items,
      is_insured: shipment.is_insured || false,
      rates: [], // Will be refreshed
    });

    // Set contextQuoteId from shipment
    setContextQuoteId(shipment.quote_id || null);
  };


  // Saved address handlers
  const handleSelectSenderAddress = (address) => {
    setSenderName(address.name);
    setSenderEmail(address.email || '');
    setSenderPhone(address.phone);
    setSenderAddressLine1(address.address_line_1);
    setSenderAddressLine2(address.address_line_2 || '');
    setSenderCity(address.city);
    setSenderState(address.state);
    setSenderPostalCode(address.postal_code);
    setSenderCountry(address.country);
  };

  const handleSelectReceiverAddress = (address) => {
    setReceiverName(address.name);
    setReceiverEmail(address.email || '');
    setReceiverPhone(address.phone);
    setReceiverAddressLine1(address.address_line_1);
    setReceiverAddressLine2(address.address_line_2 || '');
    setReceiverCity(address.city);
    setReceiverState(address.state);
    setReceiverPostalCode(address.postal_code);
    setReceiverCountry(address.country);
  };

  // Item management
  const addItem = () => {
    setItems([...items, {
      categoryId: '',
      description: '',
      packageType: 'box',
      quantity: 1,
      weight: '',
      length: '',
      width: '',
      height: '',
      declaredValue: '',
    }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return; // Keep at least one item
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Validation
  const validateDetailsForm = () => {
    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const validation = validateShipmentItem(item);

      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        setError(`Item ${i + 1}: ${firstError}`);
        setExpandedSection('items');
        return false;
      }
    }

    // Validate sender address
    const senderValidation = validateAddress({
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      address_line_1: senderAddressLine1,
      city: senderCity,
      state: senderState,
      postal_code: senderPostalCode,
      country: senderCountry,
    });

    if (!senderValidation.valid) {
      const firstError = Object.values(senderValidation.errors)[0];
      setError(`Sender: ${firstError}`);
      setExpandedSection('sender');
      return false;
    }

    // Validate receiver address
    const receiverValidation = validateAddress({
      name: receiverName,
      email: receiverEmail,
      phone: receiverPhone,
      address_line_1: receiverAddressLine1,
      city: receiverCity,
      state: receiverState,
      postal_code: receiverPostalCode,
      country: receiverCountry,
    });

    if (!receiverValidation.valid) {
      const firstError = Object.values(receiverValidation.errors)[0];
      setError(`Receiver: ${firstError}`);
      setExpandedSection('receiver');
      return false;
    }

    // Validate pickup
    if (pickupType === 'scheduled_pickup' && !pickupDate) {
      setError('Please select a pickup date');
      setExpandedSection('pickup');
      return false;
    }

    return true;
  };

  const handleReviewQuotes = async () => {
    setError(null);

    if (!validateDetailsForm()) {
      return;
    }

    try {
      setLoading(true);

      // Build fresh quote request with current form data
      // NO quote_id included - this is a fresh request
      const quoteRequest = {
        shipment_id: shipmentId || undefined, // Include if updating existing shipment
        origin: {
          country: senderCountry,
          state: senderState.toLowerCase(),
          city: senderCity.toLowerCase(),
        },
        destination: {
          country: receiverCountry,
          state: receiverState.toLowerCase(),
          city: receiverCity.toLowerCase(),
        },
        items: items.map(item => {
          // Find the category details
          const category = categories.find(cat => cat.id === item.categoryId);

          return {
            category_id: item.categoryId,
            category_name: category?.name || '',
            category_description: category?.description || '',
            category_hs_code: category?.hs_code || '',
            category_group_tag: category?.group_tag || '',
            quantity: parseInt(item.quantity),
            weight: parseFloat(item.weight),
            declared_value: item.declaredValue ? parseFloat(item.declaredValue) : undefined,
            description: item.description || 'Package',
            package_type: item.packageType || 'box',
            length: item.length ? parseFloat(item.length) : undefined,
            width: item.width ? parseFloat(item.width) : undefined,
            height: item.height ? parseFloat(item.height) : undefined,
          };
        }),
        currency: quoteData?.rates?.[0]?.currency || 'NGN',
        is_insured: quoteData?.is_insured || false,
        // NO quote_id - we want fresh quotes
      };

      // Fetch fresh quotes - response includes { status, message, data }
      const response = await fetchShippingQuotes(quoteRequest);

      // Extract rates from response.data
      const fetchedQuotes = response.data.rates || [];

      // Transform quotes to match expected format
      const transformedQuotes = fetchedQuotes.map(quote => ({
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

      // Update context with fresh data from backend
      setQuoteData(response.data);
      setRefreshedQuotes(transformedQuotes);

      // Auto-highlight: if previously selected quote_id exists in new rates, select it
      if (contextQuoteId) {
        const matchingQuote = transformedQuotes.find(q => q.quote_id === contextQuoteId);
        if (matchingQuote) {
          setSelectedQuoteId(matchingQuote.id); // Auto-select previous choice
        } else {
          // Previous quote not available, select first quote
          setSelectedQuoteId(transformedQuotes[0]?.id || null);
        }
      } else {
        // No previous selection, select first quote
        setSelectedQuoteId(transformedQuotes[0]?.id || null);
      }

      // Move to review step
      setCheckoutStep('review');
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(extractErrorMessage(err, 'Failed to fetch quotes. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuoteOnReview = (quote) => {
    setSelectedQuoteId(quote.id);
    // Update context with newly selected quote_id
    setContextQuoteId(quote.quote_id);
  };

  const handleCreateShipment = async () => {
    if (!selectedQuoteId) {
      setError('Please select a quote to continue');
      return;
    }

    // Find the selected quote object
    const selectedQuote = refreshedQuotes.find(q => q.id === selectedQuoteId);
    if (!selectedQuote) {
      setError('Selected quote not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build shipment request
      const shipmentData = buildShipmentRequest({
        items: items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          weight: parseFloat(item.weight),
          length: item.length ? parseFloat(item.length) : undefined,
          width: item.width ? parseFloat(item.width) : undefined,
          height: item.height ? parseFloat(item.height) : undefined,
          declaredValue: item.declaredValue ? parseFloat(item.declaredValue) : undefined,
        })),
        originName: senderName,
        originEmail: senderEmail,
        originPhone: senderPhone,
        originAddressLine1: senderAddressLine1,
        originAddressLine2: senderAddressLine2,
        originCity: senderCity,
        originState: senderState,
        originPostalCode: senderPostalCode,
        originCountry: senderCountry,
        destinationName: receiverName,
        destinationEmail: receiverEmail,
        destinationPhone: receiverPhone,
        destinationAddressLine1: receiverAddressLine1,
        destinationAddressLine2: receiverAddressLine2,
        destinationCity: receiverCity,
        destinationState: receiverState,
        destinationPostalCode: receiverPostalCode,
        destinationCountry: receiverCountry,
        pickupType: pickupType,
        pickupScheduledAt: pickupDate || null,
        customerNotes: customerNotes || null,
        isInsured: quoteData?.is_insured || false,
        saveOriginAddress: saveSenderAddress,
        saveDestinationAddress: saveReceiverAddress,
      }, selectedQuote.quote_id, categories, shipmentId);

      // CREATE new shipment (normal flow)
      const response = await createShipment(shipmentData);

      // Store shipment + form data in sessionStorage for back navigation
      setSessionItem(StorageKey.CREATED_SHIPMENT_DATA, {
        shipment: response,
        formData: {
          items,
          senderName, senderEmail, senderPhone,
          senderAddressLine1, senderAddressLine2, senderPostalCode,
          senderCity, senderState, senderCountry,
          receiverName, receiverEmail, receiverPhone,
          receiverAddressLine1, receiverAddressLine2, receiverPostalCode,
          receiverCity, receiverState, receiverCountry,
          pickupType, pickupDate, customerNotes,
        }
      });

      // Navigate to payment page with shipment ID
      navigate(`/quote/payment/${response.id}`);
    } catch (err) {
      console.error('Error creating shipment:', err);
      setError(extractErrorMessage(err, shipmentId ? 'Failed to update shipment. Please try again.' : 'Failed to create shipment. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Get options
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
  const packageTypeOptions = PACKAGE_TYPES;
  const pickupTypeOptions = PICKUP_TYPES;
  const countryOptions = getCountryOptions();

  const minPickupDate = new Date();
  minPickupDate.setDate(minPickupDate.getDate());
  const minPickupDateStr = minPickupDate.toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress indicator */}
      <ProgressBar
        currentStep={3}
        totalSteps={4}
        stepLabels={['Route & Package', 'Select Quote', 'Details & Review', 'Payment']}
        className="mb-6"
      />

      {checkoutStep === 'details' ? (
        /* Step 3A: Details Form */
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Shipment Details
            </h1>
            <p style={{ color: theme.text.secondary }}>
              Complete your shipment information to get final quotes
            </p>
          </div>

          {/* Review Mode Banner */}
          {mode === 'review' && (
            <Alert
              variant="info"
              title="Reviewing Existing Shipment"
              message="This shipment has already been created. You can modify details and return to payment."
              className="mb-6"
            />
          )}

          {error && (
            <Alert
              variant="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          <div className="space-y-4">
            {/* Items Section */}
            <AccordionSection
              title="Items"
              description="Add details about what you're shipping"
              expanded={expandedSection === 'items'}
              onToggle={() => setExpandedSection(expandedSection === 'items' ? '' : 'items')}
              completed={items.every(item => item.categoryId && item.description && item.weight)}
            >
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                        Item {index + 1}
                      </h4>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 rounded transition-colors"
                          style={{ color: theme.danger_color }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Category"
                        value={item.categoryId}
                        onChange={(e) => updateItem(index, 'categoryId', e.target.value)}
                        options={categoryOptions}
                        placeholder="Select category"
                        required
                      />
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Brief description"
                        required
                      />
                      <Select
                        label="Package Type"
                        value={item.packageType}
                        onChange={(e) => updateItem(index, 'packageType', e.target.value)}
                        options={packageTypeOptions}
                        required
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        min="1"
                        required
                      />
                      <Input
                        label="Weight (kg)"
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateItem(index, 'weight', e.target.value)}
                        placeholder="0.0"
                        min="0.1"
                        step="0.1"
                        required
                      />
                      <Input
                        label="Declared Value"
                        type="number"
                        value={item.declaredValue}
                        onChange={(e) => updateItem(index, 'declaredValue', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                      <Input
                        label="Length (cm)"
                        type="number"
                        value={item.length}
                        onChange={(e) => updateItem(index, 'length', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                      <Input
                        label="Width (cm)"
                        type="number"
                        value={item.width}
                        onChange={(e) => updateItem(index, 'width', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                      <Input
                        label="Height (cm)"
                        type="number"
                        value={item.height}
                        onChange={(e) => updateItem(index, 'height', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addItem} className="w-full">
                  <Plus size={18} />
                  <span className="ml-2">Add Another Item</span>
                </Button>
              </div>
            </AccordionSection>

            {/* Sender Section */}
            <AccordionSection
              title="Sender Information"
              description="Where the package is being sent from"
              expanded={expandedSection === 'sender'}
              onToggle={() => setExpandedSection(expandedSection === 'sender' ? '' : 'sender')}
              completed={senderName && senderEmail && senderPhone && senderAddressLine1 && senderCity}
            >
              <div className="space-y-4">
                <SavedAddressSelector
                  label="Use Saved Sender Address"
                  onSelect={handleSelectSenderAddress}
                  savedAddresses={savedAddresses}
                  loading={loadingAddresses}
                  addressType="origin"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Country"
                    value={senderCountry}
                    onChange={(e) => {
                      setSenderCountry(e.target.value);
                      setSenderState('');
                      setSenderCity('');
                    }}
                    options={countryOptions}
                    placeholder="Select country"
                    required
                  />
                  <Select
                    label="State/Province"
                    value={senderState}
                    onChange={(e) => {
                      setSenderState(e.target.value);
                      setSenderCity('');
                    }}
                    options={getStateOptions(senderCountry)}
                    placeholder="Select state"
                    disabled={!senderCountry}
                    required
                  />
                </div>

                <CityAutocomplete
                  label="City"
                  countryCode={senderCountry}
                  value={senderCity}
                  onChange={setSenderCity}
                />

                <Input
                  label="Address Line 1"
                  value={senderAddressLine1}
                  onChange={(e) => setSenderAddressLine1(e.target.value)}
                  required
                />
                <Input
                  label="Address Line 2"
                  value={senderAddressLine2}
                  onChange={(e) => setSenderAddressLine2(e.target.value)}
                />
                <Input
                  label="Postal Code"
                  value={senderPostalCode}
                  onChange={(e) => setSenderPostalCode(e.target.value)}
                  required
                />

                <SaveAddressCheckbox
                  checked={saveSenderAddress}
                  onChange={setSaveSenderAddress}
                  label="Save this sender address for future shipments"
                />
              </div>
            </AccordionSection>

            {/* Receiver Section */}
            <AccordionSection
              title="Receiver Information"
              description="Where the package is being sent to"
              expanded={expandedSection === 'receiver'}
              onToggle={() => setExpandedSection(expandedSection === 'receiver' ? '' : 'receiver')}
              completed={receiverName && receiverEmail && receiverPhone && receiverAddressLine1 && receiverCity}
            >
              <div className="space-y-4">
                <SavedAddressSelector
                  label="Use Saved Receiver Address"
                  onSelect={handleSelectReceiverAddress}
                  savedAddresses={savedAddresses}
                  loading={loadingAddresses}
                  addressType="destination"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Country"
                    value={receiverCountry}
                    onChange={(e) => {
                      setReceiverCountry(e.target.value);
                      setReceiverState('');
                      setReceiverCity('');
                    }}
                    options={countryOptions}
                    placeholder="Select country"
                    required
                  />
                  <Select
                    label="State/Province"
                    value={receiverState}
                    onChange={(e) => {
                      setReceiverState(e.target.value);
                      setReceiverCity('');
                    }}
                    options={getStateOptions(receiverCountry)}
                    placeholder="Select state"
                    disabled={!receiverCountry}
                    required
                  />
                </div>

                <CityAutocomplete
                  label="City"
                  countryCode={receiverCountry}
                  value={receiverCity}
                  onChange={setReceiverCity}
                />

                <Input
                  label="Address Line 1"
                  value={receiverAddressLine1}
                  onChange={(e) => setReceiverAddressLine1(e.target.value)}
                  required
                />
                <Input
                  label="Address Line 2"
                  value={receiverAddressLine2}
                  onChange={(e) => setReceiverAddressLine2(e.target.value)}
                />
                <Input
                  label="Postal Code"
                  value={receiverPostalCode}
                  onChange={(e) => setReceiverPostalCode(e.target.value)}
                  required
                />

                <SaveAddressCheckbox
                  checked={saveReceiverAddress}
                  onChange={setSaveReceiverAddress}
                  label="Save this receiver address for future shipments"
                />
              </div>
            </AccordionSection>

            {/* Pickup Section */}
            <AccordionSection
              title="Pickup & Delivery"
              description="Schedule your pickup"
              expanded={expandedSection === 'pickup'}
              onToggle={() => setExpandedSection(expandedSection === 'pickup' ? '' : 'pickup')}
              completed={pickupType && (pickupType === 'drop_off' || pickupDate)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block mb-3 text-sm font-medium" style={{ color: theme.text.primary }}>
                    Pickup Type <span style={{ color: theme.danger_color }}>*</span>
                  </label>
                  <div className="space-y-2">
                    {pickupTypeOptions.map(option => (
                      <label key={option.value} className="flex items-start gap-3 p-3 rounded cursor-pointer border" style={{ borderColor: pickupType === option.value ? theme.primary_color : theme.border.color, backgroundColor: pickupType === option.value ? `${theme.primary_color}10` : theme.background.card }}>
                        <input
                          type="radio"
                          value={option.value}
                          checked={pickupType === option.value}
                          onChange={(e) => setPickupType(e.target.value)}
                          className="mt-0.5"
                          style={{ accentColor: theme.primary_color }}
                        />
                        <div>
                          <p className="font-medium" style={{ color: theme.text.primary }}>{option.label}</p>
                          <p className="text-sm" style={{ color: theme.text.muted }}>{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {pickupType === 'scheduled_pickup' && (
                  <Input
                    label="Pickup Date"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={minPickupDateStr}
                    required
                  />
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: theme.text.primary }}>
                    Special Instructions
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Any special handling or delivery instructions..."
                    rows={3}
                    className={`w-full px-4 py-2.5 font-medium transition-all focus:outline-none ${getBorderRadius()}`}
                    style={{
                      backgroundColor: theme.background.card,
                      color: theme.text.primary,
                      border: `1px solid ${theme.border.color}`,
                    }}
                  />
                </div>
              </div>
            </AccordionSection>
          </div>

          {/* Error alert near button */}
          {error && (
            <Alert
              variant="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
              className="mt-6"
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {mode !== 'review' && (
              <Button
                variant="outline"
                onClick={() => navigate('/quote/select')}
                className="flex-1"
              >
                <ArrowLeft size={18} />
                <span className="ml-2">Back to Quotes</span>
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleReviewQuotes}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Loading...</span>
                </>
              ) : (
                mode === 'review' ? 'Update & Return to Payment' : 'Review Quotes'
              )}
            </Button>
          </div>
        </>
      ) : (
        /* Step 3B: Quote Review */
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Review & Select Quote
            </h1>
            <p style={{ color: theme.text.secondary }}>
              Select your final shipping quote to continue to payment
            </p>
          </div>

          {error && (
            <Alert
              variant="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          <div className="space-y-4 mb-6">
            {refreshedQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                currency={quoteData?.rates?.[0]?.currency || 'NGN'}
                selected={selectedQuoteId === quote.id}
                onSelect={handleSelectQuoteOnReview}
              />
            ))}
          </div>

          {/* Error alert near button */}
          {error && (
            <Alert
              variant="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCheckoutStep('details')}
              className="flex-1"
            >
              <ArrowLeft size={18} />
              <span className="ml-2">Back to Details</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateShipment}
              disabled={!selectedQuoteId || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">{mode === 'review' ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                mode === 'review' ? 'Back to Payment' : 'Continue to Payment'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteCheckout;
