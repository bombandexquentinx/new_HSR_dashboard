import React, { useEffect } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Image as ReactImage,
} from "react-bootstrap";
import { Stepper, Step, StepLabel } from "@mui/material";
import axios from "axios";
import duotone from "../../assets/Pin_alt_duotone.png";
import CloseIcon from "@mui/icons-material/Close";
import app from "../../utils/api";

const wordCountValidator = (value) => {
  if (!value) return true;
  return value.split(/\s+/).length <= 30;
};

const validationSchema = Yup.object().shape({
  listingCate: Yup.string().required("Category is required"),
  title: Yup.string()
    .test("word-count", "Maximum 30 words", wordCountValidator)
    .required("Title is required"),
  subtitle: Yup.string()
    .test("word-count", "Maximum 30 words", wordCountValidator)
    .required("Subtitle is required"),
  serviceLocation: Yup.string().required("Service area is required"),
  displayImages: Yup.array().min(5, "Minimum 5 images required").nullable(), // Ensures validation works correctly
  serviceSummary: Yup.string().required("Overview is required"),
  keyFeatures: Yup.array()
    .max(4, "Maximum 4 features")
    .min(1, "At least one feature required"),
  whatsIncluded: Yup.array()
    .max(4, "Maximum 4 items")
    .min(1, "At least one item required"),
  whatsIncludedDetails: Yup.string().required("Detailed summary is required"),
  expectedOutcome: Yup.array()
    .max(10, "Maximum 10 items")
    .min(1, "At least one outcome required"),
  pricingOption: Yup.string().required("Pricing option is required"),
  price: Yup.number().when("pricingOption", {
    is: "price",
    then: (schema) =>
      schema
        .required("Price is required")
        .positive("Price must be a positive number"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  faqs: Yup.array().of(
    Yup.object().shape({
      question: Yup.string().required("Question required"),
      answer: Yup.string().required("Answer required"),
    })
  ),
});

const ServiceModel = ({
  handleClose,
  showDefault,
  notify,
  editdata,
  editId,
  refresh,
}) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "https://homestyleserver.xcelsz.com";
  const [activeStep, setActiveStep] = React.useState(0);
  const [imagePreviews, setImagePreviews] = React.useState([]);
  const [newFaq, setNewFaq] = React.useState({ question: "", answer: "" });

  const steps = ["Type", "Details", "Features", "FAQs", "Preview"];

  useEffect(() => {
    if (editdata && editdata.media) {
      setImagePreviews(editdata.media);
    }
  }, [editdata]);

  function convertToArray(value) {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim());
    }
    return Array.isArray(value) ? value : [];
  }

  const getPreviewUrl = (preview) => {
    if (typeof preview === "string" && preview.startsWith("/uploads")) {
      return `https://homestyleserver.xcelsz.com${preview}`;
    }
    return preview;
  };

  const initialValues = {
    listingCate: editdata?.serviceCategory || "",
    title: editdata?.title || "",
    subtitle: editdata?.subtitle || "",
    serviceLocation: editdata?.serviceLocation || "",
    displayImages: editdata?.media || [],
    serviceSummary: editdata?.serviceSummary || "",
    keyFeatures: convertToArray(editdata?.keyFeatures) || [],
    whatsIncluded: convertToArray(editdata?.whatsIncluded) || [],
    whatsIncludedDetails: editdata?.whatsIncludedDetails || "",
    expectedOutcome: convertToArray(editdata?.expectedOutcome) || [],
    faqs: editdata?.faq || [],
    pricingOption: editdata?.requestQuote ? "quote" : "price",
    price: editdata?.price || "",
  };

  const handleImageChange = (event, setFieldValue, values) => {
    const files = Array.from(event.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setFieldValue("displayImages", [...values.displayImages, ...files]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index, setFieldValue, values) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
    const updatedImages = values.displayImages.filter((_, i) => i !== index);
    setFieldValue("displayImages", updatedImages);
  };

  useEffect(() => {
    return () => imagePreviews.forEach(URL.revokeObjectURL);
  }, [imagePreviews]);

  const handleSubmitForm = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("listingType", "Service");
      formData.append("title", values.title);
      formData.append("subtitle", values.subtitle);
      formData.append("serviceCategory", values.listingCate);
      formData.append("serviceLocation", values.serviceLocation);
      formData.append("status", "unpublished");
      formData.append("serviceSummary", values.serviceSummary);
      formData.append("whatsIncludedDetails", values.whatsIncludedDetails);
      formData.append("keyFeatures", values.keyFeatures);
      formData.append("whatsIncluded", values.whatsIncluded);
      formData.append("expectedOutcome", values.expectedOutcome);

      if (values.pricingOption === "price") {
        formData.append("price", values.price);
      } else {
        formData.append("requestQuote", true);
      }

      if (values.faqs && values.faqs.length > 0) {
        formData.append("faq", JSON.stringify(values.faqs));
      }

      if (values.displayImages && values.displayImages.length > 0) {
        values.displayImages.forEach((image) => {
          formData.append("media", image);
        });
      }

      const url = editdata
        ? `${baseUrl}/listings/edit-listing/${editId}`
        : `${baseUrl}/listings/listing`;

      if (editdata) {
        await axios.put(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Listing edited successfully!");
        resetForm();
        refresh(); // Trigger table reload
        handleClose();
      } else {
        await axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Listing saved successfully!");
        resetForm();
        refresh(); // Trigger table reload
        handleClose();
      }
    } catch (error) {
      toast.error("Error saving listing");
      console.error("Submission error:", error);
    } finally {
      // setSubmitting(false);
    }
  };

  return (
    <Modal show={showDefault} onHide={handleClose} size="md" centered>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm}
        validateOnBlur={false}
      >
        {({
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit} className="needs-validation">
            <Modal.Header closeButton className="border-0 pb-0">
              <h5 className="fw-bold text-md">
                Create Service Listing : {values.listingCate || ""}
              </h5>
            </Modal.Header>

            <Modal.Body>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                className="mb-4"
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 0 && (
                <div className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Service Category</Form.Label>
                    <Field
                      as="select"
                      name="listingCate"
                      className={`form-select ${
                        errors.listingCate &&
                        touched.listingCate &&
                        "is-invalid"
                      }`}
                    >
                      <option value="">Select Category</option>
                      {[
                        "Property Management",
                        "Property Sales",
                        "Interior Decor",
                        "Project Management",
                        "Property Valuation",
                        "Land Registration",
                        "Property Consultancy",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="listingCate"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                </div>
              )}

              {activeStep === 1 && (
                <div className="mt-3">
                  <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                    <Form.Group className="mb-0">
                      <Form.Label>Title (max 30 words)</Form.Label>
                      <Field
                        name="title"
                        className={`form-control ${
                          errors.title && touched.title && "is-invalid"
                        }`}
                      />
                      <ErrorMessage
                        name="title"
                        component="div"
                        className="text-danger small"
                      />
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Label>Subtitle (max 30 words)</Form.Label>
                      <Field
                        name="subtitle"
                        className={`form-control ${
                          errors.subtitle && touched.subtitle && "is-invalid"
                        }`}
                      />
                      <ErrorMessage
                        name="subtitle"
                        component="div"
                        className="text-danger small"
                      />
                    </Form.Group>
                  </div>
                  <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3">
                    <Form.Group className="mb-0">
                      <Form.Label>Service Area</Form.Label>
                      <Field
                        name="serviceLocation"
                        className={`form-control ${
                          errors.serviceLocation &&
                          touched.serviceLocation &&
                          "is-invalid"
                        }`}
                      />
                      <ErrorMessage
                        name="serviceLocation"
                        component="div"
                        className="text-danger small"
                      />
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Label>Key Features (max 4)</Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        <Field
                          name="newFeature"
                          className="form-control"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && values.newFeature) {
                              setFieldValue("keyFeatures", [
                                ...values.keyFeatures,
                                values.newFeature,
                              ]);
                              setFieldValue("newFeature", "");
                            }
                          }}
                        />
                        <Button
                          variant="outline-primary"
                          onClick={() => {
                            if (values.newFeature) {
                              setFieldValue("keyFeatures", [
                                ...values.keyFeatures,
                                values.newFeature,
                              ]);
                              setFieldValue("newFeature", "");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <ErrorMessage
                        name="keyFeatures"
                        component="div"
                        className="text-danger small"
                      />
                    </Form.Group>
                  </div>
                  <div className="d-flex flex-wrap gap-2 m-2">
                    {values.keyFeatures.map((feature, index) => (
                      <div key={index} className="badge bg-primary p-2">
                        {feature}
                        <button
                          type="button"
                          className="ms-2 bg-transparent border-0 text-white"
                          onClick={() =>
                            setFieldValue(
                              "keyFeatures",
                              values.keyFeatures.filter((_, i) => i !== index)
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Pricing Option</Form.Label>
                    <div role="group" className="d-flex gap-3">
                      <label className="d-flex align-items-center">
                        <Field
                          type="radio"
                          name="pricingOption"
                          value="price"
                          className="me-2"
                        />
                        Set Price
                      </label>
                      <label className="d-flex align-items-center">
                        <Field
                          type="radio"
                          name="pricingOption"
                          value="quote"
                          className="me-2"
                        />
                        Request Quote
                      </label>
                    </div>
                    <ErrorMessage
                      name="pricingOption"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>

                  {values.pricingOption === "price" && (
                    <Form.Group className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <Field
                        type="number"
                        name="price"
                        className={`form-control ${
                          errors.price && touched.price && "is-invalid"
                        }`}
                      />
                      <ErrorMessage
                        name="price"
                        component="div"
                        className="text-danger small"
                      />
                    </Form.Group>
                  )}
                </div>
              )}

              {activeStep === 2 && (
                <div className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold">
                      Display Images (Min 5)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleImageChange(e, setFieldValue, values)
                      }
                      className={`${
                        errors.displayImages && touched.displayImages
                          ? "is-invalid"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      name="displayImages"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>

                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap items-center justify-start gap-2 mb-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative h-16 w-24 flex items-center justify-center rounded-md overflow-hidden"
                          style={{
                            backgroundImage: `url(${getPreviewUrl(preview)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <CloseIcon
                            onClick={() =>
                              removeImage(index, setFieldValue, values)
                            }
                            className="absolute top-1 right-1 text-red-500 bg-white rounded-full cursor-pointer p-0.5"
                            fontSize="small"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Service Overview</Form.Label>
                    <Field
                      as="textarea"
                      name="serviceSummary"
                      className={`form-control ${
                        errors.serviceSummary &&
                        touched.serviceSummary &&
                        "is-invalid"
                      }`}
                      rows={3}
                    />
                    <ErrorMessage
                      name="serviceSummary"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>What's Included</Form.Label>
                    <Field
                      as="textarea"
                      name="whatsIncludedDetails"
                      placeholder="Give a detailed summary of what's included "
                      className={`form-control ${
                        errors.whatsIncludedDetails &&
                        touched.whatsIncludedDetails &&
                        "is-invalid"
                      }`}
                      rows={3}
                    />
                    <ErrorMessage
                      name="whatsIncludedDetails"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    {/* <Form.Label>What's Included (max 4)</Form.Label> */}
                    <div className="d-flex gap-2 mb-2">
                      <Field
                        name="newIncluded"
                        className="form-control"
                        placeholder="key attributes"
                      />
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          if (
                            values.newIncluded &&
                            values.whatsIncluded.length < 4
                          ) {
                            setFieldValue("whatsIncluded", [
                              ...values.whatsIncluded,
                              values.newIncluded,
                            ]);
                            setFieldValue("newIncluded", "");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {values.whatsIncluded.map((item, index) => (
                        <div key={index} className="badge bg-success p-2">
                          {item}
                          <button
                            type="button"
                            className="ms-2 bg-transparent border-0 text-white"
                            onClick={() =>
                              setFieldValue(
                                "whatsIncluded",
                                values.whatsIncluded.filter(
                                  (_, i) => i !== index
                                )
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <ErrorMessage
                      name="whatsIncluded"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>

                  {/* <div className="columns-1 sm:columns-2 lg:columns-2 space-y-4 mt-3"> */}

                  <Form.Group className="mb-3">
                    <Form.Label>Expected Outcomes (max 10)</Form.Label>
                    <div className="d-flex gap-2 mb-2">
                      <Field
                        name="newOutcome"
                        className="form-control"
                        placeholder="key benefits"
                      />
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          if (
                            values.newOutcome &&
                            values.expectedOutcome.length < 10
                          ) {
                            setFieldValue("expectedOutcome", [
                              ...values.expectedOutcome,
                              values.newOutcome,
                            ]);
                            setFieldValue("newOutcome", "");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {values.expectedOutcome.map((item, index) => (
                        <div
                          key={index}
                          className="badge bg-warning text-dark p-2"
                        >
                          {item}
                          <button
                            type="button"
                            className="ms-2 bg-transparent border-0"
                            onClick={() =>
                              setFieldValue(
                                "expectedOutcome",
                                values.expectedOutcome.filter(
                                  (_, i) => i !== index
                                )
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <ErrorMessage
                      name="expectedOutcome"
                      component="div"
                      className="text-danger small"
                    />
                  </Form.Group>
                  {/* </div> */}
                </div>
              )}

              {activeStep === 3 && (
                <div className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Question</Form.Label>
                    <Field
                      name="faqs[].question"
                      className="form-control"
                      value={newFaq.question}
                      onChange={(e) =>
                        setNewFaq((p) => ({ ...p, question: e.target.value }))
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Answer</Form.Label>
                    <Field
                      as="textarea"
                      name="faqs[].answer"
                      className="form-control"
                      rows={3}
                      value={newFaq.answer}
                      onChange={(e) =>
                        setNewFaq((p) => ({ ...p, answer: e.target.value }))
                      }
                    />
                  </Form.Group>

                  <Button
                    variant="outline-primary"
                    className="mb-3"
                    onClick={() => {
                      if (newFaq.question && newFaq.answer) {
                        setFieldValue("faqs", [...values.faqs, newFaq]);
                        setNewFaq({ question: "", answer: "" });
                      }
                    }}
                  >
                    Add FAQ
                  </Button>

                  <div className="border-top pt-3">
                    {values.faqs.map((faq, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">Q: {faq.question}</h6>
                            <p className="mb-0">A: {faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              setFieldValue(
                                "faqs",
                                values.faqs.filter((_, i) => i !== index)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="bg-white rounded-lg shadow-lg p-4 mt-3 m-auto w-[400px]">
                  <div className="d-flex align-items-center mb-2">
                    <span className="bg-black text-white rounded-pill px-2 py-1 me-3 text-sm">
                      Service
                    </span>
                    <div>
                      <h5 className="mb-0 text-md fw-bold">
                        {values.listingCate}
                      </h5>
                      <p className="mb-0 text-muted">{values.title}</p>
                    </div>
                  </div>

                  {imagePreviews[0] && (
                    <div
                      className="rounded-lg mb-3"
                      style={{
                        height: "200px",
                        backgroundImage: `url(${imagePreviews[0]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}

                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={duotone}
                      alt="Location"
                      className="me-2"
                      style={{ width: "24px", height: "24px" }}
                    />
                    <span className="text-muted">{values.serviceLocation}</span>
                  </div>

                  {/* <p className="text-muted">{values.serviceSummary}</p> */}
                  <p className="mb-0 text-md font-bold">Key Features</p>
                  {/* <div className="mt-0 grid grid-cols-2 gap-2 justify-center mb-2"> */}
                  {values.keyFeatures.map((value, index) => {
                    return (
                      <p className="text-gray-600 text-sm capitalize mb-1">
                        - {value}
                      </p>
                    );
                  })}
                  {/* </div> */}

                  <button
                    disabled
                    className="bg-black text-white rounded mt-2 py-2 w-full"
                  >
                    View More
                  </button>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
              <Button
                variant="outline-secondary"
                onClick={() => setActiveStep((prev) => prev - 1)}
                disabled={activeStep === 0}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Listing"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    let isValid = true;
                    switch (activeStep) {
                      case 0:
                        isValid = values.listingCate;
                        break;
                      case 1:
                        isValid =
                          values.title &&
                          values.subtitle &&
                          values.serviceLocation &&
                          values.pricingOption &&
                          (values.pricingOption === "quote" ||
                            (values.pricingOption === "price" && values.price));
                        break;
                      case 2:
                        isValid =
                          values.displayImages.length >= 5 &&
                          values.serviceSummary &&
                          values.whatsIncludedDetails;
                        break;
                    }
                    isValid
                      ? setActiveStep((prev) => prev + 1)
                      : toast.error("Please complete all required fields");
                  }}
                >
                  Next
                </Button>
              )}
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ServiceModel;
