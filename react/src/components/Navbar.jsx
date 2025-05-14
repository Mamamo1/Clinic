import {
    User as UserIcon,
    Bell,
    Info,
    FileText,
    LogOut,
    ChevronDown,
    Clock,
    Settings
  } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import { useEffect, useState, useRef } from "react";
  import axios from "axios";
  import { motion } from "framer-motion";
  import '../index.css';
  
  export default function UserDashboard() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
  
    useEffect(() => {
      const authToken = localStorage.getItem("auth_token");
  
      if (!authToken) {
        navigate("/login");
      } else {
        axios
          .get("http://localhost:8000/api/user", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
          .then((response) => {
            setFirstName(response.data.first_name);
          })
          .catch(() => {
            navigate("/login");
          });
      }
  
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
        if (notifRef.current && !notifRef.current.contains(event.target)) {
          setNotifOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [navigate]);
  
    const handleLogout = () => {
      setLoading(true); // Start loading animation
      const authToken = localStorage.getItem("auth_token");
      axios
        .post("http://localhost:8000/api/logout", {}, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then(() => {
          localStorage.removeItem("auth_token");
          setLoading(false); // Stop loading animation
          navigate("/login");
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
          setLoading(false); // Stop loading animation in case of error
          navigate("/login");
        });
    };
  
    return (
      <div>
        {/* Loading Spinner (Center of screen) */}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
            <div className="flex flex-col justify-center items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                alt="NU Logo"
                className="w-24 h-24 animate-spin-center"
              />
              <p className="mt-4 text-white text-center font-bold text-2xl">Processing...</p>
            </div>
          </div>
        )}
  
        {/* Navbar */}
        <div className="bg-[#2E3192] text-white py-4 px-8 flex justify-between items-center border-b-4 border-yellow-400">
          <div className="flex items-center space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
              alt="NU CARES"
              className="h-10"
            />
            <h1 className="text-xl font-bold">NU-CARES</h1>
          </div>
  
          <div className="flex items-center space-x-6" ref={dropdownRef}>
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <Bell
                className="h-6 w-6 text-white cursor-pointer"
                onClick={() => setNotifOpen(!notifOpen)}
              />
             <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1">
                   3
                   </span>
  
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[380px] bg-white text-black rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b font-bold text-xl">Notifications</div>
                  {/* Your notification content */}
                </div>
              )}
            </div>
  
            {/* Greeting */}
            <div className="text-lg font-semibold text-white">Hi, {firstName}</div>
  
            {/* User Icon + Dropdown */}
            <div
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <UserIcon className="text-gray-700" />
            </div>
            <ChevronDown className="cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)} />
  
            {dropdownOpen && (
              <div className="absolute right-0 top-12 bg-white text-black rounded shadow-lg w-48 z-10">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/user/profile");
                  }}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
                >
                  <UserIcon className="h-4 w-4 mr-2" /> Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
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
  
        {/* Optional Dashboard Content Below */}
        {/* ... your cards or content go here ... */}
      </div>
    );
  }
  