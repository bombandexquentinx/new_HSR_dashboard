import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PropertyListing } from '@/types/propertyListing';
import { Upload, Plus, X } from 'lucide-react';

interface StepThreeProps {
  formData: PropertyListing;
  updateFormData: (updates: Partial<PropertyListing>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PropertyListingStepThree = ({ formData, updateFormData, onNext, onBack }: StepThreeProps) => {
  
  const addFloorPlan = () => {
    updateFormData({
      floorPlans: [...formData.floorPlans, '']
    });
  };

  const updateFloorPlan = (index: number, value: string) => {
    const updated = [...formData.floorPlans];
    updated[index] = value;
    updateFormData({ floorPlans: updated });
  };

  const removeFloorPlan = (index: number) => {
    const updated = formData.floorPlans.filter((_, i) => i !== index);
    updateFormData({ floorPlans: updated });
  };

  const addPhoto = () => {
    updateFormData({
      additionalPhotos: [...formData.additionalPhotos, '']
    });
  };

  const updatePhoto = (index: number, value: string) => {
    const updated = [...formData.additionalPhotos];
    updated[index] = value;
    updateFormData({ additionalPhotos: updated });
  };

  const removePhoto = (index: number) => {
    const updated = formData.additionalPhotos.filter((_, i) => i !== index);
    updateFormData({ additionalPhotos: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Property Details</h2>
        <p className="text-muted-foreground">Add detailed information, floor plans, photos, and videos</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => updateFormData({ summary: e.target.value })}
              placeholder="Brief summary of the property..."
              className="mt-1 min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="generalInfo">General Information</Label>
            <Textarea
              id="generalInfo"
              value={formData.generalInfo}
              onChange={(e) => updateFormData({ generalInfo: e.target.value })}
              placeholder="Detailed information about the property..."
              className="mt-1 min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">Floor & Site Plans</Label>
            <Button type="button" variant="outline" size="sm" onClick={addFloorPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </div>
          
          {formData.floorPlans.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">
                No floor plans added yet. Click "Add Plan" to start.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {formData.floorPlans.map((plan, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Input
                    type="file"
                    placeholder="Floor plan URL or upload file"
                    value={plan}
                    onChange={(e) => updateFloorPlan(index, e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Drag and drop, upload from file, or paste image URL
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFloorPlan(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">Additional Photos</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPhoto}>
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
          
          {formData.additionalPhotos.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">
                No additional photos added yet. Click "Add Photo" to start.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {formData.additionalPhotos.map((photo, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Input
                    type="file"
                    placeholder="Photo URL or upload file"
                    value={photo}
                    onChange={(e) => updatePhoto(index, e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Drag and drop, upload from file, or paste image URL
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Label htmlFor="video" className="text-base font-semibold">Video</Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <Input
              id="video"
              type="text"
              placeholder="Video URL (YouTube) or upload file"
              value={formData.video}
              onChange={(e) => updateFormData({ video: e.target.value })}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Drag and drop video file, upload from file, or paste YouTube URL
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};