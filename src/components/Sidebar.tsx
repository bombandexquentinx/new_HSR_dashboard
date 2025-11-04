import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/hsr-logo.jpeg";

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const pathToDropdown = {
    // "/service-listings": "listing",
    "/property-listings": "listing",
    // "/featured-listings": "listing",
    // "/addons-listings": "listing",
    // "/resource-listings": "listing",
    // "/booking": "bookings",
    // "/reviews": "feedback",
  };

  useEffect(() => {
    setOpenDropdown(pathToDropdown[location.pathname] || null);
  }, [location.pathname]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const menuItems = [
    {
      title: "Listing",
      name: "listing",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
      subItems: [
        // { to: "/service-listings", label: "Service Listing" },
        { to: "/property-listings", label: "Property Listing" },
        // { to: "/featured-listings", label: "Featured Listing" },
        // { to: "/addons-listings", label: "Add-Ons Listing" },
        // { to: "/resource-listings", label: "Resource Listing" },
      ],
    },
    // {
    //   title: "Bookings",
    //   name: "bookings",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    //       />
    //     </svg>
    //   ),
    //   subItems: [{ to: "/booking", label: "Booking" }],
    // },
    // {
    //   title: "Leads",
    //   name: "leads",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    //       />
    //     </svg>
    //   ),
    //   subItems: [{ to: "/leads", label: "Leads" }],
    // },
    // {
    //   title: "Feedback",
    //   name: "feedback",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
    //       />
    //     </svg>
    //   ),
    //   subItems: [{ to: "/reviews", label: "Reviews" }],
    // },
    // {
    //   title: "Finance",
    //   name: "finance",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    //       />
    //     </svg>
    //   ),
    //   subItems: [{ to: "/finance", label: "Finance" }],
    // },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-300 transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 shadow-xl`}
    >
      <div className="h-full px-4 py-6 overflow-y-auto bg-white">
        <div className="px-4 mb-10">
          <img
            src={Logo}
            alt="homestyle-logo"
            className="h-[120px] w-[170px] p-0"
          />
        </div>

        <nav className="space-y-2 ">
          {/* <Link
            to="/dashboard"
            className={`flex items-center w-full p-3 text-base bg-gray-800 text-[#a97e2b] transition-all duration-200 rounded-lg no-underline ${
              location.pathname === "/dashboard"
                ? "bg-[#a97e2b] text-[#ffffff]"
                : "hover:bg-[#a97e2b] text-[#ffffff] hover:text-amber-300"
            }`}
            style={{ textDecoration: 'none', color:"#fff"}}
          >
            <span className="text-amber-400/80">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                stroke="currentColor"
                viewBox="0 0 1024 1024"
                version="1.1"
              >
                <path d="M514.176 579.008 139.584 263.36C-27.072 462.592 5.952 745.984 204.8 913.28c199.168 167.552 496.512 142.016 664.128-57.088 94.656-112.448 127.488-236.672 102.464-370.688L514.176 579.008z" />
                <path d="M808.704 116.672c-2.24-1.984-4.416-3.968-6.72-5.952C602.816-56.896 305.536-31.296 137.92 167.936 137.6 168.256 137.344 168.576 137.088 168.896l367.488 309.248L808.704 116.672z" />
                <path d="M868.352 178.432 545.472 511.808l445.184-135.104C971.328 286.848 924.992 223.872 868.352 178.432z" />
              </svg>
            </span>
            <span className="flex-1 ml-3 text-left whitespace-nowrap  text-sm">
              Overview
            </span>
          </Link> */}

          {menuItems.map((item) => (
            <div key={item.name} className="group">
              <button
                onClick={() => toggleDropdown(item.name)}
                className={`flex items-center w-full p-3 bg-gray-300 text-black transition-all duration-200 rounded-lg ${
                  openDropdown === item.name
                    ? "bg-[#a97e2b] text-[#ffffff]"
                    : "hover:text-amber-300"
                }`}
              >
                <span className="text-amber-400/80">{item.icon}</span>
                <span className="flex-1 ml-3 text-left whitespace-nowrap  text-sm">
                  {item.title}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    openDropdown === item.name ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {openDropdown === item.name && (
                <div className="mt-1 space-y-1 pl-4">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.to}
                      to={subItem.to}
                      className={`flex items-center p-2 text-sm rounded-lg transition-colors duration-200 no-underline ${
                        location.pathname === subItem.to
                          ? "bg-[#a97e2b] text-white"
                          : "hover:bg-[#a97e2b] text-white"
                      }`}
                      style={{ textDecoration: 'none'}}
                    >
                      <span className={`ml-3 hover:text-white text-[#a97e2b] ${location.pathname === subItem.to? "text-white":""}`}>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
