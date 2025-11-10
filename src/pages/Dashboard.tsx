// Converted to TypeScript with type annotations and minor fixes

import { useState, useEffect, ChangeEvent } from "react";
import listingService from "../services/ListingService";
import app from "../utils/api";
import Sidebar from "../components/Sidebar";
import CircleChartWidget from "../components/charts/CircleChartWidget";
import Modals from "../components/Modals";
import { ToastContainer, toast } from "react-toastify";
import Header from "../components/Header";

// Define types for data structures
type Listing = {
    id: number;
    type: string;
    subcategory?: string;
    title: string;
    subtitle?: string;
    display_image?: string | null;
    short_description?: string;
    status: string;
    service_name?: string;
    service_location?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
};

type Stats = {
    type: string;
    published: string;
    unpublished: string;
    archived: string;
};

type ListingData = Record<string, any>;

type ChartDataItem = {
    label: string;
    value: number;
    color?: string;
};

type CircleChartWidgetProps = {
    title: string;
    data: ChartDataItem[];
};

// Dummy data for development/testing
const dummy: Listing[] = [
    {
        id: 1,
        type: "Service",
        subcategory: "Property Management",
        title: "Test Service",
        subtitle: "Test Subtitle",
        display_image: null,
        short_description: "A great cleaning service",
        status: "unpublished",
        service_name: "Cleaning Service",
        service_location: "New York",
        created_at: "2025-01-18T15:41:41.000Z",
        updated_at: "2025-01-18T15:41:41.000Z",
    },
    {
        id: 2,
        type: "Service",
        subcategory: "Property Management",
        title: "Test Service",
        subtitle: "Test Subtitle",
        display_image: null,
        short_description: "A great cleaning service",
        status: "unpublished",
    },
    // more dummy data...
];

