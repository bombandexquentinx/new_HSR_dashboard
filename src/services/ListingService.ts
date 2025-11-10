import app from "../utils/api";

// Define types for function parameters and responses
interface UpdateStatusBody {
    // Define the shape of the body object as needed
    [key: string]: any;
}

interface ListingOverviewResponse {
    // Define the expected response structure
    [key: string]: any;
}

interface ListingResponse {
    // Define the expected response structure
    [key: string]: any;
}

// Listing Overview
const listingOverview = async (): Promise<ListingOverviewResponse> => {
    const response = await app.get<ListingOverviewResponse>("/listings/overview");
    return response.data;
}

// Get all listings with pagination
const getAllListing = async (currentPage: number): Promise<ListingResponse> => {
    const response = await app.get<ListingResponse>(`/listings?page=${currentPage}`);
    return response.data;
}

// Get all addon listings
const getAddonsListing = async (): Promise<ListingResponse> => {
    const response = await app.get<ListingResponse>(`/listings/addons`);
    return response.data;
}

// Get all property listings
const getPropertyListing = async (): Promise<ListingResponse> => {
    const response = await app.get<ListingResponse>(`/listings/property`);
    return response.data;
}

// Get all resource listings
const getResourceListing = async (): Promise<ListingResponse> => {
    const response = await app.get<ListingResponse>(`/listings/resource`);
    return response.data;
}

// Get all service listings
const getServiceListing = async (): Promise<ListingResponse> => {
    const response = await app.get<ListingResponse>(`/listings/service`);
    return response.data;
}

// Update listing status
const updateStatus = async (body: UpdateStatusBody): Promise<ListingResponse> => {
    const response = await app.put<ListingResponse>(`/listings/update-status`, body);
    return response.data;
}

// Export all listing service functions as an object
const listingService = {
    listingOverview,
    getAllListing,
    updateStatus,
    getAddonsListing,
    getPropertyListing,
    getServiceListing,
    getResourceListing
}

export default listingService

// NOTE: Replace the placeholder interfaces with actual types based on your API response structure.