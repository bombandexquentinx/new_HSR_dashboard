// ...existing code...
import React, { useEffect, useState, useRef } from "react";
import { Modal, Container, Form, Button as BootstrapButton } from "react-bootstrap";

import app from "../utils/api";
import { PictureAsPdf, Image } from "@mui/icons-material"; // Correct named imports for Material UI icons

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import axios from "axios";
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

import Faq from "./FAQ";

import FaqMain from "./FaqMain";

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
  <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} {...props} />
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

const steps = ["Type", "Details", "Features", "faqs", "Preview"];

// Validation Schemas for each step
const validationSchema = Yup.object({
  listingType: Yup.string().required("Listing type is required."),
  listingCate: Yup.string().required("Listing category is required."),
  propertyNeed: Yup.string().when("listingType", (listingType) =>
    listingType === "Property Listings" ? Yup.string().required("Property need is required.") : Yup.string()
  ),
});

// Initial form values
const initialValues = {
  listingType: "",
  listingCate: "",
  propertyNeed: "",
};

const Modals = ({
  setShowDefault,
  handleClose,
  showDefault,
  notify,
  editdata,
  editId,
}) => {
  const recievedData = editdata;
  const recievedAmenities = recievedData?.propertyAmenities && Array.isArray(recievedData.propertyAmenities) && recievedData.propertyAmenities.length
    ? recievedData.propertyAmenities[0]
    : null;
  const recievedPropertyDetails = recievedData?.propertyDetails?.length
    ? recievedData.propertyDetails[0]
    : recievedData?.serviceDetails?.length
    ? recievedData.serviceDetails[0]
    : null;

  // Parse JSON fields safely
  const safeJsonParse = (value, fallback) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    }
    return value || fallback;
  };

  const recievedPropertyFloor = recievedData?.propertyFloorPlans || []; // Ensure it's an array
  const recievedPropertyImage = recievedData?.propertyImages?.length
    ? recievedData.propertyImages.map((image) => image.imageUrl)
    : [];

  const mapRef = useRef(null); // Reference to the map instance
  const mapContainerRef = useRef(null); // Reference to the map container DOM element
  const markerRef = useRef(null); // Reference to the marker
  const [selectedCountry, setSelectedCountry] = useState("Ghana");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const countryData = {
    Ghana: { lat: 5.6037, lng: -0.1870, zoom: 8 },
    Nigeria: { lat: 9.081999, lng: 8.675277, zoom: 6 },
    Kenya: { lat: -0.023559, lng: 37.906193, zoom: 6 },
    UAE: { lat: 23.424076, lng: 53.847818, zoom: 6 },
  };
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const [faqs, setFaqs] = useState(recievedPropertyDetails?.faq || []); // State to store the list of FAQs
  const [questionInput, setQuestionInput] = useState(""); // State for FAQ question
  const [answerInput, setAnswerInput] = useState(""); // State for FAQ answer

  const [amenities, setAmenities] = useState<Array<{name: string, distance: string}>>(
    (recievedAmenities?.amenitiesData || []) as Array<{name: string, distance: string}>
  ); // State to hold the list of added amenities
  const [amenityInput, setAmenityInput] = useState(""); // State to hold the current amenity input value
  const [distanceInput, setDistanceInput] = useState(""); // State to hold the current distance input value

  const [videoLinks, setVideoLinks] = useState(
    recievedPropertyDetails?.videoLinks || []
  ); // State to store the video links
  const [videoInput, setVideoInput] = useState(""); // State to hold the current video link input value

  const [planFiles, setPlanfiles] = useState(
    recievedPropertyDetails?.floorPlans || []
  ); // State to store uploaded files

  const recievedWhatsIncluded = recievedPropertyDetails?.whatsIncluded || [];
  const [whatsIncluded, setWhatsIncluded] = useState(recievedWhatsIncluded);
  const [newFeature, setNewFeature] = useState("");

  const [expanded, setExpanded] = React.useState("panel1");

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
  const [listingType, setListingType] = useState(
    recievedData?.listingType || (recievedPropertyDetails?.service_type
      ? `${recievedPropertyDetails.service_type} Listings`
      : "")
  );
  const [listingCate, setListingCate] = useState(
    recievedData?.category || recievedPropertyDetails?.category || ""
  );
  const [imageUrl, setImageUrl] = useState(
    recievedPropertyDetails?.displayImage || ""
  );
  const [prevImageUrl, setPrevImageUrl] = useState(null);

  const [detailsForm, setDetailsForm] = useState({});

  const [formData, setFormData] = useState({
    title: recievedPropertyDetails?.title || "",
    subtitle: recievedPropertyDetails?.subtitle || "",
    displayImage: "", // For the display image URL
    serviceCategory: "",
    serviceLocation:
      recievedPropertyDetails?.area ||
      recievedPropertyDetails?.service_location ||
      "",
    serviceSummary:
      recievedPropertyDetails?.serviceSummary ||
      recievedPropertyDetails?.service_summary ||
      "",
    price: Number(recievedPropertyDetails?.price || 0),
    keywords: recievedPropertyDetails?.keywords || [],
    paymentOptions: recievedPropertyDetails?.payment_options || [],
    landmarks: [],
    displayImages: recievedPropertyImage || [],
    location: {
      latitude:
        String(recievedPropertyDetails?.location?.latitude ?? "5.6037"),
      longitude:
        String(recievedPropertyDetails?.location?.longitude ?? "-0.1870"),
    },
    features: [],
    serviceDetails: recievedPropertyDetails?.service_details || "",
    status: "unpublished",
    listingType: "",
    PropertyNeed: recievedPropertyDetails?.PropertyNeed || "",
    generalInfo: recievedPropertyDetails?.generalInfo || "",
    propertyAmenities: recievedPropertyDetails?.propertyAmenities || [],
    bedroom: recievedPropertyDetails?.bedRoom || "",
    bathroom: recievedPropertyDetails?.bathRoom || "",
    parking: recievedPropertyDetails?.parking || "",
    propertySize: recievedPropertyDetails?.size || "",
    paragraphs: recievedPropertyDetails?.paragraphs || [],
    total_minutes_read: recievedPropertyDetails?.total_minutes_read || "",
    whyChoose: recievedPropertyDetails?.whyChoose || "",
    category: recievedPropertyDetails?.category || "",
    overview: recievedPropertyDetails?.serviceSummary || "",
  });

  // Update states when editdata changes (for editing existing listings)
  useEffect(() => {
    const recievedData = editdata;
    const recievedAmenities = recievedData?.propertyAmenities && Array.isArray(recievedData.propertyAmenities) && recievedData.propertyAmenities.length
      ? recievedData.propertyAmenities[0]
      : null;
    const recievedPropertyDetails = recievedData?.propertyDetails?.length
      ? recievedData.propertyDetails[0]
      : recievedData?.serviceDetails?.length
      ? recievedData.serviceDetails[0]
      : null;
    const recievedPropertyImage = recievedData?.propertyImages?.length
      ? recievedData.propertyImages.map((image) => image.imageUrl)
      : [];

    setListingType(recievedData?.listingType || (recievedPropertyDetails?.service_type ? `${recievedPropertyDetails.service_type} Listings` : ""));
    setListingCate(recievedData?.category || recievedPropertyDetails?.category || "");
    setImageUrl(recievedPropertyDetails?.displayImage || "");
    setAmenities(safeJsonParse(recievedAmenities?.amenitiesData, []));
    setVideoLinks(recievedPropertyDetails?.videoLinks || []);
    setPlanfiles(recievedPropertyDetails?.floorPlans || []);
    const recievedWhatsIncluded = recievedPropertyDetails?.whatsIncluded || [];
    setWhatsIncluded(recievedWhatsIncluded);
    setFaqs(recievedPropertyDetails?.faq || []);
    setFormData({
      title: recievedPropertyDetails?.title || "",
      subtitle: recievedPropertyDetails?.subtitle || "",
      displayImage: "",
      serviceCategory: "",
      serviceLocation: recievedPropertyDetails?.area || recievedPropertyDetails?.service_location || "",
      serviceSummary: recievedPropertyDetails?.serviceSummary || recievedPropertyDetails?.service_summary || "",
      price: Number(recievedPropertyDetails?.price || 0),
      keywords: recievedPropertyDetails?.keywords || [],
      paymentOptions: recievedPropertyDetails?.payment_options || [],
      landmarks: [],
      displayImages: recievedPropertyImage || [],
      location: {
        latitude: String(recievedPropertyDetails?.location?.latitude ?? "5.6037"),
        longitude: String(recievedPropertyDetails?.location?.longitude ?? "-0.1870"),
      },
      features: [],
      serviceDetails: recievedPropertyDetails?.service_details || "",
      status: "unpublished",
      listingType: "",
      PropertyNeed: recievedPropertyDetails?.PropertyNeed || "",
      generalInfo: recievedPropertyDetails?.generalInfo || "",
      propertyAmenities: recievedPropertyDetails?.propertyAmenities || [],
      bedroom: recievedPropertyDetails?.bedRoom || "",
      bathroom: recievedPropertyDetails?.bathRoom || "",
      parking: recievedPropertyDetails?.parking || "",
      propertySize: recievedPropertyDetails?.size || "",
      paragraphs: recievedPropertyDetails?.paragraphs || [],
      total_minutes_read: recievedPropertyDetails?.total_minutes_read || "",
      whyChoose: recievedPropertyDetails?.whyChoose || "",
      category: recievedPropertyDetails?.category || "",
      overview: recievedPropertyDetails?.serviceSummary || "",
    });
  }, [editdata]);

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

  const handleAddFeature = () => {
    if (newFeature.trim() !== "") {
      setWhatsIncluded([...whatsIncluded, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = new FormData();
    let url = "";
    const method = Object.entries(recievedData).length !== 0 ? "PUT" : "POST"; // Use PUT if updating, otherwise POST
    if (Object.entries(recievedData).length !== 0) {
      url = `${app.baseURL}/listings/edit-listing`; // Unified endpoint
      requestBody.append("listingId", editId?.toString() || "");
    } else {
      url = `${app.baseURL}/listings/listing`; // Unified endpoint
    }

    requestBody.append("listingType", listingType.split(" ")[0] || "");
    requestBody.append("title", formData.title);
    requestBody.append("subtitle", formData.subtitle);
    requestBody.append("serviceCategory", formData.serviceCategory || "");
    requestBody.append("serviceLocation", formData.serviceLocation || "");
    requestBody.append("status", "unpublished");
    requestBody.append("serviceSummary", formData.serviceSummary || "");
    requestBody.append("serviceDetails", formData.serviceDetails || "");
    requestBody.append("price", String(formData.price || 0));

    if (formData.displayImage) {
      requestBody.append("media", formData.displayImage);
    }

    if (faqs && faqs.length > 0) {
      requestBody.append("faq", JSON.stringify(faqs));
    }

    if (listingType === "Property Listings") {
      requestBody.append("category", listingCate);
      requestBody.append("PropertyNeed", formData.PropertyNeed || "");
      requestBody.append("generalInfo", formData.generalInfo || "");
      requestBody.append("features", JSON.stringify(formData.features || []));
      requestBody.append("localAmenities", JSON.stringify(amenities || []));
      requestBody.append("propertyAmenities", JSON.stringify(formData.propertyAmenities || []));
      requestBody.append("location", JSON.stringify(formData.location || {}));
      requestBody.append("paymentOptions", JSON.stringify(formData.paymentOptions || []));
      requestBody.append("size", String(formData.propertySize || ""));
      requestBody.append("bathRoom", String(formData.bathroom || ""));
      requestBody.append("bedRoom", String(formData.bedroom || ""));
      requestBody.append("parking", String(formData.parking || ""));
      requestBody.append("area", formData.serviceLocation || "");

      if (formData.displayImages && formData.displayImages.length > 0) {
        formData.displayImages.forEach((image) => {
          requestBody.append("media", image);
        });
      }

      if (planFiles && planFiles.length > 0) {
        planFiles.forEach((file) => {
          requestBody.append("floorPlans", file);
        });
      }

      if (videoLinks && videoLinks.length > 0) {
        requestBody.append("videoLinks", JSON.stringify(videoLinks));
      }
    }

    if (listingType === "Resource Listings") {
      requestBody.append("category", listingCate);
      requestBody.append("total_minutes_read", formData.total_minutes_read || "");
      requestBody.append("paragraphs", JSON.stringify(formData.paragraphs || []));

      if (formData.displayImages && formData.displayImages.length > 0) {
        formData.displayImages.forEach((image) => {
          requestBody.append("media", image);
        });
      }
    }

    if (listingType === "Addons Listings") {
      requestBody.append("category", listingCate);
      requestBody.append("whatsIncluded", JSON.stringify(whatsIncluded || []));
      requestBody.append("whyChoose", formData.whyChoose || "");

      if (formData.displayImages && formData.displayImages.length > 0) {
        formData.displayImages.forEach((image) => {
          requestBody.append("media", image);
        });
      }
    }

    try {
      const response = await axios({
        method,
        url,
        data: requestBody,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        handleClose();
        notify && notify(`${listingType} listing posted successfully`);
      } else {
        alert(`Failed to post ${listingType} listing.`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred while posting the ${listingType} listing.`);
    }
  };

  const handleInputChange = (field, value, isChecked = null) => {
    setFormData((prev) => {
      if (field === "displayImages") {
        const existingFiles = prev.displayImages || [];
        const newFiles = Array.isArray(value) ? value : [value];
        return {
          ...prev,
          displayImages: [...existingFiles, ...newFiles],
        };
      }

      if (field === "propertyAmenities") {
        const updatedAmenities = isChecked
          ? [...(prev[field] || []), value]
          : (prev[field] || []).filter((amenity) => amenity !== value);

        return {
          ...prev,
          propertyAmenities: updatedAmenities,
        };
      }

      if (field === "paymentOptions") {
        const updated = isChecked
          ? [...(prev[field] || []), value]
          : (prev[field] || []).filter((amenity) => amenity !== value);

        return {
          ...prev,
          paymentOptions: updated,
        };
      }

      // For location updates, ensure strings
      if (field === "location" && typeof value === "object") {
        return {
          ...prev,
          location: {
            ...prev.location,
            latitude: String(value.latitude),
            longitude: String(value.longitude),
            ...(value.street ? { street: value.street } : {}),
            ...(value.city ? { city: value.city } : {}),
          },
        };
      }

      if (Array.isArray(prev[field])) {
        const updatedKeywords = value ? [...(prev[field] || []), value] : prev[field];
        return {
          ...prev,
          [field]: updatedKeywords,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleImageChange = (imageFile) => {
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
    if (formData.displayImage) {
      handleImageChange(formData.displayImage);
    }
  }, [formData.displayImage]);

  const handleListingCateChange = (value) => {
    setListingCate(value);
    setFormData(prev => ({...prev, PropertyNeed: ""}));
  };

  const listingOptions = {
    "Property Listings": [
      "Residential",
      "Commercial",
      "Investment",
      "The Fjord",
      "Land",
    ],
    "Addons Listings": ["Cleaning", "Transportation", "Things to Do", "Food"],
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
        title: "Property Location",
        content: "Property Location",
        iconType: "custom",
        customIconUrl:
          "https://amarinwb.com/wp-content/uploads/2024/06/Amari-Location-red.png",
        customIconWidth: "40",
        customIconHeight: "40",
      },
    ],
    map_zoom: "14",
    scroll_wheel_zoom: "1",
    map_type: "OSM",
    center_index: 0,
  };

  // Helper to update map view and marker
  const updateMapLocation = (lat, lng, zoom = 14, popupHtml = null) => {
    if (!mapRef.current) return;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return;

    mapRef.current.setView([latNum, lngNum], zoom);
    const customIcon = L.icon({
      iconUrl: settings.map_marker[0].customIconUrl,
      iconSize: [
        parseInt(settings.map_marker[0].customIconWidth, 10),
        parseInt(settings.map_marker[0].customIconHeight, 10),
      ],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([latNum, lngNum]);
      if (popupHtml) markerRef.current.bindPopup(popupHtml).openPopup();
    } else {
      markerRef.current = L.marker([latNum, lngNum], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(popupHtml || "Selected location")
        .openPopup();
    }
  };

  // Initialize map once when container is present
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    const initialLat = Number(formData.location.latitude) || 5.6037;
    const initialLng = Number(formData.location.longitude) || -0.1870;
    const initialZoom = parseInt(settings.map_zoom, 10) || 13;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // create persistent marker
    const customIcon = L.icon({
      iconUrl: settings.map_marker[0].customIconUrl,
      iconSize: [
        parseInt(settings.map_marker[0].customIconWidth, 10),
        parseInt(settings.map_marker[0].customIconHeight, 10),
      ],
    });

    markerRef.current = L.marker([initialLat, initialLng], { icon: customIcon })
      .addTo(mapRef.current)
      .bindPopup("Property Location");

    // click handler moves marker and updates form data, and shows a copyable google maps link in popup
    mapRef.current.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const latStr = String(lat);
      const lngStr = String(lng);
      handleInputChange("location", { latitude: latStr, longitude: lngStr });

      const googleLink = `https://www.google.com/maps/@${lat},${lng},15z`;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
          .bindPopup(`<div style="max-width:220px;"><div style="margin-bottom:6px;">Selected location</div><a href="${googleLink}" target="_blank" rel="noreferrer">Open in Google Maps</a><div style="margin-top:6px;font-size:12px;color:#555;">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</div></div>`)
          .openPopup();
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef]);

  // When selectedCountry changes, center map to that country center
  useEffect(() => {
    const data = countryData[selectedCountry];
    if (data) {
      updateMapLocation(data.lat, data.lng, data.zoom || 6);
      handleInputChange("location", { latitude: String(data.lat), longitude: String(data.lng) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      (file) => !planFiles.some((f) => f.name === file.name)
    );

    if (uniqueFiles.length > 0) {
      setPlanfiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
    } else {
      alert("You have already uploaded this file.");
    }
  };

  const handleRemoveFile = (fileName) => {
    setPlanfiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const handleAddAmenity = () => {
    if (
      amenityInput &&
      distanceInput &&
      !isNaN(Number(distanceInput)) &&
      !amenities.some((item) => item.name === amenityInput)
    ) {
      setAmenities((prevAmenities) => [
        ...prevAmenities,
        { name: amenityInput, distance: String(distanceInput) },
      ]);
      setAmenityInput("");
      setDistanceInput("");
    } else {
      alert("Please enter valid, non-duplicate amenity and distance");
    }
  };

  const handleRemoveAmenity = (amenityName) => {
    setAmenities((prevAmenities) =>
      prevAmenities.filter((item) => item.name !== amenityName)
    );
  };

  const isValidVideoLink = (url) => {
    const youtubeRegex =
      /^(https?\:\/\/)?(www\.youtube\.com|youtube\.com|m\.youtube\.com)\/(watch\?v=|v\/|e\/|u\/\w\/|embed\/)([a-zA-Z0-9_-]{11})$/;
    return youtubeRegex.test(url);
  };

  const handleAddVideo = () => {
    if (videoInput && isValidVideoLink(videoInput) && !videoLinks.includes(videoInput)) {
      setVideoLinks((prevLinks) => [...prevLinks, videoInput]);
      setVideoInput("");
    } else {
      alert("Please enter a valid YouTube video URL or a unique link");
    }
  };

  const handleRemoveVideo = (url) => {
    setVideoLinks((prevLinks) => prevLinks.filter((link) => link !== url));
  };

  const handleAddFAQ = () => {
    if (questionInput && answerInput && !faqs.some((faq) => faq.question === questionInput)) {
      setFaqs((prevFaqs) => [
        ...prevFaqs,
        { question: questionInput, answer: answerInput },
      ]);
      setQuestionInput("");
      setAnswerInput("");
    } else {
      alert("Please enter a valid question and answer");
    }
  };

  const handleRemoveFAQ = (question) => {
    setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq.question !== question));
  };

  // Geocode user text (city, street, city+street)
  const handleGeocodeSearch = async () => {
    if (!locationSearch.trim()) return;
    try {
      // Use Nominatim to geocode user input (city, street, city+street)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=1&addressdetails=1&countrycodes=`;
      const response = await axios.get(url, { headers: { "Accept-Language": "en" } });
      const data = response.data;
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        handleInputChange("location", { latitude: String(lat), longitude: String(lon) });
        updateMapLocation(lat, lon, 15, `<div style="max-width:220px;"><div>${display_name}</div><a href="https://www.google.com/maps/@${lat},${lon},15z" target="_blank" rel="noreferrer">Open in Google Maps</a></div>`);
        setLocationSearch("");
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error searching location");
    }
  };

  // Parse Google Maps links, direct coordinates, or "lat,lng"
  const handleLinkParse = () => {
    if (!locationLink.trim()) return;
    // Try multiple patterns
    const atMatch = locationLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const qMatch = locationLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    const plainMatch = locationLink.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
    const plusmatch = locationLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/); // some Google maps embed formats
    const match = atMatch || qMatch || plainMatch || plusmatch;
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      handleInputChange("location", { latitude: String(lat), longitude: String(lng) });
      updateMapLocation(lat, lng, 15, `<div style="max-width:220px;"><div>Parsed location</div><a href="https://www.google.com/maps/@${lat},${lng},15z" target="_blank" rel="noreferrer">Open in Google Maps</a></div>`);
      setLocationLink("");
      return;
    }

    // Fallback: try to geocode the provided text/link via Nominatim
    setLocationSearch(locationLink);
    handleGeocodeSearch();
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

  const handleParagraphAdd = () => {
    setFormData({ ...formData, paragraphs: [...formData.paragraphs, ""] });
  };

  const handleParagraphChange = (index, value) => {
    const updatedParagraphs = [...formData.paragraphs];
    updatedParagraphs[index] = value;
    setFormData({ ...formData, paragraphs: updatedParagraphs });
  };

  return (
    <article>
      <Container className="py-5">
        <Modal
          show={showDefault}
          onHide={handleClose}
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Create Listing</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Box sx={{ width: "100%", maxWidth: "900px" }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  let stepProps: { completed?: boolean } = {};
                  const labelProps = {};

                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {activeStep === steps.length ? (
                <React.Fragment>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    All steps completed - you&apos;re finished
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button onClick={handleReset}>Reset</Button>
                  </Box>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {activeStep === 0 && (
                    <Form>
                      <Form.Group className="mb-3 mt-3">
                        <Form.Label className="font-semibold">
                          Select Listing Type
                        </Form.Label>
                        <Form.Control
                          className="font-normal"
                          as="select"
                          value={listingType}
                          onChange={(e) => {
                            setListingType(e.target.value);
                            setListingCate("");
                          }}
                        >
                          <option value="">Select...</option>
                          {Object.keys(listingOptions).map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                      {listingType && (
                        <Form.Group className="mb-3">
                          <Form.Label className="font-semibold">
                            Select Listing Category
                          </Form.Label>
                          <Form.Control
                            className="font-normal"
                            as="select"
                            value={listingCate}
                            onChange={(e) =>
                              handleListingCateChange(e.target.value)
                            }
                          >
                            <option value="">Select...</option>
                            {listingOptions[listingType].map((subType) => (
                              <option key={subType} value={subType}>
                                {subType}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      )}

                      {listingType === "Property Listings" && (
                        <Form.Group className="mb-3">
                          <Form.Label className="font-semibold">
                            Select Property Need
                          </Form.Label>
                          <select
                            className="form-control"
                            value={formData.PropertyNeed}
                            onChange={(e) =>
                              handleInputChange("PropertyNeed", e.target.value)
                            }
                          >
                            <option value="">Select...</option>
                            {(() => {
                              if (
                                listingCate === "Residential" ||
                                listingCate === "Commercial" ||
                                listingCate === "Land"
                              ) {
                                return ["Rent", "Buy"].map((subType) => (
                                  <option key={subType} value={subType}>
                                    {subType}
                                  </option>
                                ));
                              }
                              if (listingCate === "Investment") {
                                return ["Invest"].map((subType) => (
                                  <option key={subType} value={subType}>
                                    {subType}
                                  </option>
                                ));
                              }
                              if (listingCate === "The Fjord") {
                                return ["Stay"].map((subType) => (
                                  <option key={subType} value={subType}>
                                    {subType}
                                  </option>
                                ));
                              }
                              return null;
                            })()}
                          </select>
                        </Form.Group>
                      )}
                    </Form>
                  )}
                  <Form onSubmit={handleSubmit}>
                    {listingType === "Service Listings" && (
                      <>
                        {activeStep === 1 && (
                          <>
                            <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Title
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.title}
                                  placeholder="Enter the listing title"
                                  onChange={(e) =>
                                    handleInputChange("title", (e.target as HTMLInputElement).value)
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Subtitle
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.subtitle}
                                  placeholder="Enter a subtitle"
                                  onChange={(e) =>
                                    handleInputChange(
                                      "subtitle",
                                      (e.target as HTMLInputElement).value
                                    )
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Service area
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.serviceLocation}
                                  placeholder="Enter Service area"
                                  onChange={(e) =>
                                    handleInputChange(
                                      "serviceLocation",
                                      (e.target as HTMLInputElement).value
                                    )
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Display Image
                                </Form.Label>

                                <Form.Control
                                  className="font-normal"
                                  type="file"
                                  onChange={(e) =>
                                    handleInputChange(
                                      "displayImage",
                                      (e.target as HTMLInputElement).files[0] || null
                                    )
                                  }
                                />
                              </Form.Group>
                            </div>
                            {imageUrl && (
                              <div
                                className="mb-2 h-60 flex items-center justify-center"
                                style={{
                                  backgroundImage: `url(${imageUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              ></div>
                            )}

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Service Overview
                              </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  as="textarea"
                                  value={formData.serviceSummary}
                                  placeholder="Write a service overview"
                                  rows={3}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "serviceSummary",
                                      (e.target as HTMLTextAreaElement).value
                                    )
                                  }
                                />
                            </Form.Group>
                          </>
                        )}
                        {activeStep === 2 && (
                          <>
                            <Form.Group className="mb-3 mt-3">
                              <Form.Label className="font-semibold">
                                Service Description
                              </Form.Label>
                              <Form.Control
                                className="font-normal"
                                as="textarea"
                                value={formData.serviceDetails}
                                placeholder="Write detailed information about the service"
                                rows={6}
                                onChange={(e) =>
                                  handleInputChange(
                                    "serviceDetails",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Key Results
                              </Form.Label>
                              <Form.Control
                                className="font-normal"
                                type="text"
                                placeholder="Type keywords and press Enter to add"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    e.target.value.trim() !== ""
                                  ) {
                                    const newKeyword = e.target.value.trim();
                                    if (
                                      !formData.keywords.includes(newKeyword)
                                    ) {
                                      handleInputChange("keywords", newKeyword);
                                    }

                                    e.target.value = "";
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Price
                              </Form.Label>
                              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                                <Form.Control
                                  className="font-normal"
                                  type="number"
                                  value={formData.price}
                                  placeholder="Enter a price"
                                  onChange={(e) =>
                                    handleInputChange("price", e.target.value)
                                  }
                                />

                                <Form.Check
                                  type="checkbox"
                                  label={
                                    <span
                                      className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                      style={{
                                        maxWidth: "120px",
                                        fontSize: "15px",
                                      }}
                                    >
                                      Request a Quote
                                    </span>
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "paymentOptions",
                                      e.target.checked
                                    )
                                  }
                                />
                              </div>
                            </Form.Group>
                          </>
                        )}

                        {activeStep === 3 && (
                          <Form>
                            <Form.Group className="mb-3 mt-3">
                              <Form.Label className="font-semibold">
                                Frequently Asked Questions (FAQ)
                              </Form.Label>

                              <div className="flex flex-col">
                                <input
                                  type="text"
                                  value={questionInput}
                                  onChange={(e) =>
                                    setQuestionInput(e.target.value)
                                  }
                                  className="border p-2 rounded-md w-full mb-2"
                                  placeholder="Enter FAQ question"
                                />

                                <textarea
                                  value={answerInput}
                                  onChange={(e) =>
                                    setAnswerInput(e.target.value)
                                  }
                                  className="border p-2 rounded-md w-full mb-2"
                                  placeholder="Enter FAQ answer"
                                  rows="4"
                                />

                                <Button onClick={handleAddFAQ} className="mt-2">
                                  Add FAQ
                                </Button>
                              </div>
                              <Faq questionsAndAnswers={faqs} />
                            </Form.Group>
                          </Form>
                        )}
                        {activeStep === 4 && (
                          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] mt-3 m-auto">
                            <div className="flex align-items-center">
                              <p className="text-gray-600 font-normal bg-black p-2 text-white rounded-2xl mr-4">
                                News
                              </p>
                              <div>
                                <h2 className="text-sm font-bold m-0 text-black">
                                  Service News
                                </h2>
                                <p className="text-gray-600 font-normal">
                                  {formData.title}
                                </p>
                              </div>
                            </div>

                            <div
                              className="h-60 flex items-center justify-center"
                              style={{
                                backgroundImage: `url(${imageUrl})`,
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
                            </div>
                            <div className="text-black-600 mt-2">
                              <p className="mb-0">{formData.serviceSummary}</p>
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
                    )}

                    {listingType === "Property Listings" && (
                      <>
                        {activeStep === 1 && (
                          <>
                            <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                              <Form.Group className="mb-3 ">
                                <Form.Label className="font-semibold">
                                  Title
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.title}
                                  placeholder="Enter the listing title"
                                  onChange={(e) =>
                                    handleInputChange("title", e.target.value)
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Subtitle
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.subtitle}
                                  placeholder="Enter a subtitle"
                                  onChange={(e) =>
                                    handleInputChange(
                                      "subtitle",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Price
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="number"
                                  value={formData.price}
                                  placeholder="Enter a price"
                                  onChange={(e) =>
                                    handleInputChange("price", e.target.value)
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Display Images
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="file"
                                  multiple
                                  onChange={(e) =>
                                    handleInputChange(
                                      "displayImages",
                                      Array.from(e.target.files) || []
                                    )
                                  }
                                />
                              </Form.Group>
                            </div>

                            {formData.displayImages &&
                              formData.displayImages.length > 0 && (
                                <div className="flex flex-wrap items-center justify-start">
                                  {formData.displayImages.map(
                                    (image, index) => (
                                      <div
                                        key={index}
                                        className="relative h-20 w-36 flex items-center justify-center mb-3 rounded-md mx-2"
                                        style={{
                                          backgroundImage: `url(${
                                            typeof image === "string"
                                              ? `https://homestyleserver.xcelsz.com${image}`
                                              : URL.createObjectURL(image)
                                          })`,
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                        }}
                                      >
                                        <CloseIcon
                                          onClick={() =>
                                            handleRemoveImage(index)
                                          }
                                          className="absolute top-2 right-2 text-red-500 mr-2 bg-[#ffffff7d] rounded-full cursor-pointer"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Select Country
                              </Form.Label>
                              <Form.Control
                                as="select"
                                value={selectedCountry}
                                onChange={(e) => {
                                  setSelectedCountry(e.target.value);
                                }}
                              >
                                {Object.keys(countryData).map((country) => (
                                  <option key={country} value={country}>{country}</option>
                                ))}
                              </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Search Location (city, street or "city, street")
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                placeholder="Enter location to search (e.g., Accra, Osu - Oxford St)"
                              />
                              <Button onClick={handleGeocodeSearch} className="mt-2">Search</Button>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Location Link or coordinates (lat,lng) or Google Maps link
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={locationLink}
                                onChange={(e) => setLocationLink(e.target.value)}
                                placeholder="Paste Google Maps link or 'lat,lng'"
                              />
                              <Button onClick={handleLinkParse} className="mt-2">Parse Link</Button>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Select Location (click on map to set pin)
                              </Form.Label>
                              <div
                                ref={mapContainerRef}
                                id="map"
                                style={{ width: "100%", height: "300px", borderRadius: 6 }}
                              ></div>
                              <p className="text-sm text-muted mt-2">Lat: {formData.location.latitude}, Lng: {formData.location.longitude}</p>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Property Area
                              </Form.Label>
                              <Form.Control
                                className="font-normal"
                                type="text"
                                value={formData.serviceLocation}
                                placeholder="Ghana, East Legon, Accra, Ghana"
                                onChange={(e) =>
                                  handleInputChange(
                                    "serviceLocation",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>

                            <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Summary
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  as="textarea"
                                  value={formData.serviceSummary}
                                  placeholder="Write a brief service summary"
                                  rows={3}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "serviceSummary",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  General Info
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  as="textarea"
                                  value={formData.generalInfo}
                                  placeholder="Share any information about property"
                                  rows={3}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "generalInfo",
                                      e.target.value
                                    )
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
                                    checked={formData.propertyAmenities.includes(
                                      localAmenitie
                                    )}
                                    type="checkbox"
                                    label={
                                      <span
                                        className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                        style={{
                                          maxWidth: "120px",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {localAmenitie}
                                      </span>
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "propertyAmenities",
                                        localAmenitie,
                                        e.target.checked
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            </Form.Group>

                            <Form>
                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Local Amenities
                                </Form.Label>
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={amenityInput}
                                    onChange={(e) =>
                                      setAmenityInput(e.target.value)
                                    }
                                    className="border p-2 rounded-md w-full"
                                    placeholder="Enter an amenity"
                                  />
                                  <input
                                    type="number"
                                    value={distanceInput}
                                    onChange={(e) =>
                                      setDistanceInput(e.target.value)
                                    }
                                    className="border p-2 rounded-md w-32 ml-2"
                                    placeholder="Distance (km)"
                                  />
                                  <Button
                                    onClick={handleAddAmenity}
                                    className="ml-2"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </Form.Group>

                              <div className="mt-3">
                                {amenities.length > 0 && (
                                  <ul className="pl-0 flex justify-start items-center">
                                    {amenities.map((amenity, index) => (
                                      <li
                                        key={index}
                                        className="flex justify-between items-center mb-2 border p-2 rounded-md min-w-[160px] mx-2"
                                      >
                                        <span>
                                          {amenity.name} - {amenity.distance} km
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveAmenity(amenity.name)
                                          }
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
                                    value={formData.propertySize}
                                    placeholder={0}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "propertySize",
                                        e.target.value
                                      )
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
                                    value={formData.bedroom}
                                    placeholder={0}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "bedroom",
                                        e.target.value
                                      )
                                    }
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
                                    value={formData.parking}
                                    placeholder={0}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "parking",
                                        e.target.value
                                      )
                                    }
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
                                    value={formData.bathroom}
                                    placeholder={0}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "bathroom",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Payment Options
                              </Form.Label>
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
                                    checked={formData.paymentOptions.includes(
                                      paymentOption
                                    )}
                                    type="checkbox"
                                    label={
                                      <span
                                        className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                        style={{
                                          maxWidth: "120px",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {paymentOption}
                                      </span>
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "paymentOptions",
                                        paymentOption,
                                        e.target.checked
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            </Form.Group>
                          </>
                        )}

                        {activeStep === 3 && (
                          <Form>
                            <FaqMain
                              faqs={faqs}
                              questionInput={questionInput}
                              setQuestionInput={setQuestionInput}
                              answerInput={answerInput}
                              setAnswerInput={setAnswerInput}
                              handleAddFAQ={handleAddFAQ}
                            />

                            <Form>
                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Video Links
                                </Form.Label>
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={videoInput}
                                    onChange={(e) =>
                                      setVideoInput(e.target.value)
                                    }
                                    className="border p-2 rounded-md w-full"
                                    placeholder="Enter video URL"
                                  />
                                  <Button
                                    onClick={handleAddVideo}
                                    className="ml-2"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </Form.Group>

                              <div className="mt-3">
                                {videoLinks.length > 0 && (
                                  <div>
                                    {videoLinks.map((link, index) => (
                                      <div key={index} className="mb-2">
                                        <div className="mb-2">
                                          <iframe
                                            width="300"
                                            height="200"
                                            src={`https://www.youtube.com/embed/${
                                              (link.split("v=")[1] || "").split("&")[0]
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
                                            onClick={() =>
                                              handleRemoveVideo(link)
                                            }
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
                                {planFiles.map((file, index) => (
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
                                      <span className="truncate max-w-[200px]">
                                        {file.name}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveFile(file.name)
                                      }
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
                                <p className="text-gray-600 font-normal">
                                  {formData.subtitle}
                                </p>
                              </div>
                            </div>

                            <div
                              className="h-60 flex items-center justify-center"
                              style={{
                                backgroundImage: `url(${
                                  typeof formData.displayImages[0] === "string"
                                    ? `https://homestyleserver.xcelsz.com${formData.displayImages[0]}`
                                    : (formData.displayImages[0] ? URL.createObjectURL(formData.displayImages[0]) : "")
                                })`,
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
                            </div>

                            <div className="mt-0 grid grid-cols-2 gap-3 justify-center">
                              <div className="flex items-center">
                                <img
                                  src={squreIcon}
                                  alt="Bed"
                                  className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                />
                                <span className="text-black">
                                  {formData.propertySize}m²
                                </span>
                              </div>
                              <div className="flex items-center">
                                <img
                                  src={childIcon}
                                  alt="Bed"
                                  className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                />
                                <span className="text-black">
                                  {formData.bedroom} Bed Room
                                </span>
                              </div>

                              <div className="flex items-center">
                                <img
                                  src={garageIcon}
                                  alt="Parking"
                                  className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                />
                                <span className="text-black">
                                  {formData.parking} Parking
                                </span>
                              </div>
                              <div className="flex items-center">
                                <img
                                  src={bathroonIcon}
                                  alt="Bath Room"
                                  className="h-6 w-6 mr-1 bg-[#a3640440] p-1 rounded-md"
                                />
                                <span className="text-black">
                                  {formData.bathroom} Bath Room
                                </span>
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
                    )}

                    {listingType === "Addons Listings" && (
                      <>
                        {activeStep === 1 && (
                          <>
                            <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                              <Form.Group className="mb-3 ">
                                <Form.Label className="font-semibold">
                                  Title
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.title}
                                  placeholder="Enter the listing title"
                                  onChange={(e) =>
                                    handleInputChange("title", e.target.value)
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Subtitle
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="text"
                                  value={formData.subtitle}
                                  placeholder="Enter a subtitle"
                                  onChange={(e) =>
                                    handleInputChange(
                                      "subtitle",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Price
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="number"
                                  value={formData.price}
                                  placeholder="Enter a price"
                                  onChange={(e) =>
                                    handleInputChange("price", e.target.value)
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Display Images
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  type="file"
                                  multiple
                                  onChange={(e) =>
                                    handleInputChange(
                                      "displayImages",
                                      Array.from(e.target.files) || []
                                    )
                                  }
                                />
                              </Form.Group>
                            </div>

                            {formData.displayImages &&
                              formData.displayImages.length > 0 && (
                                <div className="flex flex-wrap items-center justify-start">
                                  {formData.displayImages.map(
                                    (image, index) => (
                                      <div
                                        key={index}
                                        className="relative h-20 w-36 flex items-center justify-center mb-3 rounded-md mx-2"
                                        style={{
                                          backgroundImage: `url(${
                                            typeof image === "string"
                                              ? `https://homestyleserver.xcelsz.com${image}`
                                              : URL.createObjectURL(image)
                                          })`,
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                        }}
                                      >
                                        <CloseIcon
                                          onClick={() =>
                                            handleRemoveImage(index)
                                          }
                                          className="absolute top-2 right-2 text-red-500 mr-2 bg-[#ffffff7d] rounded-full cursor-pointer"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  Overview
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  as="textarea"
                                  value={formData.serviceSummary}
                                  placeholder="Summary or short description paragraph"
                                  rows={3}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "serviceSummary",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="font-semibold">
                                  General Info
                                </Form.Label>
                                <Form.Control
                                  className="font-normal"
                                  as="textarea"
                                  value={formData.generalInfo}
                                  placeholder="large paragraph to add all details"
                                  rows={3}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "generalInfo",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>
                            </div>
                          </>
                        )}
                        {activeStep === 2 && (
                          <>
                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                What's Included
                              </Form.Label>
                              <div className="flex">
                                <Form.Control
                                  type="text"
                                  placeholder="Add feature"
                                  value={newFeature}
                                  onChange={(e) =>
                                    setNewFeature(e.target.value)
                                  }
                                />
                                <Button
                                  variant="contained"
                                  onClick={handleAddFeature}
                                  className="ml-2"
                                >
                                  Add
                                </Button>
                              </div>
                              <div className="mt-2 flex items-center justify-start">
                                {whatsIncluded.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center mb-1 mx-2"
                                  >
                                    <span className="mr-2">{item}</span>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleRemoveFeature(index)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="font-semibold">
                                Why Choose this
                              </Form.Label>
                              <Form.Control
                                className="font-normal"
                                as="textarea"
                                value={formData.whyChoose}
                                placeholder="Share any information about property"
                                rows={3}
                                onChange={(e) =>
                                  handleInputChange("whyChoose", e.target.value)
                                }
                              />
                            </Form.Group>
                          </>
                        )}

                        {activeStep === 3 && (
                          <>
                            <FaqMain
                              faqs={faqs}
                              questionInput={questionInput}
                              setQuestionInput={setQuestionInput}
                              answerInput={answerInput}
                              setAnswerInput={setAnswerInput}
                              handleAddFAQ={handleAddFAQ}
                            />
                          </>
                        )}

                        {activeStep === 4 && (
                          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] mt-3 m-auto">
                            <div className="flex align-items-center">
                              <p className="text-gray-600 font-normal bg-black p-2 text-white rounded-2xl mr-4">
                                {formData.PropertyNeed}
                              </p>
                              <div>
                                <h2 className="text-sm font-bold m-0 text-black">
                                  {listingCate}
                                </h2>
                                <p className="text-gray-600 font-normal">
                                  {formData.title}
                                </p>
                              </div>
                            </div>

                            <div
                              className="h-60 flex items-center justify-center object-cover h-[145px] rounded-2xl w-full"
                              style={{
                                backgroundImage: `url(${
                                  formData.displayImages?.[0]
                                    ? typeof formData.displayImages[0] ===
                                      "string"
                                      ? `https://homestyleserver.xcelsz.com${formData.displayImages[0]}`
                                      : formData.displayImages[0] instanceof
                                        File
                                      ? URL.createObjectURL(
                                          formData.displayImages[0]
                                        )
                                      : "fallback-image-url.jpg"
                                    : "fallback-image-url.jpg"
                                })`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            ></div>

                            <div className="mt-1 text-sm">
                              <div className="flex items-center justify-between py-2">
                                <h6 className="flex items-center text-md font-medium mb-0">
                                  <span className="w-2 h-2 rounded-full bg-[orange] mr-2 flex" />{" "}
                                  {formData.total_minutes_read} min Read
                                </h6>
                                <button className="font-medium">
                                  Buy{" "}
                                  {listingCate === "Property Guide"
                                    ? "Guide"
                                    : "News"}
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <h2 className="mb-1 text-xs">{formData.title}</h2>
                            </div>

                             <button className="flex items-center justify-center w-full py-2.5 mb-2 text-md text-center text-white bg-black/90 rounded-full hover:bg-black transtion-smooth active:opacity-10">
                              View More
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                      <Button
                        color="green"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      <Box sx={{ flex: "1 1 auto" }} />

                      {activeStep === steps.length - 1 ? (
                        <button type="submit" className="btn btn-primary">
                          Submit
                        </button>
                      ) : (
                        <Button onClick={handleNext}>Next</Button>
                      )}
                    </Box>
                  </Form>
                </React.Fragment>
              )}
            </Box>
          </Modal.Body>
        </Modal>
      </Container>
    </article>
  );
};

export default Modals;
