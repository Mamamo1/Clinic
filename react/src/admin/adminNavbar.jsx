import {
  User as UserIcon,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../index.css";
import { capitalizeWords } from "../utils";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      navigate("/login");
    } else {
      axios
        .get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => {
          navigate("/login");
        });
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const handleLogout = () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");

    axios
      .post(
        "http://localhost:8000/api/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        localStorage.removeItem("auth_token");
        setLoading(false);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        localStorage.removeItem("auth_token");
        setLoading(false);
        navigate("/login");
      });
  };

  return (
    <div>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
          <div className="flex flex-col justify-center items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
              alt="NU Logo"
              className="w-24 h-24 animate-spin-center"
            />
            <p className="mt-4 text-white text-center font-bold text-2xl">
              Processing...
            </p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="bg-[#2E3192] text-white py-4 px-8 flex justify-between items-center border-b-4 border-yellow-400">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
            alt="NU CARES"
            className="h-10"
          />
          <h1 className="text-xl font-bold">NU-CARES</h1>
        </div>

        {/* Right: Avatar & Dropdown */}
        <div className="flex items-center space-x-2 relative">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            tabIndex={0}
            role="button"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <UserIcon className="text-gray-700" />
            </div>
            <ChevronDown className="text-white" />
          </div>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-12 bg-white text-black rounded shadow-lg w-48 z-10"
            >
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/user/profile", { replace: true });
                }}
                className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
              >
                <UserIcon className="h-4 w-4 mr-2" /> Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
                className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
              >
                <Settings className="h-4 w-4 mr-2" /> Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-100 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
