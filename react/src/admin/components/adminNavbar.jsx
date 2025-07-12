"use client"

import { UserIcon, LogOut, ChevronDown, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import "../../index.css"
import { capitalizeWords } from "../../utils"
import { useLoading } from "../../user/components/LoadingContext"
import LoadingScreen from "../../user/components/LoadingScreen"

export default function AdminNavbar() {
  const navigate = useNavigate()
  const [adminName, setAdminName] = useState("Administrator")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { loading, showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      navigate("/login")
    } else {
      axios
        .get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAdminName(capitalizeWords(response.data.first_name) || "Administrator")
        })
        .catch(() => {
          navigate("/login")
        })
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [navigate])

  const handleLogout = () => {
    showLoading("Logging out...", "auth")
    const token = localStorage.getItem("auth_token")
    axios
      .post("http://localhost:8000/api/logout", {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("account_type")
        localStorage.removeItem("first_name")
        hideLoading()
        navigate("/login")
      })
      .catch((error) => {
        console.error("Logout failed:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("account_type")
        localStorage.removeItem("first_name")
        hideLoading()
        navigate("/login")
      })
  }

  return (
    <div>
      {loading && <LoadingScreen />}

      {/* Enhanced Admin Navbar */}
      <nav className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white shadow-2xl border-b-4 border-yellow-400 relative">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-3 border-yellow-400 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                    alt="NU CARES Admin"
                    className="h-9 w-9"
                  />
                </div>
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">NU-CARES Admin</h1>
                <p className="text-yellow-300 text-xs font-medium hidden sm:block">System Management</p>
              </div>
            </div>

            {/* Right: Admin Greeting & Profile Dropdown */}
            <div className="flex items-center space-x-6">
              <div className="hidden lg:block">
                <p className="text-yellow-300 text-sm font-medium">Welcome,</p>
                <p className="text-white font-bold text-lg">{adminName}</p>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserIcon className="text-blue-800 h-5 w-5" />
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-white group-hover:text-yellow-300 transition-all duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-black rounded-2xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                          <UserIcon className="text-blue-800 h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{adminName}</p>
                          <p className="text-blue-200 text-sm">Administrator</p>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            navigate("/admin/profile", { replace: true })
                          }}
                          className="flex items-center px-4 py-3 hover:bg-blue-50 w-full transition-colors group"
                        >
                          <UserIcon className="h-5 w-5 mr-3 text-blue-600 group-hover:text-blue-700" />
                          <span className="font-medium">Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            navigate("/admin/settings")
                          }}
                          className="flex items-center px-4 py-3 hover:bg-blue-50 w-full transition-colors group"
                        >
                          <Settings className="h-5 w-5 mr-3 text-blue-600 group-hover:text-blue-700" />
                          <span className="font-medium">Settings</span>
                        </button>
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full transition-colors group"
                        >
                          <LogOut className="h-5 w-5 mr-3 group-hover:text-red-700" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
