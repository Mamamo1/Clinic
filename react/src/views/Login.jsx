"use client"

import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaGraduationCap,
  FaStethoscope,
  FaHome,
  FaExclamationCircle,
} from "react-icons/fa"
import axios from "axios"
import { useLoading } from "../user/components/LoadingContext"
import "../index.css"

export default function NULogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [campus, setCampus] = useState("NU Lipa")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  // Get the loading context
  const { loading, showLoading, hideLoading } = useLoading()

  // Check form validity
  useEffect(() => {
    setIsFormValid(email.trim() !== "" && password.trim() !== "")
  }, [email, password])

  // Check if user is logged in and redirect based on account type
  useEffect(() => {
    const userToken = localStorage.getItem("auth_token")
    const accountType = localStorage.getItem("account_type")
    if (userToken) {
      switch (accountType) {
          case "SuperAdmin":
            navigate("/admin")
            break
          case "Doctor":
          case "Nurse":
          case "Dentist":
            navigate("/medicalStaff")
            break
          case "SHS":
          case "College":
          case "Employee":
            navigate("/user")
            break
          default:
            navigate("/user")
        }
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setEmailError("")
    setPasswordError("")
    setGeneralError("")

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required")
      return
    }
    if (!password.trim()) {
      setPasswordError("Password is required")
      return
    }

    showLoading()

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email: email.trim(),
        password,
        campus,
      })

      hideLoading()

      if (response.data.success) {
        const accountType = response.data.user.account_type

        // Save token and account type in localStorage
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("account_type", accountType)
        localStorage.setItem("first_name", response.data.user.first_name)

        // Redirect based on account type
        switch (accountType) {
            case "SuperAdmin":
              navigate("/admin")
              break
            case "Doctor":
            case "Nurse":
            case "Dentist":
              navigate("/medicalStaff")
              break
            case "SHS":
            case "College":
            case "Employee":
              navigate("/user")
              break
            default:
              navigate("/user")
          }
        } else {
        if (response.data.error === "Invalid email") {
          setGeneralError("Invalid email or username.")
        } else if (response.data.error === "Invalid password") {
          setGeneralError("Incorrect password.")
        } else {
          setGeneralError("Login failed. Please check your credentials.")
        }
      }
    } catch (error) {
      hideLoading()
      console.error("Login error:", error)

      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          setGeneralError("Invalid credentials. Please check your email and password.")
        } else if (status === 422) {
          setGeneralError("Please check your input and try again.")
        } else {
          setGeneralError("Login failed. Please try again.")
        }
      } else if (error.request) {
        setGeneralError("Network error. Please check your connection and try again.")
      } else {
        setGeneralError("An unexpected error occurred. Please try again.")
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-yellow-300/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-300/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="flex w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
          {/* Left Section - NU Branding */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 p-12 flex-col items-center justify-center relative">
            {/* Decorative Elements */}
            <div className="absolute top-8 right-8 w-16 h-16 border-2 border-blue-800/20 rounded-full"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-blue-800/10 rounded-full"></div>

            {/* Logo and Branding */}
            <div className="text-center">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-blue-800 mx-auto">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                    alt="NU Logo"
                    className="w-28 h-28"
                  />
                </div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">NU-CARES</h1>
              <p className="text-blue-800 text-lg font-medium mb-4">National University</p>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="bg-blue-800 p-3 rounded-full">
                  <FaStethoscope className="text-yellow-400 text-xl" />
                </div>
                <div className="bg-blue-800 p-3 rounded-full">
                  <FaGraduationCap className="text-yellow-400 text-xl" />
                </div>
              </div>

              <p className="text-blue-800 text-sm font-medium italic">"Making health records easy for you"</p>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back</h2>
                <p className="text-blue-600">Sign in to your NU-CARES account</p>
              </div>
              <NavLink
                to="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                <FaHome className="text-sm" />
                <span className="text-sm">Home</span>
              </NavLink>
            </div>

            {/* Campus Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-blue-900 mb-2">Select Campus</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 focus:border-blue-800 transition-all duration-200 bg-white"
              >
                <option value="NU Lipa">NU Lipa Campus</option>
              </select>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-blue-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError("")
                      if (generalError) setGeneralError("")
                    }}
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 transition-all duration-200 ${
                      emailError ? "border-red-500 bg-red-50" : "border-blue-200 focus:border-blue-800 bg-white"
                    }`}
                  />
                </div>
                {emailError && (
                  <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
                    <FaExclamationCircle className="mr-2" />
                    {emailError}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-blue-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) setPasswordError("")
                      if (generalError) setGeneralError("")
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 transition-all duration-200 ${
                      passwordError ? "border-red-500 bg-red-50" : "border-blue-200 focus:border-blue-800 bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordError && (
                  <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
                    <FaExclamationCircle className="mr-2" />
                    {passwordError}
                  </div>
                )}
              </div>

              {/* General Error */}
              {generalError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700 font-medium">
                    <FaExclamationCircle className="mr-2 text-red-500" />
                    {generalError}
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isFormValid && !loading
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  " Sign in to NU-CARES"
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                <NavLink
                  to="/signup"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                >
                  Don't have an account? Create one
                </NavLink>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                  Forgot your password?
                </a>
              </div>

              <div className="text-center pt-4 border-t border-blue-100">
                <p className="text-blue-600 text-sm">Need help? Contact NU-CARES Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Logo for smaller screens */}
      <div className="lg:hidden absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
              alt="NU Logo"
              className="w-8 h-8"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">NU-CARES</h1>
            <p className="text-yellow-300 text-xs">Lipa Campus</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        <p className="text-white/80 text-xs">© 2025 National University - Lipa Campus. All rights reserved.</p>
      </div>
    </div>
  )
}
