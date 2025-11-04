import React, { useState } from "react";

const TrustedPartnerCard = ({ partner, onArchive, close }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  console.log('====================================');
  console.log(partner);
  console.log('====================================');

  const handleArchive = () => {
    onArchive(partner.id); // Call the archive function with the partner's ID
    setIsDropdownOpen(false); // Close the dropdown
  };

  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm relative min-w-[400px]">

      <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-x-circle absolute top-4 right-4 cursor-pointer"
                viewBox="0 0 16 16"
                onClick={close}
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>

      {/* Partner Logo */}
      <div className="flex justify-center p-4 ">
        <img
          src={`https://homestyleserver.xcelsz.com/${partner.logo_url}`}
          alt={partner.name}
          className="w-24 h-24 rounded-full object-cover bg-slate-600"
        />
      </div>

      {/* Partner Details */}
      <div className="p-4 pt-0">
        <h5 className="text-xl font-bold text-gray-900  text-center">
          {partner.name}
        </h5>
        <p className="text-sm text-gray-500  text-center mt-2">
          {partner.description}
        </p>

        {/* Contact Information */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 16"
            >
              <path d="M10 0C4.612 0 0 3.582 0 8c0 1.907.923 3.68 2.502 5.032A10.96 10.96 0 0 1 10 16c1.907 0 3.68-.923 5.032-2.502A10.96 10.96 0 0 1 20 8c0-4.418-4.612-8-10-8Z" />
              <path d="M10 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
            </svg>
            <span className="text-sm text-gray-700">
              {partner.email}
            </span>
          </div>

          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 0 0-8 8v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a8 8 0 0 0-8-8Zm0 1a7 7 0 0 1 7 7v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V8a7 7 0 0 1 7-7Z" />
              <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
            </svg>
            <span className="text-sm text-gray-700">
              {partner.phone_number}
            </span>
          </div>

          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" />
              <path d="M10 4a6 6 0 1 0 6 6 6 6 0 0 0-6-6Z" />
            </svg>
            <a
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Visit Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedPartnerCard;