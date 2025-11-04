import React, { useState } from "react";

const AvailableJobCard = ({ job, onArchive, close }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleArchive = () => {
    onArchive(job.id); // Call the archive function with the job's ID
    setIsDropdownOpen(false); // Close the dropdown
  };

  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm relative">
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

      {/* Job Details */}
      <div className="p-6">
        <h5 className="text-xl font-bold text-gray-900">
          {job.title}
        </h5>
        <p className="text-sm text-gray-500 mt-2">
          {job.location}
        </p>
        <p className="text-sm text-gray-700  mt-4">
          {job.description}
        </p>

        {/* Salary */}
        <div className="mt-4 flex items-center">
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
          <span className="text-sm text-gray-700">
            Salary: GH₵ {job.salary}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AvailableJobCard;