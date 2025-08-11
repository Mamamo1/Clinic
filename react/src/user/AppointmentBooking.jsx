"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Stethoscope, AlertCircle, CheckCircle } from "lucide-react"
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

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  // Fetch available time slots when appointment type and date are selected
  useEffect(() => {
    if (appointmentType && selectedDate) {
      fetchAvailableTimeSlots()
    } else {
      setAvailableTimeSlots([])
      setSelectedTime("")
    }
  }, [appointmentType, selectedDate])

  const fetchAvailableTimeSlots = async () => {
    setLoadingTimeSlots(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.get("http://localhost:8000/api/appointments/time-slots", {
        params: {
          appointment_type: appointmentType,
          date: selectedDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.data.success) {
        setAvailableTimeSlots(response.data.data)
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
      const response = await axios.post(
        "http://localhost:8000/api/appointments",
        {
          appointment_type: appointmentType,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          reason: reason,
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
        setSuccess("Appointment booked successfully!")
        // Reset form
        setSelectedDate("")
        setSelectedTime("")
        setReason("")
        setAvailableTimeSlots([])
      }
    } catch (err) {
      console.error("Error booking appointment:", err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
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
          <p className="text-center text-blue-200 mt-2">Schedule your visit with our medical professionals</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Stethoscope className="inline w-4 h-4 mr-2" />
                Appointment Type
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
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">🦷</div>
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
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Select Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-2" />
                Select Time
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Appointment</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe your symptoms or reason for the appointment..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime || !reason}
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
