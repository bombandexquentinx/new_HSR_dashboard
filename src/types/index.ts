
export type Country = "Ghana" | "Nigeria" | "Kenya" | "UAE";

export interface Property {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  status?: string;
  date?: string;
  price?: string;
  currency?: string;
  country?: Country;
  city?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType?: string;
  purpose?: string;
  amenities?: string[];
  images?: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
  video?: string;
  additionalPhotos?: string[];
}

export interface Service {
  id?: string;
  title?: string;
  description?: string;
  name?: string;
  category?: string;
  type?: "service";
  price?: string;
  currency?: string;
  serviceType?: string;
  country?: Country | "All";
  image?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  providerId?: string;
}

export interface Resource {
  id?: string;
  title?: string;
  content?: string;
  published?: string;
  summary?: string;
  type: "Guide" | "Report";
  category?: string;
  coverImage?: string;
  author?: string;
  authorImage?: string;
  publishDate?: string;
  featured?: boolean;
  slug?: string;
  tags?: string[];
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  applicableTo: string;
  isRecurring: boolean;
  status: string;
  imageUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "agent" | "admin";
  avatar?: string;
}

export interface Booking {
  id: string;
  userId?: string;
  propertyId?: string;
  serviceId?: string;
  startDate?: string;
  client?: string;
  property?: string;
  type?: "booking";
  date?: string;
  time?: string;
  status?: StatusBooking;
  email: string;
  phone?: string;
  message?: string;
  endDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  featured?: boolean;
}

export type ReplyItem =
  | {
      id: string;
      client?: string;
      name?: string;
      email?: string;
      status?: string;
      type: "booking" | "lead" | "invoice";
    };

export type StatusBooking = "confirmed" | "pending" | "cancelled";
export type StatusLead = "new" | "contacted" | "qualified" | "converted" | "lost";
export type StatusInvoice = "paid" | "pending" | "overdue";


export type DialogType =
  | "property"
  | "properties"
  | "service"
  | "services"
  | "resource"
  | "resources"
  | "featured"
  | "addon"
  | "addons"
  | "team"
  | "partner"
  | "invoice";

export interface InvoiceItem {
  name: string;
  quantity: number;
  rate: string;
}

export interface DashboardStat {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}


export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  source: string;
  date: string;
  status: StatusLead;
  message?: string;
  type: "lead";
}

export interface Invoice {
  id: string;
  client: string;
  amount: string;
  issued: string;
  due: string;
  status: StatusInvoice;
  items?: InvoiceItem[];
  clientEmail?: string;
  type: "invoice";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  type: "team";
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  type: "partner";
}


export interface FeaturedListing {
  id: string;
  property: string;
  type: string;
  until: string;
  position: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: string;
  availability: string;
  type: "addon";
}

export type ViewItem =
  | (Booking & { type: "booking" })
  | (Lead & { type: "lead" })
  | (Invoice & { type: "invoice" });


export type ListingFormData = Partial<
  Property &
    Service &
    Resource &
    FeaturedListing &
    Addon &
    TeamMember &
    Partner &
    Invoice & { items?: InvoiceItem[] }
>;
