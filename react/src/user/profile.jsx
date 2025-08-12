"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  User,
  Mail,
  BookOpen,
  Hash,
  Phone,
  MapPin,
  Calendar,
  GroupIcon as Gender,
  Briefcase,
  Edit,
  ShieldCheck,
  Home,
  Building2,
  Globe,
} from "lucide-react"
import { useLoading } from "./components/LoadingContext" // Assuming this path is correct
import LoadingScreen from "./components/LoadingScreen" // Assuming this path is correct

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
  if (!str || typeof str !== "string") return str
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export default function UserProfile() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const { loading, showLoading, hideLoading } = useLoading()
  const [accountType, setAccountType] = useState("")

  useEffect(() => {
    const auth_token = localStorage.getItem("auth_token")
    const storedAccountType = localStorage.getItem("account_type")
    setAccountType(storedAccountType || "")

    if (!auth_token) {
      navigate("/login")
      return
    }

    showLoading("Loading profile...", "auth")
    axios
      .get("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      })
      .then((response) => {
        const data = response.data
        // Capitalize specific fields for display
        const capitalizedData = {
          ...data,
          first_name: capitalizeWords(data.first_name),
          middle_name: capitalizeWords(data.middle_name),
          last_name: capitalizeWords(data.last_name),
          gender: capitalizeWords(data.gender),
          nationality: capitalizeWords(data.nationality),
          street: capitalizeWords(data.street),
          city: capitalizeWords(data.city),
          state: capitalizeWords(data.state),
        }
        setUserData(capitalizedData)
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
        // Optionally navigate to login or show an error message
        navigate("/login")
      })
      .finally(() => {
        hideLoading()
      })
  }, [navigate, showLoading, hideLoading])

  const getDisplayValue = useCallback((key, value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A"
    }
    if (key === "dob") {
      try {
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      } catch {
        return value // Fallback if date parsing fails
      }
    }
    return value
  }, [])

  const renderField = (label, value, icon) => (
    <div className="flex items-center mb-3">
      <div className="p-2 bg-blue-100 rounded-full mr-3 text-blue-700">{icon}</div>
      <div>
        <label className="block text-sm font-medium text-blue-700">{label}</label>
        <p className="text-blue-900 font-semibold text-base">
          {getDisplayValue(label.toLowerCase().replace(/\s/g, ""), value)}
        </p>
      </div>
    </div>
  )

  if (loading) return <LoadingScreen />
  if (!userData) return null // Or a more sophisticated loading/error state

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <button
        className="flex items-center text-blue-700 hover:text-blue-900 transition-colors duration-200 mb-6 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 shadow-sm hover:shadow-md"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="text-lg font-semibold">Back to Dashboard</span>
      </button>

      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-yellow-200">
        {/* Golden accent bar */}
        <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

        {/* Profile Header */}
        <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-lg border-4 border-yellow-400">
            <User className="w-16 h-16 text-blue-700" />
            {/* Placeholder for actual profile picture */}
            {/* <img src="/placeholder.svg?height=128&width=128" alt="User Profile" className="w-full h-full rounded-full object-cover" /> */}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
              {userData.first_name} {userData.middle_name} {userData.last_name}
            </h1>
            <p className="text-blue-700 text-lg mb-4">
              {accountType === "Employee" ? (
                <>
                  <Briefcase className="inline-block w-5 h-5 mr-2 text-yellow-600" />
                  Employee ID: <span className="font-bold">{userData.employee_id || "N/A"}</span>
                </>
              ) : (
                <>
                  <BookOpen className="inline-block w-5 h-5 mr-2 text-yellow-600" />
                  Student ID: <span className="font-bold">{userData.student_number || "N/A"}</span>
                </>
              )}
            </p>
            <p className="text-blue-600 text-md mb-2 flex items-center justify-center md:justify-start">
              <Mail className="w-5 h-5 mr-2 text-blue-500" />
              Official Email: <span className="font-bold ml-2">{userData.email || "N/A"}</span>
            </p>
            {accountType !== "Employee" && (
              <p className="text-blue-600 text-md flex items-center justify-center md:justify-start">
                <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                Program: <span className="font-bold ml-2">{userData.course || "N/A"}</span>
              </p>
            )}
            <button
              onClick={() => alert("Edit Profile functionality coming soon!")} 
              className="mt-6 px-6 py-3 bg-yellow-500 text-blue-900 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center md:inline-flex"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Personal Info & Contact Info Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10 border-t border-blue-100">
          {/* Personal Information */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-yellow-600" />
              Personal Information
            </h2>
            {renderField("First Name", userData.first_name, <User className="w-4 h-4" />)}
            {renderField("Middle Name", userData.middle_name, <User className="w-4 h-4" />)}
            {renderField("Last Name", userData.last_name, <User className="w-4 h-4" />)}
            {renderField("Gender", userData.gender, <Gender className="w-4 h-4" />)}
            {renderField("Date of Birth", userData.dob, <Calendar className="w-4 h-4" />)}
          </div>

          {/* Address And Contacts */}
          <div className="bg-yellow-50 p-6 rounded-xl shadow-inner border border-yellow-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-blue-700" />
              Address & Contacts
            </h2>
            {renderField("Mobile Number", userData.mobile, <Phone className="w-4 h-4" />)}
            {renderField("Emergency Contact", userData.telephone, <Phone className="w-4 h-4" />)}
            {renderField("Street", userData.street, <Home className="w-4 h-4" />)}
            {renderField("City", userData.city, <Building2 className="w-4 h-4" />)}
            {renderField("Province/State", userData.state, <Building2 className="w-4 h-4" />)}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-6 bg-blue-900 text-white rounded-b-2xl">
          <p className="font-semibold mb-2">
            <ShieldCheck className="inline-block w-5 h-5 mr-2 text-yellow-400" />
            Your information is protected under Philippine Data Privacy Act
          </p>
          <p className="text-blue-300 text-sm">
            © 2025 National University - Lipa Campus Medical Center. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
