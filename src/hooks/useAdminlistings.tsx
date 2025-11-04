import { useState } from 'react';

export interface Listing {
  id: number;
  title: string;
  type: string;
  status: 'Published' | 'Draft' | 'Archived';
  price?: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_LISTINGS = {
  properties: [
    { 
      id: 1, 
      title: 'Modern Apartment', 
      type: 'Fjord Apartment', 
      status: 'Published' as const, 
      price: '$2,500/mo', 
      location: 'Downtown',
      description: 'Beautiful modern apartment in the heart of downtown',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-15'
    },
    { 
      id: 2, 
      title: 'Family House', 
      type: 'Residential', 
      status: 'Draft' as const, 
      price: '$850,000', 
      location: 'Suburbs',
      description: 'Spacious family home with large garden',
      createdAt: '2024-12-05',
      updatedAt: '2024-12-10'
    },
    { 
      id: 3, 
      title: 'Investment Property', 
      type: 'Investment', 
      status: 'Published' as const, 
      price: '$1.2M', 
      location: 'Business District',
      description: 'Prime investment opportunity in growing area',
      createdAt: '2024-12-08',
      updatedAt: '2024-12-12'
    },
  ],
  services: [
    { 
      id: 1, 
      title: 'Property Valuation', 
      type: 'Property Valuation', 
      status: 'Published' as const, 
      price: '$500',
      description: 'Professional property valuation services',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-10'
    },
    { 
      id: 2, 
      title: 'Interior Design', 
      type: 'Interior Decor', 
      status: 'Published' as const, 
      price: '$2,000',
      description: 'Complete interior design consultation',
      createdAt: '2024-12-03',
      updatedAt: '2024-12-08'
    },
    { 
      id: 3, 
      title: 'Project Management', 
      type: 'Project Management', 
      status: 'Draft' as const, 
      price: '$5,000',
      description: 'End-to-end project management services',
      createdAt: '2024-12-05',
      updatedAt: '2024-12-07'
    },
  ],
  addons: [],
  resources: [
    { 
      id: 1, 
      title: 'First Time Buyer Guide', 
      type: 'Property Guide', 
      status: 'Published' as const,
      description: 'Comprehensive guide for first-time property buyers',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-05'
    },
    { 
      id: 2, 
      title: 'Market Update Q4', 
      type: 'Property News', 
      status: 'Published' as const,
      description: 'Latest market trends and analysis',
      createdAt: '2024-12-10',
      updatedAt: '2024-12-15'
    },
    { 
      id: 3, 
      title: 'Investment Checklist', 
      type: 'Checklists', 
      status: 'Draft' as const,
      description: 'Step-by-step investment property checklist',
      createdAt: '2024-12-12',
      updatedAt: '2024-12-14'
    },
  ],
  other: [
    { 
      id: 1, 
      title: 'Goldman Sachs Partnership', 
      type: 'Trusted Partners', 
      status: 'Published' as const,
      description: 'Strategic partnership announcement',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-03'
    },
    { 
      id: 2, 
      title: 'Senior Property Advisor', 
      type: 'Team Members', 
      status: 'Published' as const,
      description: 'Meet our senior property investment advisor',
      createdAt: '2024-12-05',
      updatedAt: '2024-12-08'
    },
  ]
};

export const useAdminListings = () => {
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const addListing = async (category: keyof typeof listings, data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newListing: Listing = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setListings(prev => ({
      ...prev,
      [category]: [...prev[category], newListing]
    }));
    
    setIsLoading(false);
    return newListing;
  };

  const updateListing = async (category: keyof typeof listings, id: number, data: Partial<Listing>) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setListings(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id 
          ? { ...item, ...data, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      )
    }));
    
    setIsLoading(false);
  };

  const deleteListing = async (category: keyof typeof listings, id: number) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setListings(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
    
    setIsLoading(false);
  };

  const toggleStatus = async (category: keyof typeof listings, id: number) => {
    const listing = listings[category].find(item => item.id === id);
    if (listing) {
      const newStatus = listing.status === 'Published' ? 'Draft' : 'Published';
      await updateListing(category, id, { status: newStatus });
    }
  };

  const archiveListing = async (category: keyof typeof listings, id: number) => {
    await updateListing(category, id, { status: 'Archived' });
  };

  return {
    listings,
    isLoading,
    addListing,
    updateListing,
    deleteListing,
    toggleStatus,
    archiveListing
  };
};