import React, { useState, useEffect, useCallback } from "react";
import app from "../utils/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
// import "preline/preline";

import { useDropzone } from "react-dropzone";

import TrustedPartnerCard from "../components/TrustedPartnerCard";
import TeamMemberCard from "../components/TeamMemberCard";
import AvailableJobCard from "../components/AvailableJobCard";

const apiBaseUrl = "https://homestyleserver.xcelsz.com/api";
const imageBaseUrl = "https://homestyleserver.xcelsz.com";

const categories = [
  "Trusted Partners",
  "Team Members",
  "Available Jobs",
  "Privacy Policy Terms",
  "Cookie Policy Terms",
  "Website Terms",
];

const initialFormState = {
  name: "",
  description: "",
  email: "",
  phone_number: "",
  website_url: "",
  title: "",
  location: "",
  salary: "",
  linkedin_url: "",
  bio: "",
  position: "",
  topic: "",
};

const Featured = () => {
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const [dropdownStates, setDropdownStates] = useState({});
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // For editing and previewing
  const [isEditing, setIsEditing] = useState(false); // To distinguish between add and edit modes

  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const toggleDropdown = (index) => {
    // setDropdownStates((prev) => ({ ...prev, [index]: !prev[index] }));
    setActiveDropdownIndex(activeDropdownIndex === index ? null : index);
  };

  const [formData, setFormData] = useState(initialFormState);
  // const [formData, setFormData] = useState({
  //   name: "",
  //   description: "",
  //   email: "",
  //   phone_number: "",
  //   website_url: "",
  //   is_trusted: true,
  //   title: "",
  //   location: "",
  //   salary: "",
  //   category: "",
  // });

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const [files, setFiles] = useState([]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      )
    );
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
    maxSize: 2 * 1024 * 1024, // 2MB limit
  });

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  // const { getRootProps, getInputProps } = useDropzone({
  //   onDrop,
  //   accept: "image/*",
  //   multiple: true,
  //   maxSize: 2 * 1024 * 1024, // 2MB limit
  // });

  const closeModel = () => {
    setShowModal(false);
    setIsEditing(false);
  };
  const closePrevModel = () => {
    setShowPreviewModal(false);
    setIsEditing(false);
  };

  // Fetch listings when activeTab changes
  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  // Reset form when modal is closed
  const resetForm = () => {
    setFormData(initialFormState);
    setFiles([]);
    setIsEditing(false);
    setSelectedItem(null);
  };

  // Open modal for adding new item
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const endpoints = {
    "Trusted Partners": "/partners/list",
    "Available Jobs": "/jobs/list",
    "Team Members": "/team/all",
    "Privacy Policy Terms": "/terms/list/Privacy Policy Terms",
    "Cookie Policy Terms": "/terms/list/Cookie Policy Terms",
    "Website Terms": "/terms/list/Website Terms",
  };
  const fetchListings = async () => {
    const endpoint = endpoints[activeTab] || "";
    if (!endpoint) return;
    try {
      const response = await api.get(`${endpoint}`);
      console.log("====================================");
      console.log(`${activeTab}:`, response.data);
      console.log("====================================");
      setListings(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "media") {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   let endpoint = "";

  //   const requestBody = new FormData();

  //   if (activeTab === "Trusted Partners") {
  //     endpoint = "/partners/add";
  //     requestBody.append("name", formData.name); // Extracts "Property" or "Service"
  //     requestBody.append("email", formData.email);
  //     requestBody.append("description", formData.description);
  //     requestBody.append("phone_number", formData.phone_number);
  //     requestBody.append("website_url", formData.website_url);
  //     requestBody.append("media", files[0]);
  //     requestBody.append("category", "trusted_partners"); // Specify upload folder

  //   } else if (activeTab === "Available Jobs") {
  //     endpoint = "/jobs/add";
  //   } else if (["Privacy Policy Terms", "Cookie Policy Terms", "Website Terms"].includes(activeTab)) {
  //     endpoint = "/terms/add";
  //     formData.category = activeTab;
  //   }else if (activeTab === "Team Members") {
  //     endpoint = "/team/add";
  //     requestBody.append("name", formData.name); // Extracts "Property" or "Service"
  //     requestBody.append("email", formData.email);
  //     requestBody.append("phone_number", formData.phone_number);
  //     requestBody.append("linkedin_url", formData.linkedin_url);
  //     requestBody.append("bio", formData.bio);
  //     requestBody.append("position", formData.position);
  //     requestBody.append("media", files[0]);
  //     requestBody.append("category", "team_members"); // Specify upload folder
  //   }

  //   for (const [key, value] of requestBody.entries()) {
  //     console.log(`${key}:`, value);
  //   }

  //   try {
  //     await api.post(`${endpoint}`, requestBody);
  //     fetchListings();
  //     setShowModal(false);
  //     setFormData({});
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //   }
  // };

  // Handle form submission
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   const formPayload = new FormData();
  //   let endpoint = apiBaseUrl;
  //   let method = "POST";

  //   if (isEditing) {
  //     method = "PUT";
  //     formPayload.append("id", selectedItem.id);
  //   }

  //   try {
  //     switch (activeTab) {
  //       case "Trusted Partners":
  //         endpoint += isEditing ? "/partners/update" : "/partners/add";
  //         formPayload.append("name", formData.name);
  //         formPayload.append("description", formData.description);
  //         formPayload.append("email", formData.email);
  //         formPayload.append("phone_number", formData.phone_number);
  //         formPayload.append("website_url", formData.website_url);
  //         if (files[0]) formPayload.append("media", files[0]);
  //         break;

  //       case "Team Members":
  //         endpoint += isEditing ? "/team/update" : "/team/add";
  //         formPayload.append("name", formData.name);
  //         formPayload.append("position", formData.position);
  //         formPayload.append("email", formData.email);
  //         formPayload.append("phone_number", formData.phone_number);
  //         formPayload.append("linkedin_url", formData.linkedin_url);
  //         formPayload.append("bio", formData.bio);
  //         if (files[0]) formPayload.append("media", files[0]);
  //         break;

  //       case "Available Jobs":
  //         endpoint += isEditing ? "/jobs/update" : "/jobs/add";
  //         formPayload.append("title", formData.title);
  //         formPayload.append("description", formData.description);
  //         formPayload.append("location", formData.location);
  //         formPayload.append("salary", formData.salary);
  //         break;

  //       default:
  //         endpoint += "/terms/add";
  //         formPayload.append("category", activeTab);
  //         formPayload.append("topic", formData.topic);
  //         formPayload.append("description", formData.description);

  //     }

  //     for (const [key, value] of formPayload.entries()) {
  //       console.log(`${key}:`, value);
  //     }

  //     await api({ method, url: endpoint, data: formPayload });
  //     fetchListings();
  //     setShowModal(false);
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //   } finally {
  //     setLoading(false);
  //     setFormData(initialFormState);
  //     setFiles([]);
  //     setIsEditing(false);
  //     setSelectedItem(null);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formPayload = new FormData();
    let endpoint = apiBaseUrl;
    let method = "POST";
  
    if (isEditing) {
      method = "PUT";
      formPayload.append("id", selectedItem.id);
    }
  
    try {
      switch (activeTab) {
        case "Trusted Partners":
          endpoint += isEditing ? "/partners/update" : "/partners/add";
          formPayload.append("name", formData.name);
          formPayload.append("description", formData.description);
          formPayload.append("email", formData.email);
          formPayload.append("phone_number", formData.phone_number);
          formPayload.append("website_url", formData.website_url);
          if (files[0]) formPayload.append("media", files[0]);
          break;
  
        case "Team Members":
          endpoint += isEditing ? "/team/update" : "/team/add";
          formPayload.append("name", formData.name);
          formPayload.append("position", formData.position);
          formPayload.append("email", formData.email);
          formPayload.append("phone_number", formData.phone_number);
          formPayload.append("linkedin_url", formData.linkedin_url);
          formPayload.append("bio", formData.bio);
          if (files[0]) formPayload.append("media", files[0]);
          break;
  
        case "Available Jobs":
          endpoint += isEditing ? "/jobs/update" : "/jobs/add";
          formPayload.append("title", formData.title);
          formPayload.append("description", formData.description);
          formPayload.append("location", formData.location);
          formPayload.append("salary", formData.salary);
          break;
  
        case "Privacy Policy Terms":
        case "Cookie Policy Terms":
        case "Website Terms":
          endpoint += "/terms/add";
          formPayload.append("category", activeTab);
          formPayload.append("topic", formData.topic);
          formPayload.append("description", formData.description);
          break;
  
        default:
          break;
      }
  
      // Debugging: Log FormData entries
      for (const [key, value] of formPayload.entries()) {
        console.log(`${key}:`, value);
      }
  
      await api({ method, url: endpoint, data: formPayload });
      fetchListings();
      setShowModal(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      setFormData(initialFormState);
      setFiles([]);
      setIsEditing(false);
      setSelectedItem(null);
    }
  };

  // Handle edit action
  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditing(true);
    setFormData(item);
    if (item.logo_url || item.profile_image_url) {
      setFiles([
        {
          name: "existing-image",
          preview: `${imageBaseUrl}/${item.logo_url || item.profile_image_url}`,
        },
      ]);
    }
    setShowModal(true);
  };

  // Handle delete action
  // const handleDelete = async (id) => {
  //   let endpoint ="";
  //   try {

  //     switch (activeTab) {
  //       case "Trusted Partners":
  //         endpoint = "/partners/delete";

  //         break;

  //       case "Team Members":

  //         break;

  //       case "Available Jobs":

  //         break;

  //       default:
  //         endpoint += "/terms/add";

  //     }
  //     await api.delete(`${endpoint}`, {
  //       data: { id: id } // Send the `id` in the request body
  //     });
  //     fetchListings();
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   }
  // };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      switch (activeTab) {
        case "Trusted Partners":
          endpoint = "/partners/delete";
          break;
        case "Team Members":
          endpoint = "/team/delete";
          break;
        case "Available Jobs":
          endpoint = "/jobs/delete";
          break;
        default:
          break;
      }
      await api.delete(`${endpoint}`, {
        data: { id: itemToDelete },
      });
      fetchListings();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Handle preview action
  const handlePreview = (item) => {
    setSelectedItem(item);
    setShowPreviewModal(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Close preview modal
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedItem(null);
    resetForm();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div class="sm:ml-64">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Manage Featured Listings
            </h2>

            <div className="flex space-x-4 border-b mb-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`py-2 px-4 text-sm font-medium rounded-t-lg focus:outline-none transition-all ${
                    activeTab === category
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <button
              className="bg-black text-white px-4 py-2 rounded-md shadow hover:bg-black transition"
              onClick={() => setShowModal(true)}
            >
              Add {activeTab}
            </button>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>

            {activeTab === "Available Jobs" && (
              <section className="bg-white">
                <div className="py-2 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6 ">
                  <div className="mx-auto max-w-screen-sm text-center mb-2 lg:mb-16">
                    <p className="font-light text-gray-500 lg:mb-16 sm:text-xl ">
                      Your Available Jobs
                    </p>
                  </div>
                  <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-3">
                    {listings.map((listing, index) => (
                      <div className="max-w-sm p-6 bg-white border relative rounded-lg shadow-sm">
                        <div className="flex justify-end px-0 pt-0 ">
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="inline-block text-gray-500 hover:bg-gray-100 rounded-lg text-sm p-1.5"
                            type="button"
                          >
                            <span className="sr-only">Open dropdown</span>
                            <svg
                              className="w-5 h-5"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 16 3"
                            >
                              <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdownIndex === index && (
                            <div className="absolute right-2 mt-8 w-36 bg-white border border-gray-200 rounded-lg shadow-sm ">
                              <ul className="p-2 pl-0 mb-0">
                                {/* <li className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black" onClick={() => handlePreview(listing)}><span>Preview</span></li> */}
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black"
                                  onClick={() => handleEdit(listing)}
                                >
                                  <span>Edit</span>
                                </li>
                                {/* <li className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black" ><span>Achieve</span></li> */}
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-[red]"
                                  onClick={() => handleDelete(listing.id)}
                                >
                                  <span>Delete</span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Job Details */}
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-black">
                          {listing.name || listing.title || listing.category}
                        </h5>
                        <p className="mb-3 font-normal text-gray-700">
                          {listing.description}
                        </p>
                        <p className="mb-3 font-normal text-[#a97e2b]">
                          GH {listing.salary}
                        </p>
                        <span
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-black rounded-lg hover:bg-black focus:ring-4 focus:outline-none focus:ring-black cursor-pointer"
                          onClick={() => handlePreview(listing)}
                        >
                          Read more
                          <svg
                            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                          </svg>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {activeTab === "Trusted Partners" && (
              <section className="bg-white ">
                <div className="py-2 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6 ">
                  <div className="mx-auto max-w-screen-sm text-center mb-2 lg:mb-16">
                    <p className="font-light text-gray-500 lg:mb-16 sm:text-xl">
                      Your Trusted Partners
                    </p>
                  </div>
                  <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-4">
                    {listings.map((listing, index) => (
                      <div className="items-center bg-gray-50 rounded-lg shadow relative">
                        <div className="flex justify-end px-0 pt-0  ">
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="inline-block text-gray-500 hover:bg-gray-100 rounded-lg text-sm p-1.5 mr-2"
                            type="button"
                          >
                            <span className="sr-only">Open dropdown</span>
                            <svg
                              className="w-5 h-5"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 16 3"
                            >
                              <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdownIndex === index && (
                            <div className="absolute right-2 mt-8 w-36 bg-white border border-gray-200 rounded-lg shadow-sm ">
                              <ul className="p-2 pl-0 mb-0">
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black"
                                  onClick={() => handlePreview(listing)}
                                >
                                  <span>Preview</span>
                                </li>
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black"
                                  onClick={() => handleEdit(listing)}
                                >
                                  <span>Edit</span>
                                </li>
                                {/* <li className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black" ><span>Achieve</span></li> */}
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-[red]"
                                  onClick={() => handleDelete(listing.id)}
                                >
                                  <span>Delete</span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="sm:flex p-2 justify-center">
                          <img
                            className="rounded-lg  w-[80px] h-[80px]"
                            src={`https://homestyleserver.xcelsz.com/${listing.logo_url}`}
                            alt="Bonnie Avatar"
                          />
                          <div className="p-2 ml-4 w-[80%]">
                            <h3 className="text-sm font-bold tracking-tight text-gray-900 truncate max-w-[150px]">
                              <span>
                                {listing.name ||
                                  listing.title ||
                                  listing.category}
                              </span>
                            </h3>
                            <p className="text-gray-500 text-sm truncate max-w-[150px]">
                              {listing.description}
                            </p>
                            {/* <span className="text-gray-500 text-sm"> {listing.description}</span> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {activeTab === "Team Members" && (
              <section className="bg-white ">
                <div className="py-2 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6 ">
                  <div className="mx-auto max-w-screen-sm text-center mb-2 lg:mb-16">
                    <p className="font-light text-gray-500 lg:mb-16 sm:text-xl">
                      Your Team Members
                    </p>
                  </div>
                  <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-4">
                    {listings.map((listing, index) => (
                      <div className="items-center bg-gray-50 rounded-lg shadow relative">
                        <div className="flex justify-end px-0 pt-0  ">
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="inline-block text-gray-500 hover:bg-gray-100 rounded-lg text-sm p-1.5 mr-2"
                            type="button"
                          >
                            <span className="sr-only">Open dropdown</span>
                            <svg
                              className="w-5 h-5"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 16 3"
                            >
                              <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdownIndex === index && (
                            <div className="absolute right-2 mt-8 w-36 bg-white border border-gray-200 rounded-lg shadow-sm ">
                              <ul className="p-2 pl-0 mb-0">
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black"
                                  onClick={() => handlePreview(listing)}
                                >
                                  <span>Preview</span>
                                </li>
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black"
                                  onClick={() => handleEdit(listing)}
                                >
                                  <span>Edit</span>
                                </li>
                                {/* <li className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-black" ><span>Achieve</span></li> */}
                                <li
                                  className="p-2 hover:bg-gray-100 rounded no-underline w-full cursor-pointer text-sm hover:text-[red]"
                                  onClick={() => handleDelete(listing.id)}
                                >
                                  <span>Delete</span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="sm:flex p-2 justify-between">
                          <img
                            className="rounded-lg sm:rounded-none sm:rounded-l-lg w-[100px] h-[100px]"
                            src={`https://homestyleserver.xcelsz.com/${listing.profile_image_url}`}
                            alt="Bonnie Avatar"
                          />
                          <div className="p-2">
                            <h3 className="text-sm font-bold tracking-tight text-gray-900">
                              <span>{listing.name}</span>
                            </h3>
                            <span className="text-gray-500 text-sm">
                              {" "}
                              {listing.position}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {activeTab === "Privacy Policy Terms" || activeTab === "Cookie Policy Terms" || activeTab === "Website Terms" && (
                <>
                
                </>
              )}

            {showDeleteConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg max-w-xs md:max-w-md w-full mx-2">
                  <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                  <p className="mb-4">
                    Are you sure you want to delete this item?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={confirmDelete}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {showModal && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 "
                style={{ zIndex: 10000 }}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg lg:w-[550px] relative">
                  <h3 className="text-lg font-semibold mb-4">
                    {isEditing ? "Edit" : "Add"} {activeTab}
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-x-circle"
                    viewBox="0 0 16 16"
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={closeModal}
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                  </svg>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {activeTab === "Available Jobs" && (
                      <>
                        <input
                          type="text"
                          name="title"
                          placeholder="Job Title"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={formData.title}
                        />
                        <textarea
                          name="description"
                          placeholder="Job Description"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={formData.description}
                        ></textarea>
                        <input
                          type="text"
                          name="location"
                          placeholder="Location"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={formData.location}
                        />
                        <input
                          type="number"
                          name="salary"
                          placeholder="Salary"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={formData.salary}
                        />
                      </>
                    )}

                    {activeTab === "Trusted Partners" && (
                      <>
                        <div className="grid gap-2 mb-2 md:grid-cols-2">
                          <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.name}
                          />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.email}
                          />
                          <input
                            type="text"
                            name="phone_number"
                            placeholder="Phone Number"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.phone_number}
                          />
                          <input
                            type="text"
                            name="website_url"
                            placeholder="Website URL"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.website_url}
                          />
                        </div>
                        {/* <input type="text" name="logo_url" placeholder="Logo URL" onChange={handleChange} className="border p-2 w-full rounded-md" /> */}
                        {/* <input name="media" className="border p-2 w-full rounded-md" aria-describedby="user_avatar_help" id="user_avatar" type="file" onChange={handleChange} /> */}
                        <div className="p-0">
                          {/* Drag-and-Drop Zone */}
                          <div
                            {...getRootProps()}
                            className="cursor-pointer p-12 flex justify-center bg-white border border-dashed border-gray-300 rounded-xl"
                          >
                            <input {...getInputProps()} />
                            <div className="text-center">
                              <svg
                                className="w-16 text-gray-400 mx-auto"
                                width="70"
                                height="46"
                                viewBox="0 0 70 46"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.05172 9.36853L17.2131 7.5083V41.3608L12.3018 42.3947C9.01306 43.0871 5.79705 40.9434 5.17081 37.6414L1.14319 16.4049C0.515988 13.0978 2.73148 9.92191 6.05172 9.36853Z"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="fill-white stroke-gray-400"
                                ></path>
                                <path
                                  d="M63.9483 9.36853L52.7869 7.5083V41.3608L57.6982 42.3947C60.9869 43.0871 64.203 40.9434 64.8292 37.6414L68.8568 16.4049C69.484 13.0978 67.2685 9.92191 63.9483 9.36853Z"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="fill-white stroke-gray-400"
                                ></path>
                                <rect
                                  x="17.0656"
                                  y="1.62305"
                                  width="35.8689"
                                  height="42.7541"
                                  rx="5"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="fill-white stroke-gray-400"
                                ></rect>
                              </svg>

                              <div className="mt-4 flex flex-wrap justify-center text-sm leading-6 text-gray-600">
                                <span className="pe-1 font-medium text-gray-800">
                                  Drop your file here or
                                </span>
                                <span className="bg-white font-semibold text-blue-600 hover:text-blue-700 rounded-lg decoration-2 hover:underline">
                                  browse
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-400">
                                Pick an image up to 2MB.
                              </p>
                            </div>
                          </div>

                          {/* Preview Section */}
                          <div className="mt-4 space-y-3">
                            {/* Show existing image URL when editing */}
                            {isEditing &&
                              selectedItem?.logo_url &&
                              !files.length && (
                                <div className="p-3 bg-white border border-gray-300 rounded-xl flex justify-between items-center">
                                  <div className="flex items-center gap-x-3">
                                    <img
                                      src={`${imageBaseUrl}/${selectedItem.logo_url}`}
                                      alt="Existing Image"
                                      className="size-16 rounded-lg"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-gray-800 truncate max-w-[250px]">
                                        Existing Image
                                      </p>
                                      <p className="text-xs text-gray-500 m-0">
                                        Upload a new file to replace this image.
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setFiles([])} // Clear existing image
                                    className="text-gray-500 hover:text-gray-800"
                                  >
                                    <svg
                                      className="size-4"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      <line
                                        x1="10"
                                        x2="10"
                                        y1="11"
                                        y2="17"
                                      ></line>
                                      <line
                                        x1="14"
                                        x2="14"
                                        y1="11"
                                        y2="17"
                                      ></line>
                                    </svg>
                                  </button>
                                </div>
                              )}

                            {/* Show uploaded files */}
                            {files.map((file) => (
                              <div
                                key={file.name}
                                className="p-3 bg-white border border-gray-300 rounded-xl flex justify-between items-center"
                              >
                                <div className="flex items-center gap-x-3">
                                  <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="size-16 rounded-lg"
                                    onLoad={() =>
                                      URL.revokeObjectURL(file.preview)
                                    }
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 truncate max-w-[250px]">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 m-0">
                                      {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.name)}
                                  className="text-gray-500 hover:text-gray-800"
                                >
                                  <svg
                                    className="size-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line
                                      x1="10"
                                      x2="10"
                                      y1="11"
                                      y2="17"
                                    ></line>
                                    <line
                                      x1="14"
                                      x2="14"
                                      y1="11"
                                      y2="17"
                                    ></line>
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <textarea
                          name="description"
                          placeholder="Description"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={formData.description}
                        ></textarea>
                      </>
                    )}
                    {activeTab === "Team Members" && (
                      <>
                        <div className="grid gap-2 mb-2 md:grid-cols-2">
                          <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.name}
                          />
                          <input
                            type="text"
                            name="position"
                            placeholder="Position"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.position}
                          />

                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.email}
                          />
                          <input
                            type="text"
                            name="phone_number"
                            placeholder="Phone Number"
                            onChange={handleChange}
                            className="border p-2 w-full rounded-md"
                            value={formData.phone_number}
                          />
                        </div>
                        {/* <input type="text" name="profile_image_url" placeholder="Profile Image URL" onChange={handleChange} className="border p-2 w-full rounded-md" /> */}

                        <textarea
                          name="bio"
                          placeholder="Bio"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={formData.bio}
                        ></textarea>
                        {/* <input name="media" className="border p-2 w-full rounded-md" aria-describedby="user_avatar_help" id="user_avatar" type="file" onChange={handleChange} /> */}

                        <div className="p-0">
                          {/* Drag-and-Drop Zone */}
                          <div
                            {...getRootProps()}
                            className="cursor-pointer p-12 flex justify-center bg-white border border-dashed border-gray-300 rounded-xl"
                          >
                            <input {...getInputProps()} />
                            <div className="text-center">
                              <svg
                                className="w-16 text-gray-400 mx-auto"
                                width="70"
                                height="46"
                                viewBox="0 0 70 46"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.05172 9.36853L17.2131 7.5083V41.3608L12.3018 42.3947C9.01306 43.0871 5.79705 40.9434 5.17081 37.6414L1.14319 16.4049C0.515988 13.0978 2.73148 9.92191 6.05172 9.36853Z"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="fill-white stroke-gray-400"
                                ></path>
                                <path
                                  d="M63.9483 9.36853L52.7869 7.5083V41.3608L57.6982 42.3947C60.9869 43.0871 64.203 40.9434 64.8292 37.6414L68.8568 16.4049C69.484 13.0978 67.2685 9.92191 63.9483 9.36853Z"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="fill-white stroke-gray-400"
                                ></path>
                                <rect
                                  x="17.0656"
                                  y="1.62305"
                                  width="35.8689"
                                  height="42.7541"
                                  rx="5"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="fill-white stroke-gray-400"
                                ></rect>
                              </svg>

                              <div className="mt-4 flex flex-wrap justify-center text-sm leading-6 text-gray-600">
                                <span className="pe-1 font-medium text-gray-800">
                                  Drop your file here or
                                </span>
                                <span className="bg-white font-semibold text-blue-600 hover:text-blue-700 rounded-lg decoration-2 hover:underline">
                                  browse
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-400">
                                Pick an image up to 2MB.
                              </p>
                            </div>
                          </div>

                          {/* Preview Section */}
                          <div className="mt-4 space-y-3">
                            {files.map((file) => (
                              <div
                                key={file.name}
                                className="p-3 bg-white border border-gray-300 rounded-xl flex justify-between items-center"
                              >
                                <div className="flex items-center gap-x-3">
                                  <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="size-16 rounded-lg "
                                    onLoad={() =>
                                      URL.revokeObjectURL(file.preview)
                                    }
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 truncate max-w-[250px]">
                                      {file.name}
                                    </p>

                                    <p className="text-xs text-gray-500 m-0">
                                      {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.name)}
                                  className="text-gray-500 hover:text-gray-800 "
                                >
                                  <svg
                                    className="size-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line
                                      x1="10"
                                      x2="10"
                                      y1="11"
                                      y2="17"
                                    ></line>
                                    <line
                                      x1="14"
                                      x2="14"
                                      y1="11"
                                      y2="17"
                                    ></line>
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <input
                          type="text"
                          name="linkedin_url"
                          placeholder="LinkedIn URL"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                          value={isEditing ? formData.linkedin_url : ""}
                        />
                      </>
                    )}
                    {[
                      "Privacy Policy Terms",
                      "Cookie Policy Terms",
                      "Website Terms",
                    ].includes(activeTab) && (
                      <>
                        <input
                          type="text"
                          name="category"
                          value={activeTab}
                          readOnly
                          className="border p-2 w-full rounded-md bg-gray-100"
                        />
                        <input
                          type="text"
                          name="topic"
                          onChange={handleChange}
                          placeholder="Topic"
                          className="border p-2 w-full rounded-md"
                        />
                        <textarea
                          name="description"
                          placeholder="Description"
                          onChange={handleChange}
                          className="border p-2 w-full rounded-md"
                        ></textarea>
                      </>
                    )}
                    {/* <button type="submit" className="bg-black text-white px-4 py-2 w-full rounded-md shadow hover:bg-black">Submit</button> */}
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-2 w-full rounded-md shadow hover:bg-black mt-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        </div>
                      ) : isEditing ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {showPreviewModal && selectedItem && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                style={{ zIndex: 10000 }}
              >
                {activeTab === "Trusted Partners" && (
                  <TrustedPartnerCard
                    key={selectedItem.id}
                    partner={selectedItem}
                    onArchive={() => {}}
                    close={closePreviewModal}
                  />
                )}
                {activeTab === "Team Members" && (
                  <TeamMemberCard
                    key={selectedItem.id}
                    member={selectedItem}
                    onArchive={() => {}}
                    close={closePreviewModal}
                  />
                )}
                {activeTab === "Available Jobs" && (
                  <AvailableJobCard
                    key={selectedItem.id}
                    job={selectedItem}
                    onArchive={() => {}}
                    close={closePreviewModal}
                  />
                )}
                {/* </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
