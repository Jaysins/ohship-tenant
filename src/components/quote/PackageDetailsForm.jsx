import { useState, useEffect } from 'react';
import { Package, Box, Ruler, Weight } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const PackageDetailsForm = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [isWeightManuallySet, setIsWeightManuallySet] = useState(false);

  // Package types with predefined weights in kg
  const packageTypes = [
    { value: 'envelope', label: 'Envelope', weight: 0.5 },
    { value: 'box', label: 'Box/Carton', weight: 2 },
    { value: 'pallet', label: 'Pallet', weight: 50 },
    { value: 'tube', label: 'Tube', weight: 1.5 },
    { value: 'pak', label: 'Pak', weight: 1 },
    { value: 'other', label: 'Other', weight: null },
  ];

  // Dummy item types - replace with API call later
  const itemTypes = [
    { value: 'cream', label: 'Cream' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'documents', label: 'Documents' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food Items' },
    { value: 'books', label: 'Books' },
    { value: 'toys', label: 'Toys' },
    { value: 'cosmetics', label: 'Cosmetics' },
    { value: 'other', label: 'Other' },
  ];

  // Auto-fill weight when package type changes
  useEffect(() => {
    if (!isWeightManuallySet && formData.packageType) {
      const selectedPackage = packageTypes.find(p => p.value === formData.packageType);
      if (selectedPackage && selectedPackage.weight !== null) {
        updateFormData({ weight: selectedPackage.weight.toString() });
      }
    }
  }, [formData.packageType, isWeightManuallySet]);

  const handlePackageTypeChange = (e) => {
    setIsWeightManuallySet(false);
    updateFormData({ packageType: e.target.value });
  };

  const handleWeightChange = (e) => {
    setIsWeightManuallySet(true);
    updateFormData({ weight: e.target.value });

    // Switch to "other" when weight is manually changed
    const selectedPackage = packageTypes.find(p => p.value === formData.packageType);
    if (selectedPackage && selectedPackage.weight !== null &&
        parseFloat(e.target.value) !== selectedPackage.weight) {
      updateFormData({ packageType: 'other' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.packageType) {
      newErrors.packageType = 'Package type is required';
    }

    if (!formData.itemType) {
      newErrors.itemType = 'Item type is required';
    }

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Type */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Box size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Package Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Package Type"
            value={formData.packageType}
            onChange={handlePackageTypeChange}
            options={packageTypes}
            error={errors.packageType}
            required
          />

          <Select
            label="Item Type"
            value={formData.itemType}
            onChange={(e) => updateFormData({ itemType: e.target.value })}
            options={itemTypes}
            error={errors.itemType}
            required
          />
        </div>
      </div>

      {/* Weight */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Weight size={18} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Weight</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Weight (kg)"
            type="number"
            value={formData.weight}
            onChange={handleWeightChange}
            error={errors.weight}
            placeholder="0.0"
            step="0.1"
            min="0"
            helperText="Weight in kilograms"
            required
          />
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Ruler size={18} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Dimensions (Optional)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Length (cm)"
            type="number"
            value={formData.length}
            onChange={(e) => updateFormData({ length: e.target.value })}
            placeholder="0.0"
            step="0.1"
            min="0"
          />

          <Input
            label="Width (cm)"
            type="number"
            value={formData.width}
            onChange={(e) => updateFormData({ width: e.target.value })}
            placeholder="0.0"
            step="0.1"
            min="0"
          />

          <Input
            label="Height (cm)"
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData({ height: e.target.value })}
            placeholder="0.0"
            step="0.1"
            min="0"
          />
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Dimensions help calculate volumetric weight for accurate pricing
        </p>
      </div>

      {/* Additional Details */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Additional Details</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Shipment Value"
            type="number"
            value={formData.shipmentValue}
            onChange={(e) => updateFormData({ shipmentValue: e.target.value })}
            placeholder="0.00"
            step="0.01"
            min="0"
            helperText="Optional - for insurance and customs purposes"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currency
            </label>
            <Select
              value={formData.currency}
              onChange={(e) => updateFormData({ currency: e.target.value })}
              options={[
                { value: 'NGN', label: 'NGN (Nigerian Naira)' },
                { value: 'USD', label: 'USD (US Dollar)' },
                { value: 'EUR', label: 'EUR (Euro)' },
                { value: 'GBP', label: 'GBP (British Pound)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary">
          Get Shipping Quotes
        </Button>
      </div>
    </form>
  );
};

export default PackageDetailsForm;
