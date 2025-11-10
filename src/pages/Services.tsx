import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import app from "../utils/api";
import ServiceModel from "../components/listing/ServiceModel";
import listingService from "../services/ListingService";
import { Col, Row, Button, Form } from "@themesberg/react-bootstrap";
import { Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";

const Service = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  type ListingData = {
    serviceDetails?: any[];
    [key: string]: any;
  };
  const [listingdata, setListingdata] = useState<ListingData>({});
  const [editId, setEditId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDefault, setShowDefault] = useState(false);
  const [showCloseReasonModal, setShowCloseReasonModal] = useState(false);
  const [selectedCloseReason, setSelectedCloseReason] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const notify = (msg: string, type: "success" | "error" | "info" | "warn" = "success") => {
    switch (type) {
      case "success":
        toast.success(msg);
        break;
      case "error":
        toast.error(msg);
        break;
      case "info":
        toast.info(msg);
        break;
      case "warn":
        toast.warn(msg);
        break;
      default:
        toast(msg);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await listingService.getServiceListing();
      const rows = response.data.map(row => ({
        id: row.service_details_id,
        ...row
      }));
      console.log('===============rows=====================');
      console.log(rows);
      console.log('====================================');

      setData(rows);
      setTotalItems(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      notify("Error fetching listings", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (filterSetter) => (event) => {
    filterSetter(event.target.value);
  };

  const filteredData = data.filter((item) => {
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter ? item.serviceCategory === categoryFilter : true;
    const matchesType = typeFilter ? item.serviceCategory === typeFilter : true;
    return matchesStatus && matchesCategory && matchesType;
  });

  const refresh = () => {
    fetchData();
  };

  const handleStatusChange = async (id, newStatus, data) => {
    if (newStatus === 'edit') {
      getEditData(id);
    } else if (newStatus === 'closed') {
      setSelectedRowId(id);
      setShowCloseReasonModal(true);
    } else {
      updateStatus(id, newStatus);
    }
  };

  const updateStatus = async (id, status, reason = null) => {
    try {
      const body = {
        id: id,
        status: status,
        listingType: 'service',
        reason: reason
      };
      await listingService.updateStatus(body);
      notify(`Status updated to ${status} successfully`);
      refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      notify("Error updating status", "error");
    }
  };

  const getEditData = async (id) => {
    try {
      const response = await app.get(`listings/getById/${id}/service`,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200) {
        console.log('====================================');
        console.log(response?.data?.childData?.serviceDetails?.[0]);
        console.log('====================================');
        setListingdata(response?.data?.childData);
        setEditId(response?.data?.childData?.serviceDetails?.[0].service_details_id);
        setShowDefault(true);
      }
    } catch (error) {
      notify("Error fetching edit data", "error");
    }
  };

  const handleCloseReasonConfirm = () => {
    if (selectedCloseReason && selectedRowId) {
      updateStatus(selectedRowId, 'closed', selectedCloseReason);
      setShowCloseReasonModal(false);
      setSelectedCloseReason("");
    }
  };

  const columns = [
    {
      field: "display_image",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.display_image || '/default-service-image.png'}
          alt="Display"
          className="h-12 w-12 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-service-image.png';
          }}
        />
      ),
    },
    {
      field: "closeReason",
      headerName: "Closed Reason",
      width: 100,
      renderCell: (params) => (
        <div className="break-words">
          <span className="font-bold text-md capitalize">{params.row.closeReason || 'N/A'}</span>
        </div>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div className="break-words">
          <span className="font-medium">{params.row.title}</span>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params) => `${params.row.requestQuote ? "Quote Request" : `$ ${params.value?.toLocaleString()}`}`
    },
    {
      field: "serviceCategory",
      headerName: "Category",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="capitalize">{params.value?.toLowerCase() || ''}</span>
      )
    },
    {
      field: "serviceLocation",
      headerName: "Service Area",
      width: 150,
    },
    {
      field: "created_at",
      headerName: "Date",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          published: "bg-green-100 text-green-800",
          closed: "bg-red-100 text-red-800",
          unpublished: "bg-yellow-100 text-yellow-800",
          available: "bg-blue-100 text-blue-800",
          rented: "bg-purple-100 text-purple-800",
          sold: "bg-pink-100 text-pink-800",
          booked: "bg-indigo-100 text-indigo-800",
          'under offer': "bg-orange-100 text-orange-800"
        };

        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[params.value] || 'bg-gray-100'}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <select
          className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleStatusChange(params.row.id, e.target.value, params)}
          value=""
        >
          <option value="" disabled>Change Status</option>
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
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} headerTitle="Home Style" />

          {/* Close Reason Modal */}
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
                <option value="Sold Out">Sold Out</option>
                <option value="No longer need">No longer need</option>
              </Form.Select>
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCloseReasonModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCloseReasonConfirm}
                  disabled={!selectedCloseReason}
                >
                  Confirm
                </Button>
              </div>
            </Modal.Body>
          </Modal>

          {/* Service Model Modal */}
          {showDefault && (
            <ServiceModel
              handleClose={() => setShowDefault(false)}
              showDefault={showDefault}
              notify={notify}
              editdata={listingdata?.serviceDetails?.[0]}
              editId={editId}
              refresh={refresh}
            />
          )}

          {/* Table  */}
          <div className="sm:ml-64 p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h4 className="text-xl font-semibold text-gray-800">Service Listings</h4>
                <Button
                  variant="dark"
                  onClick={() => setShowDefault(true)}
                  className="w-full sm:w-auto hover:scale-105 transition-transform"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add New Service
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
                  <option value="closed">Closed</option>
                </Form.Select>

                <Form.Select
                  value={typeFilter}
                  onChange={handleFilterChange(setTypeFilter)}
                  className="w-full focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                >
                  <option value="">All Categories</option>
                  <option value="Property Management">Property Management</option>
                  <option value="Property Sales">Property Sales</option>
                  <option value="Interior Decor">Interior Decor</option>
                  <option value="Property Consultancy">Property Consultancy</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Property Valuation">Property Valuation</option>
                  <option value="Land Registration">Land Registration</option>
                </Form.Select>
              </div>

              <div className="h-[500px] w-full bg-white rounded-lg overflow-hidden shadow-xs">
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  pagination
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  pageSizeOptions={[10]}
                  loading={loading}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-cell': {
                      display: 'flex',
                      alignItems: 'center',
                      padding: '18px 16px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                  }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                    row: {
                      className: 'hover:bg-gray-50 cursor-pointer',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Service;