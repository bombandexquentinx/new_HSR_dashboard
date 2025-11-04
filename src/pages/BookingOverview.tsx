import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { DataGrid } from "@mui/x-data-grid";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

ChartJS.register(...registerables);

const API_BASE = 'https://homestyleserver.xcelsz.com/api';

const bookingTypes = [
  'All',
  'Request a Quote',
  'Book a Viewing',
  'Book Consultancy',
  'Book Appointment',
  'Book Stay',
  'Book Listing'
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  unpublished: 'bg-yellow-100 text-yellow-800',
  available: 'bg-blue-100 text-blue-800'
};

const commonColumns = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 100 
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[params.value] || 'bg-gray-100'}`}>
        {params.value}
      </span>
    )
  },
  { 
    field: 'created_at', 
    headerName: 'Date', 
    width: 150,
    renderCell: (params) => new Date(params.value).toLocaleDateString()
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 200,
    renderCell: (params) => (
      <div className="space-x-2">
        <button
          className="text-blue-500 hover:text-blue-700"
          // onClick={() => setSelectedBooking(params.row)}
        >
          Reply
        </button>
        <select 
          className="px-2 py-1 rounded-md border focus:outline-none"
          // onChange={(e) => updateBookingStatus(params.row.id, e.target.value,activeTab)}
          value=""
        >
          <option value="" disabled>Change Status</option>
          <option value="published">Publish</option>
          <option value="accepted">Accept</option>
          <option value="rejected">Reject</option>
          <option value="archived">Archive</option>
        </select>
      </div>
    )
  }
];



export default function Bookings() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
const [bookingView, setBookingView] = useState([]);
const [quotes, setQuotes] = useState([]);
const [consults, setConsults] = useState([]);
const [decorations, setDecorations] = useState([]);
const [stays, setStays] = useState([]);
const [listings, setListings] = useState([]);



const typeSpecificColumns = {
  'Book Stay': [
    { field: 'property_name', headerName: 'Property', flex: 1 },
    { field: 'costOfStay', headerName: 'Cost', width: 120 },
    { field: 'addOns', headerName: 'Add-Ons', flex: 1 },
    { field: 'costOfAddOns', headerName: 'AddOns Cost', flex: 1 },
    { field: 'numberOfGuests', headerName: 'Guests', width: 120  },
    { field: 'numberOfKids', headerName: 'Kids', width: 120  },
    { field: 'checkInDate', headerName: 'Check-In', width: 120 },
    { field: 'checkOutDate', headerName: 'Check-Out', width: 120 },
    { field: 'totalCost', headerName: 'totalCost', width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          accepted: "bg-green-100 text-green-800",
          published: "bg-red-100 text-red-800",
          rejected: "bg-yellow-100 text-yellow-800",
          archived: "bg-blue-100 text-blue-800",
        };
        
        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[params.value] || 'bg-gray-100'}`}>
            {params.value === 'published'?"N/A":params.value}
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => setSelectedBooking(params.row)}
          >
            Reply
          </button>
          <select 
            className="px-2 py-1 rounded-md border focus:outline-none"
            onChange={(e) => updateBookingStatus(params.row.id, e.target.value,activeTab)}
            value=""
          >
            <option value="" disabled>Change Status</option>
            <option value="published">Publish</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Reject</option>
            <option value="archived">Archive</option>
          </select>
        </div>
      )
    }
  ],
  'Book Listing': [
    { field: 'property_category', headerName: 'Category', width: 120 },
    { field: 'name', headerName: 'name', width: 120 },
    { field: 'service', headerName: 'service', width: 120 },
    { field: 'about_you', headerName: 'About You', width: 220 },
    { field: 'whatsapp', headerName: 'Whatsapp', width: 120 },
    { field: 'email', headerName: 'email', width: 120 },
    { field: 'market_duration', headerName: 'Duration', width: 120 },
    { field: 'location', headerName: 'Location', width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          accepted: "bg-green-100 text-green-800",
          published: "bg-red-100 text-red-800",
          rejected: "bg-yellow-100 text-yellow-800",
          archived: "bg-blue-100 text-blue-800",
        };
        
        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[params.value] || 'bg-gray-100'}`}>
            {params.value === 'published'?"N/A":params.value}
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => setSelectedBooking(params.row)}
          >
            Reply
          </button>
          <select 
            className="px-2 py-1 rounded-md border focus:outline-none"
            onChange={(e) => updateBookingStatus(params.row.id, e.target.value,activeTab)}
            value=""
          >
            <option value="" disabled>Change Status</option>
            <option value="published">Publish</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Reject</option>
            <option value="archived">Archive</option>
          </select>
        </div>
      )
    }
  ],
  'Request a Quote': [
    { field: 'project_need', headerName: 'Project Need', flex: 1 },
    { field: 'location_name', headerName: 'Location', width: 120 },
    { field: 'project_details', headerName: 'Details', flex: 1 }
  ],
  'Book Consultancy': [
    { field: 'service', headerName: 'Service', flex: 1 },
    { field: 'consultancy_need', headerName: 'Need', flex: 1 },
    { field: 'location', headerName: 'Location', width: 120 },
    { field: 'about_project', headerName: 'about_project', width: 120 },
    { field: 'whatsapp', headerName: 'whatsapp', width: 120 },
    { field: 'total_cost', headerName: 'Cost', width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          accepted: "bg-green-100 text-green-800",
          published: "bg-red-100 text-red-800",
          rejected: "bg-yellow-100 text-yellow-800",
          archived: "bg-blue-100 text-blue-800",
        };
        
        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[params.value] || 'bg-gray-100'}`}>
            {params.value === 'published'?"N/A":params.value}
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => setSelectedBooking(params.row)}
          >
            Reply
          </button>
          <select 
            className="px-2 py-1 rounded-md border focus:outline-none"
            onChange={(e) => updateBookingStatus(params.row.id, e.target.value,activeTab)}
            value=""
          >
            <option value="" disabled>Change Status</option>
            <option value="published">Publish</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Reject</option>
            <option value="archived">Archive</option>
          </select>
        </div>
      )
    }
  ],
  'Book Decoration': [
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'service', headerName: 'service', width: 120 },
    { field: 'about_you', headerName: 'about_you', width: 120 },
    { field: 'about_property', headerName: 'Address', flex: 1 },
    { field: 'property_type', headerName: 'Type', width: 120 },
    { field: 'whatsapp', headerName: 'whatsapp', width: 120 },
    { field: 'appointment_date', headerName: 'appointment_date', width: 120 },
    { field: 'service_timing', headerName: 'Timing', width: 120 },
    { field: 'property_address', headerName: 'Address', flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          accepted: "bg-green-100 text-green-800",
          published: "bg-red-100 text-red-800",
          rejected: "bg-yellow-100 text-yellow-800",
          archived: "bg-blue-100 text-blue-800",
        };
        
        return (
          <span className={`px-3 py-1 rounded-lg text-sm ${statusColors[params.value] || 'bg-gray-100'}`}>
            {params.value === 'published'?"N/A":params.value}
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => setSelectedBooking(params.row)}
          >
            Reply
          </button>
          <select 
            className="px-2 py-1 rounded-md border focus:outline-none"
            onChange={(e) => updateBookingStatus(params.row.id, e.target.value,activeTab)}
            value=""
          >
            <option value="" disabled>Change Status</option>
            <option value="published">Publish</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Reject</option>
            <option value="archived">Archive</option>
          </select>
        </div>
      )
    }
  ],
  'Book a Viewing': [
    { field: 'employment_status', headerName: 'Employment', width: 120 },
    { field: 'proof_of_funds_url', headerName: 'Funds Proof', flex: 1 }
  ]
};


  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const endpoints = [
        { key: 'appointments', url: '/bookings/getAllbookappointment' },
        { key: 'bookingView', url: '/bookings/getAll-booking-view' },
        { key: 'quotes', url: '/bookings/getAllrequestquote' },
        { key: 'consults', url: '/bookings/getAllbookconsult' },
        { key: 'decorations', url: '/bookings/getAllbookdeco' },
        { key: 'stays', url: '/bookings/getAllbookstay' },
        { key: 'listings', url: '/bookings/getAllbooklistings' }
      ];

      // Fetch all data in parallel
      const responses = await Promise.all(
        endpoints.map(endpoint => 
          fetch(`${API_BASE}${endpoint.url}`).then(res => res.json())
        )
      );

      // Store data separately in different state variables
      setAppointments(responses[0]);
      setBookingView(responses[1]);
      setQuotes(responses[2]);
      setConsults(responses[3]);
      setDecorations(responses[4]);
      setStays(responses[5]);
      setListings(responses[6]);

      // Set loading to false after data is fetched
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };


  const mapType = (booking) => {
    if (booking.service?.includes('Viewing')) return 'Book a Viewing';
    if (booking.service?.includes('Consultancy')) return 'Book Consultancy';
    if (booking.service?.includes('Quote')) return 'Request a Quote';
    if (booking.costOfStay) return 'Book Stay';
    return booking.type || 'Book Listing';
  };

  const getColumns = () => {
    if (activeTab === 'All') return [...commonColumns];
    return [
      // ...commonColumns,
      ...(typeSpecificColumns[activeTab] || [])
    ];
  };

  const filteredRows = bookings.filter(booking => 
    activeTab === 'All' || booking.type === activeTab
  );

  const updateBookingStatus = async (id, status, bookingType) => {
    let table = '';

    switch (bookingType) {
        case 'Request a Quote':
            table = 'request_quote';
            break;
        case 'Book a Viewing':
            table = 'booking_view';
            break;
        case 'Book Consultancy':
            table = 'book_consult';
            break;
        case 'Book Decoration':
            table = 'book_deco';
            break;
        case 'Book Stay':
            table = 'book_stay';
            break;
        case 'Book Listing':
            table = 'book_listings';
            break;
        default:
            console.error('Invalid booking type:', bookingType);
            return; // Exit the function if the type is invalid
    }

    try {
        await fetch(`${API_BASE}/bookings/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table, id, status })
        });

        setBookings(bookings.map(booking =>
            booking.id === id ? { ...booking, status } : booking
        ));
    } catch (error) {
        console.error('Error updating status:', error);
    }
};



const handleReply = () => {
  if (!selectedBooking || !replyMessage) return;

  // Send via WhatsApp
  if (selectedBooking.whatsapp) {
    const whatsappUrl = `https://wa.me/${selectedBooking.whatsapp}?text=${encodeURIComponent(replyMessage)}`;
    window.open(whatsappUrl, '_blank');
  }
  
  // Send via Email
  if (selectedBooking.email) {
    const mailtoLink = `mailto:${selectedBooking.email}?body=${encodeURIComponent(replyMessage)}`;
    window.location.href = mailtoLink;
  }

  setSelectedBooking(null);
  setReplyMessage('');
};


  return (
    <>
      <Sidebar />
      <Header />
      <div className="sm:ml-64">
        <div className="p-6 w-full mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {bookingTypes.map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeTab === type 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab(type)}
              >
                {type}
              </button>
            ))}
          </div>


          <div className="h-[600px] w-full bg-white rounded-lg overflow-hidden">
            {activeTab === "Request a Quote"&&
            <DataGrid
              rows={quotes}
              columns={getColumns()}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                },
              }}
            />}
            {activeTab === "Book a Viewing"&&
            <DataGrid
              rows={bookingView}
              columns={getColumns()}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                },
              }}
            />}

