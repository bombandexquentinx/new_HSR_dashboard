import { useState, useEffect } from "react";
import { Input } from '@/components/ui/input';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Settings,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddListingModal from "@/components/AddlistingModal";
import EditListingModal from "@/components/EditListingModal";
import PropertyListingModal from "@/components/PropertyListingmodal";
import { useToast } from "@/hooks/use-toast";
import { PropertyListing } from "@/types/propertyListing";
import { useAdminListings } from "@/hooks/useAdminlistings";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const Property = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<
    PropertyListing | undefined
  >(undefined);
  const [activeCategory, setActiveCategory] = useState<
    "properties" | "services" | "addons" | "resources" | "other"
  >("properties");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    listings,
    isLoading,
    addListing,
    updateListing,
    deleteListing,
    toggleStatus,
    archiveListing,
  } = useAdminListings();
  const { toast } = useToast();

  const handleAction = async (
    action: string,
    category: keyof typeof listings,
    id: number
  ) => {
    try {
      switch (action) {
        case "toggle":
          await toggleStatus(category, id);
          toast({ title: "Status updated successfully" });
          break;
        case "archive":
          await archiveListing(category, id);
          toast({ title: "Listing archived successfully" });
          break;
        case "delete":
          await deleteListing(category, id);
          toast({ title: "Listing deleted successfully" });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    }
  };
  const handleAddListing = (category: typeof activeCategory) => {
    setActiveCategory(category);
    setShowAddModal(true);
  };

  const handleEditListing = (category: typeof activeCategory, listing: any) => {
    setActiveCategory(category);
    setEditingListing(listing);
    setShowEditModal(true);
  };

  const filteredListings = (category: keyof typeof listings) => {
    let filtered = listings[category];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.status.toLowerCase() === statusFilter
      );
    }

    return filtered;
  };

  const categories = {
    properties: [
      "Fjord Apartment",
      "Land",
      "Residential",
      "Investment",
      "Commercial",
    ],
    services: [
      "Project Management",
      "Property Valuation",
      "Interior Decor",
      "Land Registration",
      "Property Consultancy",
    ],
    resources: [
      "Property News",
      "General News",
      "Property Guide",
      "Checklists",
      "Toolkits",
    ],
    other: [
      "Trusted Partners",
      "Team Members",
      "Available Jobs",
      "Privacy Policy",
      "Cookie Policy",
      "Website Terms",
      "FAQs",
      "Support Articles",
    ],
  };

  const ActionButton = ({
    action,
    variant = "outline",
    size = "sm",
    children,
    onClick,
  }: any) => (
    <Button
      variant={variant}
      size={size}
      className="mr-2 mb-2"
      onClick={onClick}
    >
      {children}
    </Button>
  );

  const ListingTable = ({
    listings,
    type,
  }: {
    listings: any[];
    type: "properties" | "services" | "addons" | "resources" | "other";
  }) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search listings..."
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type === "properties" ? (
          <Button
            className="btn-primary"
            onClick={() => setShowPropertyModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property Listing
          </Button>
        ) : (
          <Button
            className="btn-primary"
            onClick={() => handleAddListing(type as any)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New{" "}
            {type === "services"
              ? "Service"
              : type === "resources"
                ? "Resource"
                : type === "addons"
                  ? "Add-On"
                  : "Content"}
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              {type === "properties" && <TableHead>Price</TableHead>}
              {type === "properties" && <TableHead>Location</TableHead>}
              {type === "services" && <TableHead>Price</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings(type).map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.title}</TableCell>
                <TableCell>{listing.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      listing.status === "Published" ? "default" : "secondary"
                    }
                  >
                    {listing.status}
                  </Badge>
                </TableCell>
                {listing.price && <TableCell>{listing.price}</TableCell>}
                {listing.location && <TableCell>{listing.location}</TableCell>}
                <TableCell>
                  <div className="flex flex-wrap">
                    <ActionButton
                      onClick={() => handleEditListing(type, listing)}
                    >
                      <Edit className="w-4 h-4" />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleAction("toggle", type, listing.id)}
                    >
                      {listing.status === "Published" ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleAction("archive", type, listing.id)}
                    >
                      <Archive className="w-4 h-4" />
                    </ActionButton>
                    <ActionButton
                      variant="destructive"
                      onClick={() => handleAction("delete", type, listing.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={undefined} setIsOpen={undefined} />
        <div className="flex-1 overflow-x-hidden">
          <Header sidebarOpen={undefined} setSidebarOpen={undefined} />
        
          
          {/* Main Content */}
          <div className="sm:ml-64 p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h4>Manage Property Listings</h4>
              </div>
              <div>
                <ListingTable listings={listings.properties} type="properties" />
              </div>
            </div>
          </div>
        </div>

        {showAddModal && (
          <AddListingModal
            category={activeCategory}
            onClose={() => setShowAddModal(false)}
            onSubmit={async (data) => {
              await addListing(activeCategory, data);
              setShowAddModal(false);
            }}
          />
        )}

        {showEditModal && editingListing && (
          <EditListingModal
            category={activeCategory}
            listing={editingListing}
            onClose={() => {
              setShowEditModal(false);
              setEditingListing(null);
            }}
            onSubmit={async (data) => {
              await updateListing(activeCategory, editingListing.id, data);
              setShowEditModal(false);
              setEditingListing(null);
            }}
          />
        )}

        <PropertyListingModal
          isOpen={showPropertyModal}
          onClose={() => {
            setShowPropertyModal(false);
            setEditingProperty(undefined);
          }}
          onSubmit={(listing: PropertyListing) => {
            const formattedListing = {
              id: Date.now(),
              title: listing.title,
              type: listing.category,
              status: listing.status,
              price: `${listing.currency === "Cedis" ? "₵" : "$"
                }${listing.price.toLocaleString()}${listing.need === "Rent" ? "/mo" : ""
                }`,
              location: `${listing.location.city}, ${listing.location.country.split(" ")[0]
                }`,
              description: listing.summary,
              createdAt: listing.createdAt,
              updatedAt: listing.updatedAt,
            };
            addListing("properties", formattedListing);
            setShowPropertyModal(false);
          }}
          editingListing={editingProperty}
        />
      </div>
    </>
  );
};

export default Property;
