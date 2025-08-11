import { UserIcon, Bell, LogOut, ChevronDown, Settings, Menu, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import "../../index.css"
import { capitalizeWords } from "../../utils"
import { useLoading } from "../../user/components/LoadingContext"
import LoadingScreen from "../../user/components/LoadingScreen"


export default function UserDashboard() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { loading, showLoading, hideLoading } = useLoading()
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      navigate("/login")
    } else {
      axios
        .get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((response) => {
          setFirstName(capitalizeWords(response.data.first_name))
        })
      axios
        .get("http://localhost:8000/api/notifications", {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => setNotifications(res.data))
        .catch(() => setNotifications([]))
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [navigate])

  const handleLogout = () => {
  showLoading();
  const authToken = localStorage.getItem("auth_token");

  axios
    .post("http://localhost:8000/api/logout", {}, { headers: { Authorization: `Bearer ${authToken}` } })
    .then(() => {
      localStorage.removeItem("auth_token");
      hideLoading();
      navigate("/login");
    })
    .catch(() => {
      localStorage.removeItem("auth_token");
      hideLoading();
      navigate("/login");
    });
};

  return (
    <div>
      {loading && <LoadingScreen />}
      {/* Enhanced Navbar */}
      <nav className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white shadow-2xl border-b-4 border-yellow-400 relative">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                    alt="NU CARES"
                    className="h-8 w-8"
                  />
                </div>
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">NU-CARES</h1>
                <p className="text-yellow-300 text-xs font-medium hidden sm:block">Medical Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center spacze-x-6">
              {/* Notification Bell */}
          <div className="relative hidden md:block" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-300 group"
            >
              <Bell className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown (Desktop Only) */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-96 bg-white text-black rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="bg-yellow-400 text-blue-900 text-xs px-2 py-1 rounded-full font-bold">
                        {notifications.length}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No new notifications</p>
                      <p className="text-gray-400 text-sm">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                          index === notifications.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <p className="text-sm text-gray-800 font-medium mb-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>


              {/* User Greeting */}
              <div className="hidden lg:block">
                <p className="text-yellow-300 text-sm font-medium">Welcome back,</p>
                <p className="text-white font-bold text-lg">{firstName}</p>
              </div>

              {/* User Profile Dropdown */}
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

                {/* Enhanced Profile Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-black rounded-2xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                          <UserIcon className="text-blue-800 h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{firstName}</p>
                          <p className="text-blue-200 text-sm">Student Portal</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          navigate("/settings")
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
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div ref={mobileMenuRef} className="md:hidden border-t border-blue-700 bg-blue-800/50 backdrop-blur-sm">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile User Info */}
                <div className="flex items-center space-x-3 pb-4 border-b border-blue-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <UserIcon className="text-blue-800 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{firstName}</p>
                    <p className="text-yellow-300 text-sm">Student Portal</p>
                  </div>
                </div>

                {/* Mobile Notifications */}
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Notifications</span>
                  </div>
                  {notifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Items */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate("/user/profile", { replace: true })
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate("/settings")
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Settings className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-600/20 transition-colors text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
