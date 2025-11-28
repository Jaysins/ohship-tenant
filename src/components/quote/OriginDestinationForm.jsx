import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const OriginDestinationForm = ({ formData, updateFormData, onNext }) => {
  const [errors, setErrors] = useState({});

  const countries = [
    { value: 'NG', label: 'Nigeria' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'CN', label: 'China' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IN', label: 'India' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.originState) newErrors.originState = 'Origin state is required';
    if (!formData.originCountry) newErrors.originCountry = 'Origin country is required';

    if (!formData.destinationState) newErrors.destinationState = 'Destination state is required';
    if (!formData.destinationCountry) newErrors.destinationCountry = 'Destination country is required';

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Origin Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <MapPin size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Origin</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Country"
            value={formData.originCountry}
            onChange={(e) => updateFormData({ originCountry: e.target.value })}
            options={countries}
            error={errors.originCountry}
            required
          />

          <Input
            label="State"
            value={formData.originState}
            onChange={(e) => updateFormData({ originState: e.target.value })}
            error={errors.originState}
            placeholder="e.g., Lagos"
            required
          />

          <Input
            label="City"
            value={formData.originCity}
            onChange={(e) => updateFormData({ originCity: e.target.value })}
            placeholder="Optional"
          />

          <Input
            label="ZIP Code"
            value={formData.originZip}
            onChange={(e) => updateFormData({ originZip: e.target.value })}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center">
          <Navigation size={20} className="bg-white px-2 text-slate-400" />
        </div>
      </div>

      {/* Destination Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin size={18} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Destination</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Country"
            value={formData.destinationCountry}
            onChange={(e) => updateFormData({ destinationCountry: e.target.value })}
            options={countries}
            error={errors.destinationCountry}
            required
          />

          <Input
            label="State"
            value={formData.destinationState}
            onChange={(e) => updateFormData({ destinationState: e.target.value })}
            error={errors.destinationState}
            placeholder="e.g., New York"
            required
          />

          <Input
            label="City"
            value={formData.destinationCity}
            onChange={(e) => updateFormData({ destinationCity: e.target.value })}
            placeholder="Optional"
          />

          <Input
            label="ZIP Code"
            value={formData.destinationZip}
            onChange={(e) => updateFormData({ destinationZip: e.target.value })}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-8 mt-8">
        <Button type="submit" variant="primary">
          Continue to Package Details
        </Button>
      </div>
    </form>
  );
};

export default OriginDestinationForm;
