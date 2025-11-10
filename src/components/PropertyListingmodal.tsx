// components/PropertyListingmodal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { PropertyListingStepOne } from './PropertyListing/StepOne';
import { PropertyListingStepTwo } from './PropertyListing/StepTwo';
import { PropertyListingStepThree } from './PropertyListing/StepThree';
import { PropertyListingStepFour } from './PropertyListing/StepFour';
import { PropertyListingStepFive } from './PropertyListing/StepFive';
import { PropertyListingStepSix } from './PropertyListing/StepSix';
import { DEFAULT_AMENITIES, PropertyListing } from '@/types/propertyListing';
import { useToast } from '@/hooks/use-toast';

interface PropertyListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: PropertyListing) => void;
  editingListing?: PropertyListing;
}

const PropertyListingModal = ({ isOpen, onClose, onSubmit, editingListing }: PropertyListingModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const [formData, setFormData] = useState<PropertyListing>(() => {
    const baseData: PropertyListing = {
      // Step 1
      category: 'Residential',
      PropertyNeed: 'Buy',
      propertyType: '',
      featured: false,

      // Step 2
      title: '',
      subtitle: '',
      currency: 'Cedis',
      price: 0,
      frontImage: '',
      location: {
        country: 'Ghana (GH)',
        street: '',
        city: '',
        region: '',
        postcode: '',
        digitalAddress: '',
      },
      size: 0,
      sizeUnit: 'm2',
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,

      // Step 3
      summary: '',
      generalInfo: '',
      floorPlans: [],
      additionalPhotos: [],
      video: '',

      // Step 4
      amenities: DEFAULT_AMENITIES, // Comma-separated string
      customAmenities: [],
      localAmenities: [],
      paymentOptions: [], // Comma-separated string

      // Step 5
      faqs: [], // Comma-separated string

      // Additional fields
      listingType: 'property',
      propertyPrice: '0',
      propertyTax: '0',
      risks: '',
      tenures: '',
      registrations: '',
      salesPrice: '',
      ownership: '',
      roads: '',
      serviceLevel: '',
      Cancellation: '',
      CheckIn: '',
      commissionOffice: '',
      CheckInTime: '',
      CheckOutTime: '',
      bednum: 0,
      rule: '',
      buildyear: 2000,
      propertyUsage: '',

      // System
      status: 'unpublished',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return editingListing ? { ...baseData, ...editingListing } : baseData;
  });

  const steps = [
    { number: 1, title: 'Type', component: PropertyListingStepOne },
    { number: 2, title: 'Overview', component: PropertyListingStepTwo },
    { number: 3, title: 'Details', component: PropertyListingStepThree },
    { number: 4, title: 'Amenities', component: PropertyListingStepFour },
    { number: 5, title: 'FAQs', component: PropertyListingStepFive },
    { number: 6, title: 'Preview', component: PropertyListingStepSix },
  ];

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    try {
      onSubmit(formData);
      console.log(formData)
      toast({ title: "Property listing saved successfully!" });
      onClose();
      setCurrentStep(1);
    } catch (error) {
      console.error("Error saving property listing:", error);
      toast({
        title: "Error",
        description: "Failed to save property listing",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (updates: Partial<PropertyListing>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-xl">
              {editingListing ? 'Edit Property Listing' : 'Add Property Listing'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {steps.map((step) => (
                <Badge
                  key={step.number}
                  variant={step.number === currentStep ? "default" : step.number < currentStep ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {step.number}. {step.title}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLastStep={currentStep === 6}
            isFirstStep={currentStep === 1}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyListingModal;