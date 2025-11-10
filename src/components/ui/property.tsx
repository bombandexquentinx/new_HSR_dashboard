// src/components/Property.jsx
import React, { useReducer, useEffect, useCallback } from "react";
import { Form, Button } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Sidebar from "../Sidebar";
import Header from "../Header";
import PropertyModel from "../listing/PropertyModel";
import listingService from "../../services/ListingService";

// Custom hook for filters
const useFilters = (data) => {
  const [filters, setFilters] = React.useState({
    status: "",
    category: "",
    type: "",
  });

  const filteredData = React.useMemo(
    () =>
      data.filter((item) => {
        const matchesStatus = filters.status ? item.status === filters.status : true;
        const matchesCategory = filters.category ? item.category === filters.category : true;
        const matchesType = filters.type ? item.category === filters.type : true;
        return matchesStatus && matchesCategory && matchesType;
      }),
    [data, filters]
  );

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return { filters, filteredData, handleFilterChange };
};

// Reducer for state management
const initialState = {
  data: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loading: true,
  error: null,
  showDefault: false,
  showCloseReasonModal: false,
  selectedCloseReason: "",
  selectedRowId: null,
  listingdata: {},
  editId: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        data: action.payload.rows,
        totalItems: action.payload.totalItems,
        totalPages: action.payload.totalPages,
        loading: false,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_MODAL":
      return { ...state, showDefault: action.payload };
    case "SET_CLOSE_REASON_MODAL":
      return {
        ...state,
        showCloseReasonModal: action.payload.show,
        selectedRowId: action.payload.id || null,
      };
    case "SET_CLOSE_REASON":
      return { ...state, selectedCloseReason: action.payload };
    case "SET_EDIT_DATA":
      return { ...state, listingdata: action.payload.data, editId: action.payload.editId };
    default:
      return state;
  }
};

