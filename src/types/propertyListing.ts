export type ListingCategory = 'The Fjord' | 'Land' | 'Commercial' | 'Residential' | 'Investment';
export type ListingAmenities = ""
export type ListingStatus = 'published' | 'unpublished' | 'close' | 'archived';
export type PropertyNeed = 'Stay' | 'Rent' | 'Buy' | 'Invest';
export type Currency = 'Cedis' | 'Dollar';
export type Country = 'Ghana (GH)' | 'South Africa (SA)' | 'United Arab Emirates (UAE)' | 'Nigeria (NG)' | 'Kenya (KN)';
export type SizeUnit = 'm2' | 'ft2';
export type PaymentOption = 
  | 'Monthly payment' 
  | '3 monthly payment' 
  | '6 monthly payment' 
  | '12 monthly payment' 
  | '24 monthly payment' 
  | '36 monthly payment'
  | 'Cash Outright'
  | '12 Months Payment Plan'
  | '24 Months Payment Plan'
  | '6 Months Payment Plan'
  | 'Mortgage';

export interface Location {
  country: string;
  street: string;
  city: string;
  region: string;
  postcode: string;
  digitalAddress: string;
  latitude: string | number;
  longitude: string | number;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  selected: boolean;
}

export interface CustomAmenity {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

export interface LocalAmenity {
  id: string;
  name: string;
  minutesDrive: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PropertyListing {
  amenities: any;
  customAmenities: any;
  need: string;
  property_details_id?: string;
  listingType: 'Property' | 'Service' | 'Resource' | 'Addons';
  title: string;
  subtitle: string;
  serviceCategory: string;
  serviceLocation: string;
  serviceSummary: string;
  price: number;
  shortDescription?: string;
  detailedDescription?: string;
  digitalAddress?: string;
  region?: string;
  city?: string;
  street?: string;
  postcode?: string;
  serviceDetails: string;
  status: ListingStatus;
  PropertyNeed: PropertyNeed;
  generalInfo: string;
  localAmenities: string; // JSON string
  propertyAmenities: string; // JSON string
  size: number;
  parking: number;
  bedRoom: number;
  bathRoom: number;
  area: string;
  paymentOptions: string; // JSON string
  features: string; // JSON string
  currency: Currency;
  country: string;
  location: Location;
  videoLinks: string; // JSON string
  faq: FAQ[]; // Array of FAQ objects
  category: ListingCategory;
  keyFeatures?: string[]; // JSON string
  propertyUsage: string;
  total: string;
  occupancy: string;
  propertyPrice: string; // JSON string
  propertyTax: string; // JSON string
  risks: string; // JSON string
  tenures: string; // JSON string
  registrations: string; // JSON string
  expectedOutcome?: string; // JSON string
  whyChoose?: string;
  salesPrice: string; // JSON string
  whatsIncluded?: string; // JSON string
  whatsIncludedDetails?: string;
  featured: boolean;
  ownership: string; // JSON string
  roads: string; // JSON string
  serviceLevel: string; // JSON string
  total_minutes_read?: number;
  Cancellation: string; // JSON string
  CheckIn: string; // JSON string
  requestQuote?: boolean;
  commissionOffice: string;
  paragraphs?: string; // Comma-separated string
  displayImage?: string; // URL from frontImage
  displayImages?: string[]; // URLs from media
  floorPlans?: string[]; // URLs from floorPlans
  ownershipPaths?: string[]; // URLs from ownership
  createdAt?: string;
  updatedAt?: string;
  unit?: string;
  propertyType?: string;
  frontImage?: string;
  sizeUnit?: SizeUnit;

  displayImageFile: File | null;
  yearBuilt: number | ''; // New field for year built
  condition: string; // New field for property condition
  discount: number | ''; // New field for discount percentage
  floorPlansData: Array<{ floor: string; file: File }>; // New field for floor plans
  sitePlansData: Array<{ type: string; file: File }>; // New field for site plans
  documentationData: Array<{ type: string; file: File }>;
  additionalPhotos: string[];
  summary: string;
  video: string;
}

// General amenities that apply to all property types
export const GENERAL_AMENITIES: Amenity[] = [
  { id: 'gen1', name: 'Parking', icon: '🚗', selected: false },
  { id: 'gen2', name: 'Security System', icon: '🔒', selected: false },
  { id: 'gen3', name: 'CCTV Surveillance', icon: '📹', selected: false },
  { id: 'gen4', name: 'WiFi Internet', icon: '📶', selected: false },
  { id: 'gen5', name: 'Air Conditioning', icon: '❄️', selected: false },
  { id: 'gen6', name: 'Water Supply', icon: '💧', selected: false },
  { id: 'gen7', name: 'Electricity', icon: '⚡', selected: false },
  { id: 'gen8', name: 'Waste Management', icon: '🗑️', selected: false },
  { id: 'gen9', name: 'Road Access', icon: '🛣️', selected: false },
  { id: 'gen10', name: 'Public Transport Access', icon: '🚌', selected: false },
  { id: 'gen11', name: 'Backup Power/Generator', icon: '🔌', selected: false },
  { id: 'gen12', name: 'Fire Safety System', icon: '🚨', selected: false },
];

// Default amenities structure - combines general + category-specific
export const DEFAULT_AMENITIES: Amenity[] = GENERAL_AMENITIES;

export const PROPERTY_TYPES = {
  Residential: ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Duplex'],
  Commercial: ['Office', 'Retail', 'Warehouse', 'Industrial', 'Mixed Use', 'Restaurant', 'Hotel'],
  Investment: ['Rental Property', 'Commercial Investment', 'Development Land', 'REITs', 'Portfolio'],
  Land: ['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Development Land', 'Raw Land'],
  'The Fjord': ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Duplex','Luxury Suite', 'Executive Room', 'Penthouse', 'Beach Villa', 'Garden View', 'Sea View',],
};

// Category-specific amenities with icons
export const CATEGORY_AMENITIES = {
  Residential: [
    { id: 'air-conditioning', name: 'Air conditioning', icon: '❄️', selected: false },
    { id: 'furnished', name: 'Furnished', icon: '🛋️', selected: false },
    { id: 'unfurnished', name: 'Unfurnished', icon: '🏠', selected: false },
    { id: 'semi-furnished', name: 'Semi Furnished', icon: '🛏️', selected: false },
    { id: 'balcony', name: 'Balcony', icon: '🌅', selected: false },
    { id: 'terrace', name: 'Terrace', icon: '🌿', selected: false },
    { id: 'parking', name: 'Parking', icon: '🚗', selected: false },
    { id: 'swimming-pool', name: 'Swimming Pool', icon: '🏊', selected: false },
    { id: 'fitness-center', name: 'Fitness Center', icon: '💪', selected: false },
    { id: 'security', name: 'Security systems', icon: '🔒', selected: false },
    { id: 'cctv', name: 'CCTV', icon: '📹', selected: false },
    { id: 'backup-power', name: 'Backup Power/Generator', icon: '🔌', selected: false },
    { id: 'water-supply', name: '24/7 Water Supply', icon: '💧', selected: false },
    { id: 'internet', name: 'Internet/WiFi Ready', icon: '📶', selected: false },
    { id: 'garden', name: 'Garden/Green Space', icon: '🌳', selected: false },
    { id: 'servant-quarters', name: 'Servant Quarters', icon: '🏘️', selected: false },
    { id: 'borehole', name: 'Borehole', icon: '💧', selected: false },
    { id: 'solar-panels', name: 'Solar Panels', icon: '☀️', selected: false },
  ],
  Commercial: [
    { id: 'elevator', name: 'Elevator', icon: '🏗️', selected: false },
    { id: 'air-conditioning', name: 'Central Air Conditioning', icon: '❄️', selected: false },
    { id: 'parking', name: 'Parking Space', icon: '🚗', selected: false },
    { id: 'security', name: '24/7 Security', icon: '🔒', selected: false },
    { id: 'cctv', name: 'CCTV Surveillance', icon: '📹', selected: false },
    { id: 'backup-power', name: 'Backup Generator', icon: '🔌', selected: false },
    { id: 'loading-bay', name: 'Loading Bay', icon: '🚛', selected: false },
    { id: 'conference-room', name: 'Conference Rooms', icon: '💼', selected: false },
    { id: 'reception', name: 'Reception Area', icon: '🏢', selected: false },
    { id: 'canteen', name: 'Staff Canteen', icon: '🍽️', selected: false },
    { id: 'fire-safety', name: 'Fire Safety System', icon: '🚨', selected: false },
    { id: 'wheelchair-access', name: 'Wheelchair Accessible', icon: '♿', selected: false },
    { id: 'fiber-internet', name: 'Fiber Internet', icon: '🌐', selected: false },
    { id: 'water-backup', name: 'Water Storage/Backup', icon: '💧', selected: false },
    { id: 'waste-management', name: 'Waste Management', icon: '🗑️', selected: false },
  ],
  Land: [
    { id: 'title-deed', name: 'Clean Title Deed', icon: '📋', selected: false },
    { id: 'surveyed', name: 'Surveyed', icon: '📐', selected: false },
    { id: 'fenced', name: 'Fenced', icon: '🚧', selected: false },
    { id: 'road-access', name: 'Good Road Access', icon: '🛣️', selected: false },
    { id: 'electricity-nearby', name: 'Electricity Nearby', icon: '⚡', selected: false },
    { id: 'water-source', name: 'Water Source Nearby', icon: '💧', selected: false },
    { id: 'corner-piece', name: 'Corner Piece', icon: '📐', selected: false },
    { id: 'flat-terrain', name: 'Flat Terrain', icon: '🏞️', selected: false },
    { id: 'slightly-sloped', name: 'Slightly Sloped', icon: '⛰️', selected: false },
    { id: 'commercial-zoning', name: 'Commercial Zoning', icon: '🏢', selected: false },
    { id: 'residential-zoning', name: 'Residential Zoning', icon: '🏠', selected: false },
    { id: 'mixed-use-zoning', name: 'Mixed Use Zoning', icon: '🏙️', selected: false },
    { id: 'development-permit', name: 'Development Permit Ready', icon: '📝', selected: false },
    { id: 'drainage', name: 'Good Drainage', icon: '🌊', selected: false },
  ],
  Investment: [
    { id: 'high-rental-yield', name: 'High Rental Yield Area', icon: '💰', selected: false },
    { id: 'capital-appreciation', name: 'Capital Appreciation Potential', icon: '📈', selected: false },
    { id: 'prime-location', name: 'Prime Location', icon: '📍', selected: false },
    { id: 'transport-links', name: 'Good Transport Links', icon: '🚌', selected: false },
    { id: 'schools-nearby', name: 'Schools Nearby', icon: '🎓', selected: false },
    { id: 'hospitals-nearby', name: 'Hospitals Nearby', icon: '🏥', selected: false },
    { id: 'shopping-centers', name: 'Shopping Centers Nearby', icon: '🛒', selected: false },
    { id: 'business-district', name: 'Business District', icon: '🏢', selected: false },
    { id: 'tourist-area', name: 'Tourist/Entertainment Area', icon: '🎭', selected: false },
    { id: 'expanding-neighborhood', name: 'Expanding Neighborhood', icon: '🏗️', selected: false },
    { id: 'government-projects', name: 'Government Projects Nearby', icon: '🏛️', selected: false },
    { id: 'infrastructure-development', name: 'Infrastructure Development', icon: '🛤️', selected: false },
    { id: 'low-vacancy-rate', name: 'Low Vacancy Rate', icon: '🏠', selected: false },
    { id: 'professional-management', name: 'Professional Management Available', icon: '👨‍💼', selected: false },
  ],
  'The Fjord': [
    { id: 'sea-view', name: 'Sea View', icon: '🌊', selected: false },
    { id: 'beach-access', name: 'Private Beach Access', icon: '🏖️', selected: false },
    { id: 'concierge', name: '24/7 Concierge', icon: '🛎️', selected: false },
    { id: 'housekeeping', name: 'Daily Housekeeping', icon: '🧹', selected: false },
    { id: 'room-service', name: '24/7 Room Service', icon: '🍽️', selected: false },
    { id: 'spa', name: 'Spa Services', icon: '🧖‍♀️', selected: false },
    { id: 'fine-dining', name: 'Fine Dining Restaurant', icon: '🍷', selected: false },
    { id: 'infinity-pool', name: 'Infinity Pool', icon: '🏊‍♂️', selected: false },
    { id: 'yacht-service', name: 'Yacht Charter Service', icon: '⛵', selected: false },
    { id: 'golf-course', name: 'Golf Course Access', icon: '⛳', selected: false },
    { id: 'helicopter-pad', name: 'Helicopter Landing Pad', icon: '🚁', selected: false },
    { id: 'wine-cellar', name: 'Private Wine Cellar', icon: '🍾', selected: false },
    { id: 'butler-service', name: 'Personal Butler Service', icon: '🤵', selected: false },
    { id: 'luxury-transport', name: 'Luxury Transport Service', icon: '🚗', selected: false },
    { id: 'private-chef', name: 'Private Chef Available', icon: '👨‍🍳', selected: false },
    { id: 'entertainment-system', name: 'Premium Entertainment System', icon: '📺', selected: false },
  ],
};