// src/utils/formData.js
export const createPropertyFormData = (formData, listingType, listingCate, editId) => {
  const requestBody = new FormData();
  const type = listingType.split(" ")[0];

  if (editId) requestBody.append("listingId", editId);
  requestBody.append("listingType", type);
  requestBody.append("title", formData.title);
  requestBody.append("subtitle", formData.subtitle);
  requestBody.append("serviceCategory", formData.serviceCategory);
  requestBody.append("serviceLocation", formData.serviceLocation);
  requestBody.append("status", "unpublished");
  requestBody.append("serviceSummary", formData.serviceSummary);
  requestBody.append("serviceDetails", formData.serviceDetails);
  requestBody.append("price", parseInt(formData.price, 10).toString());

  if (formData.displayImage) requestBody.append("media", formData.displayImage);
  if (formData.faqs?.length > 0) requestBody.append("faq", JSON.stringify(formData.faqs));

  if (type === "Property") {
    requestBody.append("category", listingCate);
    requestBody.append("PropertyNeed", formData.PropertyNeed);
    requestBody.append("generalInfo", formData.generalInfo);
    requestBody.append("features", JSON.stringify(formData.features));
    requestBody.append("localAmenities", JSON.stringify(formData.amenities));
    requestBody.append("propertyAmenities", JSON.stringify(formData.propertyAmenities));
    requestBody.append("location", JSON.stringify(formData.location));
    requestBody.append("paymentOptions", JSON.stringify(formData.paymentOptions));
    requestBody.append("size", formData.propertySize);
    requestBody.append("bathRoom", formData.bathroom);
    requestBody.append("bedRoom", formData.bedroom);
    requestBody.append("parking", formData.parking);
    requestBody.append("area", formData.serviceLocation);
    requestBody.append("occupancy", formData.occupancy);
    requestBody.append("propertyUsage", formData.propertyUsage);
    requestBody.append("total", formData.total);
    requestBody.append("propertyPrice", JSON.stringify(formData.propertyPrice));
    requestBody.append("propertyTax", JSON.stringify(formData.propertyTax));
    requestBody.append("risks", JSON.stringify(formData.risks));
    requestBody.append("tenures", JSON.stringify(formData.tenures));
    requestBody.append("registrations", JSON.stringify(formData.registrations));
    requestBody.append("salesPrice", JSON.stringify(formData.salesPrice));
    requestBody.append("ownership", JSON.stringify(formData.ownership));
    requestBody.append("roads", JSON.stringify(formData.roads));
    requestBody.append("serviceLevel", JSON.stringify(formData.serviceLevel));
    requestBody.append("Cancellation", JSON.stringify(formData.Cancellation));
    requestBody.append("commissionOffice", JSON.stringify(formData.commissionOffice));

    if (formData.displayImages?.length > 0) {
      formData.displayImages.forEach((image) => requestBody.append("media", image));
    }
    if (formData.frontImage) requestBody.append("frontMedia", formData.frontImage);
    if (formData.floorPlans?.length > 0) {
      formData.floorPlans.forEach((file) => requestBody.append("floorPlans", file));
    }
    if (formData.ownership?.length > 0) {
      formData.ownership.forEach((file) => requestBody.append("ownership", file));
    }
    if (formData.videoLinks?.length > 0) {
      requestBody.append("videoLinks", JSON.stringify(formData.videoLinks));
    }
  }

  return requestBody;
};