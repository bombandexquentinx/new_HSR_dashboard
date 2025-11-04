import * as Yup from "yup";

// Validation Schema
export const PropertyValidationSchema = Yup.object({
  listingType: Yup.string()
    .required("Listing type is required")
    .oneOf(["Property Listings"], "Invalid listing type"),
  listingCate: Yup.string()
    .required("Listing category is required")
    .oneOf(
      ["Residential", "Commercial", "Investment", "The Fjord", "Land"],
      "Invalid listing category"
    ),
  propertyNeed: Yup.string().when("listingCate", {
    is: (value) => ["Residential", "Commercial", "Land"].includes(value),
    then: Yup.string()
      .required("Property need is required")
      .oneOf(["Rent", "Buy"], "Invalid property need"),
    otherwise: Yup.string().when("listingCate", {
      is: "Investment",
      then: Yup.string()
        .required("Property need is required")
        .oneOf(["Invest"], "Invalid property need"),
      otherwise: Yup.string().when("listingCate", {
        is: "The Fjord",
        then: Yup.string()
          .required("Property need is required")
          .oneOf(["Stay"], "Invalid property need"),
        otherwise: Yup.string().notRequired(),
      }),
    }),
  }),
  PropertyType: Yup.string().when("listingCate", {
    is: (value) => ["Residential", "Commercial", "Investment"].includes(value),
    then: Yup.string()
      .required("Property type is required")
      .oneOf(
        [
          "Apartment",
          "Townhouse",
          "Detached House",
          "Semi Detached House",
          "Bungalow",
          "Luxury Home",
          "Affordable Home",
        ],
        "Invalid property type"
      ),
    otherwise: Yup.string().notRequired(),
  }),
  title: Yup.string()
    .required("Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  subtitle: Yup.string()
    .required("Subtitle is required")
    .min(5, "Subtitle must be at least 5 characters")
    .max(150, "Subtitle cannot exceed 150 characters"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be a positive number")
    .typeError("Price must be a number"),
  serviceLocation: Yup.string()
    .required("Location is required")
    .min(5, "Location must be at least 5 characters"),
  serviceSummary: Yup.string()
    .required("Summary is required")
    .min(20, "Summary must be at least 20 characters")
    .max(500, "Summary cannot exceed 500 characters"),
  generalInfo: Yup.string()
    .required("General information is required")
    .min(20, "General information must be at least 20 characters")
    .max(1000, "General information cannot exceed 1000 characters"),
  location: Yup.object({
    latitude: Yup.number()
      .required("Latitude is required")
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .typeError("Latitude must be a number"),
    longitude: Yup.number()
      .required("Longitude is required")
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .typeError("Longitude must be a number"),
  }),
  propertySize: Yup.string().when("listingCate", {
    is: (value) => ["Residential", "Commercial", "Investment", "Land"].exactly(value),
    then: Yup.string()
      .required("Property size is required")
      .matches(/^\d+(\.\d+)?$/, "Property size must be a number (e.g., 100 or 100.5)")
      .test("is-positive", "Property size must be a positive number", (value) => {
        return parseFloat(value) > 0;
      }),
    otherwise: Yup.string().notRequired(),
  }),
  bedroom: Yup.number().when("listingCate", {
    is: (value) => ["Residential", "Commercial", "Investment"].includes(value),
    then: Yup.number()
      .required("Number of bedrooms is required")
      .min(0, "Number of bedrooms cannot be negative")
      .integer("Number of bedrooms must be an integer")
      .typeError("Number of bedrooms must be a number"),
    otherwise: Yup.number().notRequired(),
  }),
  bathroom: Yup.number().when("listingCate", {
    is: (value) => ["Residential", "Commercial", "Investment"].includes(value),
    then: Yup.number()
      .required("Number of bathrooms is required")
      .min(0, "Number of bathrooms cannot be negative")
      .integer("Number of bathrooms must be an integer")
      .typeError("Number of bathrooms must be a number"),
    otherwise: Yup.number().notRequired(),
  }),
  parking: Yup.number().when("listingCate", {
    is: (value) => ["Residential", "Commercial", "Investment"].includes(value),
    then: Yup.number()
      .required("Number of parking spaces is required")
      .min(0, "Number of parking spaces cannot be negative")
      .integer("Number of parking spaces must be an integer")
      .typeError("Number of parking spaces must be a number"),
    otherwise: Yup.number().notRequired(),
  }),
  total: Yup.string().when("listingCate", {
    is: "Land",
    then: Yup.string()
      .required("Total number of plots is required")
      .matches(/^\d+$/, "Total number of plots must be a positive integer")
      .test("is-positive", "Total number of plots must be a positive number", (value) => {
        return parseInt(value) > 0;
      }),
    otherwise: Yup.string().notRequired(),
  }),
  propertyUsage: Yup.string().when("listingCate", {
    is: "Land",
    then: Yup.string()
      .required("Property usage is required")
      .oneOf(
        ["Mixed Use", "Residential", "Commercial", "Industrial", "Farming"],
        "Invalid property usage"
      ),
    otherwise: Yup.string().notRequired(),
  }),
  displayImages: Yup.array()
    .min(1, "At least one property image is required")
    .required("Property images are required"),
  frontImage: Yup.mixed()
    .required("Front image is required")
    .test("fileType", "Front image must be a valid image file", (value) => {
      if (!value) return false;
      return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
    }),
  propertyAmenities: Yup.array()
    .min(1, "At least one property amenity is required")
    .required("Property amenities are required"),
  paymentOptions: Yup.array()
    .min(1, "At least one payment option is required")
    .required("Payment options are required"),
  videoLinks: Yup.array().of(
    Yup.string().matches(
      /^(https?:\/\/)?(www\.youtube\.com|youtube\.com|m\.youtube\.com)\/(watch\?v=|v\/|e\/|u\/\w\/|embed\/)([a-zA-Z0-9_-]{11})$/,
      "Invalid YouTube URL"
    )
  ),
  faqs: Yup.array().of(
    Yup.object({
      question: Yup.string()
        .required("FAQ question is required")
        .min(5, "FAQ question must232 be at least 5 characters"),
      answer: Yup.string()
        .required("FAQ answer is required")
        .min(10, "FAQ answer must be at least 10 characters"),
    })
  ),
});

export const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  location: Yup.object({
    city: Yup.string().required('City is required'),
    latitude: Yup.string().required('Latitude is required'),
    longitude: Yup.string().required('Longitude is required'),
  }),
  // Add more fields as needed
});