{activeTab === "Book Consultancy"&&
            <DataGrid
              rows={consults}
              columns={getColumns()}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                },
              }}
            />}



{activeTab === "Book Decoration"&&
            <DataGrid
              rows={decorations}
              columns={getColumns()}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                },
              }}
            />}




{activeTab === "Book Stay"&&
            <DataGrid
              rows={stays}
              columns={getColumns()}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                },
              }}
            />}


{activeTab === "Book Listing"&&
            <DataGrid
              rows={listings}
              columns={getColumns()}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                },
              }}
            />}
          </div>



          {/* Reply Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
                <h3 className="text-lg font-semibold mb-4">Reply to {selectedBooking.name}</h3>
                <textarea
                  className="w-full border p-3 rounded-lg mb-4 h-32"
                  placeholder="Type your response..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                {/* <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => handleReply()}
                  >
                    Send Response
                  </button>
                </div> */}

                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedBooking.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedBooking.whatsapp}?text=${encodeURIComponent(replyMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 no-underline"
                    >
                      Send via WhatsApp
                    </a>
                  )}
                  {selectedBooking.email && (
                    <a
                      href={`mailto:${selectedBooking.email}?body=${encodeURIComponent(replyMessage)}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 no-underline"
                    >
                      Send via Email
                    </a>
                  )}
               
                </div>
                <button
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 absolute top-0 right-2"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Cancel
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}