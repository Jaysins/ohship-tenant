import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, MapPin, Truck, Calendar, Shield, MessageSquare, Plus, X, CheckCircle2, CheckCircle } from 'lucide-react';
import { useTenantConfig } from '../context/TenantConfigContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StepWizard from '../components/ui/StepWizard';
import { fetchShippingQuotes, buildQuoteRequest } from '../services/quoteService';
import { getItemCategories, createShipment, buildShipmentRequest, getSavedAddresses } from '../services/shipmentService';
import { extractErrorMessage } from '../utils/errorHandler';

const CreateShipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledData = location.state?.formData;
  const { theme, getBorderRadius } = useTenantConfig();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingQuotes, setFetchingQuotes] = useState(false);
  const [categories, setCategories] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [errors, setErrors] = useState({});
  const [itemWeightManuallySet, setItemWeightManuallySet] = useState({});
  const [quotesAlreadyFetched, setQuotesAlreadyFetched] = useState(false);

  const [formData, setFormData] = useState({
    // Origin Address
    originName: '',
    originAddressLine1: '',
    originAddressLine2: '',
    originCity: prefilledData?.originCity || '',
    originState: prefilledData?.originState || '',
    originPostalCode: '',
    originCountry: prefilledData?.originCountry || 'NG',
    originPhone: '',
    originEmail: '',

    // Destination Address
    destinationName: '',
    destinationAddressLine1: '',
    destinationAddressLine2: '',
    destinationCity: prefilledData?.destinationCity || '',
    destinationState: prefilledData?.destinationState || '',
    destinationPostalCode: '',
    destinationCountry: prefilledData?.destinationCountry || 'US',
    destinationPhone: '',
    destinationEmail: '',

    // Items
    items: [{
      categoryId: prefilledData?.itemType || '',
      description: '',
      packageType: prefilledData?.packageType || 'envelope',
      quantity: '1',
      weight: prefilledData?.weight || '',
      length: prefilledData?.length || '',
      width: prefilledData?.width || '',
      height: prefilledData?.height || '',
      declaredValue: prefilledData?.shipmentValue || '',
    }],

    // Shipment Options
    pickupType: 'scheduled_pickup',
    pickupScheduledAt: '',
    isInsured: true,
    customerNotes: '',
    saveOriginAddress: false,
    saveDestinationAddress: false,
  });

  useEffect(() => {
    loadCategories();
    loadSavedAddresses();
  }, []);

  // Auto-trigger quote fetching when entering step 3 (Select Service)
  useEffect(() => {
    // Always fetch quotes when entering step 3, regardless of whether they were fetched before
    if (currentStep === 3 && !fetchingQuotes) {
      handleGetQuotes();
    }
  }, [currentStep]);

  // Reset quotes when form data changes
  useEffect(() => {
    // Only reset if we're past the quotes step and quotes have been fetched
    if (quotesAlreadyFetched) {
      setQuotesAlreadyFetched(false);
      setQuotes([]);
      setSelectedQuote(null);
    }
  }, [
    // Address changes
    formData.originCity,
    formData.originState,
    formData.originCountry,
    formData.destinationCity,
    formData.destinationState,
    formData.destinationCountry,
    // Items changes (stringify to detect deep changes)
    JSON.stringify(formData.items.map(item => ({
      categoryId: item.categoryId,
      packageType: item.packageType,
      weight: item.weight,
      length: item.length,
      width: item.width,
      height: item.height,
      declaredValue: item.declaredValue,
    }))),
    // Insurance
    formData.isInsured,
  ]);

  const loadCategories = async () => {
    try {
      const cats = await getItemCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const addresses = await getSavedAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
    }
  };

  // Check if sections are completed for visual feedback
  const isSectionComplete = (section) => {
    switch (section) {
      case 'origin':
        return formData.originName && formData.originAddressLine1 && formData.originCity &&
               formData.originState && formData.originPostalCode &&
               formData.originCountry && formData.originPhone;
      case 'destination':
        return formData.destinationName && formData.destinationAddressLine1 && formData.destinationCity &&
               formData.destinationState && formData.destinationPostalCode &&
               formData.destinationCountry && formData.destinationPhone;
      case 'items':
        return formData.items.every(item =>
          item.categoryId && item.description && item.packageType &&
          item.quantity && item.weight && item.declaredValue
        );
      case 'options':
        return formData.pickupType &&
               (formData.pickupType !== 'scheduled_pickup' || formData.pickupScheduledAt);
      default:
        return false;
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill weight when package type changes (if not manually set)
    if (field === 'packageType' && !itemWeightManuallySet[index]) {
      const selectedPackage = packageTypes.find(p => p.value === value);
      if (selectedPackage && selectedPackage.weight) {
        newItems[index].weight = selectedPackage.weight.toString();
      }
    }

    // Track manual weight changes
    if (field === 'weight') {
      setItemWeightManuallySet(prev => ({ ...prev, [index]: true }));
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        categoryId: '',
        description: '',
        packageType: 'box',
        quantity: '1',
        weight: '',
        length: '',
        width: '',
        height: '',
        declaredValue: '',
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleGetQuotes = async () => {
    setFetchingQuotes(true);
    setErrors({});

    try {
      // Build quote request from current form data
      const quoteData = {
        origin: {
          country: formData.originCountry,
          state: formData.originState.toLowerCase(),
          city: formData.originCity.toLowerCase(),
        },
        destination: {
          country: formData.destinationCountry,
          state: formData.destinationState.toLowerCase(),
          city: formData.destinationCity.toLowerCase(),
        },
        items: formData.items.map(item => {
          // Find the category details from the categories array
          const category = categories.find(cat => cat.id === item.categoryId);

          return {
            category_id: item.categoryId,
            category_name: category?.name || '',
            category_description: category?.description || '',
            category_hs_code: category?.hs_code || '',
            category_group_tag: category?.group_tag || '',
            description: item.description || '',
            package_type: item.packageType,
            quantity: parseInt(item.quantity),
            weight: parseFloat(item.weight),
            length: item.length ? parseFloat(item.length) : undefined,
            width: item.width ? parseFloat(item.width) : undefined,
            height: item.height ? parseFloat(item.height) : undefined,
            declared_value: item.declaredValue ? parseFloat(item.declaredValue) : undefined,
          };
        }),
        currency: 'NGN',
        is_insured: formData.isInsured,
      };

      const quotesData = await fetchShippingQuotes(quoteData);
      setQuotes(quotesData);
      setQuotesAlreadyFetched(true);
    } catch (error) {
      setErrors({ quotes: error.message });
    } finally {
      setFetchingQuotes(false);
    }
  };

  // Helper to populate form from saved address
  const populateFromSavedAddress = (address, type) => {
    if (type === 'origin') {
      setFormData(prev => ({
        ...prev,
        originName: address.name || '',
        originAddressLine1: address.address_line_1,
        originAddressLine2: address.address_line_2 || '',
        originCity: address.city,
        originState: address.state,
        originPostalCode: address.postal_code,
        originCountry: address.country,
        originPhone: address.phone,
        originEmail: address.email || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        destinationName: address.name || '',
        destinationAddressLine1: address.address_line_1,
        destinationAddressLine2: address.address_line_2 || '',
        destinationCity: address.city,
        destinationState: address.state,
        destinationPostalCode: address.postal_code,
        destinationCountry: address.country,
        destinationPhone: address.phone,
        destinationEmail: address.email || '',
      }));
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedQuote) {
      setErrors({ quote: 'Please select a shipping service' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Create shipment without payment method (will be selected on next screen)
      const shipmentData = buildShipmentRequest(formData, selectedQuote.quote_id, categories);
      const shipment = await createShipment(shipmentData);

      // Only navigate if shipment was created successfully
      if (shipment && shipment.id) {
        navigate(`/shipments/${shipment.id}/payment/select-method`, {
          state: {
            shipment,
            selectedQuote
          }
        });
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to create shipment. Please try again.');
      setErrors({ shipment: errorMessage });

      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const steps = [
    { label: 'Addresses', icon: MapPin },
    { label: 'Package Items', icon: Package },
    { label: 'Shipment Options', icon: Truck },
    { label: 'Select Service', icon: Shield },
    { label: 'Review & Create', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const countries = [
    { value: 'NG', label: 'Nigeria' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
  ];

  const packageTypes = [
    { value: 'envelope', label: 'Envelope', weight: 0.5 },
    { value: 'box', label: 'Box/Carton', weight: 2 },
    { value: 'pallet', label: 'Pallet', weight: 50 },
    { value: 'tube', label: 'Tube', weight: 1.5 },
    { value: 'pak', label: 'Pak', weight: 1 },
  ];

  const pickupTypes = [
    { value: 'scheduled_pickup', label: 'Scheduled Pickup' },
    { value: 'drop_off', label: 'Drop Off' },
  ];

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Addresses
        return renderAddressesStep();
      case 1: // Package Items
        return renderItemsStep();
      case 2: // Shipment Options
        return renderOptionsStep();
      case 3: // Get Quotes
        return renderQuotesStep();
      case 4: // Review & Create
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderAddressesStep = () => (
    <div className="space-y-6">
      {/* Origin Address */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <MapPin size={20} style={{ color: theme.primary_color }} />
            <span>Origin Address</span>
            {isSectionComplete('origin') && (
              <CheckCircle2 size={20} style={{ color: theme.success_color }} className="ml-auto" />
            )}
          </div>
        }
        padding="default"
      >
        <div className="space-y-4">
          {/* Saved Address Selection */}
          {savedAddresses.length > 0 && (
            <Select
              label="Load from Saved Address (Optional)"
              value=""
              onChange={(e) => {
                const address = savedAddresses.find(a => a.id === e.target.value);
                if (address) populateFromSavedAddress(address, 'origin');
              }}
              options={[
                { value: '', label: 'Select a saved address...' },
                ...savedAddresses.map(addr => ({
                  value: addr.id,
                  label: `${addr.label || addr.name} - ${addr.address_line_1}, ${addr.city}`
                }))
              ]}
            />
          )}
          <Input
            label="Name"
            value={formData.originName}
            onChange={(e) => updateFormData('originName', e.target.value)}
            placeholder="Full name"
            required
          />
          <Input
            label="Address Line 1"
            value={formData.originAddressLine1}
            onChange={(e) => updateFormData('originAddressLine1', e.target.value)}
            placeholder="Street address"
            required
          />
          <Input
            label="Address Line 2"
            value={formData.originAddressLine2}
            onChange={(e) => updateFormData('originAddressLine2', e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.originCity}
              onChange={(e) => updateFormData('originCity', e.target.value)}
              required
            />
            <Input
              label="State"
              value={formData.originState}
              onChange={(e) => updateFormData('originState', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              value={formData.originPostalCode}
              onChange={(e) => updateFormData('originPostalCode', e.target.value)}
              required
            />
            <Select
              label="Country"
              value={formData.originCountry}
              onChange={(e) => updateFormData('originCountry', e.target.value)}
              options={countries}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.originPhone}
              onChange={(e) => updateFormData('originPhone', e.target.value)}
              placeholder="+234..."
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.originEmail}
              onChange={(e) => updateFormData('originEmail', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.saveOriginAddress}
              onChange={(e) => updateFormData('saveOriginAddress', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{
                color: theme.primary_color,
                borderColor: theme.border.color
              }}
            />
            <span className="text-sm" style={{ color: theme.text.secondary }}>Save this address for future use</span>
          </label>
        </div>
      </Card>

      {/* Destination Address */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <MapPin size={20} style={{ color: theme.primary_color }} />
            <span>Destination Address</span>
            {isSectionComplete('destination') && (
              <CheckCircle2 size={20} style={{ color: theme.success_color }} className="ml-auto" />
            )}
          </div>
        }
        padding="default"
      >
        <div className="space-y-4">
          {/* Saved Address Selection */}
          {savedAddresses.length > 0 && (
            <Select
              label="Load from Saved Address (Optional)"
              value=""
              onChange={(e) => {
                const address = savedAddresses.find(a => a.id === e.target.value);
                if (address) populateFromSavedAddress(address, 'destination');
              }}
              options={[
                { value: '', label: 'Select a saved address...' },
                ...savedAddresses.map(addr => ({
                  value: addr.id,
                  label: `${addr.label || addr.name} - ${addr.address_line_1}, ${addr.city}`
                }))
              ]}
            />
          )}
          <Input
            label="Name"
            value={formData.destinationName}
            onChange={(e) => updateFormData('destinationName', e.target.value)}
            placeholder="Full name"
            required
          />
          <Input
            label="Address Line 1"
            value={formData.destinationAddressLine1}
            onChange={(e) => updateFormData('destinationAddressLine1', e.target.value)}
            placeholder="Street address"
            required
          />
          <Input
            label="Address Line 2"
            value={formData.destinationAddressLine2}
            onChange={(e) => updateFormData('destinationAddressLine2', e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.destinationCity}
              onChange={(e) => updateFormData('destinationCity', e.target.value)}
              required
            />
            <Input
              label="State"
              value={formData.destinationState}
              onChange={(e) => updateFormData('destinationState', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              value={formData.destinationPostalCode}
              onChange={(e) => updateFormData('destinationPostalCode', e.target.value)}
              required
            />
            <Select
              label="Country"
              value={formData.destinationCountry}
              onChange={(e) => updateFormData('destinationCountry', e.target.value)}
              options={countries}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.destinationPhone}
              onChange={(e) => updateFormData('destinationPhone', e.target.value)}
              placeholder="+1..."
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.destinationEmail}
              onChange={(e) => updateFormData('destinationEmail', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.saveDestinationAddress}
              onChange={(e) => updateFormData('saveDestinationAddress', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{
                color: theme.primary_color,
                borderColor: theme.border.color
              }}
            />
            <span className="text-sm" style={{ color: theme.text.secondary }}>Save this address for future use</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => navigate('/shipments')}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!isSectionComplete('origin') || !isSectionComplete('destination')}
        >
          Next: Package Items
        </Button>
      </div>
    </div>
  );

  const renderItemsStep = () => (
    <div className="space-y-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <Package size={20} style={{ color: theme.primary_color }} />
            <span>Package Items</span>
            {isSectionComplete('items') && (
              <CheckCircle2 size={20} style={{ color: theme.success_color }} className="ml-auto" />
            )}
          </div>
        }
        padding="default"
      >
        <div className="space-y-6">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className={`p-4 border ${getBorderRadius()} transition-all duration-300 animate-in fade-in slide-in-from-top-2`}
              style={{
                borderColor: theme.border.color,
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.primary_color;
                e.currentTarget.style.boxShadow = `0 4px 6px -1px ${theme.primary_color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border.color;
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${theme.primary_color}1A`,
                    }}
                  >
                    <span className="text-xs font-semibold" style={{ color: theme.primary_color }}>{index + 1}</span>
                  </div>
                  <h4 className="text-sm font-semibold" style={{ color: theme.text.primary }}>Item {index + 1}</h4>
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="transition-colors p-1 rounded"
                    style={{ color: theme.danger_color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${theme.danger_color}0D`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <Select
                  label="Category"
                  value={item.categoryId}
                  onChange={(e) => updateItem(index, 'categoryId', e.target.value)}
                  options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  required
                />
                <Input
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Brief description of the item"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Package Type"
                    value={item.packageType}
                    onChange={(e) => updateItem(index, 'packageType', e.target.value)}
                    options={packageTypes}
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
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={item.weight}
                    onChange={(e) => updateItem(index, 'weight', e.target.value)}
                    step="0.1"
                    required
                  />
                  <Input
                    label="Length (cm)"
                    type="number"
                    value={item.length}
                    onChange={(e) => updateItem(index, 'length', e.target.value)}
                    step="0.1"
                  />
                  <Input
                    label="Width (cm)"
                    type="number"
                    value={item.width}
                    onChange={(e) => updateItem(index, 'width', e.target.value)}
                    step="0.1"
                  />
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={item.height}
                    onChange={(e) => updateItem(index, 'height', e.target.value)}
                    step="0.1"
                  />
                </div>
                <Input
                  label="Declared Value"
                  type="number"
                  value={item.declaredValue}
                  onChange={(e) => updateItem(index, 'declaredValue', e.target.value)}
                  step="0.01"
                  placeholder="Item value for insurance"
                  required
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus size={16} />}
            onClick={addItem}
          >
            Add Another Item
          </Button>
        </div>
      </Card>

      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!isSectionComplete('items')}
        >
          Next: Shipment Options
        </Button>
      </div>
    </div>
  );

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <Truck size={20} style={{ color: theme.primary_color }} />
            <span>Shipment Options</span>
            {isSectionComplete('options') && (
              <CheckCircle2 size={20} style={{ color: theme.success_color }} className="ml-auto" />
            )}
          </div>
        }
        padding="default"
      >
        <div className="space-y-4">
          <Select
            label="Pickup Type"
            value={formData.pickupType}
            onChange={(e) => updateFormData('pickupType', e.target.value)}
            options={pickupTypes}
            required
          />
          {formData.pickupType === 'scheduled_pickup' && (
            <Input
              label="Pickup Date"
              type="date"
              value={formData.pickupScheduledAt}
              onChange={(e) => updateFormData('pickupScheduledAt', e.target.value)}
              required
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isInsured}
              onChange={(e) => updateFormData('isInsured', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{
                color: theme.primary_color,
                borderColor: theme.border.color
              }}
            />
            <span className="text-sm" style={{ color: theme.text.secondary }}>Add insurance coverage to this shipment</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
              Customer Notes
            </label>
            <textarea
              value={formData.customerNotes}
              onChange={(e) => updateFormData('customerNotes', e.target.value)}
              placeholder="Any special instructions or notes..."
              rows={3}
              className={`w-full px-3 py-2 border ${getBorderRadius()} resize-none outline-none`}
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
        </div>
      </Card>

      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!isSectionComplete('options')}
        >
          Next: Select Service
        </Button>
      </div>
    </div>
  );

  const renderQuotesStep = () => (
    <div className="space-y-6">
      <Card title="Select Shipping Service" padding="default">
        <div className="space-y-4">
          {fetchingQuotes && (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner />
              <p className="text-sm mt-4" style={{ color: theme.text.secondary }}>Fetching shipping quotes...</p>
            </div>
          )}

          {errors.quotes && (
            <div
              className={`p-4 border ${getBorderRadius()}`}
              style={{
                backgroundColor: `${theme.danger_color}0D`,
                borderColor: `${theme.danger_color}33`
              }}
            >
              <p className="text-sm" style={{ color: theme.danger_color }}>{errors.quotes}</p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGetQuotes}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {!fetchingQuotes && quotes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Select a shipping service to continue:
              </p>
              {quotes.map((quote) => (
                <button
                  key={quote.quote_id}
                  type="button"
                  onClick={() => setSelectedQuote(quote)}
                  className={`w-full text-left p-4 ${getBorderRadius()} border-2 transition-all duration-200`}
                  style={{
                    borderColor: selectedQuote?.quote_id === quote.quote_id ? theme.primary_color : theme.border.color,
                    backgroundColor: selectedQuote?.quote_id === quote.quote_id ? `${theme.primary_color}0D` : 'transparent',
                    boxShadow: selectedQuote?.quote_id === quote.quote_id ? `0 4px 6px -1px ${theme.primary_color}20` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedQuote?.quote_id !== quote.quote_id) {
                      e.currentTarget.style.borderColor = `${theme.primary_color}66`;
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedQuote?.quote_id !== quote.quote_id) {
                      e.currentTarget.style.borderColor = theme.border.color;
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium" style={{ color: theme.text.primary }}>{quote.display_name}</p>
                    <p className="text-lg font-bold" style={{ color: theme.text.primary }}>
                      {quote.currency} {quote.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: theme.text.secondary }}>{quote.carrier_name}</p>
                  <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                    Estimated delivery: {quote.estimated_days} {quote.estimated_days === 1 ? 'day' : 'days'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!fetchingQuotes && quotes.length === 0 && !errors.quotes && (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: theme.text.secondary }}>No quotes available yet.</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!selectedQuote}
        >
          Next: Review & Create
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Error Display at Top */}
      {errors.shipment && (
        <div
          className={`p-4 border-2 ${getBorderRadius()} animate-in fade-in slide-in-from-top-2`}
          style={{
            backgroundColor: `${theme.danger_color}0D`,
            borderColor: theme.danger_color
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
              style={{ backgroundColor: theme.danger_color }}
            >
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1" style={{ color: theme.danger_color }}>Failed to Create Shipment</h3>
              <p className="text-sm" style={{ color: theme.danger_color }}>{errors.shipment}</p>
              <p className="text-xs mt-2" style={{ color: theme.danger_color }}>Please review your information and try again.</p>
            </div>
          </div>
        </div>
      )}

      <Card title="Review Shipment" padding="default">
        <div className="space-y-6">
          {/* Addresses Summary */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: theme.text.primary }}>Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-3 ${getBorderRadius()}`} style={{ backgroundColor: theme.background.subtle }}>
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>Origin</p>
                <p className="text-sm" style={{ color: theme.text.primary }}>{formData.originAddressLine1}</p>
                <p className="text-sm" style={{ color: theme.text.primary }}>
                  {formData.originCity}, {formData.originState} {formData.originPostalCode}
                </p>
                <p className="text-sm" style={{ color: theme.text.primary }}>{formData.originCountry}</p>
              </div>
              <div className={`p-3 ${getBorderRadius()}`} style={{ backgroundColor: theme.background.subtle }}>
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text.muted }}>Destination</p>
                <p className="text-sm" style={{ color: theme.text.primary }}>{formData.destinationAddressLine1}</p>
                <p className="text-sm" style={{ color: theme.text.primary }}>
                  {formData.destinationCity}, {formData.destinationState} {formData.destinationPostalCode}
                </p>
                <p className="text-sm" style={{ color: theme.text.primary }}>{formData.destinationCountry}</p>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: theme.text.primary }}>Items</h3>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className={`p-3 ${getBorderRadius()}`} style={{ backgroundColor: theme.background.subtle }}>
                  <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                    Item {index + 1}: {item.packageType} - {item.weight}kg
                  </p>
                  {item.description && (
                    <p className="text-xs" style={{ color: theme.text.secondary }}>{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Options */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: theme.text.primary }}>Shipment Options</h3>
            <div className={`p-3 ${getBorderRadius()} space-y-2`} style={{ backgroundColor: theme.background.subtle }}>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: theme.text.muted }}>Pickup Type:</span>
                <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                  {pickupTypes.find(p => p.value === formData.pickupType)?.label || formData.pickupType}
                </span>
              </div>
              {formData.pickupType === 'scheduled_pickup' && formData.pickupScheduledAt && (
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: theme.text.muted }}>Pickup Date:</span>
                  <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                    {new Date(formData.pickupScheduledAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: theme.text.muted }}>Insurance:</span>
                <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                  {formData.isInsured ? 'Yes' : 'No'}
                </span>
              </div>
              {formData.customerNotes && (
                <div className="pt-2" style={{ borderTop: `1px solid ${theme.border.color}` }}>
                  <span className="text-xs block mb-1" style={{ color: theme.text.muted }}>Notes:</span>
                  <p className="text-sm" style={{ color: theme.text.primary }}>{formData.customerNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Quote */}
          {selectedQuote && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: theme.text.primary }}>Selected Service & Pricing</h3>
              <div
                className={`p-4 border-2 ${getBorderRadius()}`}
                style={{
                  backgroundColor: `${theme.primary_color}0D`,
                  borderColor: theme.primary_color
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium" style={{ color: theme.text.primary }}>{selectedQuote.display_name}</p>
                    <p className="text-xs" style={{ color: theme.text.secondary }}>{selectedQuote.carrier_name}</p>
                    <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                      Estimated delivery: {selectedQuote.estimated_days} {selectedQuote.estimated_days === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <p className="text-xl font-bold" style={{ color: theme.text.primary }}>
                    {selectedQuote.currency} {selectedQuote.total_amount.toFixed(2)}
                  </p>
                </div>

                {/* Rate Breakdown */}
                <div className="pt-3 space-y-2" style={{ borderTop: `1px solid ${theme.primary_color}33` }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: theme.text.secondary }}>Rate Breakdown:</p>

                  {/* Base Rate */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: theme.text.muted }}>Base Rate:</span>
                    <span className="text-sm" style={{ color: theme.text.primary }}>
                      {selectedQuote.currency} {selectedQuote.base_rate.toFixed(2)}
                    </span>
                  </div>

                  {/* Adjustments */}
                  {selectedQuote.adjustments && selectedQuote.adjustments.length > 0 && (
                    <>
                      {selectedQuote.adjustments.map((adjustment, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-xs" style={{ color: theme.text.muted }}>
                            {adjustment.description}
                            {adjustment.calculation_type === 'percentage' && adjustment.rate && (
                              <span className="text-[10px] ml-1">({adjustment.rate}%)</span>
                            )}:
                          </span>
                          <span className="text-sm" style={{ color: theme.text.primary }}>
                            {selectedQuote.currency} {adjustment.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Discounts */}
                  {selectedQuote.discounts && selectedQuote.discounts.length > 0 && (
                    <>
                      {selectedQuote.discounts.map((discount, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-xs" style={{ color: theme.success_color }}>
                            {discount.description || 'Discount'}
                            {discount.calculation_type === 'percentage' && discount.rate && (
                              <span className="text-[10px] ml-1">({discount.rate}%)</span>
                            )}:
                          </span>
                          <span className="text-sm" style={{ color: theme.success_color }}>
                            -{selectedQuote.currency} {discount.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${theme.primary_color}66` }}>
                    <span className="text-xs font-semibold" style={{ color: theme.text.secondary }}>Total:</span>
                    <span className="text-base font-bold" style={{ color: theme.text.primary }}>
                      {selectedQuote.currency} {selectedQuote.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleCreateShipment}
          loading={loading}
        >
          {loading ? 'Creating Shipment...' : 'Create Shipment'}
        </Button>
      </div>
    </div>
  );


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>Create Shipment</h1>
        <p style={{ color: theme.text.secondary }}>Complete the steps below to create your shipment</p>
      </div>

      {/* Step Wizard */}
      <Card padding="lg">
        <StepWizard
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        >
          {renderStepContent()}
        </StepWizard>
      </Card>
    </div>
  );
};

export default CreateShipment;
