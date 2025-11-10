import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PropertyListing, FAQ } from '@/types/propertyListing';
import { Plus, X } from 'lucide-react';

interface StepFiveProps {
  formData: PropertyListing;
  updateFormData: (updates: Partial<PropertyListing>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PropertyListingStepFive = ({ formData, updateFormData, onNext, onBack }: StepFiveProps) => {
  
  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    updateFormData({
      faq: [...formData.faq, newFAQ]
    });
  };

  const updateFAQ = (id: string, field: keyof FAQ, value: string) => {
    const updated = formData.faq.map(faq =>
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    updateFormData({ faq: updated });
  };

  const removeFAQ = (id: string) => {
    const updated = formData.faq.filter(faq => faq.id !== id);
    updateFormData({ faq: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">Add common questions and answers about your property</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">FAQs</Label>
            <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
          
          {formData.faq.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">
                No FAQs added yet. Click "Add FAQ" to start adding frequently asked questions.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {formData.faq.map((faq, index) => (
              <Card key={faq.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">FAQ #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFAQ(faq.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`question-${faq.id}`} className="text-sm">Question</Label>
                      <Input
                        id={`question-${faq.id}`}
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                        placeholder="Enter the question..."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`answer-${faq.id}`} className="text-sm">Answer</Label>
                      <Textarea
                        id={`answer-${faq.id}`}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                        placeholder="Enter the answer..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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