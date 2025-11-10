// src/utils/constants.js
export const LISTING_OPTIONS = {
  "Property Listings": [
    "Residential",
    "Commercial",
    "Investment",
    "The Fjord",
    "Land",
  ],
};

export const PLOT_FEATURES = [
  "Water on site",
  "Electricity on site",
  "Gas on site",
  "Sanitation System",
  "Garbage Pickup",
  "24/7 security",
  "CCTV",
  "Watch Man",
  "Fenced plot",
];

export const BUILDING_FEATURES = [
  "Swimming Pool",
  "Parking",
  "Fitness Center",
  "Rooftop Gardens",
  "Building WiFi",
  "Greenery Around the Space",
];

export const FJORD_FEATURES = [
  "24/7 security",
  "CCTV",
  "Watch Man",
  "Beach front plot",
  "Mountain view",
  "Beach view",
];

export const PAYMENT_OPTIONS = {
  Land: ["Cash Outright", "6 Months Payment Plan", "12 Months Payment Plan"],
  Property: [
    "Cash Outright",
    "6 Months Payment Plan",
    "12 Months Payment Plan",
    "Republic Bank Mortgage",
  ],
  Fjord: ["Cash Payment", "Momo Payment", "OneOff Payment"],
  Rent: ["Monthly Payment", "3 Monthly Payment", "6 Monthly Payment"],
};

export const MAP_SETTINGS = {
  map_marker: [
    {
      id: "0",
      lat: "5.605052121404785",
      lng: "-360.23620605468756",
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