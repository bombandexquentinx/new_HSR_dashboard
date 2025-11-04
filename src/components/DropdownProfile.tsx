import app from "@/utils/api";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function DropdownProfile({ align }) {
  const storedItem = localStorage.getItem("homestyle_admin_user");
  const userData = JSON.parse(storedItem);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const onLogout = async() => {
    try {
      const response = await app.get('/admin/logout');
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("homestyle_admin_user");
      navigate("/");
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <div className="profileAvatar"></div>
        <div className="flex items-center truncate">
          <img alt="Display" className="h-10 w-10 mr-4 rounded-full object-cover" src="https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"/>
          <span className="hidden text-right lg:block">
            <span className="block text-sm font-medium text-black ">Profile</span>
          </span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-slate-800" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      {dropdownOpen && (
        <div ref={dropdown} className="absolute right-0 mt-12 w-48 bg-white border rounded shadow-lg z-10">
          <ul className="m-0 p-0">
            <li>
              <Link to="/profile" className="no-underline w-full block px-4 py-2 text-black hover:bg-gray-100">
                My Profile
              </Link>
            </li>
            <li>
            <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-black hover:bg-gray-100"
          >
            Log Out
          </button>
            </li>
          </ul>
          
        </div>
      )}
    </div>
  );
}

export default DropdownProfile;
