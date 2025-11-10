import React, { useEffect, useState, useRef } from "react";
// import { Modal,Row, Col, Card,Button, Container,Form } from '@themesberg/react-bootstrap';
import app from "../../utils/api"
import PropertyModel from "./PropertyModel";

import {
  Modal,
  Row,
  Col,
  Card,
  Button,
  Container,
  Form,
} from "react-bootstrap";

import { PictureAsPdf, Image } from "@mui/icons-material"; // Correct named imports for Material UI icons

import CloseIcon from "@mui/icons-material/Close";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
// import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";

import axios from "axios";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import L from "leaflet"; // Make sure you have Leaflet installed: npm install leaflet

import bathroonIcon from "../../assets/bathroom.png";
import childIcon from "../../assets/bedroom_child.png";
import garageIcon from "../../assets/garage_home.png";
import squreIcon from "../../assets/square_foot.png";
import duotone from "../../assets/Pin_alt_duotone.png";
import kitchenIcon from "../../assets/kitchen.png";
import livingIcon from "../../assets/living.png";

import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

import FAQ from "../FAQ";

import FaqMain from "../FaqMain";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
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

const steps = ["Type", "Details", "Features", "faqs", "Preview"];

// Validation Schemas for each step
const validationSchema = Yup.object({
  listingType: Yup.string().required("Listing type is required."),
  listingCate: Yup.string().required("Listing category is required."),
  propertyNeed: Yup.string().when("listingType", {
    is: "Property Listings",
    then: Yup.string().required("Property need is required."),
  }),
});

// Initial form values
const initialValues = {
  listingType: "",
  listingCate: "",
  propertyNeed: "",
};

