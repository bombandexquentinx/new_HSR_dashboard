import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PropertyListing, Currency, Country, SizeUnit } from '@/types/propertyListing';
import { Upload, MapPin } from 'lucide-react';

interface StepTwoProps {
  formData: PropertyListing;
  updateFormData: (updates: Partial<PropertyListing>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PropertyListingStepTwo = ({ formData, updateFormData, onNext, onBack }: StepTwoProps) => {
  
  const handleLocationChange = (field: string, value: string) => {
    updateFormData({
      location: {
        ...formData.location,
        [field]: value
      }
    });
  };

  const isValid = formData.title && formData.price > 0 && formData.location.country && 
                  formData.location.city && formData.size > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Property Overview</h2>
        <p className="text-muted-foreground">Add basic information about your property</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6 space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Enter property title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => updateFormData({ subtitle: e.target.value })}
                placeholder="Enter property subtitle"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6 space-y-4">
            <div>
              <Label>Currency *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value: Currency) => updateFormData({ currency: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cedis">Cedis</SelectItem>
                  <SelectItem value="Dollar">Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                placeholder="Enter price"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6">
            <Label>Front Image (Display Image)</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <Input
                  type="file"
                  placeholder="Image URL or upload file"
                  value={formData.frontImage}
                  onChange={(e) => updateFormData({ frontImage: e.target.value })}
                  className="mt-2"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Drag and drop, upload from file, or paste image URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <Label className="text-base font-semibold">Location Details</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Country *</Label>
                <Select 
                  value={formData.location.country} 
                  onValueChange={(value: Country) => handleLocationChange('country', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                    <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={formData.location.street}
                  onChange={(e) => handleLocationChange('street', e.target.value)}
                  placeholder="Street address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.location.region}
                  onChange={(e) => handleLocationChange('region', e.target.value)}
                  placeholder="Region"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.location.postcode}
                  onChange={(e) => handleLocationChange('postcode', e.target.value)}
                  placeholder="Postcode"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="digitalAddress">Digital Address</Label>
                <Input
                  id="digitalAddress"
                  value={formData.location.digitalAddress}
                  onChange={(e) => handleLocationChange('digitalAddress', e.target.value)}
                  placeholder="Digital address"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-scale-in">
          <CardContent className="p-4 lg:p-6">
            <Label className="text-base font-semibold mb-4 block">Property Specifications</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  type="number"
                  min="0"
                  value={formData.size}
                  onChange={(e) => updateFormData({ size: Number(e.target.value) })}
                  placeholder="Size"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select 
                  value={formData.sizeUnit} 
                  onValueChange={(value: SizeUnit) => updateFormData({ sizeUnit: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m2">m²</SelectItem>
                    <SelectItem value="ft2">ft²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedRoom}
                  onChange={(e) => updateFormData({ bedRoom: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathRoom}
                  onChange={(e) => updateFormData({ bathRoom: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="parking">Parking (Number of cars)</Label>
              <Input
                id="parking"
                type="number"
                min="0"
                value={formData.parking}
                onChange={(e) => updateFormData({ parking: Number(e.target.value) })}
                placeholder="Number of parking spaces"
                className="mt-1 max-w-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
          disabled={!isValid}
          className="px-6 py-2 lg:px-8 lg:py-3 btn-primary disabled:opacity-50 transition-all duration-300 hover:scale-105"
        >
          Next
        </Button>
      </div>
    </div>
  );
};