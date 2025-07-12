"use client"
import { useNavigate } from "react-router-dom"
import { UserIcon, FileText, Calendar, Bell, Settings, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function UserDashboard() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("User") // Default name
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Fetch user name from localStorage or API if available
    const storedUserName = localStorage.getItem("first_name") // Assuming first_name is stored
    if (storedUserName) {
      setUserName(storedUserName)
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    // Mock logout for demo
    localStorage.removeItem("auth_token")
    localStorage.removeItem("account_type")
    localStorage.removeItem("first_name")
    navigate("/login")
  }

  // Custom Card component using plain Tailwind CSS
  const CustomCard = ({ icon, title, subtitle, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group cursor-pointer bg-white hover:shadow-2xl transition-all duration-500 p-6 rounded-3xl shadow-lg border border-gray-100 hover:border-yellow-300 w-full h-64 flex flex-col items-center justify-center text-center space-y-5 relative overflow-hidden hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-br from-blue-600 to-yellow-400"></div>

      {/* Animated Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-blue-400 to-blue-600"></div>

      {/* Icon Container */}
      <motion.div
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative p-5 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
      >
        {icon}
      </motion.div>

      {/* Content */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-xl font-bold text-blue-900 group-hover:text-blue-800 transition-colors">{title}</h3>
        <p className="text-sm text-blue-600 leading-relaxed px-1 group-hover:text-blue-700 transition-colors">
          {subtitle}
        </p>
      </div>
    </motion.div>
  )

  // Quick Action Button component
  const QuickActionButton = ({ icon, label, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center space-x-3 px-5 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md font-medium bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200"
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section (now just a title, assuming global navbar is present) */}
        <div className="max-w-6xl mx-auto mb-10">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Welcome back, {userName}!</h1>
          <p className="text-blue-700 text-sm">
            Dashboard &gt; <span className="text-blue-800 font-medium">Home</span>
          </p>
        </div>

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-yellow-200"
        >
          <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-xl">
              <Settings className="text-blue-800 text-lg" />
            </div>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <QuickActionButton
              icon={<Settings className="text-lg" />}
              label="Settings"
              onClick={() => navigate("/user/settings")}
            />
            <QuickActionButton
              icon={<Bell className="text-lg" />}
              label="Notifications"
              onClick={() => navigate("/user/notifications")}
            />
            <QuickActionButton icon={<LogOut className="text-lg" />} label="Logout" onClick={handleLogout} />
          </div>
        </motion.div>

        {/* Main Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="text-blue-800 text-lg" />
            </div>
            <h2 className="text-3xl font-bold text-blue-900">Your Dashboard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <CustomCard
              icon={<UserIcon className="h-9 w-9" />}
              title="My Profile"
              subtitle="View and update your personal information, contact details, and account settings."
              onClick={() => navigate("/user/profile")}
            />
            <CustomCard
              icon={<Calendar className="h-9 w-9" />}
              title="Book Appointment"
              subtitle="Schedule new appointments and manage your visits."
              onClick={() => navigate("/user/appointments")}
            />
            <CustomCard
              icon={<FileText className="h-9 w-9" />}
              title="Consultation History"
              subtitle="Review previous medical consultations, doctor's notes, and treatment history."
              onClick={() => navigate("/user/history")}
            />
          </div>
        </motion.div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-white to-blue-50 border-t-2 border-yellow-200 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-blue-700 font-semibold mb-2">
              © 2025 National University - Lipa Campus Medical Center. All rights reserved.
            </p>
            <p className="text-blue-600 text-sm flex items-center justify-center gap-2">
              Your health information is secure and confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// Note: This code assumes you have the necessary routes set up in your React Router configuration.