const Property = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { filters, filteredData, handleFilterChange } = useFilters(state.data);

  const notify = useCallback((msg, type = "success") => toast[type](msg), []);

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: "SET_DATA", payload: { rows: [], totalItems: 0, totalPages: 1 } });
      const response = await listingService.getPropertyListing();
      const rows = response.data.map((row) => ({
        id: row.property_details_id,
        ...row,
      }));
      dispatch({
        type: "SET_DATA",
        payload: {
          rows,
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        },
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Error fetching data" });
      notify("Error fetching listings", "error");
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = useCallback(
    async (id, status, reason = null) => {
      try {
        await listingService.updateStatus({
          id,
          status,
          listingType: "property",
          reason,
        });
        notify(`Status updated to ${status} successfully`);
        fetchData();
      } catch (error) {
        console.error("Error updating status:", error);
        notify("Error updating status", "error");
      }
    },
    [notify, fetchData]
  );

  const getEditData = useCallback(
    async (id) => {
      try {
        const response = await listingService.getById(id, "property");
        if (response.status === 200) {
          dispatch({
            type: "SET_EDIT_DATA",
            payload: {
              data: response.data.childData,
              editId: response.data.childData?.serviceDetails?.[0]?.service_details_id || "",
            },
          });
          dispatch({ type: "SET_MODAL", payload: true });
        }
      } catch (error) {
        console.error("Error fetching edit data:", error);
        notify("Error fetching edit data", "error");
      }
    },
    [notify]
  );

  const handleStatusChange = useCallback(
    (id, newStatus) => {
      if (newStatus === "edit") {
        getEditData(id);
      } else if (newStatus === "closed") {
        dispatch({ type: "SET_CLOSE_REASON_MODAL", payload: { show: true, id } });
      } else {
        updateStatus(id, newStatus);
      }
    },
    [getEditData, updateStatus]
  );

  const handleCloseReasonConfirm = useCallback(() => {
    if (state.selectedCloseReason && state.selectedRowId) {
      updateStatus(state.selectedRowId, "closed", state.selectedCloseReason);
      dispatch({ type: "SET_CLOSE_REASON_MODAL", payload: { show: false } });
      dispatch({ type: "SET_CLOSE_REASON", payload: "" });
    }
  }, [state.selectedCloseReason, state.selectedRowId, updateStatus]);

  const columns = [
    {
      field: "display_image",
      headerName: "Image",
      width: 100,
      renderCell: ({ row }) => (
        <img
          src={`http://localhost:5000${row.displayImage}`}
          alt="Display"
          className="h-12 w-12 rounded-full object-cover"
          onError={(e) => (e.target.src = "/fallback-image.jpg")} // Add fallback image
        />
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => <span className="font-medium">{row.title}</span>,
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: ({ value, row }) =>
        row.requestQuote ? "Quote Request" : `$ ${value?.toLocaleString()}`,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 70,
      renderCell: ({ value }) => <span className="capitalize">{value?.toLowerCase() || ""}</span>,
    },
    {
      field: "PropertyNeed",
      headerName: "Property Need",
      flex: 1,
      minWidth: 100,
      renderCell: ({ value }) => <span className="capitalize">{value?.toLowerCase() || ""}</span>,
    },
    { field: "area", headerName: "Location", width: 150 },
    {
      field: "created_at",
      headerName: "Created At",
      width: 150,
      renderCell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ value }) => {
        const statusColors = {
          published: "bg-green-100 text-green-800",
          closed: "bg-red-100 text-red-800",
          unpublished: "bg-yellow-100 text-yellow-800",
          available: "bg-blue-100 text-blue-800",
          rented: "bg-purple-100 text-purple-800",
          sold: "bg-pink-100 text-pink-800",
          booked: "bg-indigo-100 text-indigo-800",
          "under offer": "bg-orange-100 text-orange-800",
        };
        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[value] || "bg-gray-100"}`}>
            {value}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <select
          className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
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
        <Sidebar />
        <div className="flex-1 overflow-x-hidden">
          <Header />
          <div className="sm:ml-64 p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h4 className="text-xl font-semibold text-gray-800">Property Listings</h4>
                <Button
                  variant="dark"
                  onClick={() => dispatch({ type: "SET_MODAL", payload: true })}
                  className="w-full sm:w-auto hover:scale-105 transition-transform"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add New Property
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Form.Select
                  value={filters.status}
                  onChange={handleFilterChange("status")}
                  className="w-full focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="archived">Archived</option>
                  <option value="closed">Closed</option>
                </Form.Select>
                <Form.Select
                  value={filters.type}
                  onChange={handleFilterChange("type")}
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
              <div className="h-[500px] w-full bg-white rounded-lg overflow-hidden shadow-xs">
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  loading={state.loading}
                  disableSelectionOnClick
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
                    "& .MuiDataGrid-cell:focus": { outline: "none" },
                  }}
                  componentsProps={{
                    toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } },
                    row: { className: "hover:bg-gray-50 cursor-pointer" },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={state.showCloseReasonModal}
        onHide={() => dispatch({ type: "SET_CLOSE_REASON_MODAL", payload: { show: false } })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Close Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={state.selectedCloseReason}
            onChange={(e) => dispatch({ type: "SET_CLOSE_REASON", payload: e.target.value })}
            className="mb-3"
          >
            <option value="">Select a reason...</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="sold">Sold</option>
            <option value="booked">Booked</option>
            <option value="under offer">Under Offer</option>
          </Form.Select>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "SET_CLOSE_REASON_MODAL", payload: { show: false } })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseReasonConfirm}
              disabled={!state.selectedCloseReason}
            >
              Confirm
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {state.showDefault && (
        <PropertyModel
          handleClose={() => dispatch({ type: "SET_MODAL", payload: false })}
          showDefault={state.showDefault}
          notify={notify}
          editdata={state.listingdata?.serviceDetails?.[0] || {}}
          editId={state.editId}
          setShowDefault={(value) => dispatch({ type: "SET_MODAL", payload: value })}
          refresh={fetchData}
        />
      )}
    </>
  );
};

export default Property;