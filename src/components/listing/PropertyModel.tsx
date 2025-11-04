import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FormikHelpers } from 'formik';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PictureAsPdf, Image, Upload, Category, NaturePeople } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

import { PropertyListing, ListingCategory, PropertyNeed, Currency, PROPERTY_TYPES, Country, SizeUnit, CATEGORY_AMENITIES, DEFAULT_AMENITIES } from '@/types/propertyListing';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import * as L from 'leaflet';
import app from '../../utils/api';
import { Checkbox } from '../ui/checkbox';

import { BadgeCent, Heart, House, LucideDollarSign, MapPin, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import { ToastContainer } from 'react-toastify';

import { debounce } from '../../utils/debounce';

// Import assets
import bathroonIcon from '../../assets/bathroom.png';
import childIcon from '../../assets/bedroom_child.png';
import garageIcon from '../../assets/garage_home.png';
import squreIcon from '../../assets/square_foot.png';
import duotone from '../../assets/Pin_alt_duotone.png';
import plot from '../../assets/plot.png';
import AmenitiesStep from '../PropertyListing/AmenitiesStep';

const BASE_URL: string = import.meta.env.VITE_BASE_URl;

// Utility functions to convert amenities formats
const amenitiesArrayToObject = (arr: Array<{ name: string; distance: number }>): Record<string, number> => {
  const obj: Record<string, number> = {};
  arr.forEach((item) => {
    obj[item.name] = item.distance;
  });
  return obj;
};

const amenitiesObjectToArray = (obj: Record<string, number>): Array<{ name: string; distance: number }> => {
  return Object.entries(obj).map(([name, distance]) => ({ name, distance }));
};

const countryCenters: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Ghana (GH)': { lat: 7.9465, lng: -1.0232, zoom: 6 },
  'South Africa (SA)': { lat: -30.5595, lng: 22.9375, zoom: 5 },
  'United Arab Emirates (UAE)': { lat: 23.4241, lng: 53.8478, zoom: 6 },
  'Nigeria (NG)': { lat: 9.0765, lng: 8.6753, zoom: 6 },
  'Kenya (KN)': { lat: -0.0236, lng: 37.9062, zoom: 6 },
};

// Define initial form data structure
interface FormData extends Omit<PropertyListing, 'location' | 'keyFeatures' | 'videoLinks' | 'faq' | 'displayImages' | 'propertyAmenities' | 'paymentOptions' | 'localAmenities' | 'serviceType' | 'yearBuilt' | 'discount' | 'video'> {
  location: Location;
  summary: string;
  video?: string;
  additionalPhotos: string[];
  displayImageFile: File | null;
  keyFeatures: string[];
  yearBuilt: string;
  condition: string;
  discount: string;
  floorPlansData: Array<{ floor: string; file: File }>;
  sitePlansData: Array<{ type: string; file: File }>;
  documentationData: Array<{ type: string; file: File }>;
  videoLinks: string[];
  faq: Array<{ question: string; answer: string }>;
  displayImages: (string | File)[];
  propertyAmenities: string;
  paymentOptions: string;
  localAmenities: string;
  serviceType: string;
  type: string;
  subcategory?: string;
  ownershipFiles: File[];
}

interface Location {
  country: string;
  street: string;
  city: string;
  region: string;
  postcode: string;
  digitalAddress: string;
  latitude: string;
  longitude: string;
}

const initialFormData: FormData = {
  property_details_id: '',
  title: '',
  subtitle: '',
  displayImage: '',
  displayImageFile: null,
  shortDescription: '',
  status: 'unpublished',
  type: 'Property',
  subcategory: '',
  category: 'Residential',
  PropertyNeed: 'Buy',
  country: 'Ghana (GH)',
  currency: 'Cedis',
  price: 0,
  serviceSummary: '',
  generalInfo: '',
  features: '[]',
  propertyAmenities: '{}',
  paymentOptions: '[]',
  localAmenities: '{}',
  location: {
    country: 'Ghana (GH)',
    street: '',
    city: '',
    region: '',
    postcode: '',
    digitalAddress: '',
    latitude: '5.605052121404785',
    longitude: '-0.23620605468756',
  },
  unit: "m2",
  serviceDetails: '',
  serviceCategory: '',
  serviceLocation: '',
  serviceType: 'Property',
  size: 0,
  bedRoom: 0,
  bathRoom: 0,
  parking: 0,
  area: '',
  videoLinks: [],
  faq: [],
  propertyUsage: '',
  total: '',
  occupancy: '',
  propertyPrice: '[]',
  propertyTax: '[]',
  risks: '[]',
  tenures: '[]',
  registrations: '[]',
  salesPrice: '[]',
  ownership: '[]',
  roads: '[]',
  serviceLevel: '[]',
  Cancellation: '[]',
  CheckIn: '[]',
  commissionOffice: '',
  featured: false,
  displayImages: [],
  floorPlans: [],
  ownershipFiles: [],
  keyFeatures: [], // Initialize key features
  yearBuilt: '',
  condition: '',
  discount: '',
  floorPlansData: [], // Initialize floor plans data
  sitePlansData: [], // Initialize site plans data
  documentationData: [], // Initialize documentation data
    amenities: [],
    customAmenities: [],
    need: '',
    listingType: 'Property',
    propertyType: '',
    additionalPhotos: [],
    summary: '',
    video: '',
  };

// Helper function to format validation errors
const formatValidationErrors = (errors: any[]): string => {
  return errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
};

interface PropertyModelProps {
  setShowDefault: (show: boolean) => void;
  handleClose: () => void;
  showDefault: boolean;
  editdata: Partial<PropertyListing>;
  editId: string;
  notify: any;
}

