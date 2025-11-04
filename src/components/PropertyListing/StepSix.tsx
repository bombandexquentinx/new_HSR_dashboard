import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyListing } from '@/types/propertyListing';
import { MapPin, Home, Eye, Heart, Bed, Bath, Car, Square } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface StepSixProps {
  formData: PropertyListing;
  onBack: () => void;
  onSubmit: () => void;
  isLastStep: boolean;
}

export const PropertyListingStepSix = ({ formData, onBack, onSubmit }: StepSixProps) => {
  const handleSubmit = () => {
    const confirmed = window.confirm('Are you sure you want to submit this listing? Please review all information carefully.');
    if (confirmed) {
      onSubmit();
    }
  };

  const getNeedTitle = () => {
    switch (formData.PropertyNeed) {
      case 'Buy':
        return 'Property to Buy';
      case 'Rent':
        return 'Property to Rent';
      case 'Stay':
        return 'Property to Stay';
      case 'Invest':
        return 'Investment Property';
      default:
        return 'Property Listing';
    }
  };

  const getLocationDisplay = () => {
    const { city, region, country } = formData.location;
    return [city, region, country.split(' ')[0]].filter(Boolean).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Preview Your Listing</h2>
        <p className="text-muted-foreground">Review how your property listing will appear to customers</p>
      </div>

      <Card className="max-w-md mx-auto overflow-hidden shadow-lg">
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200">
          {formData.frontImage ? (
            <img 
              src={`${BASE_URL}${formData.frontImage}`} 
              alt={formData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant="secondary" className="text-xs">
              {formData.PropertyNeed}
            </Badge>
            {formData.featured && (
              <Badge variant="default" className="text-xs bg-yellow-500">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-xs bg-white">
              {formData.category}
            </Badge>
          </div>

          {/* Favorite Icon */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/80 rounded-full p-2">
              <Heart className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Need Title */}
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {getNeedTitle()}
            </Badge>
          </div>

          {/* Title and Price */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg line-clamp-1">{formData.title}</h3>
            {formData.subtitle && (
              <p className="text-sm text-gray-600 line-clamp-1">{formData.subtitle}</p>
            )}
            <p className="text-xl font-bold text-primary mt-1">
              {formData.currency === 'Cedis' ? '₵' : '$'}{formData.price.toLocaleString()}
              {formData.PropertyNeed === 'Rent' && '/mo'}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{getLocationDisplay()}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{formData.size} {formData.sizeUnit}</span>
            </div>
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>{formData.parking}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{formData.bedRoom}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{formData.bathRoom}</span>
            </div>
          </div>

          {/* View More Button */}
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View More
          </Button>
        </CardContent>
      </Card>

      {/* Summary Information */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Listing Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{formData.category}</span>
            </div>
            <div>
              <span className="text-gray-600">Need:</span>
              <span className="ml-2 font-medium">{formData.PropertyNeed}</span>
            </div>
            {formData.propertyType && (
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{formData.propertyType}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Featured:</span>
              <span className="ml-2 font-medium">{formData.featured ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Amenities:</span>
              <span className="ml-2 font-medium">
                {formData.amenities.filter(a => a.selected).length} selected
              </span>
            </div>
            <div>
              <span className="text-gray-600">FAQs:</span>
              <span className="ml-2 font-medium">{formData.faq.length} added</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} className="px-8">
          Submit Listing
        </Button>
      </div>
    </div>
  );
};