import React, { useEffect, useState, useRef, useCallback } from "react";
import { debounce } from "../utils/debounce";

import {
  Button,
  Form,
} from "react-bootstrap";

import { PictureAsPdf, Image } from "@mui/icons-material"; // Correct named imports for Material UI icons

import CloseIcon from "@mui/icons-material/Close";
import * as Yup from "yup";

import L from "leaflet"; // Make sure you have Leaflet installed: npm install leaflet

import bathroonIcon from "../assets/bathroom.png";
import childIcon from "../assets/bedroom_child.png";
import garageIcon from "../assets/garage_home.png";
import squreIcon from "../assets/square_foot.png";
import duotone from "../assets/Pin_alt_duotone.png";

import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

import FAQ from "./FAQ";

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

{
  /* <ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />  */
}

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={"btn"} {...props} />
))(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

interface FormDataType {
  title: string;
  subtitle: string;
  displayImage: string;
  displayImages: File[];
  serviceCategory: string;
  serviceLocation: string;
  serviceSummary: string;
  price: number;
  keywords: string[];
  paymentOptions: string[];
  landmarks: any[];
  location: { latitude: string; longitude: string };
  features: any[];
  serviceDetails: string;
  status: string;
  listingType: string;
  PropertyNeed: string;
  generalInfo: string;
  localAmenities: string[];
  bedroom: number;
  bathroom: number;
  parking: number;
  propertySize: number;
}

const steps = ["Type", "Details", "Features", "faqs", "Preview"];

// Validation Schemas for each step
const validationSchema = Yup.object({
  listingType: Yup.string().required("Listing type is required."),
  listingCate: Yup.string().required("Listing category is required."),
  propertyNeed: Yup.string().when(["listingType"], ([listingType], schema) => listingType === "Property Listings" ? schema.required("Property need is required.") : schema),
});

// Initial form values
const initialValues = {
  listingType: "",
  listingCate: "",
  propertyNeed: "",
};

const PropertyModel = ({ activeStep, setActiveStep }) => {
  const mapRef = useRef(null); // Reference to the map instance
  const mapContainerRef = useRef(null); // Reference to the map container DOM element
  //   const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const [faqs, setFaqs] = useState([]); // State to store the list of FAQs
  const [questionInput, setQuestionInput] = useState(""); // State for FAQ question
  const [answerInput, setAnswerInput] = useState(""); // State for FAQ answer

  const [amenities, setAmenities] = useState<{name: string, distance: number}[]>([]); // State to hold the list of added amenities
  const [amenityInput, setAmenityInput] = useState(""); // State to hold the current amenity input value
  const [distanceInput, setDistanceInput] = useState<string>("0"); // State to hold the current distance input value

  const [videoLinks, setVideoLinks] = useState([]); // State to store the video links
  const [videoInput, setVideoInput] = useState(""); // State to hold the current video link input value

  const [expanded, setExpanded] = React.useState("panel1");

  const [selectedCountry, setSelectedCountry] = useState("");

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    subtitle: "",
    displayImage: "",
    displayImages: [],
    serviceCategory: "",
    serviceLocation: "",
    serviceSummary: "",
    price: 0,
    keywords: [],
    paymentOptions: [],
    landmarks: [],
    location: {
      latitude: "5.605052121404785",
      longitude: "0",
    },
    features: [],
    serviceDetails: "",
    status: "unpublished",
    listingType: "",
    PropertyNeed: "",
    generalInfo: "",
    localAmenities: [],
    bedroom: 0,
    bathroom: 0,
    parking: 0,
    propertySize: 0,
  });

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const [showModal, setShowModal] = useState(false);
  const [listingType, setListingType] = useState("");
  const [listingCate, setListingCate] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [prevImageUrl, setPrevImageUrl] = useState(null);

  // const [formData, setFormData] = useState({});
  const [detailsForm, setDetailsForm] = useState({});

  //   const [formData, setFormData] = useState({
  //     title: "",
  //     subtitle: "",
  //     displayImage: "",
  //     serviceCategory: "",
  //     serviceLocation: "",
  //     serviceSummary: "",
  //     price: "",
  //     keywords: [],
  //     paymentOptions: [],
  //     location: { latitude: "", longitude: "" },
  //     features: [],
  //     serviceDetails: "",
  //     status: "published",
  //     listingType: "Service",
  //     category: "Home Services",
  //   });



  const [keyword, setKeyword] = useState(""); // State to store the input value temporarily

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        keywords: Array.isArray(prev.keywords)
          ? [...prev.keywords, keyword.trim()]
          : [keyword.trim()],
      }));
      setKeyword(""); // Clear input field after adding keyword
    }
  };

  const handleTagRemove = (index) => {
    const updatedKeywords = formData.keywords.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      keywords: updatedKeywords,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = new FormData();
    requestBody.append("PropertyNeed", formData.PropertyNeed);
    requestBody.append("title", formData.title);
    requestBody.append("subtitle", formData.subtitle);
    requestBody.append("price", String(formData.price));
    requestBody.append("serviceSummary", formData.serviceSummary);
    requestBody.append("generalInfo", formData.generalInfo);
    requestBody.append("features", JSON.stringify(formData.features)); // Convert array to JSON string
    requestBody.append("localAmenities", JSON.stringify(amenities)); // Convert array to JSON string
    requestBody.append("location", JSON.stringify(formData.location)); // Convert object to JSON string
    requestBody.append(
      "paymentOptions",
      JSON.stringify(formData.paymentOptions)
    ); // Convert array to JSON string
    requestBody.append("status", "unpublished");
    requestBody.append("serviceDetails", formData.serviceDetails);
    requestBody.append("listingType", listingType.split(" ")[0]);
    requestBody.append("serviceCategory", formData.serviceCategory);
    requestBody.append("serviceLocation", formData.serviceLocation);
    requestBody.append("keywords", JSON.stringify(formData.keywords));
    requestBody.append("size", String(formData.propertySize));
    requestBody.append("bathRoom", String(formData.bathroom));
    requestBody.append("bedRoom", String(formData.bedroom));
    requestBody.append("parking", String(formData.parking));

    // Append multiple display images
    if (formData.displayImages && formData.displayImages.length > 0) {
      formData.displayImages.forEach((image) => {
        requestBody.append("media", image);
      });
    }



    // Append video links as JSON string
    if (videoLinks && videoLinks.length > 0) {
      requestBody.append("videoLinks", JSON.stringify(videoLinks));
    }

    // Append FAQ data as JSON string
    if (faqs && faqs.length > 0) {
      requestBody.append("faq", JSON.stringify(faqs));
    }

    // Log all entries in the FormData
    for (const [key, value] of requestBody.entries()) {
      console.log(`${key}:`, value);
    }

    // // Prepare the FormData instance
    // const requestBody = new FormData();
    // requestBody.append("PropertyNeed", formData.PropertyNeed);
    // requestBody.append("title", formData.title);
    // requestBody.append("subtitle", formData.subtitle);
    // requestBody.append("price", parseInt(formData.price, 10));
    // requestBody.append("serviceSummary", formData.serviceSummary);
    // requestBody.append("generalInfo", formData.generalInfo);
    // requestBody.append("features", formData.features);
    // requestBody.append("localAmenities", JSON.stringify(formData.localAmenities)); // Convert array to JSON string
    // requestBody.append("location", JSON.stringify(formData.location)); // Convert object to JSON string
    // requestBody.append("paymentOptions", JSON.stringify(formData.paymentOptions)); // Convert array to JSON string
    // requestBody.append("status", "unpublished");
    // requestBody.append("serviceDetails", formData.serviceDetails);
    // requestBody.append("listingType", listingType.split(" ")[0]);
    // requestBody.append("serviceCategory", formData.serviceCategory);
    // requestBody.append("serviceLocation", formData.serviceLocation);
    // requestBody.append("keywords", formData.keywords);
    // requestBody.append("size", formData.propertySize);
    // requestBody.append("bathRoom", formData.bathroom);
    // requestBody.append("bedRoom", formData.bedroom);
    // requestBody.append("parking", formData.parking);

    // // If a display image is selected, append it to the FormData
    // if (formData.displayImage) {
    //   requestBody.append("media", formData.displayImage);
    // }

    // // Log all entries in the FormData
    // for (const [key, value] of requestBody.entries()) {
    //   console.log(`${key}:`, value);
    // }

    // try {
    //   const response = await axios.post(
    //     "https://homestyleserver.xcelsz.com/api/listings/service",
    //     requestBody,
    //     {
    //       headers: {
    //         "Content-Type": "multipart/form-data", // important for handling files
    //       },
    //     }
    //   );

    //   if (response.status === 201) {
    //     // alert("Service listing posted successfully!");
    //     handleClose()
    //     notify("Service listing posted successfully")
    //   } else {
    //     alert("Failed to post service listing.");
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    //   alert("An error occurred while posting the service listing.");
    // }
  };

  // const handleInputChange = (field, value, isChecked = null) => {
  //   console.log("===============field=====================");
  //   console.log(value);
  //   console.log("====================================");

  //   setFormData((prev) => {
  //     if (field === "displayImage" && value) {
  //       // For the displayImage field, replace the previous image URL with the new one
  //       return {
  //         ...prev,
  //         [field]: value, // Update displayImage with the new file
  //       };
  //     }

  //     if (field === "localAmenities") {
  //       // Toggle the option in the array
  //       console.log("====================================");
  //       console.log("Array.isArray(formData[field] && isChecked)");
  //       console.log("====================================");
  //       const updatedAmenities = isChecked
  //         ? [...prev[field], value] // Add the amenity if checked
  //         : prev[field].filter((amenity) => amenity !== value); // Remove the amenity if unchecked

  //       return {
  //         ...prev,
  //         localAmenities: updatedAmenities,
  //       };
  //     }

  //     if (field === "paymentOptions") {
  //       const updatedAmenities = isChecked
  //         ? [...prev[field], value] // Add the amenity if checked
  //         : prev[field].filter((amenity) => amenity !== value); // Remove the amenity if unchecked

  //       return {
  //         ...prev,
  //         paymentOptions: updatedAmenities,
  //       };
  //     }

  //     if (Array.isArray(formData[field])) {
  //       // If value is not empty, add it to the keywords array
  //       console.log("====================================");
  //       console.log("Arra)");
  //       console.log("====================================");
  //       const updatedKeywords = value
  //         ? [...(prev[field] || []), value]
  //         : prev[field];
  //       return {
  //         ...prev,
  //         [field]: updatedKeywords,
  //       };
  //     }
  //     // if (field === 'paymentOption') {
  //     // // If value is not empty, add it to the keywords array
  //     // const updatedKeywords = value ? [...prev.paymentOption || [], value] : prev.paymentOption;
  //     // return {
  //     //     ...prev,
  //     //     paymentOption: updatedKeywords,
  //     // };
  //     // }

  //     if (Array.isArray(prev[field])) {
  //       // Default case for array fields
  //       return {
  //         ...prev,
  //         [field]: value,
  //       };
  //     }

  //     if (typeof prev[field] === "object" && prev[field] !== null) {
  //       // If the field is an object (e.g., location), merge with the new value
  //       return {
  //         ...prev,
  //         [field]: { ...prev[field], ...value },
  //       };
  //     }

  //     // Default case for other types (like string, number, etc.)
  //     return {
  //       ...prev,
  //       [field]: value,
  //     };
  //   });
  // };

  const handleInputChange = (field, value, isChecked = null) => {
    console.log("===============field=====================");
    console.log(value);
    console.log("====================================");

    setFormData((prev) => {
      if (field === "displayImages") {
        // Update displayImages to store multiple image files
        return {
          ...prev,
          [field]: value, // Store the array of files
        };
      }

      // Handle other fields as before...
      if (field === "localAmenities") {
        const updatedAmenities = isChecked
          ? [...prev[field], value]
          : prev[field].filter((amenity) => amenity !== value);

        return {
          ...prev,
          localAmenities: updatedAmenities,
        };
      }

      if (field === "paymentOptions") {
        const updatedAmenities = isChecked
          ? [...prev[field], value]
          : prev[field].filter((amenity) => amenity !== value);

        return {
          ...prev,
          paymentOptions: updatedAmenities,
        };
      }

      if (Array.isArray(formData[field])) {
        const updatedKeywords = value
          ? [...(prev[field] || []), value]
          : prev[field];
        return {
          ...prev,
          [field]: updatedKeywords,
        };
      }

      // Handle number fields for bedroom, bathroom, parking, propertySize
      if (["bedroom", "bathroom", "parking", "propertySize"].includes(field)) {
        return {
          ...prev,
          [field]: parseFloat(value) || 0,
        };
      }
      if (field === "price") {
        return {
          ...prev,
          [field]: parseFloat(value) || 0,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleImageChange = (imageFile) => {
    // Revoke the previous object URL if it exists
    if (prevImageUrl) {
      URL.revokeObjectURL(prevImageUrl);
    }

    if (imageFile) {
      const newImageUrl = URL.createObjectURL(imageFile);
      setImageUrl(newImageUrl);
      setPrevImageUrl(newImageUrl); // Save the URL for future revocation
    } else {
      setImageUrl(null);
      setPrevImageUrl(null);
    }
  };

  useEffect(() => {
    console.log("=================formData.displayImage===================");
    console.log(formData.displayImage);
    console.log("====================================");
    // Ensure that formData.displayImage is valid before invoking handleImageChange
    if (formData.displayImage) {
      handleImageChange(formData.displayImage);
    }
  }, [formData.displayImage]);

  const handleListingCateChange = (value) => {
    setListingCate(value);
    // setFormData({}); // Reset form fields when the sub-listing changes
  };

  // Listing types and options
  const listingOptions = {
    "Property Listings": [
      "Residential",
      "Commercial",
      "Investment",
      "The Fjord",
      "Land",
    ],
    "Featured Listings": [
      "Trusted by Partners",
      "Just In Properties",
      "Resources to get started",
    ],
    "Service Listings": [
      "Property Management",
      "Property Sales",
      "Interior Decor",
      "Property Consultancy",
      "Project Management",
      "Property Valuation",
      "Land Registration",
    ],
    "Resource Listings": ["Property News", "Property Guide"],
  };

  const settings = {
    map_marker: [
      {
        id: "0",
        lat: formData.location.latitude,
        lng: formData.location.longitude,
        // lat: "5.635778",
        // lng: "-0.161149",
        title: "Property Location",
        content: "Property Location",
        iconType: "custom",
        customIconUrl:
          "https://amarinwb.com/wp-content/uploads/2024/06/Amari-Location-red.png",
        customIconWidth: "40",
        customIconHeight: "40",
      },
    ],
    map_zoom: "15",
    scroll_wheel_zoom: "1",
    map_type: "GM",
    center_index: 0,
  };

  // Initialize map only once and update view on location change
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [
          parseFloat(settings.map_marker[settings.center_index].lat),
          parseFloat(settings.map_marker[settings.center_index].lng),
        ],
        parseInt(settings.map_zoom)
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      settings.map_marker.forEach((marker) => {
        const customIcon = L.icon({
          iconUrl: marker.customIconUrl,
          iconSize: [
            parseInt(marker.customIconWidth),
            parseInt(marker.customIconHeight),
          ],
        });

        const leafletMarker = L.marker(
          [parseFloat(marker.lat), parseFloat(marker.lng)],
          {
            icon: customIcon,
          }
        )
          .addTo(mapRef.current)
          .bindPopup(marker.content);

        mapRef.current._lastMarker = leafletMarker;
      });

      mapRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        handleInputChange("location", {
          latitude: String(lat),
          longitude: String(lng),
        });
      });
    } else {
      // Update map view and marker position on location change
      const lat = parseFloat(formData.location.latitude);
      const lng = parseFloat(formData.location.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setView([lat, lng], 15);
        try {
          if (mapRef.current._lastMarker) {
            mapRef.current._lastMarker.setLatLng([lat, lng]);
          }
        } catch (e) {}
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainerRef, formData.location]); // Update when location changes

  const [files, setFiles] = useState([]); // State to store uploaded files

  // Handle file selection and filtering out duplicates
  const handleFileUpload = (e) => {
    const newFiles = Array.from((e.target as HTMLInputElement).files);
    const uniqueFiles = newFiles.filter(
      (file) => !files.some((f) => f.name === file.name) // Check for duplicate file names
    );

    if (uniqueFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
    } else {
      alert("You have already uploaded this file.");
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  // Handle adding a new amenity with distance to the list
  const handleAddAmenity = () => {
    if (
      amenityInput &&
      distanceInput &&
      !isNaN(parseFloat(distanceInput)) &&
      !amenities.some((item) => item.name === amenityInput)
    ) {
      setAmenities((prevAmenities) => [
        ...prevAmenities,
        { name: amenityInput, distance: parseFloat(distanceInput) || 0 },
      ]);
      setAmenityInput(""); // Clear the amenity input field after adding
      setDistanceInput("0"); // Clear the distance input field after adding
    } else {
      alert("Please enter valid, non-duplicate amenity and distance");
    }
  };

  // Handle removing an amenity from the list
  const handleRemoveAmenity = (amenityName) => {
    setAmenities((prevAmenities) =>
      prevAmenities.filter((item) => item.name !== amenityName)
    );
  };

  // Validate if the link is a valid YouTube URL
  const isValidVideoLink = (url) => {
    const youtubeRegex =
      /^(https?\:\/\/)?(www\.youtube\.com|youtube\.com|m\.youtube\.com)\/(watch\?v=|v\/|e\/|u\/\w\/|embed\/)([a-zA-Z0-9_-]{11})$/;
    return youtubeRegex.test(url);
  };

  // Handle adding a new video link to the list
  const handleAddVideo = () => {
    if (
      videoInput &&
      isValidVideoLink(videoInput) &&
      !videoLinks.includes(videoInput)
    ) {
      setVideoLinks((prevLinks) => [...prevLinks, videoInput]);
      setVideoInput(""); // Clear the input field after adding
    } else {
      alert("Please enter a valid YouTube video URL or a unique link");
    }
  };

  // Handle removing a video link from the list
  const handleRemoveVideo = (url) => {
    setVideoLinks((prevLinks) => prevLinks.filter((link) => link !== url));
  };

  // Handle adding a new FAQ
  const handleAddFAQ = () => {
    if (
      questionInput &&
      answerInput &&
      !faqs.some((faq) => faq.question === questionInput)
    ) {
      setFaqs((prevFaqs) => [
        ...prevFaqs,
        { question: questionInput, answer: answerInput },
      ]);
      setQuestionInput(""); // Clear the question input after adding
      setAnswerInput(""); // Clear the answer input after adding
    } else {
      alert("Please enter a valid question and answer");
    }
  };

  // Handle removing an FAQ
  const handleRemoveFAQ = (question) => {
    setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq.question !== question));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updatedImages = prev.displayImages.filter((_, i) => i !== index);
      return {
        ...prev,
        displayImages: updatedImages,
      };
    });
  };

  // geocode serviceLocation and update map + formData.location
  const geocodeLocation = async (inputValue?: string, countryIsoParam?: string) => {
    const raw = (inputValue !== undefined ? inputValue : formData.serviceLocation || "").trim();
    const countryIso = countryIsoParam || selectedCountry;

    if (!raw) {
      // geocode country only
      if (countryIso) {
        try {
          const countryUrl = `https://nominatim.openstreetmap.org/search?country=${countryIso}&format=json&limit=1`;
          const res = await fetch(countryUrl, {
            headers: {
              "User-Agent": "homestyle-app",
            },
          });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (!isNaN(lat) && !isNaN(lon)) {
              if (mapRef.current) {
                mapRef.current.setView([lat, lon], 6);
              }
            }
          }
        } catch (err) {
          console.warn("Country geocode attempt failed for:", countryIso, err);
        }
      }
      return;
    }

    // If input looks like a URL, try to extract lat/lon from it (support location links)
    const urlPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const urlMatch = raw.match(urlPattern);
    if (urlMatch) {
      const lat = parseFloat(urlMatch[1]);
      const lon = parseFloat(urlMatch[2]);
      if (!isNaN(lat) && !isNaN(lon)) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            latitude: String(lat),
            longitude: String(lon),
          },
        }));
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], 15);
          try {
            if (mapRef.current._lastMarker) {
              mapRef.current._lastMarker.setLatLng([lat, lon]);
            }
          } catch (e) {}
        }
        return;
      }
    }

    const cleaned = raw;

    // build a few fallback queries (full string, first segment, cleaned input)
    const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
    const queries = [];

    // Add original raw input as a fallback query
    if (raw) queries.push(raw);

    // Add first segment (city or street)
    if (parts.length >= 1) queries.push(parts[0]);

    // Add cleaned input
    if (cleaned) queries.push(cleaned);

    // Remove duplicate queries
    const uniqueQueries = [...new Set(queries)];

    for (const q of uniqueQueries) {
      try {
        const params = new URLSearchParams({
          q,
          format: "json",
          addressdetails: "1",
          limit: "1",
        });
        params.set("countrycodes", countryIso || "GH,NG,AE");

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        console.log("Geocode URL:", url); // Log URL for debugging
        const res = await fetch(url, {
          headers: {
            "User-Agent": "homestyle-app",
          },
        });
        const data = await res.json();
        console.log("Geocode response for query", q, ":", data); // Log full response for debugging
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const zoom = data[0].type === "country" ? 6 : 15;

          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: String(lat),
              longitude: String(lon),
            },
          }));

          if (mapRef.current) {
            mapRef.current.setView([lat, lon], zoom);
            try {
              if (mapRef.current._lastMarker) {
                mapRef.current._lastMarker.setLatLng([lat, lon]);
              }
            } catch (e) {}
          }
          return; // success
        }
      } catch (err) {
        console.warn("Geocode attempt failed for query:", q, err);
      }
    }

    // Instead of alert, use console.warn for better UX
    console.warn(`Could not find location for ${cleaned}${countryIso ? ` (${countryIso.toUpperCase()})` : ""}`);
  };

  const debounceGeocode = useCallback(debounce(geocodeLocation, 500), []);

  // Effect to geocode country when selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      geocodeLocation("", selectedCountry);
    }
  }, [selectedCountry]);

  return (
    <>
      {activeStep === 1 && (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
            {/* Title for the Listing */}
            <Form.Group className="mb-3 ">
              <Form.Label className="font-semibold">Title</Form.Label>
              <Form.Control
                className="font-normal"
                type="text"
                value={formData.title}
                placeholder="Enter the listing title"
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </Form.Group>

            {/* Subtitle */}
            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Subtitle</Form.Label>
              <Form.Control
                className="font-normal"
                type="text"
                value={formData.subtitle}
                placeholder="Enter a subtitle"
                onChange={(e) => handleInputChange("subtitle", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Price</Form.Label>
            <Form.Control
              className="font-normal"
              type="number"
              value={formData.price.toString()}
              placeholder="Enter a price"
              onChange={(e) => handleInputChange("price", e.target.value)}
            />
            </Form.Group>

            {/* <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Display Image
                              </Form.Label>
                              <Form.Control
                                className="font-normal"
                                type="file"
                                onChange={(e) =>
                                  handleInputChange(
                                    "displayImage",
                                    e.target.files[0] || null
                                  )
                                }
                              />
                            </Form.Group> */}

            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Display Images</Form.Label>
              <Form.Control
                className="font-normal"
                type="file"
                multiple // This allows for multiple file uploads
                onChange={(e) =>
                  handleInputChange(
                    "displayImages",
                    Array.from((e.target as HTMLInputElement).files || [])
                  )
                }
              />
            </Form.Group>
          </div>

          {formData.displayImages && formData.displayImages.length > 0 && (
            <div className="flex flex-wrap items-center justify-around">
              {formData.displayImages.map((image, index) => (
                <div
                  key={index}
                  className="relative h-20 w-36 flex items-center justify-center mb-3 rounded-md"
                  style={{
                    backgroundImage: `url(${URL.createObjectURL(image)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <CloseIcon
                    onClick={() => handleRemoveImage(index)}
                    className="absolute text-red-500 mr-2 bg-white rounded-full cursor-pointer"
                  />
                  {/* <button
         type='button'
          onClick={() => handleRemoveImage(index)} // Remove image on click
          className="absolute top-2 right-2 bg-white p-1 rounded-full text-red-500"
        >
          X
        </button> */}
                </div>
              ))}
            </div>
          )}

          {/* {imageUrl && (<div className="h-60 flex items-center justify-center mb-3" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            </div>)} */}

          {/* Country select */}
          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">Country</Form.Label>
            <Form.Control
              as="select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              <option value="GH">Ghana</option>
              <option value="NG">Nigeria</option>
              <option value="AE">UAE</option>
            </Form.Control>
          </Form.Group>

          {/* Service area */}
          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">Select Location</Form.Label>
            {/* <p>{`location set for lat:${formData.location.latitude} and lng:${formData.location.longitude}`}</p> */}
            <div
              ref={mapContainerRef}
              id="map"
              style={{ width: "100%", height: "200px" }}
            ></div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">Location</Form.Label>
            <Form.Control
              className="font-normal"
              type="text"
              value={formData.serviceLocation}
              placeholder="Enter city, area, location"
            onChange={(e) => {
              handleInputChange("serviceLocation", e.target.value);
              if (e.target.value.length >= 3) {
                debounceGeocode(e.target.value, selectedCountry);
              }
            }}
            // onBlur={() => geocodeLocation()} // Removed onBlur to geocode on input change with debounce
          />
          </Form.Group>

          <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
            {/* Service Summary */}
            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Summary</Form.Label>
              <Form.Control
                className="font-normal"
                as="textarea"
                value={formData.serviceSummary}
                placeholder="Write a brief service summary"
                rows={3}
                onChange={(e) =>
                  handleInputChange("serviceSummary", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">General Info</Form.Label>
              <Form.Control
                className="font-normal"
                as="textarea"
                value={formData.generalInfo}
                placeholder="Share any information about property"
                rows={3}
                onChange={(e) =>
                  handleInputChange("generalInfo", e.target.value)
                }
              />
            </Form.Group>
          </div>
        </>
      )}
      {activeStep === 2 && (
        <>
          <Form.Group className="mb-3 mt-3">
            <Form.Label className="font-semibold">
              Property Amenities
            </Form.Label>
            <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto">
              {[
                "A swimming pool",
                "Parking",
                "Fitness center",
                "Social areas",
                "Rooftop gardens",
                "Bike parking",
                "Covered parking",
                "Package lockers",
                "Party room",
                "Building Wi-Fi",
                "Greenery around the space",
                "Surveillance cameras",
                "Valet trash",
                "pet-friendly spaces",
                "walking paths",
                "playgrounds",
                "Billiards table",
                "Clubhouse",
                "Spa",
                "Online rent options",
                "Wi-Fi",
                "Large bathtubs and bathrooms",
                "Security systems",
                "Intercoms",
                "Smart home functionality",
                "Balcony",
                "Central air conditioning with heating",
                "High-end fixtures and finishes",
                "Dishwasher",
                "Built-in washer and dryer units",
                "Valet parking",
                "Late check-outs and early check-ins",
                "Refrigerator in the room",
                "Large television with cable",
                "Swimming pool",
                "Health club",
                "Two fireplaces in the room",
                "Hot tub",
                "Air conditioning",
                "Free Wi-Fi",
                "Hairdryers in the room",
                "In-room iron",
                "Complimentary breakfast",
                "Lounge, bar, or restaurant",
                "In-room toiletries (lotions, shampoo, etc.)",
                "Personal care items (razor, shaving cream, shower cap, combs)",
                "Coffee kit (creamer, coffee packets, the maker)",
                "Tissues",
                "Slippers and bathrobes",
                "Option for hypoallergenic bedding",
                "Mobile check-in",
                "VIP shopping",
                "Play area",
                "Cocktail station",
                "Microwave",
                "Relaxation devices (radio, scent diffusers, etc.)",
              ].map((localAmenitie) => (
                <Form.Check
                  key={localAmenitie}
                  checked={formData.localAmenities.includes(localAmenitie)} // Check if the option is in the paymentOptions array
                  type="checkbox"
                  label={
                    <span
                      className="block overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ maxWidth: "120px", fontSize: "15px" }} // Adjust the width as needed
                    >
                      {localAmenitie}
                    </span>
                  } // Truncate long text with ellipsis
                  onChange={(e) =>
                    handleInputChange(
                      "localAmenities",
                      localAmenitie,
                      e.target.checked
                    )
                  } // Pass the paymentOption value
                />
              ))}
            </div>
          </Form.Group>

          {/* </Form.Group> */}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Local Amenities</Form.Label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  className="border p-2 rounded-md w-full"
                  placeholder="Enter an amenity"
                />
                <input
                  type="number"
                  value={distanceInput}
                  onChange={(e) => setDistanceInput(e.target.value)}
                  className="border p-2 rounded-md w-32 ml-2"
                  placeholder="Distance (km)"
                />
                <Button onClick={handleAddAmenity} className="ml-2">
                  Add
                </Button>
              </div>
            </Form.Group>

            <div className="mt-3">
              {amenities.length > 0 && (
                <ul>
                  {amenities.map((amenity, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center mb-2 border p-2 rounded-md"
                    >
                      <span>
                        {amenity.name} - {amenity.distance} km
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity.name)}
                        className="text-red-500"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Form>

          {/* Service Key Results */}

          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">
              Property Key Features
            </Form.Label>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-6 pl-6">
              <div className="flex justify-between align-items-center">
                <Form.Label className="font-normal mr-3 mb-0">
                  Size (m²)
                </Form.Label>
                <Form.Control
                  className="font-normal"
                  style={{ width: "100px" }}
                  type="number"
                  value={formData.propertySize.toString()}
                  placeholder="0"
                  onChange={(e) =>
                    handleInputChange("propertySize", e.target.value)
                  }
                />
              </div>
              <div className="flex justify-between align-items-center">
                <Form.Label className="font-normal mr-3 mb-0">
                  Bed Room
                </Form.Label>
                <Form.Control
                  className="font-normal"
                  style={{ width: "100px" }}
                  type="number"
                  value={formData.bedroom.toString()}
                  placeholder="0"
                  onChange={(e) => handleInputChange("bedroom", e.target.value)}
                />
              </div>
              <div className="flex justify-between align-items-center">
                <Form.Label className="font-normal mr-3 mb-0">
                  Parking
                </Form.Label>
                <Form.Control
                  className="font-normal"
                  style={{ width: "100px" }}
                  type="number"
                  value={formData.parking.toString()}
                  placeholder="0"
                  onChange={(e) => handleInputChange("parking", e.target.value)}
                />
              </div>
              <div className="flex justify-between align-items-center">
                <Form.Label className="font-normal mr-3 mb-0">
                  Bath Room
                </Form.Label>
                <Form.Control
                  className="font-normal"
                  style={{ width: "100px" }}
                  type="number"
                  value={formData.bathroom.toString()}
                  placeholder="0"
                  onChange={(e) =>
                    handleInputChange("bathroom", e.target.value)
                  }
                />
              </div>
            </div>
          </Form.Group>

          {/* Payment Options */}
          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">Payment Options</Form.Label>
            <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
              {[
                "Cash Outright",
                "6 Months Payment Plan",
                "12 Months Payment Plan",
                "18 Months Payment Plan",
                "24 Months Payment Plan",
                "Republic Bank Mortgage",
                "Stanbic Bank Mortgage",
              ].map((paymentOption) => (
                <Form.Check
                  key={paymentOption}
                  checked={formData.paymentOptions.includes(paymentOption)} // Check if the option is in the paymentOptions array
                  type="checkbox"
                  label={
                    <span
                      className="block overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ maxWidth: "120px", fontSize: "15px" }} // Adjust the width as needed
                    >
                      {paymentOption}
                    </span>
                  } // Converts camelCase to readable format
                  onChange={(e) =>
                    handleInputChange(
                      "paymentOptions",
                      paymentOption,
                      e.target.checked
                    )
                  } // Pass the paymentOption value
                />
              ))}
            </div>
          </Form.Group>
        </>
      )}

      {activeStep === 3 && (
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">
              Frequently Asked Questions (FAQ)
            </Form.Label>

            <div className="flex flex-col">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                className="border p-2 rounded-md w-full mb-2"
                placeholder="Enter FAQ question"
              />

              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                className="border p-2 rounded-md w-full mb-2"
                placeholder="Enter FAQ answer"
                rows={4}
              />

              <Button onClick={handleAddFAQ} className="mt-2">
                Add FAQ
              </Button>
            </div>
            <FAQ questionsAndAnswers={faqs} />
          </Form.Group>

          {/* <div className="mt-3">
    {faqs.length > 0 && (
      <div>
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4 border p-4 rounded-md bg-gray-100">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold">{faq.question}</h5>
              <button
                type="button"
                onClick={() => handleRemoveFAQ(faq.question)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    )}
  </div> */}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Video Links</Form.Label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  className="border p-2 rounded-md w-full"
                  placeholder="Enter video URL"
                />
                <Button onClick={handleAddVideo} className="ml-2">
                  Add
                </Button>
              </div>
            </Form.Group>

            <div className="mt-3">
              {videoLinks.length > 0 && (
                <div>
                  {videoLinks.map((link, index) => (
                    <div key={index} className="mb-2">
                      {/* Embed YouTube video */}
                      <div className="mb-2">
                        <iframe
                          width="300"
                          height="200"
                          src={`https://www.youtube.com/embed/${
                            link.split("v=")[1]
                          }`}
                          title="Video Preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{link}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(link)}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form>

          <Form.Group className="mb-3">
            <Form.Label className="font-semibold">
              Floor & Site Plans
            </Form.Label>
            <div className="flex items-center">
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .pdf"
                onChange={handleFileUpload}
                className="border p-2 rounded-md w-full"
                multiple
              />
            </div>

            <div className="mt-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-2 border p-2 rounded-md"
                >
                  <div className="flex items-center">
                    {file.type === "application/pdf" ? (
                      <PictureAsPdf className="text-red-500 mr-2" />
                    ) : (
                      <Image className="text-blue-500 mr-2" />
                    )}
                    <span className="truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Form.Group>
        </Form>
      )}

      {activeStep === 4 && (
        <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] mt-3 m-auto">
          <div className="flex align-items-center">
            <p className="text-gray-600 font-normal bg-black p-2 text-white rounded-2xl mr-4">
              {formData.PropertyNeed}
            </p>
            <div>
              <h2 className="text-sm font-bold m-0 text-black">
                Property To {formData.PropertyNeed}
              </h2>
              <p className="text-gray-600 font-normal">{formData.subtitle}</p>
            </div>
          </div>

          <div
            className="h-60 flex items-center justify-center"
            style={{
              backgroundImage: `url(${URL.createObjectURL(
                formData.displayImages[0]
              )})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          <div className="text-black-600 mt-2 flex align-center ">
            <img
              src={duotone}
              alt="Location"
              className="h-6 w-6 mr-1 p-1 rounded-md"
            />
            <p>{formData.serviceLocation}</p>
            {/* <p className="text-lg font-bold">50m²</p> */}
          </div>

          <div className="mt-0 grid grid-cols-2 gap-3 justify-center">
            <div className="flex items-center">
              <img
                src={squreIcon}
                alt="Bed"
                className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
              />
              <span className="text-black">{formData.propertySize}m²</span>
            </div>
            <div className="flex items-center">
              <img
                src={childIcon}
                alt="Bed"
                className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
              />
              <span className="text-black">{formData.bedroom} Bed Room</span>
            </div>

            <div className="flex items-center">
              <img
                src={garageIcon}
                alt="Parking"
                className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
              />
              <span className="text-black">{formData.parking} Parking</span>
            </div>
            <div className="flex items-center">
              <img
                src={bathroonIcon}
                alt="Bath Room"
                className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
              />
              <span className="text-black">{formData.bathroom} Bath Room</span>
            </div>
          </div>

          <button
            disabled
            className="bg-black text-white rounded mt-4 py-2 w-full"
          >
            View More
          </button>
        </div>
      )}
    </>
  );
};

export default PropertyModel;
