// components/PropertyListing/StepOne.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyListing, ListingCategory, PropertyNeed, PROPERTY_TYPES } from '@/types/propertyListing';

interface StepOneProps {
  formData: PropertyListing;
  updateFormData: (updates: Partial<PropertyListing>) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

export const PropertyListingStepOne = ({ formData, updateFormData, onNext, isFirstStep }: StepOneProps) => {
  const getNeedOptions = (category: ListingCategory): PropertyNeed[] => {
    switch (category) {
      case 'The Fjord':
        return ['Stay'];
      case 'Investment':
        return ['Invest'];
      case 'Residential':
      case 'Land':
      case 'Commercial':
        return ['Buy', 'Rent'];
      default:
        return ['Buy', 'Rent'];
    }
  };

  const getPropertyTypes = (category: ListingCategory): string[] => {
    return PROPERTY_TYPES[category as keyof typeof PROPERTY_TYPES] || [];
  };

  const showPropertyType = ['Residential', 'Commercial', 'Investment', 'Land', 'The Fjord'].includes(formData.category);
  const needOptions = getNeedOptions(formData.category);
  const propertyTypes = getPropertyTypes(formData.category);

  const isValid = formData.category && formData.PropertyNeed && (!showPropertyType || formData.propertyType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Property Type & Requirements</h2>
        <p className="text-muted-foreground">Select the category and requirements for your property listing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6">
            <Label className="text-base font-semibold text-foreground">Listing Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: ListingCategory) => {
                updateFormData({
                  category: value,
                  PropertyNeed: getNeedOptions(value)[0],
                  propertyType: '',
                });
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="The Fjord">The Fjord</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6">
            <Label className="text-base font-semibold text-foreground">Need</Label>
            <Select
              value={formData.PropertyNeed}
              onValueChange={(value: PropertyNeed) => updateFormData({ PropertyNeed: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select need" />
              </SelectTrigger>
              <SelectContent>
                {needOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {showPropertyType && (
          <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-fade-in">
            <CardContent className="p-4 lg:p-6">
              <Label className="text-base font-semibold text-foreground">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value: string) => updateFormData({ propertyType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-fade-in">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => updateFormData({ featured: Boolean(checked) })}
              />
              <Label
                htmlFor="featured"
                className="text-base font-semibold cursor-pointer"
              >
                Featured Listing
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Featured listings get priority placement and increased visibility
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end animate-fade-in">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 lg:px-8 lg:py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          Next
        </Button>
      </div>
    </div>
  );
};