const Dashboard = () => {
    // State hooks with type annotations
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [stats, setStats] = useState<Stats[]>([]);
    const [data, setData] = useState<Listing[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [listingdata, setListingdata] = useState<ListingData>({});
    const [editId, setEditId] = useState<number | string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showDefault, setShowDefault] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(true);

    const [sidebarIsOpen, setSidebarIsOpen] = useState<boolean>(false);

    const [isOpen, setIsOpen] = useState<boolean>(false); // To toggle menu visibility
    const [selectedOption, setSelectedOption] = useState<string>("Invest"); // Default option
    const options = ["Invest", "Rent", "Stay", "Buy"]; // Dropdown options

    const toggleMenu = () => setIsOpen(!isOpen);

    const notify = (msg: string) => toast(msg);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Fetch service stats
    const fetchServiceStats = async () => {
        try {
            const response = await listingService.listingOverview();
            setStats(response.data);
        } catch (err) {
            console.error("Error fetching service stats:", err);
        }
    };

    // Example products array (not used in UI)
    const products = [
        {
            name: 'Apple MacBook Pro 17"',
            color: "Silver",
            category: "Laptop",
            price: "$2999",
        },
        {
            name: "Microsoft Surface Pro",
            color: "White",
            category: "Laptop PC",
            price: "$1999",
        },
    ];

    // Fetch listing data
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await listingService.getAllListing(currentPage);
            setData(response.data);
            setTotalItems(response.pagination.total);
            setTotalPages(response.pagination.totalPages);
            setLoading(false);
        } catch (err) {
            setError("Error fetching data");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchServiceStats();
        // eslint-disable-next-line
    }, []);

    // Generic filter change handler
    const handleFilterChange =
        (filterSetter: (value: string) => void) =>
        (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            filterSetter(event.target.value);
        };

    // Filtered data based on filters
    const filteredData = data.filter((item) => {
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesCategory = categoryFilter
            ? item.subcategory === categoryFilter
            : true;
        const matchesType = typeFilter ? item.type === typeFilter : true;
        return matchesStatus && matchesCategory && matchesType;
    });

    const totalTransactions = filteredData.length;

    const handleClose = () => setShowDefault(false);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<Listing | null>(null);

    // Table columns definition (for DataGrid or similar)
    const columns = [
        {
            field: "display_image",
            headerName: "Image",
            width: 100,
            renderCell: (params: { row: Listing }) =>
                params.row.display_image ? (
                    <img
                        src={`https://homestyleserver.xcelsz.com${params.row.display_image}`}
                        alt="Display"
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <span className="text-gray-500 italic">No Image</span>
                ),
        },
        {
            field: "title",
            headerName: "Title",
            width: 250,
            renderCell: (params: { row: Listing }) => (
                <div>
                    <span className="">{params.row.title}</span>
                </div>
            ),
        },
        { field: "type", headerName: "Type", width: 180 },
        { field: "short_description", headerName: "Description", width: 300 },
        { field: "created_at", headerName: "Created At", width: 200 },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: (params: { value: string }) => {
                // Define status-based styles
                const statusColors: Record<string, string> = {
                    published: "#008cfb",
                    close: "red",
                    unpublished: "#A97E48",
                };

                return (
                    <span
                        style={{
                            color: statusColors[params.value] || "black",
                            fontWeight: "bold",
                        }}
                    >
                        {params.value}
                    </span>
                );
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params: { row: Listing }) => {
                const rowId = params.row.id;
                const currentStatus = params.row.status;

                return (
                    <select
                        className="px-2 py-2 rounded-md text-center"
                        onChange={(e) => {
                            handleStatusChange(rowId, e.target.value, params);
                        }}
                    >
                        <option>status</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                        <option value="archived">Achieve</option>
                        <option value="closed">Close</option>
                        <option value="edit">Edit</option>
                    </select>
                );
            },
        },
    ];

    // Refresh data and stats
    const refresh = () => {
        fetchData();
        fetchServiceStats();
    };

    // Handle status change or edit
    const handleStatusChange = async (
        id: number | string,
        newStatus: string,
        data?: any
    ) => {
        if (newStatus === "edit") {
            getEditData(id);
        } else {
            try {
                const body = {
                    id: id,
                    status: newStatus,
                };
                const response = await listingService.updateStatus(body);
                notify(`Status updated to ${newStatus} Successfully`);
                refresh();
                // Optionally, you can update the UI or refresh the data
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };

    // Dialog open/close handlers
    const handleDialogOpen = (row: Listing) => {
        setSelectedRow(row);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedRow(null);
    };

    // Fetch data for editing
    const getEditData = async (id: number | string) => {
        try {
            const response = await app.get(`listings/getById/${id}`, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                setListingdata(response?.data?.childData);
                setEditId(response?.data?.listing?.id);
                setShowDefault(true);
            } else {
                console.log(`Failed to post listing.`);
            }
        } catch (error) {
            console.log("Error:", error);
        }
    };

    return (
        <>
            <ToastContainer />

            <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />

            <div className="sm:ml-64">
                <Header
                    sidebarOpen={sidebarIsOpen}
                    setSidebarOpen={setSidebarIsOpen}
                    headerTitle={"Overview"}
                />
                <div className="p-4 ">
                    <div className="flex justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 w-full max-w-6xl">
                            {stats.map((service, index) => (
                                <div className="mb-4 w-full" key={index}>
                                    <CircleChartWidget
                                        title={service.type}
                                        data={[
                                            {
                                                label: "Published",
                                                value: parseInt(service.published, 10),
                                                color: "#4CAF50",
                                            },
                                            {
                                                label: "Unpublished",
                                                value: parseInt(service.unpublished, 10),
                                            },
                                            {
                                                label: "Archived",
                                                value: parseInt(service.archived, 10),
                                            },
                                        ]}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {showDefault && (
                        <Modals
                            handleClose={handleClose}
                            setShowDefault={setShowDefault}
                            showDefault={Boolean(showDefault)}
                            notify={notify}
                            editdata={listingdata}
                            editId={editId}
                        />
                    )}
                </div>

                {/* Call to Action Section */}
                <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">Recommended Actions</h2>
                    <div className="space-y-4">
                        {stats.length === 0 && (
                            <div className="p-4 bg-blue-50 rounded-md flex justify-between items-center">
                                <p className="text-blue-700">No listings found. Start by adding a new listing.</p>
                                <button
                                    onClick={() => {
                                        // Navigate to add listing page or open modal
                                        notify("Navigate to Add Listing page");
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add Listing
                                </button>
                            </div>
                        )}

                        {stats.some(s => s.unpublished !== "0") && (
                            <div className="p-4 bg-yellow-50 rounded-md flex justify-between items-center">
                                <p className="text-yellow-700">You have unpublished listings. Publish them to go live.</p>
                                <button
                                    onClick={() => {
                                        // Navigate to unpublished listings or filter
                                        notify("Navigate to Unpublished Listings");
                                    }}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                >
                                    View Unpublished
                                </button>
                            </div>
                        )}

                        {stats.some(s => s.archived !== "0") && (
                            <div className="p-4 bg-gray-100 rounded-md flex justify-between items-center">
                                <p className="text-gray-700">You have archived listings. Review or restore them.</p>
                                <button
                                    onClick={() => {
                                        // Navigate to archived listings or filter
                                        notify("Navigate to Archived Listings");
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    View Archived
                                </button>
                            </div>
                        )}

                        {!stats.some(s => s.unpublished !== "0") && !stats.some(s => s.archived !== "0") && stats.length > 0 && (
                            <div className="p-4 bg-green-50 rounded-md flex justify-between items-center">
                                <p className="text-green-700">All listings are up to date. Consider adding new listings.</p>
                                <button
                                    onClick={() => {
                                        notify("Navigate to Add Listing page");
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Add Listing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

// Notes:
// - Added TypeScript types for state and function parameters.
// - Fixed class -> className in JSX.
// - Added comments for clarity.
// - Provided default values and type safety for all state and props.
// - You may need to further type any external service responses for full type safety.
