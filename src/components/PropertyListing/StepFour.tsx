import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyListing, PaymentOption, LocalAmenity, CustomAmenity, CATEGORY_AMENITIES, GENERAL_AMENITIES } from '@/types/propertyListing';
import { Plus, X } from 'lucide-react';
import { useMemo } from 'react';

interface StepFourProps {
  formData: PropertyListing;
  updateFormData: (updates: Partial<PropertyListing>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PropertyListingStepFour = ({ formData, updateFormData, onNext, onBack }: StepFourProps) => {

  // Parse JSON string field into array
  const parsedPaymentOptions = useMemo(() => {
    try {
      return JSON.parse(formData.paymentOptions || '[]');
    } catch {
      return [];
    }
  }, [formData.paymentOptions]);

  const parsedAmenities = useMemo(() => {
    try {
      return typeof formData.amenities === 'string' ? JSON.parse(formData.amenities) : formData.amenities || [];
    } catch {
      return [];
    }
  }, [formData.amenities]);

  const parsedLocalAmenities = useMemo(() => {
    try {
      return typeof formData.localAmenities === 'string' ? JSON.parse(formData.localAmenities) : formData.localAmenities || [];
    } catch {
      return [];
    }
  }, [formData.localAmenities]);

  // Get category-specific amenities
  const getCategoryAmenities = () => {
    const categoryKey = formData.category as keyof typeof CATEGORY_AMENITIES;
    return CATEGORY_AMENITIES[categoryKey] || CATEGORY_AMENITIES.Residential;
  };

  const categoryAmenities = getCategoryAmenities();

  // Combine general and category-specific amenities
  const getAllAmenities = () => {
    return [...GENERAL_AMENITIES, ...categoryAmenities];
  };

  const allAmenities = getAllAmenities();

  const toggleAmenity = (amenityId: string, isGeneral: boolean = false) => {
    if (isGeneral) {
      const updated = GENERAL_AMENITIES.map(amenity =>
        amenity.id === amenityId ? { ...amenity, selected: !amenity.selected } : amenity
      );
      // Update the general amenities in formData
      const updatedFormAmenities = parsedAmenities.map(amenity =>
        amenity.id === amenityId ? { ...amenity, selected: !amenity.selected } : amenity
      );
      updateFormData({ amenities: JSON.stringify(updatedFormAmenities) });
    } else {
      const updated = categoryAmenities.map(amenity =>
        amenity.id === amenityId ? { ...amenity, selected: !amenity.selected } : amenity
      );
      // Find and update the specific amenity in formData
      const updatedFormAmenities = parsedAmenities.map(amenity =>
        amenity.id === amenityId ? { ...amenity, selected: !amenity.selected } : amenity
      );
      updateFormData({ amenities: JSON.stringify(updatedFormAmenities) });
    }
  };

  const addCustomAmenity = () => {
    const newCustomAmenity: CustomAmenity = {
      id: `custom-${Date.now()}`,
      name: '',
      icon: '🏠',
      selected: false
    };
    updateFormData({
      customAmenities: [...formData.customAmenities, newCustomAmenity]
    });
  };

  const updateCustomAmenity = (id: string, field: keyof CustomAmenity, value: string | boolean) => {
    const updated = formData.customAmenities.map(amenity =>
      amenity.id === id ? { ...amenity, [field]: value } : amenity
    );
    updateFormData({ customAmenities: updated });
  };

  const removeCustomAmenity = (id: string) => {
    const updated = formData.customAmenities.filter(amenity => amenity.id !== id);
    updateFormData({ customAmenities: updated });
  };

  const toggleCustomAmenity = (amenityId: string) => {
    updateCustomAmenity(amenityId, 'selected', !formData.customAmenities.find(a => a.id === amenityId)?.selected);
  };

  const addLocalAmenity = () => {
    const newAmenity: LocalAmenity = {
      id: Date.now().toString(),
      name: '',
      minutesDrive: 0
    };
    updateFormData({
      localAmenities: JSON.stringify([...parsedLocalAmenities, newAmenity])
    });
  };

  const updateLocalAmenity = (id: string, field: keyof LocalAmenity, value: string | number) => {
    const updated = parsedLocalAmenities.map(amenity =>
      amenity.id === id ? { ...amenity, [field]: value } : amenity
    );
    updateFormData({ localAmenities: JSON.stringify(updated) });
  };

  const removeLocalAmenity = (id: string) => {
    const updated = parsedLocalAmenities.filter(amenity => amenity.id !== id);
    updateFormData({ localAmenities: JSON.stringify(updated) });
  };

  const getRentPaymentOptions = (): PaymentOption[] => [
    'Monthly payment', '3 monthly payment', '6 monthly payment', 
    '12 monthly payment', '24 monthly payment', '36 monthly payment'
  ];

  const getBuyPaymentOptions = (): PaymentOption[] => [
    'Cash Outright', '12 Months Payment Plan', '24 Months Payment Plan', 
    '6 Months Payment Plan', 'Mortgage'
  ];

  const getPaymentOptions = (): PaymentOption[] => {
    if (formData.PropertyNeed === 'Rent') return getRentPaymentOptions();
    if (formData.PropertyNeed === 'Buy') return getBuyPaymentOptions();
    return [];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Amenities & Payment</h2>
        <p className="text-muted-foreground">Select amenities and payment options for {formData.category.toLowerCase()} properties</p>
      </div>

      {/* General Property Amenities */}
      <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
        <CardContent className="p-4 lg:p-6">
          <Label className="text-base font-semibold mb-4 block text-foreground">
            General Property Amenities
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {GENERAL_AMENITIES.map((amenity) => {
              const isSelected = parsedAmenities.find(a => a.id === amenity.id)?.selected || false;
              return (
                <div 
                  key={amenity.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                  onClick={() => toggleAmenity(amenity.id, true)}
                >
                  <Checkbox
                    id={amenity.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleAmenity(amenity.id, true)}
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{amenity.icon}</span>
                    <Label
                      htmlFor={amenity.id}
                      className="text-sm cursor-pointer leading-tight font-medium"
                    >
                      {amenity.name}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category-Specific Amenities */}
      <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
        <CardContent className="p-4 lg:p-6">
          <Label className="text-base font-semibold mb-4 block text-foreground">
            {formData.category} Specific Amenities
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categoryAmenities.map((amenity) => {
              const isSelected = parsedAmenities.find(a => a.id === amenity.id)?.selected || false;
              return (
                <div 
                  key={amenity.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  <Checkbox
                    id={amenity.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{amenity.icon}</span>
                    <Label
                      htmlFor={amenity.id}
                      className="text-sm cursor-pointer leading-tight font-medium"
                    >
                      {amenity.name}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Amenities */}
      <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold text-foreground">Custom Amenities</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCustomAmenity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Amenity
            </Button>
          </div>
          
          {formData.customAmenities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom amenities added yet. Click "Add Custom Amenity" to start.
            </p>
          )}

          <div className="space-y-4">
            {formData.customAmenities.map((amenity) => (
              <div key={amenity.id} className="flex gap-3 items-end p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`custom-${amenity.id}`}
                    checked={amenity.selected}
                    onCheckedChange={() => toggleCustomAmenity(amenity.id)}
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor={`icon-${amenity.id}`} className="text-sm">Icon</Label>
                  <Input
                    id={`icon-${amenity.id}`}
                    value={amenity.icon}
                    onChange={(e) => updateCustomAmenity(amenity.id, 'icon', e.target.value)}
                    placeholder="🏠"
                    className="mt-1 text-center"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`name-${amenity.id}`} className="text-sm">Amenity Name</Label>
                  <Input
                    id={`name-${amenity.id}`}
                    value={amenity.name}
                    onChange={(e) => updateCustomAmenity(amenity.id, 'name', e.target.value)}
                    placeholder="e.g., Electric Car Charging"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCustomAmenity(amenity.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold text-foreground">Local Amenities Nearby</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLocalAmenity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity
            </Button>
          </div>
          
          {parsedLocalAmenities.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No local amenities added yet. Click "Add Amenity" to start.
            </p>
          )}

          <div className="space-y-4">
            {parsedLocalAmenities.map((amenity) => (
              <div key={amenity.id} className="flex gap-3 items-end p-3 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={`amenity-${amenity.id}`} className="text-sm">Amenity Name</Label>
                  <Input
                    id={`amenity-${amenity.id}`}
                    value={amenity.name}
                    onChange={(e) => updateLocalAmenity(amenity.id, 'name', e.target.value)}
                    placeholder="e.g., Shopping Mall"
                    className="mt-1"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`minutes-${amenity.id}`} className="text-sm">Minutes Drive</Label>
                  <Input
                    id={`minutes-${amenity.id}`}
                    type="number"
                    min="0"
                    value={amenity.minutesDrive}
                    onChange={(e) => updateLocalAmenity(amenity.id, 'minutesDrive', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLocalAmenity(amenity.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {formData.PropertyNeed && formData.PropertyNeed !== 'Stay' && formData.PropertyNeed !== 'Invest' && (
        <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6">
            <Label className="text-base font-semibold mb-4 block text-foreground">
              Payment Options for {formData.PropertyNeed}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getPaymentOptions().map((option) => (
                <label
                  key={option}
                  className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-pointer ${parsedPaymentOptions.includes(option) ? 'bg-primary/10 border-primary' : ''}`}
                  htmlFor={option.replace(/\s+/g, '-').toLowerCase()}
                >
                  <input
                    type="radio"
                    id={option.replace(/\s+/g, '-').toLowerCase()}
                    name="paymentOption"
                    value={option}
                    checked={parsedPaymentOptions.includes(option)}
                    onChange={(e) => {
                      console.log('Payment option selected:', e.target.value);
                      updateFormData({ paymentOptions: JSON.stringify([e.target.value]) });
                    }}
                    className="mr-2"
                    aria-label={`Select ${option} payment option`}
                  />
                  <span className="text-sm cursor-pointer font-medium flex-1">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between animate-fade-in">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-6 py-2 lg:px-8 lg:py-3 transition-all duration-300 hover:scale-105"
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="px-6 py-2 lg:px-8 lg:py-3 btn-primary transition-all duration-300 hover:scale-105"
        >
          Next
        </Button>
      </div>
    </div>
  );
};