const PropertyModel: React.FC<PropertyModelProps> = ({ notify, setShowDefault, handleClose, showDefault, editdata, editId }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [amenities, setAmenities] = useState<Record<string, number>>({});

  // Utility functions to convert amenities formats
  const amenitiesArrayToObject = (arr: Array<{ name: string; distance: number }>): Record<string, number> => {
    const obj: Record<string, number> = {};
    arr.forEach((item) => {
      obj[item.name] = item.distance;
    });
    return obj;
  };

  const amenitiesObjectToArray = (obj: Record<string, number>): Array<{ name: string; distance: number }> => {
    return Object.entries(obj).map(([name, distance]) => ({ name, distance }));
  };

  const [amenityInput, setAmenityInput] = useState('');
  const [distanceInput, setDistanceInput] = useState('');
  const [localAmenityCategory, setLocalAmenityCategory] = useState<string>(''); // New state for local amenity category
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState('');
  const [planFiles, setPlanFiles] = useState<File[]>([]);
  const [ownershipFiles, setOwnershipFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listingCate, setListingCate] = useState<ListingCategory | ''>(editdata.category || '');
  const [imageUrl, setImageUrl] = useState<string>(editdata.displayImage || '');
  const [keyFeatureInput, setKeyFeatureInput] = useState(''); // New state for key feature input
  const [selectedFloor, setSelectedFloor] = useState(''); // New state for floor selection
  const [selectedSitePlanType, setSelectedSitePlanType] = useState(''); // New state for site plan type
  const [selectedDocType, setSelectedDocType] = useState(''); // New state for documentation type
  const [docFile, setDocFile] = useState<File | null>(null); // New state for documentation file

  // Initialize formData with editdata
  const parsedLocation: Location = editdata.location ? (typeof editdata.location === 'string' ? JSON.parse(editdata.location) : editdata.location) : initialFormData.location;
  const [formData, setFormData] = useState<FormData>(() => ({
    ...initialFormData,
    ...editdata,
    property_details_id: editId || '',
location: {
country: (parsedLocation.country && typeof parsedLocation.country === 'string' ? parsedLocation.country : initialFormData.location.country),
street: (parsedLocation.street && typeof parsedLocation.street === 'string' ? parsedLocation.street : ''),
city: (parsedLocation.city && typeof parsedLocation.city === 'string' ? parsedLocation.city : editdata.area && typeof editdata.area === 'string' ? editdata.area : ''),
region: (parsedLocation.region && typeof parsedLocation.region === 'string' ? parsedLocation.region : ''),
postcode: (parsedLocation.postcode && typeof parsedLocation.postcode === 'string' ? parsedLocation.postcode : ''),
digitalAddress: (parsedLocation.digitalAddress && typeof parsedLocation.digitalAddress === 'string' ? parsedLocation.digitalAddress : ''),
latitude: (parsedLocation.latitude && (typeof parsedLocation.latitude === 'number' || typeof parsedLocation.latitude === 'string') ? String(parsedLocation.latitude) : initialFormData.location.latitude),
longitude: (parsedLocation.longitude && (typeof parsedLocation.longitude === 'number' || typeof parsedLocation.longitude === 'string') ? String(parsedLocation.longitude) : initialFormData.location.longitude),
},
    displayImageFile: null,
    displayImages: editdata.displayImages || [],
    floorPlans: editdata.floorPlans || [],
    ownershipFiles: (editdata as Partial<PropertyListing> & { ownershipFiles?: any[] }).ownershipFiles || [],
    features: editdata.features ? JSON.stringify(editdata.features) : '[]',
    propertyAmenities: editdata.propertyAmenities ? (typeof editdata.propertyAmenities === 'string' ? editdata.propertyAmenities : JSON.stringify(editdata.propertyAmenities)) : '[]',
    paymentOptions: editdata.paymentOptions ? JSON.stringify(editdata.paymentOptions) : '[]',
    videoLinks: editdata.videoLinks ? (typeof editdata.videoLinks === 'string' ? JSON.parse(editdata.videoLinks) : editdata.videoLinks) : [],
    faq: editdata.faq ? (typeof editdata.faq === 'string' ? JSON.parse(editdata.faq) : editdata.faq) : [],
    propertyPrice: editdata.propertyPrice ? JSON.stringify(editdata.propertyPrice) : '[]',
    propertyTax: editdata.propertyTax ? JSON.stringify(editdata.propertyTax) : '[]',
    risks: editdata.risks ? JSON.stringify(editdata.risks) : '[]',
    tenures: editdata.tenures ? JSON.stringify(editdata.tenures) : '[]',
    registrations: editdata.registrations ? JSON.stringify(editdata.registrations) : '[]',
    salesPrice: editdata.salesPrice ? JSON.stringify(editdata.salesPrice) : '[]',
    ownership: editdata.ownership ? JSON.stringify(editdata.ownership) : '[]',
    roads: editdata.roads ? JSON.stringify(editdata.roads) : '[]',
    serviceLevel: editdata.serviceLevel ? JSON.stringify(editdata.serviceLevel) : '[]',
    Cancellation: editdata.Cancellation ? JSON.stringify(editdata.Cancellation) : '[]',
    CheckIn: editdata.CheckIn ? JSON.stringify(editdata.CheckIn) : '[]',
  keyFeatures: editdata.keyFeatures ? (typeof editdata.keyFeatures === 'string' ? JSON.parse(editdata.keyFeatures) : editdata.keyFeatures) : [], // Initialize key features
    yearBuilt: String(editdata.yearBuilt || ''),
    condition: editdata.condition || '',
    discount: String(editdata.discount || ''),
    floorPlansData: editdata.floorPlansData || [], // Initialize floor plans data
    sitePlansData: editdata.sitePlansData || [], // Initialize site plans data
    documentationData: editdata.documentationData || [], // Initialize documentation data
    amenities: editdata.amenities || [],
    customAmenities: editdata.customAmenities || [],
    need: editdata.need || '',
    listingType: editdata.listingType || 'Property',
    propertyType: editdata.propertyType || '',
    additionalPhotos: editdata.additionalPhotos || [],
    summary: editdata.summary || '',
    video: editdata.video || '',
  }));

  // Reset form data
  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
    setListingCate('');
    setImageUrl('');
    setFaqs([]);
    setAmenities({});
    setVideoLinks([]);
    setPlanFiles([]);
    setOwnershipFiles([]);
    setQuestionInput('');
    setAnswerInput('');
    setAmenityInput('');
    setDistanceInput('');
    setVideoInput('');
    setKeyFeatureInput('');
    setSelectedFloor('');
    setSelectedSitePlanType('');
    setSelectedDocType('');
    setDocFile(null);
    setLocalAmenityCategory('');
    setActiveStep(0);
  }, []);

  // Handle edit data and fetch if needed
  useEffect(() => {
      const fetchPropertyData = async () => {
        if (editId && (!editdata || Object.keys(editdata).length === 0)) {
          setIsLoading(true);
          try {
            const response = await app.get(`/listings/getById/${editId}/Property`);
            const propertyDetails = response.data.childData?.propertyDetails?.[0];
            if (propertyDetails) {
              // Parse location properly
              const parsedLocation: Partial<Location> = propertyDetails.location ? (typeof propertyDetails.location === 'string' ? (JSON.parse(propertyDetails.location) as Partial<Location>) : (propertyDetails.location as Partial<Location>)) : {};
              // Parse JSON fields properly
              const parseJsonField = (field: any, defaultValue: any) => {
                if (!field) return defaultValue;
                if (typeof field === 'string') {
                  try {
                    return JSON.parse(field);
                  } catch {
                    return defaultValue;
                  }
                }
                return field;
              };
              const category = (propertyDetails?.serviceCategory || propertyDetails?.category || initialFormData.category) as ListingCategory;
              const propertyNeed = (propertyDetails?.PropertyNeed || propertyDetails?.need || initialFormData.PropertyNeed) as PropertyNeed;
              setFormData({
                ...initialFormData,
                ...propertyDetails,
                property_details_id: editId,
                category,
                PropertyNeed: propertyNeed,
                serviceType: propertyDetails?.propertyType || initialFormData.serviceType,
                location: {
                  country: (parsedLocation.country as string) || initialFormData.location.country,
                  street: (parsedLocation.street as string) || '',
                  city: (parsedLocation.city as string) || (propertyDetails?.area as string) || '',
                  region: (parsedLocation.region as string) || '',
                  postcode: (parsedLocation.postcode as string) || '',
                  digitalAddress: (parsedLocation.digitalAddress as string) || '',
                  latitude: (parsedLocation.latitude as string) || initialFormData.location.latitude,
                  longitude: (parsedLocation.longitude as string) || initialFormData.location.longitude,
                },
                displayImageFile: null,
                displayImages: propertyDetails?.displayImages || [],
                floorPlans: propertyDetails?.floorPlans || [],
                ownershipFiles: propertyDetails?.ownershipFiles || [],
                features: JSON.stringify(parseJsonField(propertyDetails.features, [])),
                propertyAmenities: JSON.stringify(parseJsonField(propertyDetails.propertyAmenities, {})),
                paymentOptions: JSON.stringify(parseJsonField(propertyDetails.paymentOptions, [])),
                videoLinks: parseJsonField(propertyDetails.videoLinks, []),
                faq: parseJsonField(propertyDetails.faq, []),
                propertyPrice: JSON.stringify(parseJsonField(propertyDetails.propertyPrice, [])),
                propertyTax: JSON.stringify(parseJsonField(propertyDetails.propertyTax, [])),
                risks: JSON.stringify(parseJsonField(propertyDetails.risks, [])),
                tenures: JSON.stringify(parseJsonField(propertyDetails.tenures, [])),
                registrations: JSON.stringify(parseJsonField(propertyDetails.registrations, [])),
                salesPrice: JSON.stringify(parseJsonField(propertyDetails.salesPrice, [])),
                ownership: JSON.stringify(parseJsonField(propertyDetails.ownership, [])),
                roads: JSON.stringify(parseJsonField(propertyDetails.roads, [])),
                serviceLevel: JSON.stringify(parseJsonField(propertyDetails.serviceLevel, [])),
                Cancellation: JSON.stringify(parseJsonField(propertyDetails.Cancellation, [])),
                CheckIn: JSON.stringify(parseJsonField(propertyDetails.CheckIn, [])),
                keyFeatures: parseJsonField(propertyDetails.keyFeatures, []),
                yearBuilt: String(propertyDetails?.yearBuilt) || '',
                condition: propertyDetails?.condition || '',
                discount: String(propertyDetails?.discount) || '',
                floorPlansData: propertyDetails?.floorPlansData || [],
                sitePlansData: propertyDetails?.sitePlansData || [],
                documentationData: propertyDetails?.documentationData || [],
                amenities: propertyDetails?.amenities || [],
                customAmenities: propertyDetails?.customAmenities || [],
                need: propertyDetails?.need || '',
                listingType: propertyDetails?.listingType || 'Property',
                propertyType: propertyDetails?.propertyType || '',
                additionalPhotos: propertyDetails?.additionalPhotos || [],
                summary: propertyDetails?.summary || '',
                video: propertyDetails?.video || '',
              });
              setListingCate(propertyDetails?.serviceCategory || propertyDetails?.category || '');
              setImageUrl(propertyDetails?.displayImage || '');
              setFaqs(parseJsonField(propertyDetails.faq, []));
              setAmenities(parseJsonField(propertyDetails.localAmenities, {}));
              setVideoLinks(parseJsonField(propertyDetails.videoLinks, []));
              setPlanFiles(
                propertyDetails?.floorPlans?.map((url: string) => new File([], url.split('/').pop() || '')) || []
              );
              setOwnershipFiles(
                propertyDetails?.ownershipFiles?.map((url: string) => new File([], url.split('/').pop() || '')) || []
              );
            }
          } catch (error) {
            console.error('Failed to fetch property data:', error);
            notify.error('Failed to load property data for editing.');
          } finally {
            setIsLoading(false);
          }
        } else if (editdata && Object.keys(editdata).length > 0) {
          // Parse location properly
          let parsedEditLocation: Partial<Location> = {};
          if (editdata.location) {
            if (typeof editdata.location === 'string') {
              try {
                parsedEditLocation = JSON.parse(editdata.location) as Partial<Location>;
              } catch {
                parsedEditLocation = {};
              }
            } else {
              parsedEditLocation = editdata.location as Partial<Location>;
            }
          }
          // Parse JSON fields properly
          const parseJsonField = (field: any, defaultValue: any) => {
            if (!field) return defaultValue;
            if (typeof field === 'string') {
              try {
                return JSON.parse(field);
              } catch {
                return defaultValue;
              }
            }
            return field;
          };
          setFormData({
            ...initialFormData,
            ...editdata,
            property_details_id: editId,
            category: (editdata.serviceCategory || editdata.category || initialFormData.category) as ListingCategory,
            PropertyNeed: (editdata.PropertyNeed || editdata.need || initialFormData.PropertyNeed) as PropertyNeed,
            serviceType: editdata.propertyType || initialFormData.serviceType,
            location: {
              country: (editdata.country as string) || (parsedEditLocation.country as string) || initialFormData.location.country,
              street: (parsedEditLocation.street as string) || '',
              city: (editdata.area as string) || (parsedEditLocation.city as string) || '',
              region: (parsedEditLocation.region as string) || '',
              postcode: (parsedEditLocation.postcode as string) || '',
              digitalAddress: (parsedEditLocation.digitalAddress as string) || '',
              latitude: (parsedEditLocation.latitude as string) || initialFormData.location.latitude,
              longitude: (parsedEditLocation.longitude as string) || initialFormData.location.longitude,
            },
            displayImageFile: null,
            displayImages: editdata.displayImages || [],
            floorPlans: editdata.floorPlans || [],
            ownershipFiles: (editdata as Partial<PropertyListing> & { ownershipFiles?: any[] }).ownershipFiles || [],
            features: JSON.stringify(parseJsonField(editdata.features, [])),
            propertyAmenities: JSON.stringify(parseJsonField(editdata.propertyAmenities, {})),
            paymentOptions: JSON.stringify(parseJsonField(editdata.paymentOptions, [])),
            videoLinks: parseJsonField(editdata.videoLinks, []),
            faq: parseJsonField(editdata.faq, []),
            propertyPrice: JSON.stringify(parseJsonField(editdata.propertyPrice, [])),
            propertyTax: JSON.stringify(parseJsonField(editdata.propertyTax, [])),
            risks: JSON.stringify(parseJsonField(editdata.risks, [])),
            tenures: JSON.stringify(parseJsonField(editdata.tenures, [])),
            registrations: JSON.stringify(parseJsonField(editdata.registrations, [])),
            salesPrice: JSON.stringify(parseJsonField(editdata.salesPrice, [])),
            ownership: JSON.stringify(parseJsonField(editdata.ownership, [])),
            roads: JSON.stringify(parseJsonField(editdata.roads, [])),
            serviceLevel: JSON.stringify(parseJsonField(editdata.serviceLevel, [])),
            Cancellation: JSON.stringify(parseJsonField(editdata.Cancellation, [])),
            CheckIn: JSON.stringify(parseJsonField(editdata.CheckIn, [])),
            keyFeatures: parseJsonField(editdata.keyFeatures, []),
            yearBuilt: String(editdata.yearBuilt || ''),
            condition: editdata.condition || '',
            discount: String(editdata.discount || ''),
            floorPlansData: editdata.floorPlansData || [],
            sitePlansData: editdata.sitePlansData || [],
            documentationData: editdata.documentationData || [],
            amenities: editdata.amenities || [],
            customAmenities: editdata.customAmenities || [],
            need: editdata.need || '',
            listingType: editdata.listingType || 'Property',
            propertyType: editdata.propertyType || '',
            additionalPhotos: editdata.additionalPhotos || [],
            summary: editdata.summary || '',
            video: editdata.video || '',
          });
          setListingCate(editdata.category || '');
          setImageUrl(editdata.displayImage || '');
          setFaqs(parseJsonField(editdata.faq, []));
          setAmenities(parseJsonField(editdata.localAmenities, {}));
          setVideoLinks(parseJsonField(editdata.videoLinks, []));
          setPlanFiles(
            editdata.floorPlans?.map((url: string) => new File([], url.split('/').pop() || '')) || []
          );
          setOwnershipFiles(
            (editdata as Partial<PropertyListing> & { ownershipFiles?: string[] }).ownershipFiles?.map((url: string) => new File([], url.split('/').pop() || '')) || []
          );
        } else {
          resetFormData();
        }
      };
      fetchPropertyData();
    }, [editdata, editId, resetFormData, notify]);

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

  const provider = new OpenStreetMapProvider() as any;

    const defaultLatLng: [number, number] = [
      parseFloat(formData.location.latitude),
      parseFloat(formData.location.longitude),
    ];
    mapRef.current = L.map(mapContainerRef.current).setView(defaultLatLng, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    const searchControl = GeoSearchControl({
      provider,
      showMarker: false,
      autoClose: true,
      style: 'bar',
      searchLabel: 'Enter address in Ghana...',
    });
    mapRef.current.addControl(searchControl);

    const customIcon = L.icon({
      iconUrl: 'https://amarinwb.com/wp-content/uploads/2024/06/Amari-Location-red.png',
      iconSize: [40, 40],
    });

    markerRef.current = L.marker(defaultLatLng, { icon: customIcon })
      .addTo(mapRef.current)
      .bindPopup('Property Location');

    const geocodeLocation = async () => {
      if (formData.location.city || formData.country) {
        try {
          let query = '';
          const city = formData.location.city?.trim();
          const country = formData.country?.trim();

          if (city && country) {
            // If city is a short code or partial, try to build a better query
            if (city.length <= 3) {
              query = `${city}, ${country}`;
            } else {
              query = `${city}, ${country}`;
            }
          } else if (city) {
            query = city;
          } else if (country) {
            query = country;
          }

          const results = await provider.search({ query });

          if (results.length > 0) {
            const { x: lng, y: lat } = results[0];
            const newLatLng: [number, number] = [lat, lng];
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                latitude: lat.toString(),
                longitude: lng.toString(),
              },
            }));
            mapRef.current?.setView(newLatLng, country ? 6 : 15);
            if (markerRef.current) {
              markerRef.current.setLatLng(newLatLng);
            }
          } else {
            notify.error(`Could not find location for ${query}`);
            console.warn(`Could not find location for ${query}`);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          notify.error('Failed to geocode the location.');
        }
      }
    };

    geocodeLocation();

    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, latitude: lat.toString(), longitude: lng.toString() },
      }));
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [formData.location.city, formData.country, notify]);

  // Listing options and configurations
  const getPropertyTypes = (category: ListingCategory): string[] => {
    return PROPERTY_TYPES[category as keyof typeof PROPERTY_TYPES] || [];
  };

  const getSpecificAmenities = (category: ListingCategory) => {
    return CATEGORY_AMENITIES[category as keyof typeof CATEGORY_AMENITIES] || [];
  };
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

  const needOptions = getNeedOptions(formData.category as ListingCategory);
  const propertyTypes = getPropertyTypes(formData.category as ListingCategory);

  const listingOptions = {
    Property: ['Residential', 'Commercial', 'The Fjord'], //'Investment', 'The Fjord', 'Land'],
  };

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

  const fjord = ['24/7 security', 'CCTV', 'Watch Man', 'Beach front plot', 'Mountain view', 'Beach view'];

  const residentialSpecificAmenities = [
    'Balcony',
    'Central Air Conditioning',
    'Fireplace',
    'Walk-in Closet',
    'Home Office',
    'Private Garden',
  ];

  const commercialSpecificAmenities = [
    'Elevator',
    'Conference Room',
    'Security System',
    'High-Speed Internet',
    'Loading Dock',
    'On-Site Parking',
  ];

  const paymentOptionsResidentialBuy = [
    'Cash Payment',
    ...Array.from({ length: 25 }, (_, i) => `Cedis Mortgage Financing (${String(i + 1).padStart(2, '0')} years)`),
    ...Array.from({ length: 15 }, (_, i) => `Dollar Mortgage Financing (${String(i + 1).padStart(2, '0')} years)`),
    'Bank Financing (loan)',
    ...Array.from({ length: 55 }, (_, i) => `Installment Payment (${String(i + 6).padStart(2, '0')} months)`),
  ];

  const paymentOptionsCommercialBuy = [
    'Cash Payment',
    ...Array.from({ length: 25 }, (_, i) => `Cedis Mortgage Financing (${String(i + 1).padStart(2, '0')} years)`),
    ...Array.from({ length: 15 }, (_, i) => `Dollar Mortgage Financing (${String(i + 1).padStart(2, '0')} years)`),
    'Bank Financing (loan)',
    ...Array.from({ length: 55 }, (_, i) => `Installment Payment (${String(i + 6).padStart(2, '0')} months)`),
  ];

  const paymentOptionsRent = ['Monthly Payment', '3 Monthly Payment', '6 Monthly Payment'];

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

  const conditionOptions = [
    'Turnkey',
    'Retired',
    'Development Project',
    'Refurb Needed',
    'Uncompleted',
    'New Build',
  ];

  const paymentOptionsLand = ['Cash Outright', '6 Months Payment Plan', '12 Months Payment Plan'];
  const paymentOptionsProperty = ['Cash Outright', '6 Months Payment Plan', '12 Months Payment Plan', 'Republic Bank Mortgage'];
  const paymentOptionsFjord = ['Cash Payment', 'Momo Payment', 'OneOff Payment'];
  const floorOptions = [
    'Lower Ground',
    'Ground Floor',
    ...Array.from({ length: 100 }, (_, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Floor`),
  ];

  const sitePlanTypes = ['Normal Site Plan', 'Cadastral Plan'];

  const documentationTypes = [
    'Property Survey',
    'Safety Report',
    'Valuation Report',
    'Energy Report',
    'Title Deed',
    'Proof of Ownership',
  ];

  // Form Handlers
  const handleInputChange = useCallback(
    (field: keyof FormData, value: any, isChecked: boolean | null = null) => {
      setFormData((prev) => {
        if (field === 'location') {
          return { ...prev, location: { ...prev.location, ...value } };
        }
        if (field === 'featured') {
          return { ...prev, featured: Boolean(isChecked) };
        }
        if (
          [
            'features',
            'propertyAmenities',
            'paymentOptions',
            'propertyPrice',
            'propertyTax',
            'risks',
            'tenures',
            'registrations',
            'salesPrice',
            'ownership',
            'roads',
            'serviceLevel',
            'Cancellation',
            'CheckIn',
          ].includes(field)
        ) {
          const currentArray = typeof prev[field] === 'string' ? JSON.parse(prev[field] || '[]') : prev[field];
          const updatedArray = isChecked ? [...currentArray, value] : currentArray.filter((item: any) => item !== value);
          return { ...prev, [field]: JSON.stringify(updatedArray) };
        }
        return { ...prev, [field]: value };
      });
    },
    []
  );

  const handleImageChange = useCallback((imageFile: File | null) => {
    setFormData((prev) => ({
      ...prev,
      displayImage: imageFile ? URL.createObjectURL(imageFile) : '',
      displayImageFile: imageFile,
    }));
    setImageUrl(imageFile ? URL.createObjectURL(imageFile) : '');
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
      const newFiles = Array.from(e.target.files || []);
      const uniqueFiles = newFiles.filter((file) => !planFiles.some((f) => f.name === file.name));
      if (uniqueFiles.length > 0) {
        setFiles((prev) => [...prev, ...uniqueFiles]);
      } else {
        notify.error('Duplicate files detected.');
      }
    },
    [notify, planFiles]
  );

  const handleRemoveFile = useCallback(
    (fileName: string, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
      setFiles((prev) => prev.filter((file) => file.name !== fileName));
    },
    []
  );

  const handleAddKeyFeature = useCallback(() => {
    if (keyFeatureInput && !formData.keyFeatures.includes(keyFeatureInput)) {
      setFormData((prev) => ({
        ...prev,
        keyFeatures: [...prev.keyFeatures, keyFeatureInput],
      }));
      setKeyFeatureInput('');
    } else {
      notify.error('Please enter a valid, unique key feature.');
    }
  }, [keyFeatureInput, formData.keyFeatures, notify]);

  const handleRemoveKeyFeature = useCallback(
    (feature: string) => {
      setFormData((prev) => ({
        ...prev,
        keyFeatures: prev.keyFeatures.filter((f) => f !== feature),
      }));
    },
    []
  );

  const handleAddFloorPlan = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedFloor && !formData.floorPlansData.some((item) => item.floor === selectedFloor)) {
        setFormData((prev) => ({
          ...prev,
          floorPlansData: [...prev.floorPlansData, { floor: selectedFloor, file }],
        }));
        setSelectedFloor('');
        e.target.value = '';
      } else {
        notify.error('Please select a floor and upload a unique file.');
      }
    },
    [selectedFloor, formData.floorPlansData, notify]
  );

  const handleRemoveFloorPlan = useCallback(
    (floor: string) => {
      setFormData((prev) => ({
        ...prev,
        floorPlansData: prev.floorPlansData.filter((item) => item.floor !== floor),
      }));
    },
    []
  );

  const handleAddSitePlan = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedSitePlanType && !formData.sitePlansData.some((item) => item.type === selectedSitePlanType)) {
        setFormData((prev) => ({
          ...prev,
          sitePlansData: [...prev.sitePlansData, { type: selectedSitePlanType, file }],
        }));
        setSelectedSitePlanType('');
        e.target.value = '';
      } else {
        notify.error('Please select a site plan type and upload a unique file.');
      }
    },
    [selectedSitePlanType, formData.sitePlansData, notify]
  );

  const handleRemoveSitePlan = useCallback(
    (type: string) => {
      setFormData((prev) => ({
        ...prev,
        sitePlansData: prev.sitePlansData.filter((item) => item.type !== type),
      }));
    },
    []
  );

  const handleAddDocumentation = useCallback(() => {
    if (selectedDocType && docFile && !formData.documentationData.some((item) => item.type === selectedDocType)) {
      setFormData((prev) => ({
        ...prev,
        documentationData: [...prev.documentationData, { type: selectedDocType, file: docFile }],
      }));
      setSelectedDocType('');
      setDocFile(null);
    } else {
      notify.error('Please select a documentation type and upload a valid file.');
    }
  }, [selectedDocType, docFile, formData.documentationData, notify]);

  const handleRemoveDocumentation = useCallback(
    (type: string) => {
      setFormData((prev) => ({
        ...prev,
        documentationData: prev.documentationData.filter((item) => item.type !== type),
      }));
    },
    []
  );

  const handleAddAmenity = useCallback(() => {
    if (amenityInput && distanceInput && !isNaN(Number(distanceInput)) && localAmenityCategory) {
      const newAmenity = { [`${localAmenityCategory}:${amenityInput}`]: Number(distanceInput) };
      setAmenities((prev) => ({ ...prev, ...newAmenity }));
      setFormData((prev) => ({
        ...prev,
        localAmenities: JSON.stringify({ ...amenities, ...newAmenity }),
      }));
      setAmenityInput('');
      setDistanceInput('');
      setLocalAmenityCategory('');
    } else {
      notify.error('Please select a category, enter a valid amenity name, and distance.');
    }
  }, [amenityInput, distanceInput, localAmenityCategory, amenities, notify]);

  const handleRemoveAmenity = useCallback(
    (amenityName: string) => {
      const updatedAmenities = { ...amenities };
      delete updatedAmenities[amenityName];
      setAmenities(updatedAmenities);
      setFormData((prev) => ({
        ...prev,
        localAmenities: JSON.stringify(updatedAmenities),
      }));
    },
    [amenities]
  );

  const handleAddVideo = useCallback(() => {
    const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtube\.com|m\.youtube\.com)\/(watch\?v=|v\/|e\/|u\/\w\/|embed\/)([a-zA-Z0-9_-]{11})$/;
    if (videoInput && youtubeRegex.test(videoInput) && !videoLinks.includes(videoInput)) {
      const newLinks = [...videoLinks, videoInput];
      setVideoLinks(newLinks);
      setFormData((prev) => ({
        ...prev,
        videoLinks: newLinks,
      }));
      setVideoInput('');
    } else {
      notify.error('Please enter a valid, unique YouTube video URL.');
    }
  }, [videoInput, videoLinks, notify]);

  const handleRemoveVideo = useCallback(
    (url: string) => {
      const updatedVideos = videoLinks.filter((link) => link !== url);
      setVideoLinks(updatedVideos);
      setFormData((prev) => ({
        ...prev,
        videoLinks: updatedVideos,
      }));
    },
    [videoLinks]
  );

  const handleAddFAQ = useCallback(() => {
    if (questionInput && answerInput && !faqs.some((faq) => faq.question === questionInput)) {
      const newFaq = { question: questionInput, answer: answerInput };
      const newFaqs = [...faqs, newFaq];
      setFaqs(newFaqs);
      setFormData((prev) => ({
        ...prev,
        faq: newFaqs,
      }));
      setQuestionInput('');
      setAnswerInput('');
    } else {
      notify.error('Please enter a valid, unique question and answer.');
    }
  }, [questionInput, answerInput, faqs, notify]);

  const handleRemoveFAQ = useCallback(
    (question: string) => {
      const updatedFaqs = faqs.filter((faq) => faq.question !== question);
      setFaqs(updatedFaqs);
      setFormData((prev) => ({
        ...prev,
        faq: updatedFaqs,
      }));
    },
    [faqs]
  );

  const handleSubmit = useCallback(
    async (values: FormData, { setSubmitting }: FormikHelpers<FormData>) => {
      console.log('handleSubmit called with values:', values);
      setIsSubmitting(true);

      if (!values.title || !values.category || !values.PropertyNeed || !values.location.city || !values.price) {
        console.log('Submission failed due to missing required fields:', {
          title: values.title,
          category: values.category,
          PropertyNeed: values.PropertyNeed,
          city: values.location.city,
          price: values.price
        });
        notify.error('Please fill in all required fields (Title, Category, Need, City, Price).');
        setIsSubmitting(false);
        setSubmitting(false);
        return;
      }

      const requestBody = new FormData();
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${BASE_URL}/listings/edit-listing` : `${BASE_URL}/listings/listing`;

      if (editId) requestBody.append('listingId', editId);
      requestBody.append('listingType', 'Property');
      requestBody.append('title', values.title);
      requestBody.append('subtitle', values.subtitle);
      requestBody.append('serviceCategory', values.category);
      requestBody.append('serviceLocation', values.location.city);
      requestBody.append('serviceSummary', values.serviceSummary);
      requestBody.append('price', String(values.price));
      requestBody.append('serviceDetails', values.serviceDetails);
      requestBody.append('status', values.status);
      requestBody.append('PropertyNeed', values.PropertyNeed);
      requestBody.append('generalInfo', values.generalInfo);
      requestBody.append('localAmenities', values.localAmenities);
      requestBody.append('propertyAmenities', values.propertyAmenities);
      requestBody.append('size', String(values.size));
      requestBody.append('unit', String(values.unit));
      requestBody.append('parking', String(values.parking));
      requestBody.append('bedRoom', String(values.bedRoom));
      requestBody.append('bathRoom', String(values.bathRoom));
      requestBody.append('area', values.area);
      requestBody.append('paymentOptions', values.paymentOptions);
      requestBody.append('features', values.features);
      requestBody.append('currency', values.currency);
      requestBody.append('country', values.country);
      requestBody.append('location', JSON.stringify(values.location));
      requestBody.append('videoLinks', JSON.stringify(values.videoLinks));
      requestBody.append('faq', JSON.stringify(values.faq));
      requestBody.append('category', values.category);
      requestBody.append('propertyUsage', values.propertyUsage);
      requestBody.append('total', values.total);
      requestBody.append('occupancy', values.occupancy);
      requestBody.append('propertyPrice', values.propertyPrice);
      requestBody.append('propertyTax', values.propertyTax);
      requestBody.append('risks', values.risks);
      requestBody.append('tenures', values.tenures);
      requestBody.append('registrations', values.registrations);
      requestBody.append('salesPrice', values.salesPrice);
      requestBody.append('ownership', values.ownership);
      requestBody.append('roads', values.roads);
      requestBody.append('serviceLevel', values.serviceLevel);
      requestBody.append('Cancellation', values.Cancellation);
      requestBody.append('CheckIn', values.CheckIn);
      requestBody.append('commissionOffice', values.commissionOffice);
      requestBody.append('featured', String(values.featured));
      requestBody.append('keyFeatures', JSON.stringify(values.keyFeatures));
      requestBody.append('year_built', String(values.yearBuilt));
      requestBody.append('condition', values.condition);
      requestBody.append('discount', String(values.discount));
      requestBody.append('floorPlansData', JSON.stringify(values.floorPlansData.map((item) => ({ floor: item.floor, file: item.file.name }))));
      requestBody.append('sitePlansData', JSON.stringify(values.sitePlansData.map((item) => ({ type: item.type, file: item.file.name }))));
      requestBody.append('documentationData', JSON.stringify(values.documentationData.map((item) => ({ type: item.type, file: item.file.name }))));

      if (values.displayImageFile instanceof File) {
        requestBody.append('frontMedia', values.displayImageFile);
      }
      if (values.displayImages.length > 0) {
        values.displayImages.forEach((image) => {
          if (image instanceof File) {
            requestBody.append('media', image);
          }
        });
      }
      if (values.floorPlansData.length > 0) {
        values.floorPlansData.forEach((item) => {
          if (item.file instanceof File) {
            requestBody.append('floorPlans', item.file);
          }
        });
      }
      if (values.sitePlansData.length > 0) {
        values.sitePlansData.forEach((item) => {
          if (item.file instanceof File) {
            requestBody.append('sitePlans', item.file);
          }
        });
      }
      if (values.documentationData.length > 0) {
        values.documentationData.forEach((item) => {
          if (item.file instanceof File) {
            requestBody.append('documentation', item.file);
          }
        });
      }
      if (planFiles.length > 0) {
        planFiles.forEach((file) => {
          if (file instanceof File) {
            requestBody.append('floorPlans', file);
          }
        });
      }
      if (ownershipFiles.length > 0) {
        ownershipFiles.forEach((file) => {
          if (file instanceof File) {
            requestBody.append('ownership', file);
          }
        });
      }

      const formDataEntries: Record<string, any> = {};
      for (const [key, value] of requestBody.entries()) {
        formDataEntries[key] = value;
      }
      console.log('FormData Payload:', formDataEntries);

      try {
        const response = await app({
          method,
          url,
          data: requestBody,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 201 || response.status === 200) {
          notify.success(`Property listing ${editId ? 'updated' : 'posted'} successfully`);
          resetFormData();
          setShowDefault(false);
          handleClose();
        } else {
          console.error('Unexpected response status:', response.status);
          notify.error(response.data?.message || 'Unexpected response from server');
        }
      } catch (error: any) {
        console.error('Submission Error:', error);
        let errorMessage = `An error occurred while ${editId ? 'updating' : 'posting'} the property listing.`;
        let errorDescription = '';

        if (error.response) {
          const { status, data } = error.response;
          if (status === 400 && data.errors) {
            errorMessage = 'Validation Error';
            errorDescription = formatValidationErrors(data.errors);
          } else if (status === 400) {
            errorMessage = data.message || 'Bad Request';
            errorDescription = data.error || 'Invalid request parameters.';
          } else if (status === 500) {
            errorMessage = 'Server Error';
            errorDescription = data.error || 'An unexpected server error occurred.';
          } else {
            errorDescription = data.message || 'An error occurred.';
          }
        } else if (error.request) {
          errorMessage = 'Network Error';
          errorDescription = 'No response received from the server. Please check your network connection.';
        } else {
          errorDescription = error.message || 'An unexpected error occurred.';
        }

        notify.error(errorDescription);
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
    [
      editId,
      notify,
      resetFormData,
      handleClose,
      planFiles,
      ownershipFiles,
      setShowDefault,
    ]
  );

  // Stepper Steps
  const steps = ['Type', 'Overview', 'Details', 'Amenities', 'FAQs', 'Preview'];

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {isLoading ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div>Loading property data...</div>
        </div>
      ) : (
        (showDefault || editId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle className="text-xl">
                    Create Property Listing: {listingCate || ''} - {formData.PropertyNeed || ''}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {steps.map((label, index) => (
                      <Badge
                        key={label}
                        variant={index === activeStep ? 'default' : index < activeStep ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {index + 1}. {label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetFormData();
                    setShowDefault(false);
                    handleClose();
                  }}
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <Formik initialValues={formData} enableReinitialize={true} onSubmit={handleSubmit}>
                  {({ values, setFieldValue, submitForm, errors, touched }) => (
                    <FormikForm>
                      {activeStep === 0 && (
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
                                  value={listingCate}
                                  onValueChange={(value: ListingCategory) => {
                                    setListingCate(value);
                                    setFormData((prev) => ({ ...prev, category: value, subcategory: value }));
                                  }}
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {listingOptions.Property.map((subType) => (
                                      <SelectItem key={subType} value={subType}>
                                        {subType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                              </CardContent>
                            </Card>
                            <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
                              <CardContent className="p-4 lg:p-6">
                                <Label className="text-base font-semibold text-foreground">Need</Label>
                                <Select
                                  value={formData.PropertyNeed}
                                  onValueChange={(value) => setFormData((prev) => ({ ...prev, PropertyNeed: value as PropertyNeed }))}
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select need" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {needOptions.map((subType) => (
                                      <SelectItem key={subType} value={subType}>
                                        {subType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <ErrorMessage name="PropertyNeed" component="div" className="text-red-500 text-sm mt-1" />
                              </CardContent>
                            </Card>
                            <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-fade-in">
                              <CardContent className="p-4 lg:p-6">
                                <Label className="text-base font-semibold text-foreground">Property Type</Label>
                                <Select
                                  value={formData.serviceType}
                                  onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select property type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {propertyTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </CardContent>
                            </Card>
                            <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-fade-in">
                              <CardContent className="p-4 lg:p-6">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="featured"
                                    checked={formData.featured}
                                    onCheckedChange={(checked) => handleInputChange('featured', checked, Boolean(checked))}
                                    aria-label="Toggle featured listing"
                                  />
                                  <Label htmlFor="featured" className="text-base font-semibold cursor-pointer">
                                    Featured Listing
                                  </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Featured listings get priority placement and increased visibility
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}

                      {activeStep === 1 && (
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
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter property title"
                                    className="mt-1"
                                    aria-required="true"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="subtitle">Subtitle</Label>
                                  <Input
                                    id="subtitle"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
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
                                    onValueChange={(value: Currency) => setFormData((prev) => ({ ...prev, currency: value }))}
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
                                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                                    placeholder="Enter price"
                                    className="mt-1"
                                    aria-required="true"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="property-card hover:shadow-md transition-all duration-300 animate-scale-in">
                              <CardContent className="p-4 lg:p-6">
                                <Label>Front Image (Display Image)</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <div className="mt-2">
                                    <Input
                                      type="file"
                                      accept=".jpg,.jpeg,.png"
                                      onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                                      className="mt-2"
                                      aria-label="Upload front image"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">Drag and drop, upload from file, or paste image URL</p>
                                </div>
                                {imageUrl && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <div
                                      className="relative h-48 w-full bg-cover bg-center rounded-md"
                                      style={{ backgroundImage: `url(${imageUrl})` }}
                                    >
                                      <button
                                        onClick={() => handleImageChange(null)}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500"
                                        aria-label="Remove front image"
                                      >
                                        <CloseIcon fontSize="small" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            <Card className="md:col-span-2 property-card hover:shadow-md transition-all duration-300 animate-scale-in">
                              <CardContent className="p-4 lg:p-6">
                                <Label className="text-base font-semibold mb-4 block">Property Specifications</Label>
                                {listingCate === 'Land' ? (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <Label htmlFor="size">Plot Size *</Label>
                                      <Input
                                        id="size"
                                        type="number"
                                        min="0"
                                        value={formData.size}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, size: Number(e.target.value) }))}
                                        placeholder="Size"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="plot-total">Total Number of Plots *</Label>
                                      <Input
                                        id="plot-total"
                                        type="number"
                                        min="0"
                                        value={formData.total}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, total: e.target.value }))}
                                        placeholder="Enter total plots"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Use of the Plots</Label>
                                      <Select
                                        value={formData.propertyUsage}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyUsage: value }))}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={undefined} disabled={true}>
                                            Select Plot Usage
                                          </SelectItem>
                                          {['Mixed Use', 'Residential', 'Commercial', 'Industrial', 'Farming'].map((usage) => (
                                            <SelectItem key={usage} value={usage}>
                                              {usage}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Unit</Label>
                                      <Select
                                        value={formData.unit}
                                        onValueChange={(value: SizeUnit) => setFormData((prev) => ({ ...prev, unit: value }))}
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
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <Label htmlFor="size">Size (m²)*</Label>
                                      <Input
                                        id="size"
                                        type="number"
                                        min="0"
                                        value={formData.size}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, size: Number(e.target.value) }))}
                                        placeholder="Size"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Unit</Label>
                                      <Select
                                        value={formData.unit}
                                        onValueChange={(value: SizeUnit) => setFormData((prev) => ({ ...prev, unit: value }))}
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
                                        onChange={(e) => setFormData((prev) => ({ ...prev, bedRoom: Number(e.target.value) }))}
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
                                        onChange={(e) => setFormData((prev) => ({ ...prev, bathRoom: Number(e.target.value) }))}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="">
                                      <Label htmlFor="parking">Number of Parking Spaces</Label>
                                      <Input
                                        id="parking"
                                        type="number"
                                        min="0"
                                        value={formData.parking}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, parking: Number(e.target.value) }))}
                                        placeholder="Number of parking spaces"
                                        className="mt-1 max-w-xs"
                                      />
                                    </div>
                                  </div>
                                )}
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
                                      value={formData.country}
                                      onValueChange={(value: Country) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          country: value,
                                          location: { ...prev.location, country: value },
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Ghana (GH)">Ghana (GH)</SelectItem>
                                        <SelectItem value="South Africa (SA)">South Africa (SA)</SelectItem>
                                        <SelectItem value="United Arab Emirates (UAE)">United Arab Emirates (UAE)</SelectItem>
                                        <SelectItem value="Nigeria (NG)">Nigeria (NG)</SelectItem>
                                        <SelectItem value="Kenya (KN)">Kenya (KN)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                      id="street"
                                      value={formData.location.street}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          location: { ...prev.location, street: e.target.value },
                                        }))
                                      }
                                      placeholder="Street address"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                      id="city"
                                      value={formData.location.city}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          location: { ...prev.location, city: e.target.value },
                                          area: e.target.value,
                                        }))
                                      }
                                      placeholder="City"
                                      className="mt-1"
                                      aria-required="true"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="region">Region/County</Label>
                                    <Input
                                      id="region"
                                      value={formData.location.region}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          location: { ...prev.location, region: e.target.value },
                                        }))
                                      }
                                      placeholder="Region/County"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="postcode">Postcode</Label>
                                    <Input
                                      id="postcode"
                                      value={formData.location.postcode}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          location: { ...prev.location, postcode: e.target.value },
                                        }))
                                      }
                                      placeholder="Postcode"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="digitalAddress">Digital Address</Label>
                                    <Input
                                      id="digitalAddress"
                                      value={formData.location.digitalAddress}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          location: { ...prev.location, digitalAddress: e.target.value },
                                        }))
                                      }
                                      placeholder="Digital address"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <div className="w-full">
                              <Label className="block text-sm font-medium text-gray-700">Select Location</Label>
                              <div ref={mapContainerRef} className="h-64 w-full rounded-md" style={{ minHeight: '200px', width: '100%' }} />
                              <p className="mt-2 text-sm text-gray-500">
                                Location: Lat {formData.location.latitude}, Lng {formData.location.longitude}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 2 && (
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
                                  value={formData.serviceSummary}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, serviceSummary: e.target.value }))}
                                  placeholder="Brief summary of the formData..."
                                  className="mt-1 min-h-[100px]"
                                />
                              </div>
                              <div>
                                <Label htmlFor="keyFeatures">Key Features</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id="keyFeatures"
                                    value={keyFeatureInput}
                                    onChange={(e) => setKeyFeatureInput(e.target.value)}
                                    placeholder="Enter a key feature"
                                    className="mt-1"
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleAddKeyFeature}
                                    className="mt-1 bg-blue-600 hover:bg-blue-700"
                                    aria-label="Add key feature"
                                  >
                                    Add
                                  </Button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {formData.keyFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-center p-2 border rounded-md">
                                      <span>{feature}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveKeyFeature(feature)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        aria-label={`Remove ${feature}`}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="yearBuilt">Year Built</Label>
                                <Input
                                  id="yearBuilt"
                                  type="number"
                                  min="1800"
                                  max={new Date().getFullYear()}
                                  value={String(formData.yearBuilt)}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, yearBuilt: e.target.value }))}
                                  placeholder="Enter year built"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="condition">Condition of Property</Label>
                                <Select
                                  value={formData.condition}
                                  onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {conditionOptions.map((condition) => (
                                      <SelectItem key={condition} value={condition}>
                                        {condition}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="discount">Discount (%)</Label>
                                <Select
                                  value={String(formData.discount || '')}
                                  onValueChange={(value) => setFormData((prev) => ({ ...prev, discount: value }))}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select discount" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}%
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="generalInfo">General Information</Label>
                                <Textarea
                                  id="generalInfo"
                                  value={formData.generalInfo}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, generalInfo: e.target.value }))}
                                  placeholder="Detailed information about the formData..."
                                  className="mt-1 min-h-[120px]"
                                  spellCheck="true"
                                />
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <Label className="text-base font-semibold">Floor & Site Plans</Label>
                              </div>
                              <Tabs defaultValue="floor" className="w-full">
                                <TabsList>
                                  <TabsTrigger value="floor">Floor Plans</TabsTrigger>
                                  <TabsTrigger value="site">Site Plans</TabsTrigger>
                                </TabsList>
                                <TabsContent value="floor">
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="floorSelect">Select Floor</Label>
                                      <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                                        <SelectTrigger className="mt-1">
                                          <SelectValue placeholder="Select floor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {floorOptions.map((floor) => (
                                            <SelectItem key={floor} value={floor}>
                                              {floor}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleAddFloorPlan}
                                        className="mt-1"
                                        aria-label="Upload floor plan"
                                      />
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {formData.floorPlansData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                          <div className="flex items-center">
                                            {item.file.name.includes('.pdf') ? (
                                              <PictureAsPdf className="text-red-500 mr-2" />
                                            ) : (
                                              <Image className="text-blue-500 mr-2" />
                                            )}
                                            <span className="truncate max-w-xs">{item.floor}: {item.file.name}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveFloorPlan(item.floor)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label={`Remove ${item.floor} plan`}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="site">
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="sitePlanType">Select Site Plan Type</Label>
                                      <Select value={selectedSitePlanType} onValueChange={setSelectedSitePlanType}>
                                        <SelectTrigger className="mt-1">
                                          <SelectValue placeholder="Select site plan type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {sitePlanTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleAddSitePlan}
                                        className="mt-1"
                                        aria-label="Upload site plan"
                                      />
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {formData.sitePlansData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                          <div className="flex items-center">
                                            {item.file.name.includes('.pdf') ? (
                                              <PictureAsPdf className="text-red-500 mr-2" />
                                            ) : (
                                              <Image className="text-blue-500 mr-2" />
                                            )}
                                            <span className="truncate max-w-xs">{item.type}: {item.file.name}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveSitePlan(item.type)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label={`Remove ${item.type} plan`}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                      
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <Label className="text-base font-semibold mb-4 block">Documentation</Label>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="docType">Select Documentation Type</Label>
                                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select documentation type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {documentationTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleAddDocumentation}
                                    className="mt-1"
                                    aria-label="Upload documentation"
                                  />
                                </div>
                                <div className="mt-3 space-y-2">
                                  {formData.documentationData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                      <div className="flex items-center">
                                        <PictureAsPdf className="text-red-500 mr-2" />
                                        <span className="truncate max-w-xs">{item.type}: {item.file.name}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDocumentation(item.type)}
                                        className="text-red-500 hover:text-red-700"
                                        aria-label={`Remove ${item.type} document`}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <Label className="text-base font-semibold mb-4 block">Additional Photos</Label>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <div className="mt-2">
                                  <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    multiple
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        displayImages: [...prev.displayImages, ...Array.from(e.target.files || [])],
                                      }))
                                    }
                                    className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                                    aria-label="Upload additional photos"
                                  />
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.displayImages.map((image, index) => (
                                      <div
                                        key={index}
                                        className="relative h-16 w-24 bg-cover bg-center rounded-md"
                                        style={{
                                          backgroundImage: `url(${image instanceof File ? URL.createObjectURL(image) : `${BASE_URL}${image}`})`,
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            setFormData((prev) => ({
                                              ...prev,
                                              displayImages: prev.displayImages.filter((_, i) => i !== index),
                                            }))
                                          }
                                          className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500"
                                          aria-label="Remove photo"
                                        >
                                          <CloseIcon fontSize="small" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
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
                                  placeholder="Video URL (YouTube)"
                                  value={videoInput}
                                  onChange={(e) => setVideoInput(e.target.value)}
                                  className="mt-2"
                                  aria-label="Enter YouTube video URL"
                                />
                                <p className="text-xs text-gray-500 mt-2">Paste a valid YouTube URL</p>
                                <button
                                  type="button"
                                  onClick={handleAddVideo}
                                  className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                  aria-label="Add video URL"
                                >
                                  Add
                                </button>
                              </div>
                              <div className="mt-3 space-y-2">
                                {(Array.isArray(videoLinks) ? videoLinks : []).map((link, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                    <span className="truncate max-w-xs">{link}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVideo(link)}
                                      className="text-red-500 hover:text-red-700"
                                      aria-label="Remove video URL"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <>
                          {(() => {
                            const listingData = {
                              ...formData,
                              location: JSON.stringify(formData.location),
                              keyFeatures: JSON.stringify(formData.keyFeatures),
                              videoLinks: JSON.stringify(formData.videoLinks),
                              faq: JSON.stringify(formData.faq),
                              propertyAmenities: formData.propertyAmenities,
                              paymentOptions: formData.paymentOptions,
                              localAmenities: formData.localAmenities,
                            };

                            const handleSetListingData = (updated: Partial<PropertyListing> & { propertyAmenities: string | string[]; paymentOptions: string | string[]; localAmenities: string | object; }) => {
                              setFormData((prev) => {
                                const processed = { ...updated };
                                if (updated.paymentOptions) {
                                  let paymentOptionsArray: string[] = [];
                                  if (Array.isArray(updated.paymentOptions)) {
                                    paymentOptionsArray = updated.paymentOptions;
                                  } else if (typeof updated.paymentOptions === 'string') {
                                    try {
                                      paymentOptionsArray = JSON.parse(updated.paymentOptions);
                                    } catch {
                                      paymentOptionsArray = [];
                                    }
                                  }
                                  processed.paymentOptions = JSON.stringify(paymentOptionsArray);
                                }
                                if (updated.propertyAmenities) {
                                  processed.propertyAmenities = typeof updated.propertyAmenities === 'string' ? updated.propertyAmenities : JSON.stringify(updated.propertyAmenities);
                                }
                                if (updated.localAmenities) {
                                  processed.localAmenities = typeof updated.localAmenities === 'string' ? updated.localAmenities : JSON.stringify(updated.localAmenities);
                                }
                                return {
                                  ...prev,
                                  ...processed,
                                  yearBuilt: processed.yearBuilt ? String(processed.yearBuilt) : prev.yearBuilt,
                                  discount: processed.discount ? String(processed.discount) : prev.discount,
                                  location: typeof processed.location === 'string' ? JSON.parse(processed.location) : prev.location,
                                  keyFeatures: typeof processed.keyFeatures === 'string' ? JSON.parse(processed.keyFeatures) : prev.keyFeatures,
                                  videoLinks: typeof processed.videoLinks === 'string' ? JSON.parse(processed.videoLinks) : prev.videoLinks,
                                  faq: typeof processed.faq === 'string' ? JSON.parse(processed.faq) : prev.faq,
                                };
                              });
                            };

                            return (
                      <AmenitiesStep
                        formData={{ ...listingData, paymentOptions: Array.isArray(listingData.paymentOptions) ? listingData.paymentOptions : JSON.parse(listingData.paymentOptions || '[]') } as any}
                        setFormData={(updated: any) => {
                          if (updated.paymentOptions && !Array.isArray(updated.paymentOptions)) {
                            updated.paymentOptions = JSON.parse(updated.paymentOptions);
                          }
                          handleSetListingData(updated);
                        }}
                        listingCate={listingCate}
                        notify={notify}
    amenities={amenities}
                      />
                            );
                          })()}
                        </>
                      )}

                      {activeStep === 4 && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="text-center animate-slide-up">
                            <h2 className="text-2xl font-bold mb-2 text-foreground">FAQs</h2>
                            <p className="text-muted-foreground">Add frequently asked questions for the property</p>
                          </div>
                          <div>
                            <Label className="block text-sm font-medium text-gray-700">Question</Label>
                            <input
                              type="text"
                              value={questionInput}
                              onChange={(e) => setQuestionInput(e.target.value)}
                              className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                              placeholder="Enter FAQ question"
                              aria-label="Enter FAQ question"
                            />
                          </div>
                          <div>
                            <Label className="block text-sm font-medium text-gray-700">Answer</Label>
                            <textarea
                              value={answerInput}
                              onChange={(e) => setAnswerInput(e.target.value)}
                              className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                              rows={4}
                              placeholder="Enter FAQ answer"
                              aria-label="Enter FAQ answer"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddFAQ}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            aria-label="Add FAQ"
                          >
                            Add FAQ
                          </button>
                          <div className="mt-3 space-y-2">
                            {(Array.isArray(faqs) ? faqs : []).map((faq, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                  <p className="font-semibold">{faq.question}</p>
                                  <p className="text-sm text-gray-600">{faq.answer}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFAQ(faq.question)}
                                  className="text-red-500 hover:text-red-700"
                                  aria-label={`Remove FAQ: ${faq.question}`}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeStep === -1 && (
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                          <div className="flex items-center gap-2">
                            <span className="bg-black text-white px-3 py-1 rounded-full text-sm">{formData.PropertyNeed}</span>
                            <div>
                              <h2 className="text-lg font-bold text-gray-800">
                                {listingCate === 'Land' ? `Land To ${formData.PropertyNeed}` : `Property To ${formData.PropertyNeed}`}
                              </h2>
                              <p className="text-sm text-gray-600">{formData.title}</p>
                              <p className="text-sm text-gray-600">{formData.subtitle}</p>
                            </div>
                          </div>
                          <div
                            className="h-40 w-full bg-cover bg-center rounded-md mt-4"
                            style={{
                              backgroundImage: `url(${imageUrl || `${BASE_URL}${formData.displayImage}`})`,
                            }}
                          />
                          <div className="mt-4 flex items-center gap-2">
                            <img src={duotone} alt="Location" className="h-6 w-6" />
                            <p className="text-sm text-gray-600">{formData.location.city} /{formData.location.country}</p>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {listingCate === 'Land' ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <img src={squreIcon} alt="Size" className="h-6 w-6" />
                                  <span className="text-sm">{formData.size}m²</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img src={plot} alt="Plot" className="h-6 w-6" />
                                  <span className="text-sm">{formData.total} Plots</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <img src={squreIcon} alt="Size" className="h-6 w-6" />
                                  <span className="text-sm">{formData.size}m²</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img src={childIcon} alt="Bedroom" className="h-6 w-6" />
                                  <span className="text-sm">{formData.bedRoom} Bedroom</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img src={garageIcon} alt="Parking" className="h-6 w-6" />
                                  <span className="text-sm">{formData.parking} Parking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img src={bathroonIcon} alt="Bathroom" className="h-6 w-6" />
                                  <span className="text-sm">{formData.bathRoom} Bathroom</span>
                                </div>
                              </>
                            )}
                          </div>
                          <button
                            disabled
                            className="mt-4 w-full py-2 bg-gray-600 text-white rounded-md"
                            aria-label="View more details"
                          >
                            View More
                          </button>
                        </div>
                      )}

                      { activeStep === 5 && (

                        <div className="shadow-lg p-6 max-w-md mx-auto">
                          <div
                            className="property-card bg-white rounded-lg shadow-2x p-6 mt-3 pb-2 max-w-[600px] lg:max-w-[450px] w-[450px]"
                          >
                            <div className="flex items-center justify-center mb-3 space-x-9" style={{ justifyContent: "space-between" }}>
                              <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                                {formData.PropertyNeed}
                              </span>
                              <div>
                                <h2 className="text-lg font-semibold">Property To {formData.PropertyNeed}</h2>
                                <p className=" text-xs text-gray-600 truncate">{formData.title}</p>
                                <p className=" text-xs text-gray-600 truncate">{formData.subtitle}</p>
                              </div>
                              <div className="">
                                <Heart
                                  className='h-6 w-6 cursor-pointer text-[#a97e2b] hover:fill-[#a97e2b] hover:text-white'
                                />
                              </div>
                            </div>

                            <div className="block relative">
                              <div className="aspect-[4/3] overflow-hidden rounded-md bg-cover h-50 w-full bg-cover bg-center rounded-md mt-4 transition-transform hover:scale-105">
                                <img
                                  src={formData.displayImage}
                                  alt={formData.title}
                                  className="w-full h-full object-cover transition-transform hover:scale-105"
                                />
                              </div>
                              {formData.featured !== false ? (
                                <div className="absolute top-2 left-2">
                                  <Badge variant="outline" className="bg-white rounded-md">
                                    {formData.featured && "Featured"}
                                  </Badge>
                                </div>
                              ) : ""}
                              <div className="absolute top-2 right-2">
                                <Badge variant="outline" className="bg-white rounded-md">
                                  {formData.category}
                                </Badge>
                              </div>

                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-3 justify-center mb-4">
                              <div className="mt-4 flex items-center gap-2">
                                <img src={duotone} alt="Location" className="h-6 w-6" />
                                <p className="text-sm text-gray-600">
                                  {formData.location.country !== undefined
                                    ? `${formData.location.city} /${formData.location.country}` 
                                    : ""}
                                </p>
                              </div>

                            </div>
                            <div className="grid grid-cols-2 gap-3 justify-center mb-4">
                              <div className="flex items-center gap-2">
                                {formData.currency === "Dollar" ? (<LucideDollarSign className="h-4 w-6 text-[#a97e2b]" />) : (<BadgeCent className="h-4 w-6 text-[#a97e2b]" />)}
                                <p className="text-sm text-[#a97e2b]">{formData.price}</p>
                              </div>
                            </div>

                            {/* Dynamic key features based on property category */}
                            {formData.category?.toLowerCase() === "the fjord" ? (
                              <div className="mt-2 grid grid-cols-2 gap-3 justify-center mb-4">
                                <div className="flex items-center">
                                  <House className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md" />
                                  <span className="text-black">{formData.occupancy} Max Guest</span>
                                </div>
                                <div className="flex items-center">
                                  <img
                                    src={squreIcon}
                                    alt="Square Foot Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.size} m²</span>
                                </div>
                                <div className="flex items-center">
                                  <img
                                    src={childIcon}
                                    alt="Bedroom Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.bedRoom} Bedrooms</span>
                                </div>
                                <div className="flex items-center">
                                  <img
                                    src={bathroonIcon}
                                    alt="Bathroom Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.bathRoom} Bathrooms</span>
                                </div>
                              </div>
                            ) : formData.category?.toLowerCase() === "land" ? (
                              <div className="mt-2 grid grid-cols-2 gap-3 justify-center mb-4">
                                <div className="flex items-center">
                                  <img
                                    src={squreIcon}
                                    alt="Square Foot Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.size} m²</span>
                                </div>
                                <div className="flex items-center justify-end mr-2 gap-2">
                                  <img src={plot} alt="Plot" className="h-6 w-6" />
                                  <span className="text-black">{formData.total} Plots</span>
                                </div>
                                {formData.propertyAmenities && JSON.parse(formData.propertyAmenities).length > 0 ? (
                                  <>
                                    {JSON.parse(formData.propertyAmenities)
                                      .slice(0, 2)
                                      .map((amenity, index) => (
                                        <div key={index} className="flex items-center">
                                          <NaturePeople className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md" />
                                          <span className="text-black">{amenity}</span>
                                        </div>
                                      ))}
                                  </>
                                ) : (
                                  <div>No amenities available</div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2 grid grid-cols-2 gap-3 justify-center mb-4">
                                <div className="flex items-center">
                                  <img
                                    src={squreIcon}
                                    alt="Square Foot Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.size} m²</span>
                                </div>
                                <div className="flex items-center justify-end">
                                  <img
                                    src={childIcon}
                                    alt="Bedroom Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.bedRoom} Bedrooms</span>
                                </div>
                                <div className="flex items-center">
                                  <img
                                    src={bathroonIcon}
                                    alt="Bathroom Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.bathRoom} Bathrooms</span>
                                </div>
                                <div className="flex items-center justify-end mr-4">
                                  <img
                                    src={garageIcon}
                                    alt="Garage Icon"
                                    className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                  />
                                  <span className="text-black">{formData.parking} Parking</span>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              className="flex items-center justify-center w-full py-2.5 mb-2 text-md text-center text-white bg-black/90 rounded-full hover:bg-black transition-smooth active:opacity-10"
                            >
                              View More
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-between">
                        <button
                          type="button"
                          disabled={activeStep === 0}
                          onClick={() => setActiveStep((prev) => prev - 1)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                          aria-label="Previous step"
                        >
                          Back
                        </button>
                        {activeStep === steps.length - 1 ? (
                          <button
                            type="button"
                            onClick={submitForm}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                            aria-label="Submit property listing"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveStep((prev) => prev + 1)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            aria-label="Next step"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    </FormikForm>
                  )}
                </Formik>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </>
  );
};

export default PropertyModel;