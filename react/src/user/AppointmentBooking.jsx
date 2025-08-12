"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Stethoscope, AlertCircle, CheckCircle, User, XCircle, RefreshCw } from "lucide-react"
import axios from "axios"

const AppointmentBooking = () => {
  const [appointmentType, setAppointmentType] = useState("doctor")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [reason, setReason] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userInfo, setUserInfo] = useState(null)
  const [appointmentAvailability, setAppointmentAvailability] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(true)

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  // Fetch user info and check availability on component mount
  useEffect(() => {
    fetchUserInfo()
  }, [])

  // Check availability when appointment type changes
  useEffect(() => {
    if (appointmentType && userInfo) {
      checkAppointmentAvailability()
    }
  }, [appointmentType, userInfo])

  // Fetch available time slots when appointment type and date are selected
  useEffect(() => {
    if (appointmentType && selectedDate && appointmentAvailability?.available) {
      fetchAvailableTimeSlots()
    } else {
      setAvailableTimeSlots([])
      setSelectedTime("")
    }
  }, [appointmentType, selectedDate, appointmentAvailability])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.get("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      setUserInfo(response.data)
    } catch (err) {
      console.error("Error fetching user info:", err)
      setError("Failed to load user information")
      setCheckingAvailability(false)
    }
  }

  const checkAppointmentAvailability = async () => {
    if (!userInfo) return

    setCheckingAvailability(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.post(
        "http://localhost:8000/api/appointment-schedule/check-availability",
        {
          course: userInfo.course || userInfo.account_type || "",
          service_type: appointmentType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.success) {
        setAppointmentAvailability(response.data)
        if (!response.data.available) {
          setError(response.data.message || "Appointments are not available for your course/department.")
        }
      } else {
        setAppointmentAvailability({
          available: false,
          message: "Unable to check appointment availability. Please try again.",
        })
        setError("Unable to check appointment availability. Please try again.")
      }
    } catch (err) {
      console.error("Error checking availability:", err)
      setAppointmentAvailability({
        available: false,
        message: "Unable to check appointment availability. Please contact the clinic.",
      })
      setError("Unable to check appointment availability. Please contact the clinic.")
    } finally {
      setCheckingAvailability(false)
    }
  }

  const fetchAvailableTimeSlots = async () => {
    setLoadingTimeSlots(true)
    setError("")
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.get("http://localhost:8000/api/appointments/available-slots", {
        params: {
          date: selectedDate,
          service_type: appointmentType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.data.success) {
        setAvailableTimeSlots(response.data.data.available_slots || [])
        setSelectedTime("") // Reset selected time when slots change
      }
    } catch (err) {
      console.error("Error fetching time slots:", err)
      setError("Failed to load available time slots")
      setAvailableTimeSlots([])
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("auth_token")

      if (!userInfo) {
        setError("User information not available. Please refresh the page.")
        return
      }

      // Double-check availability before submitting
      const availabilityCheck = await axios.post(
        "http://localhost:8000/api/appointment-schedule/check-availability",
        {
          course: userInfo.course || userInfo.account_type || "",
          service_type: appointmentType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      if (!availabilityCheck.data.available) {
        setError(availabilityCheck.data.message || "Appointments are no longer available for your course/department.")
        return
      }

      const appointmentData = {
        user_id: userInfo.id,
        student_id: userInfo.student_number || userInfo.employee_id || `USER-${userInfo.id}`,
        full_name: `${userInfo.first_name} ${userInfo.middle_name || ""} ${userInfo.last_name}`.trim(),
        service_type: appointmentType,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason: reason,
      }

      const response = await axios.post("http://localhost:8000/api/appointments", appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (response.data.success) {
        setSuccess("Appointment booked successfully! You will receive a confirmation shortly.")
        // Reset form
        setSelectedDate("")
        setSelectedTime("")
        setReason("")
        setAvailableTimeSlots([])

        // Scroll to success message
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch (err) {
      console.error("Error booking appointment:", err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat()
        setError(errors.join(", "))
      } else {
        setError("Failed to book appointment. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Show loading state while checking availability
  if (checkingAvailability) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-blue-700">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-blue-800" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-yellow-400">Book an Appointment</h1>
            <p className="text-center text-blue-200 mt-2">National University Clinic School</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-blue-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-lg">Checking appointment availability...</p>
            <p className="text-sm text-gray-500 mt-2">Verifying your course eligibility</p>
          </div>
        </div>
      </div>
    )
  }

  // Show unavailable message if appointments are not available
  if (appointmentAvailability && !appointmentAvailability.available) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-red-500">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Appointments Unavailable</h1>
            <p className="text-center text-red-200 mt-2">National University Clinic School</p>
          </div>
          <div className="p-8 text-center">
            <div className="mb-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                {appointmentType === "doctor" ? "Doctor" : "Dentist"} Appointments Currently Unavailable
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto mb-6">
                <p className="text-red-700 text-lg leading-relaxed">{appointmentAvailability.message}</p>
              </div>
            </div>

            {userInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Your Information</h3>
                <div className="text-sm text-blue-600 space-y-1">
                  <p>
                    <strong>Name:</strong> {userInfo.first_name} {userInfo.last_name}
                  </p>
                  <p>
                    <strong>Course:</strong> {userInfo.course || "Not specified"}
                  </p>
                  <p>
                    <strong>Account Type:</strong> {userInfo.account_type || "Not specified"}
                  </p>
                  <p>
                    <strong>ID:</strong> {userInfo.student_number || userInfo.employee_id || `USER-${userInfo.id}`}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please contact the clinic directly for more information or check back later.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={checkAppointmentAvailability}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Again
                </button>
                <button
                  onClick={() => setAppointmentType(appointmentType === "doctor" ? "dentist" : "doctor")}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Try {appointmentType === "doctor" ? "Dentist" : "Doctor"} Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-blue-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-blue-800" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-yellow-400">Book an Appointment</h1>
          <p className="text-center text-blue-200 mt-2">National University Clinic School</p>
        </div>

        {/* Availability Status */}
        {appointmentAvailability?.available && (
          <div className="bg-green-50 border-b border-green-200 p-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-700 font-medium">
                {appointmentType === "doctor" ? "Doctor" : "Dentist"} appointments are available for your course
              </p>
            </div>
          </div>
        )}

        {/* User Info */}
        {userInfo && (
          <div className="bg-blue-50 border-b border-blue-200 p-6">
            <div className="flex items-center">
              <User className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  {userInfo.first_name} {userInfo.middle_name} {userInfo.last_name}
                </h3>
                <p className="text-sm text-blue-600">
                  ID: {userInfo.student_number || userInfo.employee_id || `USER-${userInfo.id}`} | Email:{" "}
                  {userInfo.email} | Course: {userInfo.course || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Stethoscope className="inline w-4 h-4 mr-2" />
                Appointment Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAppointmentType("doctor")}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    appointmentType === "doctor"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Doctor</div>
                    <div className="text-sm text-gray-500">General medical consultation</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentType("dentist")}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    appointmentType === "dentist"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-2xl">🦷</div>
                    <div className="font-medium">Dentist</div>
                    <div className="text-sm text-gray-500">Dental care and treatment</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Select Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Appointments can be booked up to 30 days in advance</p>
            </div>

            {/* Select Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-2" />
                Select Time *
              </label>
              {loadingTimeSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                  <span className="ml-3 text-gray-600">Loading available times...</span>
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No available time slots for this date</p>
                  <p className="text-sm">Please select a different date</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3" />
                  <p>Please select a date first</p>
                </div>
              )}
            </div>

            {/* Reason for Appointment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Appointment *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe your symptoms or reason for the appointment..."
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{reason.length}/1000 characters</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  loading || !selectedDate || !selectedTime || !reason.trim() || !appointmentAvailability?.available
                }
                className="w-full bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AppointmentBooking
