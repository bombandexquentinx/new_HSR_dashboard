import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyListing, ListingCategory, PropertyNeed, PROPERTY_TYPES, CATEGORY_AMENITIES, DEFAULT_AMENITIES } from '@/types/propertyListing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper function to safely parse JSON
const safeJSONParse = (str: string, defaultValue: any) => {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
};


interface AmenitiesStepProps {
    formData: Omit<Partial<PropertyListing>, 'keyFeatures' | 'location' | 'videoLinks' | 'faq'> & {
        location: string;
        keyFeatures: string;
        videoLinks: string;
        faq: string;
        propertyAmenities: string;
        paymentOptions: string | string[];
        localAmenities: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<Omit<Partial<PropertyListing>, 'keyFeatures' | 'location' | 'videoLinks' | 'faq'> & {
        location: string;
        keyFeatures: string;
        videoLinks: string;
        faq: string;
        propertyAmenities: string;
        paymentOptions: string | string[];
        localAmenities: string;
    }>>;
    listingCate: ListingCategory | '';
    amenities: any;
    notify: any; // Assuming notify is from react-toastify or similar
}

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({ formData, setFormData, listingCate, notify, amenities }) => {
    const [amenityInput, setAmenityInput] = useState('');
    const [customAmenities, setCustomAmenities] = useState([])
    const [distanceInput, setDistanceInput] = useState('');
    const [localAmenityCategory, setLocalAmenityCategory] = useState<string>('');

    // Amenity and payment options
    const plotFeatures = [
        'Water on site',
        'Electricity on site',
        'Gas on site',
        'Sanitation System',
        'Garbage Pickup',
        '24/7 security',
        'CCTV',
        'Watch Man',
        'Fenced plot',
    ];

    const buildingFeatures = [
        'Swimming Pool',
        'Parking',
        'Fitness Center',
        'Rooftop Gardens',
        'Building WiFi',
        'Greenery Around the Space',
    ];

    const fjord = [
        '24/7 security',
        'CCTV',
        'Watch Man',
        'Beach front plot',
        'Mountain view',
        'Beach view',
    ];

    const residential = {
        "rent": [
            'Monthly Payment',
            '6 Months Advance Payment',
            '24 Months Advance Payment',
            '36 Months Advance Payment'
        ],
        'buy': [
            'Cash Payment',
            'Cedis Mortgage Financing (01-25 years)',
            'Dollar Mortgage Financing (01-15 years)',
            'Bank Financing (loan)',
            'Installment Payment( 06-60 months)'
        ]
    }

    const commercial = {
        'buy':[
            'Cash Payment',
            'Cedis Mortgage Financing (01-25 years)',
            'Dollar Mortgage Financing (01-15 years)',
            'Bank Financing (loan)',
            'Installment Payment( 06-60 months)'
        ],
        'rent':[
            '12 Months Advance Payment',
            '24 Months Advance Payment',
            '36 Months Advance Payment',
            '48 Months Advance Payment',
            '60 Months Advance Payment'
        ]
    }
    const paymentOptionsLand = ['Cash Outright', '6 Months Payment Plan', '12 Months Payment Plan'];
    const paymentOptionsProperty = ['Cash Outright', '6 Months Payment Plan', '12 Months Payment Plan', 'Republic Bank Mortgage'];
    const paymentOptionsFjord = ['Cash Payment', 'Momo Payment', 'OneOff Payment'];
    const paymentOptionsRent = ['Monthly Payment', '3 Monthly Payment', '6 Monthly Payment'];
    const residentalByPayment = [
        

    ]
 
    const localAmenityCategories = [
        'Shopping',
        'Education',
        'Healthcare',
        'Recreation',
        'Dining',
        'Business',
        'Commercial',
        'Transportation',
        'Banking',
        'Services',
        'Religion',
    ];

    // Debug log for paymentOptions
    useEffect(() => {
        let parsed: string[] = [];
        if (typeof formData.paymentOptions === 'string') {
            parsed = safeJSONParse(formData.paymentOptions || '[]', []);
        } else if (Array.isArray(formData.paymentOptions)) {
            parsed = formData.paymentOptions;
        }
        console.log('AmenitiesStep parsed paymentOptions:', parsed);
    }, [formData.paymentOptions]);

    // Handler for updating form data
    const handleInputChange = useCallback(
        (field: keyof PropertyListing, value: any, isChecked: boolean | null = null) => {
            setFormData((prev) => {
                if (['propertyAmenities', 'paymentOptions'].includes(field)) {
                    console.log(`AmenitiesStep handleInputChange: field=${field}, value=${value}, isChecked=${isChecked}`);
                    const currentArray = typeof prev[field] === 'string' ? safeJSONParse(prev[field] || '[]', []) : [];
                    const updatedArray = isChecked
                        ? [...currentArray, value]
                        : currentArray.filter((item: any) => item !== value);
                    console.log(`Updated array for ${field}:`, updatedArray);
                    return { ...prev, [field]: JSON.stringify(updatedArray) };
                }
                return { ...prev, [field]: value };
            });
        },
        [setFormData]
    );

    // Handler for adding local amenities
    const handleAddAmenity = useCallback(() => {
        if (amenityInput && distanceInput && !isNaN(Number(distanceInput)) && localAmenityCategory) {
            const newAmenity = { [`${localAmenityCategory}:${amenityInput}`]: Number(distanceInput) };
            const currentAmenities = typeof formData.localAmenities === 'string'
                ? safeJSONParse(formData.localAmenities || '{}', {})
                : formData.localAmenities;
            const updatedAmenities = { ...currentAmenities, ...newAmenity };
            setFormData((prev) => ({
                ...prev,
                localAmenities: JSON.stringify(updatedAmenities),
            }));
            setAmenityInput('');
            setLocalAmenityCategory('');
        } else {
            notify.error('Please select a category, enter a valid amenity name, and distance.');
        }
    }, [amenityInput, distanceInput, localAmenityCategory, formData.localAmenities, notify, setFormData]);

    // Handler for removing local amenities
    const handleRemoveAmenity = useCallback(
        (amenityName: string) => {
            const currentAmenities = typeof formData.localAmenities === 'string'
                ? safeJSONParse(formData.localAmenities || '{}', {})
                : formData.localAmenities;
            const updatedAmenities = { ...currentAmenities };
            delete updatedAmenities[amenityName];
            setFormData((prev) => ({
                ...prev,
                localAmenities: JSON.stringify(updatedAmenities),
            }));
        },
        [formData.localAmenities, setFormData]
    );

    const handleAddCustomAmenities = useCallback(() => {
        console.log(safeJSONParse(formData.propertyAmenities || '{}', {}))
        if (amenityInput && !safeJSONParse(formData.propertyAmenities || '{}', {})[amenityInput]) {
            const currentAmenities = safeJSONParse(formData.propertyAmenities || '{}', {});
            currentAmenities[amenityInput] = true;
            setFormData((prev) => ({ ...prev, propertyAmenities: JSON.stringify(currentAmenities) }));
            setAmenityInput(""); // Clear the amenity input field after adding
        } else {
            notify.error('Please enter a valid, unique amenity name.');
        }
        }, [amenityInput, amenities, notify]);

      // Handle removing an amenity from the list
    const handleRemoveCustomAmenity = (amenityName) => {
        const currentAmenities = JSON.parse(formData.propertyAmenities || '{}');
        delete currentAmenities[amenityName];
    };
    
    const getSpecificAmenities = (category: ListingCategory) => {
    return CATEGORY_AMENITIES[category as keyof typeof CATEGORY_AMENITIES] || [];
    };

    const getPaymentoption = (category: ListingCategory) => {
        if(category === "Land"){
            return paymentOptionsLand;
        }else if(category === "The Fjord"){
            return paymentOptionsFjord
        }else if(category === "Residential" && formData.PropertyNeed === "Buy"){
            return residential['buy']
        }else if(category === "Residential" && formData.PropertyNeed === "Rent"){
            return residential['rent']
        }else if(category === "Commercial" && formData.PropertyNeed === "Buy"){
            return commercial['buy']
        }else if(category === "Commercial" && formData.PropertyNeed === "Rent"){
            return commercial['rent']
        }else{
            return paymentOptionsProperty;
        }
    }
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center animate-slide-up">
                <h2 className="text-2xl font-bold mb-2 text-foreground">{listingCate} Amenities & Payment</h2>
                <p className="text-muted-foreground">Select amenities and payment options for {formData.category?.toLowerCase()} properties</p>
            </div>

            <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
                <CardContent className="p-4 lg:p-6">
                    <Label className="text-base font-semibold mb-4 block text-foreground">General Property Amenities</Label>
                    <Tabs defaultValue="general" className="w-full mb-4">
                        <TabsList>
                            <TabsTrigger value="general">General Amenities</TabsTrigger>
                            <TabsTrigger value="specific">Specific Amenities </TabsTrigger>
                            <TabsTrigger value="custom">Custom Amenities </TabsTrigger>
                        </TabsList>
                        <TabsContent value="general">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {(DEFAULT_AMENITIES).map((amenity) => (
                                    <label
                                        key={amenity.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={(JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>)[amenity.name]}
                                            onCheckedChange={(checked) => {
                                                const currentAmenities = JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>;
                                                if (checked as boolean) {
                                                    currentAmenities[amenity.name] = true;
                                                } else {
                                                    delete currentAmenities[amenity.name];
                                                }
                                                setFormData((prev) => ({ ...prev, propertyAmenities: JSON.stringify(currentAmenities) }));
                                            }}
                                            aria-label={`Toggle ${amenity.name}`}
                                        />
                                        <span className="text-sm">{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="specific">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {(listingCate ? getSpecificAmenities(listingCate as ListingCategory) : []).map((amenity) => (
                                    <label
                                        key={amenity.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={(JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>)[amenity.name]}
                                            onCheckedChange={(checked) => {
                                                const currentAmenities = JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>;
                                                if (checked as boolean) {
                                                    currentAmenities[amenity.name] = true;
                                                } else {
                                                    delete currentAmenities[amenity.name];
                                                }
                                                setFormData((prev) => ({ ...prev, propertyAmenities: JSON.stringify(currentAmenities) }));
                                            }}
                                            aria-label={`Toggle ${amenity.name}`}
                                        />
                                        <span className="text-sm">{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="custom">
                            <div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={amenityInput}
                                        onChange={(e) => setAmenityInput(e.target.value)}
                                        className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                                        placeholder="Enter an amenity"
                                        aria-label="Enter amenity name"
                                    />
                                    
                                    <button
                                        type="button"
                                        onClick={handleAddCustomAmenities}
                                        className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        aria-label="Add amenity"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {Object.keys(JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>).map((name) =>
                                       (JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>)[name] !== false && (
                                        <div key={name} className="flex items-center p-2 border rounded-md">
                                            <Checkbox
                                                checked={(JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>)[name]}
                                                onCheckedChange={(checked) => {
                                                    const currentAmenities = JSON.parse(formData.propertyAmenities || '{}') as Record<string, boolean>;
                                                    if (checked) {
                                                        currentAmenities[name] = true;
                                                    } else {
                                                        delete currentAmenities[name];
                                                    }
                                                    setFormData((prev) => ({ ...prev, propertyAmenities: JSON.stringify(currentAmenities) }));
                                                }}
                                                aria-label={`Toggle ${name}`}
                                            />
                                            <span className="text-sm">{name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
                <CardContent className="p-4 lg:p-6">
                    <Label className="text-base font-semibold mb-4 block text-foreground">Custom Local Amenities</Label>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="amenityCategory">Category</Label>
                            <Select value={localAmenityCategory} onValueChange={setLocalAmenityCategory}>
                                <SelectTrigger id="amenityCategory" className="mt-1">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {localAmenityCategories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Label htmlFor="amenityInput">Amenity Name</Label>
                                <Input
                                    id="amenityInput"
                                    value={amenityInput}
                                    onChange={(e) => setAmenityInput(e.target.value)}
                                    placeholder="Enter an amenity"
                                    className="mt-1"
                                    aria-label="Enter amenity name"
                                />
                            </div>
                            <div className="w-32">
                                <Label htmlFor="distanceInput">Distance (mins)</Label>
                                <Input
                                    id="distanceInput"
                                    type="number"
                                    value={distanceInput}
                                    onChange={(e) => setDistanceInput(e.target.value)}
                                    placeholder="Mins Drive"
                                    className="mt-1"
                                    aria-label="Enter distance in minutes"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddAmenity}
                                className="mt-6 bg-blue-600 hover:bg-blue-700"
                                aria-label="Add amenity"
                            >
                                Add
                            </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Local amenities list">
                                {Object.entries(safeJSONParse(formData.localAmenities || '{}', {}) as Record<string, number>).map(([name, distance]) => (
                                <div
                                    key={name}
                                    role="listitem"
                                    className="flex items-center p-2 border rounded-md"
                                >
                                    <span>{name} - {distance} mins</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAmenity(name)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        aria-label={`Remove ${name} amenity`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
                <CardContent className="p-4 lg:p-6">
                    <Label className="text-base font-semibold mb-4 block text-foreground">Payment Options for {formData.PropertyNeed}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {(listingCate ? getPaymentoption(listingCate as ListingCategory) : []).map((option) => (
                            <label key={option} className="flex items-center border rounded-md p-2">
                                <Checkbox
                    checked={Boolean((safeJSONParse(typeof formData.paymentOptions === 'string' ? formData.paymentOptions : '[]', []) as string[]).includes(option))}
                    onCheckedChange={(checked) => handleInputChange('paymentOptions', option, checked as boolean)}
                    aria-label={`Toggle ${option} payment option`}
                />
                <span className="text-sm ml-2">{option}</span>
            </label>
        ))}
    </div>
</CardContent>
</Card>
        </div>
    );
};

export default AmenitiesStep;