const AddonsModel = ({
  setShowDefault,
  handleClose,
  showDefault,
  notify,
  editdata,
  editId,
}) => {
  const recievedData = editdata;
  console.log("====================================");
  console.log(recievedData);
  console.log("====================================");
  const recievedAmenities = recievedData?.propertyAmenities?.length
    ? recievedData.propertyAmenities[0]
    : null;
  const recievedPropertyDetails = recievedData?.propertyDetails?.length
    ? recievedData.propertyDetails[0]
    : recievedData?.serviceDetails?.length
    ? recievedData.serviceDetails[0]
    : null;

  const recievedPropertyFloor = recievedData?.propertyFloorPlans || []; // Ensure it's an array
  const recievedPropertyImage = recievedData?.propertyImages?.length
    ? recievedData.propertyImages.map((image) => image.imageUrl)
    : [];

  const mapRef = useRef(null); // Reference to the map instance
  const mapContainerRef = useRef(null); // Reference to the map container DOM element
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const [faqs, setFaqs] = useState(recievedPropertyDetails?.faq || []); // State to store the list of FAQs
  const [questionInput, setQuestionInput] = useState(""); // State for FAQ question
  const [answerInput, setAnswerInput] = useState(""); // State for FAQ answer

  const [amenities, setAmenities] = useState(
    recievedAmenities?.amenitiesData || []
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

  const [whatsIncluded, setWhatsIncluded] = useState([]);
  const [newFeature, setNewFeature] = useState("");

  const [expanded, setExpanded] = React.useState("panel1");

    const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [listingType, setListingType] = useState(
    recievedPropertyDetails?.service_type
      ? `${recievedPropertyDetails.service_type} Listings`
      : "Addons Listings"
  );
  const [listingCate, setListingCate] = useState(
    recievedPropertyDetails?.category || ""
  );
  const [imageUrl, setImageUrl] = useState(
    recievedPropertyDetails?.displayImage || ""
  );
  const [prevImageUrl, setPrevImageUrl] = useState(null);

  // const [formData, setFormData] = useState({});
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
    keywords: [],
    paymentOptions: recievedPropertyDetails?.payment_options || [],
    landmarks: [],
    displayImages: recievedPropertyImage || [],
    location: {
      latitude:
        recievedPropertyDetails?.location?.latitude || "5.605052121404785",
      longitude:
        recievedPropertyDetails?.location?.longitude || "-360.23620605468756",
    },
    features: [],
    serviceDetails: recievedPropertyDetails?.service_details || "",
    status: "unpublished",
    listingType: "Addons Listings",
    PropertyNeed: recievedPropertyDetails?.PropertyNeed || "",
    generalInfo: recievedPropertyDetails?.generalInfo || "",
    propertyAmenities: recievedPropertyDetails?.propertyAmenities || [],
    bedroom: recievedPropertyDetails?.bedRoom || "",
    bathroom: recievedPropertyDetails?.bathRoom || "",
    parking: recievedPropertyDetails?.parking || "",
    propertySize: recievedPropertyDetails?.size || "",
    paragraphs: [],
    total_minutes_read: "",
    whyChoose: "",
  });

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


  useEffect(()=>{
    console.log('====================================');
    console.log(whatsIncluded);
    console.log('====================================');
  },[whatsIncluded])



  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true)

    const requestBody = new FormData();
    let url = "";
    const method = Object.entries(recievedData).length !== 0 ? "PUT" : "POST"; // Use PUT if updating, otherwise POST
    if (Object.entries(recievedData).length !== 0) {
      url = `${app.baseurl}/listings/edit-listing`; // Unified endpoint
      requestBody.append("listingId", editId);
    } else {
      url = `${app.baseurl}/listings/listing`; // Unified endpoint
    }
    // /edit-listing

    console.log("=================let url ===================");
    console.log(url);
    console.log("====================================");

    requestBody.append("listingType", listingType.split(" ")[0]); // Extracts "Property" or "Service"
    requestBody.append("title", formData.title);
    requestBody.append("subtitle", formData.subtitle);
    requestBody.append("serviceCategory", formData.serviceCategory);
    requestBody.append("serviceLocation", formData.serviceLocation);
    requestBody.append("status", "unpublished");
    requestBody.append("serviceSummary", formData.serviceSummary);
    requestBody.append("serviceDetails", formData.serviceDetails);
    requestBody.append("price", parseInt(formData.price, 10));

    // Append media
    if (formData.displayImage) {
      requestBody.append("media", formData.displayImage);
    }

    // Append FAQ data
    if (faqs && faqs.length > 0) {
      requestBody.append("faq", JSON.stringify(faqs));
    }

    // Additional fields for **Property Listings**
    if (listingType === "Property Listings") {
      requestBody.append("category", listingCate);
      requestBody.append("PropertyNeed", formData.PropertyNeed);
      requestBody.append("generalInfo", formData.generalInfo);
      requestBody.append("features", JSON.stringify(formData.features));
      requestBody.append("localAmenities", JSON.stringify(amenities));
      requestBody.append(
        "propertyAmenities",
        JSON.stringify(formData.propertyAmenities)
      );
      requestBody.append("location", JSON.stringify(formData.location));
      requestBody.append(
        "paymentOptions",
        JSON.stringify(formData.paymentOptions)
      );
      requestBody.append("size", formData.propertySize);
      requestBody.append("bathRoom", formData.bathroom);
      requestBody.append("bedRoom", formData.bedroom);
      requestBody.append("parking", formData.parking);
      requestBody.append("area", formData.serviceLocation);

      // Append images
      if (formData.displayImages && formData.displayImages.length > 0) {
        formData.displayImages.forEach((image) => {
          requestBody.append("media", image);
        });
      }

      // Append floor plans
      if (planFiles && planFiles.length > 0) {
        planFiles.forEach((file) => {
          requestBody.append("floorPlans", file);
        });
      }

      // Append video links
      if (videoLinks && videoLinks.length > 0) {
        requestBody.append("videoLinks", JSON.stringify(videoLinks));
      }
    }

    if (listingType === "Resource Listings") {
      requestBody.append("category", listingCate);
      requestBody.append("total_minutes_read", formData.total_minutes_read);
      requestBody.append("paragraphs", formData.paragraphs);

      if (formData.displayImages && formData.displayImages.length > 0) {
        formData.displayImages.forEach((image) => {
          requestBody.append("media", image);
        });
      }
    }

    if (listingType === "Addons Listings") {
      requestBody.append("category", listingCate);
      requestBody.append("whatsIncluded", whatsIncluded);
      requestBody.append("whyChoose", formData.whyChoose);
   

      if (formData.displayImages && formData.displayImages.length > 0) {
        formData.displayImages.forEach((image) => {
          requestBody.append("media", image);
        });
      }
    }

    // Log FormData for debugging
    for (const [key, value] of requestBody.entries()) {
      console.log(`${key}:`, value);
    }

    // Submit request
    try {
      // const response = await axios.post(url, requestBody, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      const response = await axios({
        method,
        url,
        data: requestBody,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        handleClose();
        notify(`${listingType} listing posted successfully`);
        setIsSubmitting(false)
      } else {
        console.log("====================================");
        console.log(response);
        console.log("====================================");
        alert(`Failed to post ${listingType} listing.`);
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred while posting the ${listingType} listing.`);
      setIsSubmitting(false)
    }
  };

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
      if (field === "propertyAmenities") {
        const updatedAmenities = isChecked
          ? [...prev[field], value]
          : prev[field].filter((amenity) => amenity !== value);

        return {
          ...prev,
          propertyAmenities: updatedAmenities,
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
    "Addons Listings": ["Cleaning", "Transportation", "Things to Do", "Food"],
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

  useEffect(() => {
    // If the map container is not rendered, do nothing
    if (!mapContainerRef.current) {
      return;
    }

    // Destroy the existing map instance if present
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize a new map instance
    mapRef.current = L.map(mapContainerRef.current).setView(
      [
        parseFloat(settings.map_marker[settings.center_index].lat),
        parseFloat(settings.map_marker[settings.center_index].lng),
      ],
      parseInt(settings.map_zoom)
    );

    // Add tile layer (e.g., OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add markers dynamically
    settings.map_marker.forEach((marker) => {
      const customIcon = L.icon({
        iconUrl: marker.customIconUrl,
        iconSize: [
          parseInt(marker.customIconWidth),
          parseInt(marker.customIconHeight),
        ],
      });

      L.marker([parseFloat(marker.lat), parseFloat(marker.lng)], {
        icon: customIcon,
      })
        .addTo(mapRef.current)
        .bindPopup(marker.content);
    });

    // Add click listener to the map
    mapRef.current.on("click", (e) => {
      console.log("=========dbkcxc,bnzcmzn===========================");
      console.log(e);
      console.log("====================================");
      const { lat, lng } = e.latlng;
      handleInputChange("location", {
        latitude: lat,
        longitude: lng,
      });
      // console.log(`Clicked Location: Latitude ${lat}, Longitude ${lng}`);
      // alert(`You clicked at Latitude: ${lat}, Longitude: ${lng}`);
    });

    // Cleanup function to remove the map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainerRef, settings]); // Dependencies include settings and render condition

  // Handle file selection and filtering out duplicates
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      (file) => !planFiles.some((f) => f.name === file.name) // Check for duplicate file names
    );

    if (uniqueFiles.length > 0) {
      setPlanfiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
    } else {
      alert("You have already uploaded this file.");
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileName) => {
    setPlanfiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  // Handle adding a new amenity with distance to the list
  const handleAddAmenity = () => {
    if (
      amenityInput &&
      distanceInput &&
      !isNaN(distanceInput) &&
      !amenities.some((item) => item.name === amenityInput)
    ) {
      setAmenities((prevAmenities) => [
        ...prevAmenities,
        { name: amenityInput, distance: distanceInput },
      ]);
      setAmenityInput(""); // Clear the amenity input field after adding
      setDistanceInput(""); // Clear the distance input field after adding
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

  // const [formData, setFormData] = useState({
  //   title: "",
  //   subtitle: "",
  //   total_minutes_read: "",
  //   overview: "",
  //   category: "",
  //   label: "",
  //   images: [],
  //   paragraphs: [],
  // });

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
                  const stepProps = {};
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
                      {/* // "Property Listings": ["Short-Let", "Rent", "Buy", "Invest"], */}

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
                    {listingType === "Addons Listings" && (
                      <>
                        {activeStep === 1 && (
                          <>
                            <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                              {/* Title for the Listing */}
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

                              {/* Subtitle */}
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
                                  multiple // This allows for multiple file uploads
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
                                          })`, // Check if it's a URL or File
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
                              {/* Service Summary */}
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
                        <Form.Group className="mt-3">
        <Form.Label className="font-semibold">What's Included</Form.Label>
        <div className="flex">
          <Form.Control
            type="text"
            placeholder="Add feature"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
          />
          <Button variant="primary" onClick={handleAddFeature} className="ml-2">
            Add
          </Button>
        </div>
        <div className="mt-0 grid grid-cols-4 gap-2 justify-center mb-2 mt-2">
          {whatsIncluded.map((item, index) => (
            <div key={index} className="flex items-center mb-1 mx-2 relative border rounded p-2 mx">
              <span className="mr-2 truncate max-w-[100px]">{item}</span>
              {/* <Button variant="danger" size="sm" onClick={() => handleRemoveFeature(index)}>
                Remove
              </Button> */}
              <CloseIcon
                onClick={() =>
                  handleRemoveFeature(index)
                }
                className="absolute top-2 right-0 text-red-500 mr-2 bg-[#00000042] rounded-full cursor-pointer"
              />
            </div>
          ))}
        </div>
      </Form.Group>
                            {/* Why Choose this */}

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
                                  handleInputChange(
                                    "whyChoose",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </>
                        )}

                        {activeStep === 3 && (
                          <>
                            {/* <Form>
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
                              <FAQ questionsAndAnswers={faqs} />
                            </Form.Group>
                          </Form> */}
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
                              {/* <p className="text-gray-600 font-normal bg-black p-2 text-white rounded-2xl mr-4">
                                {'Addons'}
                              </p> */}
                              <div>
                                <h2 className="text-sm font-bold m-0 text-black">
                                  {listingCate} Addons
                                </h2>
                                <p className="text-gray-600 font-normal">
                                  {formData.subtitle}
                                </p>
                              </div>
                            </div>

                            <div
                              className="h-40 flex items-center justify-center rounded-md mb-2"
                              style={{
                                // backgroundImage: `url(${URL.createObjectURL(
                                //   formData.displayImages[0]
                                // )})`,
                                backgroundImage: `url(${
                                  typeof formData.displayImages[0] === "string"
                                    ? `https://homestyleserver.xcelsz.com${formData.displayImages[0]}`
                                    : URL.createObjectURL(
                                        formData.displayImages[0]
                                      )
                                })`, // Check if it's a URL or File
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            ></div>

                           
                            <p className="mb-0 text-md font-bold">What's included</p>
                            <div className="mt-0 grid grid-cols-3 gap-2 justify-center mb-2">
                              {whatsIncluded.map((value,index)=>{
                                return(
                                  <span className="text-gray-600 text-sm truncate max-w-[120px] capitalize">- {value}</span>

                                )
                              })}
                            </div>
                            
                           
                            <p className="mb-0 text-md font-bold">why Choose</p>
                            <p className="text-gray-600 text-sm truncate max-w-[350px] capitalize">
                              - {formData.whyChoose}
                            </p>

                            <button
                              disabled
                              className="bg-black text-white rounded mt-2 py-2 w-full"
                            >
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
                        // <button type="submit" className="btn btn-primary">
                        //   Submit
                        // </button>
                        <>
                    {isSubmitting?
                      <button type="button" className="btn btn-primary" disabled>
                        loading ....
                      </button>
                      :
                      <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                    }
                    
                    </>

                        
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

export default AddonsModel;
