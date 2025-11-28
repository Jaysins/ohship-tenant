import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Plus, X, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchShippingQuotes } from '../services/quoteService';
import { getItemCategories } from '../services/shipmentService';

const Quote = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [fetchingQuotes, setFetchingQuotes] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Origin
    originCountry: 'NG',
    originState: '',
    originCity: '',

    // Destination
    destinationCountry: 'US',
    destinationState: '',
    destinationCity: '',

    // Items
    items: [{
      categoryId: '',
      description: '',
      packageType: 'box',
      quantity: '1',
      weight: '',
      length: '',
      width: '',
      height: '',
      declaredValue: '',
    }],

    // Options
    isInsured: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getItemCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
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

  const isFormValid = () => {
    return formData.originCountry && formData.originState && formData.originCity &&
           formData.destinationCountry && formData.destinationState && formData.destinationCity &&
           formData.items.every(item =>
             item.categoryId && item.description && item.packageType &&
             item.quantity && item.weight && item.declaredValue
           );
  };

  const handleGetQuotes = async () => {
    setFetchingQuotes(true);
    setErrors({});

    try {
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
    } catch (error) {
      setErrors({ quotes: error.message });
    } finally {
      setFetchingQuotes(false);
    }
  };

  const handleCreateShipmentFromQuote = (quote) => {
    // Navigate to create shipment with pre-filled data
    navigate('/shipments/create', {
      state: {
        formData: {
          ...formData,
          selectedQuoteId: quote.quote_id
        }
      }
    });
  };

  const countries = [
    { value: 'NG', label: 'Nigeria' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
  ];

  const packageTypes = [
    { value: 'envelope', label: 'Envelope' },
    { value: 'box', label: 'Box/Carton' },
    { value: 'pallet', label: 'Pallet' },
    { value: 'tube', label: 'Tube' },
    { value: 'pak', label: 'Pak' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Get a Quote</h1>
        <p className="text-slate-600">Get instant shipping quotes from multiple carriers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Origin & Destination */}
          <Card title={
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-indigo-600" />
              <span>Origin & Destination</span>
            </div>
          } padding="default">
            <div className="space-y-6">
              {/* Origin */}
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Origin</p>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    label="Country"
                    value={formData.originCountry}
                    onChange={(e) => updateFormData('originCountry', e.target.value)}
                    options={countries}
                    required
                  />
                  <Input
                    label="State"
                    value={formData.originState}
                    onChange={(e) => updateFormData('originState', e.target.value)}
                    placeholder="e.g., Lagos"
                    required
                  />
                  <Input
                    label="City"
                    value={formData.originCity}
                    onChange={(e) => updateFormData('originCity', e.target.value)}
                    placeholder="e.g., Lagos"
                    required
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Destination</p>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    label="Country"
                    value={formData.destinationCountry}
                    onChange={(e) => updateFormData('destinationCountry', e.target.value)}
                    options={countries}
                    required
                  />
                  <Input
                    label="State"
                    value={formData.destinationState}
                    onChange={(e) => updateFormData('destinationState', e.target.value)}
                    placeholder="e.g., New York"
                    required
                  />
                  <Input
                    label="City"
                    value={formData.destinationCity}
                    onChange={(e) => updateFormData('destinationCity', e.target.value)}
                    placeholder="e.g., New York"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Package Items */}
          <Card title={
            <div className="flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              <span>Package Items</span>
            </div>
          } padding="default">
            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-indigo-600">{index + 1}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">Item {index + 1}</h4>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
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
                      placeholder="Item value"
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

          {/* Options */}
          <Card title={
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              <span>Options</span>
            </div>
          } padding="default">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isInsured}
                onChange={(e) => updateFormData('isInsured', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-slate-700">Add insurance coverage</span>
            </label>
          </Card>

          {/* Get Quotes Button */}
          <Button
            type="button"
            variant="primary"
            onClick={handleGetQuotes}
            disabled={!isFormValid() || fetchingQuotes}
            loading={fetchingQuotes}
            className="w-full"
          >
            {fetchingQuotes ? 'Fetching Quotes...' : 'Get Quotes'}
          </Button>
        </div>

        {/* Quotes Results Section */}
        <div className="lg:col-span-1">
          <Card title="Shipping Quotes" padding="default" className="sticky top-6">
            {fetchingQuotes && (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner />
                <p className="text-sm text-slate-600 mt-4">Fetching quotes...</p>
              </div>
            )}

            {errors.quotes && !fetchingQuotes && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.quotes}</p>
              </div>
            )}

            {!fetchingQuotes && quotes.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-4">
                  Found {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
                </p>
                {quotes.map((quote) => (
                  <div
                    key={quote.quote_id}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-900">{quote.display_name}</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {quote.currency} {quote.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{quote.carrier_name}</p>
                    <p className="text-xs text-slate-500 mb-3">
                      Delivery: {quote.estimated_days} {quote.estimated_days === 1 ? 'day' : 'days'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={() => handleCreateShipmentFromQuote(quote)}
                      className="w-full"
                    >
                      Create Shipment
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!fetchingQuotes && quotes.length === 0 && !errors.quotes && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-600">No quotes yet.</p>
                <p className="text-xs text-slate-500 mt-2">Fill in the details and click "Get Quotes"</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quote;
