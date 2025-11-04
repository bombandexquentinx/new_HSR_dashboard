import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Listing } from '@/hooks/useAdminlistings';

interface EditListingModalProps {
  category: 'properties' | 'services' | 'addons' | 'resources' | 'other';
  listing: Listing;
  onClose: () => void;
  onSubmit: (data: Partial<Listing>) => Promise<void>;
}

const CATEGORY_CONFIG = {
  properties: {
    title: 'Edit Property',
    types: ['Fjord Apartment', 'Land', 'Residential', 'Investment', 'Commercial'],
    fields: ['title', 'type', 'price', 'location', 'description', 'status']
  },
  services: {
    title: 'Edit Service',
    types: ['Project Management', 'Property Valuation', 'Interior Decor', 'Land Registration', 'Property Consultancy'],
    fields: ['title', 'type', 'price', 'description', 'status']
  },
  addons: {
    title: 'Edit Add-On',
    types: ['Cleaning Service', 'Maintenance', 'Security', 'Landscaping'],
    fields: ['title', 'type', 'price', 'description', 'status']
  },
  resources: {
    title: 'Edit Resource',
    types: ['Property News', 'General News', 'Property Guide', 'Checklists', 'Toolkits'],
    fields: ['title', 'type', 'description', 'status']
  },
  other: {
    title: 'Edit Content',
    types: ['Trusted Partners', 'Team Members', 'Available Jobs', 'Privacy Policy', 'Cookie Policy', 'Website Terms', 'FAQs', 'Support Articles'],
    fields: ['title', 'type', 'description', 'status']
  }
};

const EditListingModal = ({ category, listing, onClose, onSubmit }: EditListingModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const config = CATEGORY_CONFIG[category];

  useEffect(() => {
    // Initialize form with existing listing data
    setFormData({
      title: listing.title || '',
      type: listing.type || '',
      price: listing.price || '',
      location: listing.location || '',
      description: listing.description || '',
      status: listing.status || 'Draft'
    });
  }, [listing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      toast({
        title: "Success!",
        description: `${config.title.replace('Edit ', '')} updated successfully.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: string) => {
    switch (field) {
      case 'title':
        return (
          <div key={field} className="col-span-2">
            <Label htmlFor={field}>Title *</Label>
            <Input
              id={field}
              placeholder="Enter title"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              required
            />
          </div>
        );

      case 'type':
        return (
          <div key={field}>
            <Label htmlFor={field}>Type *</Label>
            <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {config.types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'status':
        return (
          <div key={field}>
            <Label htmlFor={field}>Status</Label>
            <Select 
              value={formData[field] || 'Draft'} 
              onValueChange={(value) => handleInputChange(field, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'price':
        return (
          <div key={field}>
            <Label htmlFor={field}>Price</Label>
            <Input
              id={field}
              placeholder="e.g., $500, $2,500/mo"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
          </div>
        );

      case 'location':
        return (
          <div key={field}>
            <Label htmlFor={field}>Location</Label>
            <Input
              id={field}
              placeholder="Enter location"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
          </div>
        );

      case 'description':
        return (
          <div key={field} className="col-span-2">
            <Label htmlFor={field}>Description</Label>
            <Textarea
              id={field}
              placeholder="Enter description"
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{config.title}</CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map(renderField)}
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary flex-1" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Listing'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditListingModal;