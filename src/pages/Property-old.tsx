// Property.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PropertyListing } from "@/types/propertyListing";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Modal from 'react-bootstrap/Modal';
import { Form } from "@themesberg/react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PropertyModel from "@/components/listing/PropertyModel";
import listingService from "../services/ListingService";
import app from "../utils/api";

// Helper function to format validation errors
const formatValidationErrors = (errors: any[]) => {
  return errors
    .map((err: any) => {
      const field = err.path.join('.');
      return `${field}: ${err.message}`;
    })
    .join('; ');
};

const PropertyOld = () => {
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editdata, setEditdata] = useState<Partial<PropertyListing>>({});
  const [editId, setEditId] = useState("");
  const [showCloseReasonModal, setShowCloseReasonModal] = useState(false);
  const [selectedCloseReason, setSelectedCloseReason] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [data, setData] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { toast: notify } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await listingService.getPropertyListing();
      const rows = response.data.map((row: PropertyListing) => ({
        id: row.property_details_id || Date.now(),
        ...row,
        displayImage: row.displayImage || "",
        shortDescription: row.shortDescription || row.serviceSummary || "",
        area: row.area || row.location?.city || "",
        bedRoom: row.bedRoom || 0,
        bathRoom: row.bathRoom || 0,
        parking: row.parking || 0,
        displayImages: row.displayImages || [],
        floorPlans: row.floorPlans || [],
        ownershipFiles: row.ownershipFiles || [],
        localAmenities: row.localAmenities || "[]",
        propertyAmenities: row.propertyAmenities || "{}",
        paymentOptions: row.paymentOptions || "[]",
        videoLinks: row.videoLinks || "[]",
        faq: row.faq || "[]",
      }));
      setData(rows);
      setTotalItems(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      let errorMessage = 'Error fetching listings';
      let errorDescription = '';

      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          errorMessage = data.message || 'Bad Request';
          errorDescription = data.error || 'Invalid request parameters.';
        } else if (status === 500) {
          errorMessage = 'Server Error';
          errorDescription = data.error || 'An unexpected server error occurred.';
        } else {
          errorDescription = data.message || 'An error occurred.';
        }
      } else if (error.request) {
        errorMessage = 'Network Error';
        errorDescription = 'No response received from the server. Please check your network connection.';
      } else {
        errorDescription = error.message || 'An unexpected error occurred.';
      }

      setError(errorMessage);
      toast.error(errorDescription);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ showPropertyModal]);

  const handleFilterChange = (filterSetter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    filterSetter(event.target.value);
  };

  const filteredData = data.filter((item) => {
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesSearch = item.title.toLowerCase().includes("");
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleAddListing = () => {
    setEditdata({});
    setEditId("");
    setShowPropertyModal(true);
  };

  const handleEditListing = (listing: PropertyListing) => {
    getEditData(listing.id!);
  };

  const getEditData = async (id: number) => {
    try {
      const response = await app.get(`/listings/getById/${id}/Property`, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Edit data response:", response?.data?.childData?.propertyDetails?.[0]);
      if (response.status === 200) {
        const propertyDetails = response?.data?.childData?.propertyDetails?.[0];
        const editlocation = JSON.parse(propertyDetails.location)
        console.log(editlocation.city)
        setEditdata({
          property_details_id: propertyDetails?.property_details_id || "",
          title: propertyDetails?.title || "",
          subtitle: propertyDetails?.subtitle || "",
          displayImage: propertyDetails?.displayImage || "",
          shortDescription: propertyDetails?.serviceSummary || "",
          status: propertyDetails?.status || "unpublished",
          type: "Property",
          subcategory: propertyDetails?.subcategory || propertyDetails?.category || "",
          category: propertyDetails?.category || "Residential",
          PropertyNeed: propertyDetails?.PropertyNeed || "Buy",
          country: propertyDetails?.country || "Ghana (GH)",
          currency: propertyDetails?.currency || "Cedis",
          price: Number(propertyDetails?.price || 0),
          serviceSummary: propertyDetails?.serviceSummary || "",
          generalInfo: propertyDetails?.generalInfo || "",
          features: propertyDetails?.features ? JSON.stringify(propertyDetails.features) : "[]",
          propertyAmenities: propertyDetails?.propertyAmenities ? JSON.stringify(propertyDetails.propertyAmenities) : "{}",
          location: {
            country: editlocation.country || "Ghana (GH)",
            street: editlocation.street || "",
            city: editlocation.city || "",
            region: editlocation.region || "",
            postcode: editlocation.postcode || "",
            digitalAddress: editlocation.digitalAddress || "",
            latitude: editlocation.latitude || "5.605052121404785",
            longitude: editlocation.longitude || "-360.23620605468756",
          },
          paymentOptions: propertyDetails?.paymentOptions ? JSON.stringify(propertyDetails.paymentOptions) : "[]",
          serviceDetails: propertyDetails?.serviceDetails || "",
          serviceType: propertyDetails?.serviceType || "Property",
          size: Number(propertyDetails?.size || 0),
          bedRoom: Number(propertyDetails?.bedRoom || 0),
          bathRoom: Number(propertyDetails?.bathRoom || 0),
          parking: Number(propertyDetails?.parking || 0),
          area: propertyDetails?.area || "",
          videoLinks: propertyDetails?.videoLinks ? JSON.stringify(propertyDetails.videoLinks) : "[]",
          faq: propertyDetails?.faq ? JSON.stringify(propertyDetails.faq) : "[]",
          propertyUsage: propertyDetails?.propertyUsage || "",
          total: propertyDetails?.total || "",
          occupancy: propertyDetails?.occupancy || "",
          propertyPrice: propertyDetails?.propertyPrice ? JSON.stringify(propertyDetails.propertyPrice) : "[]",
          propertyTax: propertyDetails?.propertyTax ? JSON.stringify(propertyDetails.propertyTax) : "[]",
          risks: propertyDetails?.risks ? JSON.stringify(propertyDetails.risks) : "[]",
          tenures: propertyDetails?.tenures ? JSON.stringify(propertyDetails.tenures) : "[]",
          registrations: propertyDetails?.registrations ? JSON.stringify(propertyDetails.registrations) : "[]",
          salesPrice: propertyDetails?.salesPrice ? JSON.stringify(propertyDetails.salesPrice) : "[]",
          ownership: propertyDetails?.ownership ? JSON.stringify(propertyDetails.ownership) : "[]",
          roads: propertyDetails?.roads ? JSON.stringify(propertyDetails.roads) : "[]",
          serviceLevel: propertyDetails?.serviceLevel ? JSON.stringify(propertyDetails.serviceLevel) : "[]",
          Cancellation: propertyDetails?.Cancellation ? JSON.stringify(propertyDetails.Cancellation) : "[]",
          CheckIn: propertyDetails?.CheckIn ? JSON.stringify(propertyDetails.CheckIn) : "[]",
          commissionOffice: propertyDetails?.commissionOffice || "",
          featured: propertyDetails?.featured || false,
          displayImages: propertyDetails?.displayImages || [],
          floorPlans: propertyDetails?.floorPlans || [],
          ownershipFiles: propertyDetails?.ownershipFiles || [],
          localAmenities: propertyDetails?.localAmenities ? JSON.parse(propertyDetails.localAmenities) : "[]",
          createdAt: propertyDetails?.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: propertyDetails?.updatedAt || new Date().toISOString().split('T')[0],
        });
        setEditId(propertyDetails?.property_details_id || "");
        setShowPropertyModal(true);
        console.log("Edit data location: "+editdata.location)
        console.log(editlocation.location)
      }
    } catch (error: any) {
      console.error('Error fetching edit data:', error);
      let errorMessage = 'Error fetching edit data';
      let errorDescription = '';

      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          errorMessage = data.message || 'Bad Request';
          errorDescription = data.error || 'Invalid request parameters.';
        } else if (status === 404) {
          errorMessage = 'Listing Not Found';
          errorDescription = 'The requested listing does not exist.';
        } else if (status === 500) {
          errorMessage = 'Server Error';
          errorDescription = data.error || 'An unexpected server error occurred.';
        } else {
          errorDescription = data.message || 'An error occurred.';
        }
      } else if (error.request) {
        errorMessage = 'Network Error';
        errorDescription = 'No response received from the server. Please check your network connection.';
      } else {
        errorDescription = error.message || 'An unexpected error occurred.';
      }

      notify({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: number, newStatus: string, params) => {
    console.log(id, newStatus, params);
    if (newStatus === "edit") {
      getEditData(id);
    } else if (newStatus === "closed") {
      setSelectedRowId(id);
      setShowCloseReasonModal(true);
    } else {
      updateStatus(id, newStatus);
    }
  };

  const updateStatus = async (id: number, status: string, reason: string | null = null) => {
    try {
      const body = {
        id: id,
        status: status,
        listingType: "property",
        reason: reason,
      };
      await listingService.updateStatus(body);
      toast.success(`Status updated to ${status} successfully`);
      fetchData();
    } catch (error: any) {
      console.error("Error updating status:", error);
      let errorMessage = 'Error updating status';
      let errorDescription = '';

      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          errorMessage = data.message || 'Bad Request';
          errorDescription = data.error || 'Invalid status update parameters.';
        } else if (status === 500) {
          errorMessage = 'Server Error';
          errorDescription = data.error || 'An unexpected server error occurred.';
        } else {
          errorDescription = data.message || 'An error occurred.';
        }
      } else if (error.request) {
        errorMessage = 'Network Error';
        errorDescription = 'No response received from the server. Please check your network connection.';
      } else {
        errorDescription = error.message || 'An unexpected error occurred.';
      }

      toast.error(errorDescription);
    }
  };

  const handleCloseReasonConfirm = () => {
    if (selectedCloseReason && selectedRowId) {
      updateStatus(selectedRowId, "closed", selectedCloseReason);
      setShowCloseReasonModal(false);
      setSelectedCloseReason("");
      setSelectedRowId(null);
    } else {
      notify({ title: "Please select a reason for closing", variant: "destructive" });
    }
  };

  console.log("Edit data: " + editId)
  const columns = [
    {
      field: "displayImage",
      headerName: "Image",
      width: 100,
      renderCell: (params: any) => (
        <img
          src={`${params.row.displayImage}`}
          alt="Display"
          className="h-12 w-12 rounded-full object-cover"
          onError={(e) => { e.currentTarget.src = "/fallback-image.jpg"; }}
        />
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => (
        <div className="break-words">
          <span className="font-medium">{params.row.title}</span>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params: any) =>
        `${params.row.currency === "Cedis" ? "₵" : "$"}${params.value?.toLocaleString()}`,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 70,
      renderCell: (params: any) => (
        <span className="capitalize">{params.value?.toLowerCase() || ""}</span>
      ),
    },
    {
      field: "PropertyNeed",
      headerName: "Property Need",
      flex: 1,
      minWidth: 100,
      renderCell: (params: any) => (
        <span className="capitalize">{params.value?.toLowerCase() || ""}</span>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 150,
      renderCell: (params: any) => params.row.location?.city || params.row.area || "",
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 150,
      renderCell: (params: any) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: any) => {
        const statusColors = {
          published: "bg-green-100 text-green-800",
          close: "bg-red-100 text-red-800",
          unpublished: "bg-yellow-100 text-yellow-800",
          archived: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[params.value] || "bg-gray-100"}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: any) => (
        <select
          className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            handleStatusChange(params.row.id, e.target.value, params)
          }
          value=""
        >
          <option value="" disabled>
            Change Status
          </option>
          <option value="published">Publish</option>
          <option value="unpublished">Unpublish</option>
          <option value="archived">Archive</option>
          <option value="closed">Close</option>
          <option value="edit">Edit</option>
        </select>
      ),
    },
  ];

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="flex min-h-screen">
        <Sidebar isOpen={undefined} setIsOpen={undefined} />
        <div className="flex-1 overflow-x-hidden">
          <Header sidebarOpen={undefined} setSidebarOpen={undefined} />

          <div className="sm:ml-64 p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h4 className="text-xl font-semibold text-gray-800">Property Listings</h4>
                <Button
                  variant="default"
                  onClick={handleAddListing}
                  className="w-full sm:w-auto hover:scale-105 transition-transform bg-[#a97e2d] hover:bg-[#a97e2d]"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add New Property
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Form.Select
                  value={statusFilter}
                  onChange={handleFilterChange(setStatusFilter)}
                  className="w-full focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="archived">Archived</option>
                  <option value="close">Close</option>
                </Form.Select>

                <Form.Select
                  value={categoryFilter}
                  onChange={handleFilterChange(setCategoryFilter)}
                  className="w-full focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                >
                  <option value="">All Categories</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Investment">Investment</option>
                  <option value="The Fjord">The Fjord</option>
                  <option value="Land">Land</option>
                </Form.Select>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
                  {error}
                </div>
              )}

              <div className="h-[500px] w-full bg-white rounded-lg overflow-hidden shadow-xs">
                <DataGrid
                  key={filteredData.map((row) => row.property_details_id).join('-')}
                  rows={filteredData}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[10]}
                  loading={loading}
                  disableRowSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-cell": {
                      display: "flex",
                      alignItems: "center",
                      padding: "18px 16px",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f8f9fa",
                      fontWeight: "600",
                      fontSize: "0.875rem",
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                    row: {
                      className: "hover:bg-gray-50 cursor-pointer",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <PropertyModel
          setShowDefault={setShowPropertyModal}
          handleClose={() => {
            setShowPropertyModal(false);
            setEditdata({});
            setEditId("");
          }}
          showDefault={showPropertyModal}
          notify={toast}
          editdata={editdata}
          editId={editId}
        />

        <Modal show={showCloseReasonModal} onHide={() => setShowCloseReasonModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Select Close Reason</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Select
              value={selectedCloseReason}
              onChange={(e) => setSelectedCloseReason(e.target.value)}
              className="mb-3"
            >
              <option value="">Select a reason...</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
              <option value="booked">Booked</option>
              <option value="under offer">Under Offer</option>
            </Form.Select>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowCloseReasonModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCloseReasonConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!selectedCloseReason}
              >
                Confirm
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default PropertyOld;