"use client"

import React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { FaUserPlus, FaCheck, FaExclamationCircle, FaStethoscope, FaGraduationCap } from "react-icons/fa"
import axios from "axios"
import Swal from "sweetalert2"

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-2xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
      <p className="mt-4 text-center text-blue-800 font-medium">Processing Registration...</p>
    </div>
  </div>
)

// Memoized InputField component to prevent unnecessary re-renders
const InputField = React.memo(
  ({
    label,
    name,
    type = "text",
    required = false,
    options = null,
    children = null,
    onChange,
    value,
    hasError,
    isValid,
    errorMessage,
    ...props
  }) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-blue-900 mb-2">
          {label}
          {required && <span className="text-yellow-600 ml-1 text-lg font-bold">*</span>}
        </label>
        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 focus:border-blue-800 transition-all duration-200 ${
              hasError
                ? "border-red-500 bg-red-50"
                : isValid
                  ? "border-green-500 bg-green-50"
                  : "border-blue-200 bg-white hover:border-blue-400"
            }`}
            {...props}
          >
            {options &&
              options.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.text || option}
                </option>
              ))}
            {children}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 focus:border-blue-800 transition-all duration-200 resize-none ${
              hasError
                ? "border-red-500 bg-red-50"
                : isValid
                  ? "border-green-500 bg-green-50"
                  : "border-blue-200 bg-white hover:border-blue-400"
            }`}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 focus:border-blue-800 transition-all duration-200 ${
              hasError
                ? "border-red-500 bg-red-50"
                : isValid
                  ? "border-green-500 bg-green-50"
                  : "border-blue-200 bg-white hover:border-blue-400"
            }`}
            {...props}
          />
        )}
        {hasError && (
          <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
            <FaExclamationCircle className="mr-2 text-base" />
            {errorMessage}
          </div>
        )}
        {isValid && (
          <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
            <FaCheck className="mr-2 text-base" />
            Looks good!
          </div>
        )}
      </div>
    )
  },
)

InputField.displayName = "InputField"

export default function NUSignupForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    password_confirmation: "",
    student_number: "",
    employee_id: "",
    course: "",
    dob: "",
    mobile: "",
    gender: "",
    nationality: "Filipino",
    street: "",
    city: "",
    state: "",
    telephone: "",
    account_type: "",
  })

  const [courseType, setCourseType] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})

  // Memoized course data to prevent recreation on every render
  const courseData = useMemo(
    () => ({
      shsCourses: [
        { value: "ABM", text: "ABM - Accountancy, Business and Management" },
        { value: "STEM", text: "STEM - Science, Technology, Engineering and Mathematics" },
        { value: "HUMSS", text: "HUMSS - Humanities and Social Sciences" },
      ],
      collegeDepartments: {
        "SABM (School of Accountancy, Business, and Management)": [
          { value: "BSA", text: "(BSA) Bachelor of Science in Accountancy" },
          { value: "BSBA-FINMGT", text: "(BSBA-FINMGT) BSBA Major in Financial Management" },
          { value: "BSBA-MKTGMGT", text: "(BSBA-MKTGMGT) BSBA Major in Marketing Management" },
          { value: "BSTM", text: "(BSTM) BS in Tourism Management" },
        ],
        "SACE (School of Architecture, Computing, and Engineering)": [
          { value: "BSARCH", text: "(BSARCH) BS in Architecture" },
          { value: "BSCE", text: "(BSCE) BS in Civil Engineering" },
          { value: "BSCS", text: "(BSCS) BS in Computer Science" },
          { value: "BSIT-MWA", text: "(BSIT-MWA) BSIT with Mobile/Web App Development" },
        ],
        "SAHS (School of Allied Health and Science)": [
          { value: "BSMT", text: "(BSMT) BS in Medical Technology" },
          { value: "BSN", text: "(BSN) BS in Nursing" },
          { value: "BSPSY", text: "(BSPSY) BS in Psychology" },
        ],
      },
    }),
    [],
  )

  // Check authentication on mount
  useEffect(() => {
    const userToken = localStorage.getItem("auth_token")
    if (userToken) {
      navigate("/user")
    }
  }, [navigate])

  // Enhanced validation with better error messages
  const validateField = useCallback(
    (name, value) => {
      const errors = {}

      switch (name) {
        case "email":
          if (!value.trim()) {
            errors.email = "Email is required"
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.email = "Please enter a valid email address"
          } else if (!value.toLowerCase().includes("nu-lipa.edu.ph") && !value.toLowerCase().includes("gmail.com")) {
            // Allow both NU email and Gmail for flexibility
            errors.email = "Please use your NU email or a valid Gmail address"
          }
          break

        case "password":
          if (!value) {
            errors.password = "Password is required"
          } else if (value.length < 8) {
            errors.password = "Password must be at least 8 characters long"
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            errors.password = "Password must contain uppercase, lowercase, and number"
          }
          break

        case "password_confirmation":
          if (!value) {
            errors.password_confirmation = "Please confirm your password"
          } else if (value !== formData.password) {
            errors.password_confirmation = "Passwords do not match"
          }
          break

        case "firstName":
        case "lastName":
          if (!value.trim()) {
            errors[name] = `${name === "firstName" ? "First" : "Last"} name is required`
          } else if (value.trim().length < 2) {
            errors[name] = `${name === "firstName" ? "First" : "Last"} name must be at least 2 characters`
          }
          break

        case "student_number":
          if (courseType !== "Employee" && !value.trim()) {
            errors.student_number = "Student number is required"
          } else if (courseType !== "Employee" && !/^\d{4}-\d{6}$/.test(value)) {
            errors.student_number = "Student number format: YYYY-XXXXXX (e.g., 2024-123456)"
          }
          break

        case "employee_id":
          if (courseType === "Employee" && !value.trim()) {
            errors.employee_id = "Employee ID is required"
          } else if (courseType === "Employee" && value.length < 4) {
            errors.employee_id = "Employee ID must be at least 4 characters"
          }
          break

        case "mobile":
          if (!value.trim()) {
            errors.mobile = "Mobile number is required"
          } else if (!/^(09|\+639)\d{9}$/.test(value.replace(/[-\s]/g, ""))) {
            errors.mobile = "Please enter a valid Philippine mobile number (09XXXXXXXXX)"
          }
          break

        case "dob":
          if (!value) {
            errors.dob = "Date of birth is required"
          } else {
            const birthDate = new Date(value)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            if (age < 15 || age > 100) {
              errors.dob = "Age must be between 15 and 100 years"
            }
          }
          break

        case "city":
        case "state":
          if (!value.trim()) {
            errors[name] = `${name === "city" ? "City" : "Province"} is required`
          }
          break

        case "course":
          if (courseType && courseType !== "Employee" && !value.trim()) {
            errors.course = "Please select your academic program"
          }
          break
      }

      return errors
    },
    [formData.password, courseType],
  )

  // Optimized change handler with debouncing for validation
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      let newValue = value
      const nameFields = ["firstName", "middleName", "lastName"]
      const numberOnlyFields = ["student_number", "employee_id", "mobile", "telephone"]
      const capitalizeFields = ["firstName", "middleName", "lastName", "street", "city", "state"]

      // Input sanitization
      if (nameFields.includes(name)) {
        newValue = newValue.replace(/[0-9]/g, "")
      }

      if (numberOnlyFields.includes(name)) {
        if (name === "student_number") {
          // Format student number as YYYY-XXXXXX
          newValue = newValue.replace(/[^0-9-]/g, "")
          if (newValue.length === 4 && !newValue.includes("-")) {
            newValue += "-"
          }
          newValue = newValue.slice(0, 11)
        } else {
          newValue = newValue.replace(/[^0-9-+]/g, "").slice(0, 15)
        }
      }

      if (capitalizeFields.includes(name)) {
        newValue = newValue.replace(/\b\w/g, (char) => char.toUpperCase())
      }

      // Update form data
      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }))

      // Mark field as touched
      setTouchedFields((prev) => ({ ...prev, [name]: true }))

      // Debounced validation
      setTimeout(() => {
        const fieldErrors = validateField(name, newValue)
        setValidationErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name] || undefined,
        }))
      }, 300)
    },
    [validateField],
  )

  const handleCourseTypeChange = useCallback((e) => {
    const selected = e.target.value
    setCourseType(selected)
    let accountType = ""
    if (selected === "SHS") accountType = "SHS"
    else if (selected === "College") accountType = "College"
    else if (selected === "Employee") accountType = "Employee"

    setFormData((prev) => ({
      ...prev,
      course: "",
      account_type: accountType,
      student_number: selected !== "Employee" ? prev.student_number : "",
      employee_id: selected === "Employee" ? prev.employee_id : "",
    }))

    // Clear validation errors for fields that are no longer relevant
    setValidationErrors((prev) => ({
      ...prev,
      student_number: undefined,
      employee_id: undefined,
      course: undefined,
    }))
  }, [])

  const handleCheckboxChange = useCallback(() => {
    setAgreeToTerms((prev) => !prev)
  }, [])

  const validateCurrentStep = useCallback(() => {
    const errors = {}

    if (currentStep === 1) {
      const requiredFields = ["email", "password", "password_confirmation"]
      if (courseType !== "Employee") requiredFields.push("student_number")
      if (courseType === "Employee") requiredFields.push("employee_id")
      if (courseType && courseType !== "Employee") requiredFields.push("course")

      requiredFields.forEach((field) => {
        const fieldErrors = validateField(field, formData[field])
        Object.assign(errors, fieldErrors)
      })
    } else if (currentStep === 2) {
      const requiredFields = ["firstName", "lastName", "gender", "dob"]
      requiredFields.forEach((field) => {
        const fieldErrors = validateField(field, formData[field])
        Object.assign(errors, fieldErrors)
      })
    } else if (currentStep === 3) {
      const requiredFields = ["street", "city", "state", "mobile"]
      requiredFields.forEach((field) => {
        const fieldErrors = validateField(field, formData[field])
        Object.assign(errors, fieldErrors)
      })
    }

    return errors
  }, [currentStep, courseType, formData, validateField])

  const canProceedToNextStep = useCallback(() => {
    const errors = validateCurrentStep()
    return Object.keys(errors).length === 0
  }, [validateCurrentStep])

  const handleNext = useCallback(() => {
    const errors = validateCurrentStep()
    if (Object.keys(errors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    } else {
      setValidationErrors(errors)
      // Mark all fields in current step as touched
      Object.keys(errors).forEach((field) => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }))
      })
    }
  }, [validateCurrentStep])

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  // Enhanced submit handler with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!agreeToTerms) {
      await Swal.fire({
        title: "Terms Required",
        text: "You must agree to the terms and conditions to proceed.",
        icon: "warning",
        confirmButtonColor: "#1e40af",
      })
      return
    }

    const allErrors = validateCurrentStep()
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors)
      await Swal.fire({
        title: "Validation Error",
        text: "Please fix the errors in the form before submitting.",
        icon: "error",
        confirmButtonColor: "#1e40af",
      })
      return
    }

    setLoading(true)

    // Build payload conditionally
    const payload = {
      first_name: formData.firstName?.trim(),
      middle_name: formData.middleName?.trim() || null,
      last_name: formData.lastName?.trim(),
      email: formData.email?.trim().toLowerCase(),
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      dob: formData.dob,
      mobile: formData.mobile?.trim(),
      gender: formData.gender,
      nationality: formData.nationality,
      street: formData.street?.trim(),
      city: formData.city?.trim(),
      state: formData.state?.trim(),
      telephone: formData.telephone?.trim() || null,
      account_type: formData.account_type,
    }

    // Conditionally add fields based on account type
    if (formData.student_number?.trim()) {
      payload.student_number = formData.student_number.trim()
    }

    if (formData.employee_id?.trim()) {
      payload.employee_id = formData.employee_id.trim()
    }

    if (formData.course?.trim()) {
      payload.course = formData.course.trim()
    }

    try {
      const response = await axios.post("http://localhost:8000/api/signup", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // 10 second timeout
      })

      if (response.data?.success === true) {
        setLoading(false)
        await Swal.fire({
          title: "Registration Successful!",
          text: "Welcome to NU-CARES! You can now log in with your credentials.",
          icon: "success",
          confirmButtonColor: "#059669",
          confirmButtonText: "Go to Login",
        })
        navigate("/login")
      } else {
        setLoading(false)
        await Swal.fire({
          title: "Registration Failed",
          text: response.data?.message || "Please check your information and try again.",
          icon: "error",
          confirmButtonColor: "#1e40af",
        })
      }
    } catch (error) {
      setLoading(false)
      console.error("Registration error:", error)

      let errorMessage = "Something went wrong! Please try again."

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const errors = error.response.data.errors
        errorMessage = Object.values(errors).flat().join(", ")
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your connection and try again."
      } else if (!error.response) {
        errorMessage = "Network error. Please check your internet connection."
      }

      await Swal.fire({
        title: "Registration Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#1e40af",
      })
    }
  }

  // Memoized course rendering function
  const renderCourses = useMemo(() => {
    if (courseType === "SHS") {
      return courseData.shsCourses.map((c) => (
        <option key={c.value} value={c.value}>
          {c.text}
        </option>
      ))
    } else if (courseType === "College") {
      return Object.entries(courseData.collegeDepartments).map(([dept, courses]) => (
        <optgroup key={dept} label={dept}>
          {courses.map((c) => (
            <option key={c.value} value={c.value}>
              {c.text}
            </option>
          ))}
        </optgroup>
      ))
    } else {
      return <option disabled>Select account type first</option>
    }
  }, [courseType, courseData])

  // Memoized progress bar component
  const ProgressBar = useMemo(() => {
    const progress = (currentStep / 3) * 100

    return (
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-blue-900">Step {currentStep} of 3</span>
          <span className="text-sm text-blue-700 font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-3 text-xs font-medium">
          <span className={`${currentStep >= 1 ? "text-blue-800 font-bold" : "text-blue-400"} transition-colors`}>
            Account Information
          </span>
          <span className={`${currentStep >= 2 ? "text-blue-800 font-bold" : "text-blue-400"} transition-colors`}>
            Personal Details
          </span>
          <span className={`${currentStep >= 3 ? "text-blue-800 font-bold" : "text-blue-400"} transition-colors`}>
            Contact Information
          </span>
        </div>
      </div>
    )
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {loading && <LoadingScreen />}

      {/* Header with NU Golden Blue Branding */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg border-b-4 border-yellow-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-3 border-yellow-400">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
                  alt="NU Logo"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">National University</h1>
                <p className="text-yellow-300 text-sm font-medium">Lipa Campus - Philippines</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="bg-yellow-400 p-3 rounded-full shadow-lg">
                <FaStethoscope className="text-blue-800 text-2xl" />
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900 flex justify-center items-center gap-3 mb-3">
            <FaUserPlus className="text-yellow-600" />
            Student Registration Portal
          </h2>
          <p className="text-blue-700 font-medium text-lg">Join the NU Lipa Community</p>
          <div className="mt-3 flex justify-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-6 py-2 rounded-full text-sm font-bold shadow-md">
              Excellence • Innovation • Service
            </div>
          </div>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-yellow-200">
          {/* NU Golden accent bar */}
          <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

          <div className="p-6 sm:p-10">
            {ProgressBar}

            <form onSubmit={handleSubmit}>
              {/* Step 1: User Credentials */}
              {currentStep === 1 && (
                <div className="space-y-6" key="step-1">
                  <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border-2 border-yellow-200">
                    <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FaUserPlus className="text-3xl text-blue-800" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Account Setup</h3>
                    <p className="text-blue-600">Create your NU Lipa account credentials</p>
                  </div>

                  <InputField
                    key="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    hasError={touchedFields.email && validationErrors.email}
                    isValid={touchedFields.email && !validationErrors.email && formData.email}
                    errorMessage={validationErrors.email}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      key="password"
                      label="Password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      hasError={touchedFields.password && validationErrors.password}
                      isValid={touchedFields.password && !validationErrors.password && formData.password}
                      errorMessage={validationErrors.password}
                    />
                    <InputField
                      key="password_confirmation"
                      label="Confirm Password"
                      name="password_confirmation"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      hasError={touchedFields.password_confirmation && validationErrors.password_confirmation}
                      isValid={
                        touchedFields.password_confirmation &&
                        !validationErrors.password_confirmation &&
                        formData.password_confirmation
                      }
                      errorMessage={validationErrors.password_confirmation}
                    />
                  </div>

                  <InputField
                    key="account_type"
                    label="Account Type"
                    name="account_type"
                    type="select"
                    required
                    value={courseType}
                    onChange={handleCourseTypeChange}
                    hasError={touchedFields.account_type && validationErrors.account_type}
                    isValid={touchedFields.account_type && !validationErrors.account_type && courseType}
                    errorMessage={validationErrors.account_type}
                    options={[
                      { value: "", text: "Select Your Account Type" },
                      { value: "SHS", text: "Senior High School Student" },
                      { value: "College", text: "College Student" },
                      { value: "Employee", text: "Faculty/Staff Member" },
                    ]}
                  />

                  <InputField
                    key={courseType === "Employee" ? "employee_id" : "student_number"}
                    label={courseType === "Employee" ? "Employee ID Number" : "Student ID Number"}
                    name={courseType === "Employee" ? "employee_id" : "student_number"}
                    required
                    autoComplete="username"
                    placeholder={
                      courseType === "Employee" ? "Enter your employee ID" : "Format: YYYY-XXXXXX (e.g., 2024-123456)"
                    }
                    value={courseType === "Employee" ? formData.employee_id : formData.student_number}
                    onChange={handleChange}
                    hasError={
                      courseType === "Employee"
                        ? touchedFields.employee_id && validationErrors.employee_id
                        : touchedFields.student_number && validationErrors.student_number
                    }
                    isValid={
                      courseType === "Employee"
                        ? touchedFields.employee_id && !validationErrors.employee_id && formData.employee_id
                        : touchedFields.student_number && !validationErrors.student_number && formData.student_number
                    }
                    errorMessage={
                      courseType === "Employee" ? validationErrors.employee_id : validationErrors.student_number
                    }
                  />

                  {courseType && courseType !== "Employee" && (
                    <InputField
                      key="course"
                      label="Academic Program"
                      name="course"
                      type="select"
                      required
                      value={formData.course}
                      onChange={handleChange}
                      hasError={touchedFields.course && validationErrors.course}
                      isValid={touchedFields.course && !validationErrors.course && formData.course}
                      errorMessage={validationErrors.course}
                    >
                      <option value="">Select Your Program</option>
                      {renderCourses}
                    </InputField>
                  )}
                </div>
              )}

              {/* Step 2: Basic Information */}
              {currentStep === 2 && (
                <div className="space-y-6" key="step-2">
                  <div className="text-center mb-8 p-6 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FaGraduationCap className="text-3xl text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Personal Information</h3>
                    <p className="text-blue-600">Tell us about yourself</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      key="firstName"
                      label="First Name"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      hasError={touchedFields.firstName && validationErrors.firstName}
                      isValid={touchedFields.firstName && !validationErrors.firstName && formData.firstName}
                      errorMessage={validationErrors.firstName}
                    />
                    <InputField
                      key="lastName"
                      label="Last Name"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      hasError={touchedFields.lastName && validationErrors.lastName}
                      isValid={touchedFields.lastName && !validationErrors.lastName && formData.lastName}
                      errorMessage={validationErrors.lastName}
                    />
                  </div>

                  <InputField
                    key="middleName"
                    label="Middle Name (Optional)"
                    name="middleName"
                    autoComplete="additional-name"
                    placeholder="Middle name or initial"
                    value={formData.middleName}
                    onChange={handleChange}
                    hasError={touchedFields.middleName && validationErrors.middleName}
                    isValid={touchedFields.middleName && !validationErrors.middleName && formData.middleName}
                    errorMessage={validationErrors.middleName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      key="gender"
                      label="Gender"
                      name="gender"
                      type="select"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      hasError={touchedFields.gender && validationErrors.gender}
                      isValid={touchedFields.gender && !validationErrors.gender && formData.gender}
                      errorMessage={validationErrors.gender}
                      options={[{ value: "", text: "Select Gender" }, "Male", "Female", "Other"]}
                    />
                    <InputField
                      key="dob"
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      hasError={touchedFields.dob && validationErrors.dob}
                      isValid={touchedFields.dob && !validationErrors.dob && formData.dob}
                      errorMessage={validationErrors.dob}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split("T")[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Address and Contacts */}
              {currentStep === 3 && (
                <div className="space-y-6" key="step-3">
                  <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border-2 border-yellow-200">
                    <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FaStethoscope className="text-3xl text-blue-800" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Contact Information</h3>
                    <p className="text-blue-600">How can we reach you?</p>
                  </div>

                  <InputField
                    key="street"
                    label="Street/Barangay"
                    name="street"
                    type="textarea"
                    required
                    rows={3}
                    autoComplete="street-address"
                    placeholder="Street, Barangay"
                    value={formData.street}
                    onChange={handleChange}
                    hasError={touchedFields.street && validationErrors.street}
                    isValid={touchedFields.street && !validationErrors.street && formData.street}
                    errorMessage={validationErrors.street}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      key="city"
                      label="City/Municipality"
                      name="city"
                      required
                      autoComplete="address-level2"
                      placeholder="City or Municipality"
                      value={formData.city}
                      onChange={handleChange}
                      hasError={touchedFields.city && validationErrors.city}
                      isValid={touchedFields.city && !validationErrors.city && formData.city}
                      errorMessage={validationErrors.city}
                    />
                    <InputField
                      key="state"
                      label="Province/State"
                      name="state"
                      required
                      autoComplete="address-level1"
                      placeholder="Province or State"
                      value={formData.state}
                      onChange={handleChange}
                      hasError={touchedFields.state && validationErrors.state}
                      isValid={touchedFields.state && !validationErrors.state && formData.state}
                      errorMessage={validationErrors.state}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      key="mobile"
                      label="Mobile Number"
                      name="mobile"
                      required
                      autoComplete="tel"
                      placeholder="09XX-XXX-XXXX"
                      value={formData.mobile}
                      onChange={handleChange}
                      hasError={touchedFields.mobile && validationErrors.mobile}
                      isValid={touchedFields.mobile && !validationErrors.mobile && formData.mobile}
                      errorMessage={validationErrors.mobile}
                    />
                    <InputField
                      key="telephone"
                      label="Emergency Contact (Optional)"
                      name="telephone"
                      autoComplete="tel"
                      placeholder="Landline or alternate number"
                      value={formData.telephone}
                      onChange={handleChange}
                      hasError={touchedFields.telephone && validationErrors.telephone}
                      isValid={touchedFields.telephone && !validationErrors.telephone && formData.telephone}
                      errorMessage={validationErrors.telephone}
                    />
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border-2 border-yellow-300">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={handleCheckboxChange}
                        className="mt-1 h-5 w-5 text-blue-800 focus:ring-yellow-400 border-blue-300 rounded"
                      />
                      <label className="text-sm text-blue-900 leading-relaxed font-medium">
                        I acknowledge that I have read, understood, and agree to the{" "}
                        <span className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-semibold">
                          NU CARES: Service Terms & Conditions
                        </span>{" "}
                        and{" "}
                        <span className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-semibold">
                          Privacy Policy
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-10 pt-8 border-t-2 border-yellow-200">
                <div className="flex gap-4 order-2 sm:order-1">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg border-2 border-blue-700"
                    >
                      ← Previous
                    </button>
                  )}

                  <NavLink to="/login">
                    <button
                      type="button"
                      className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                  </NavLink>
                </div>

                <div className="order-1 sm:order-2">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceedToNextStep()}
                      className={`px-8 py-3 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl border-2 ${
                        canProceedToNextStep()
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 border-yellow-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                      }`}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canProceedToNextStep() || !agreeToTerms}
                      className={`px-10 py-4 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl border-2 ${
                        canProceedToNextStep() && agreeToTerms
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105 border-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                      }`}
                    >
                      Complete Registration
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-6">
          <p className="text-blue-700 text-sm font-bold">
            © 2025 National University - Lipa Campus. All rights reserved.
          </p>
          <p className="text-blue-600 text-xs mt-1">Building tomorrow's leaders today</p>
        </div>
      </div>
    </div>
  )
}
