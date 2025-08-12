import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react"
import axios from "axios"

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [userInfo, setUserInfo] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchUserInfo()
    fetchAppointments()
  }, [])

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
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.get("http://localhost:8000/api/appointments/my-appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.data.success) {
        setAppointments(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    setCancellingId(appointmentId)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.post(
        `http://localhost:8000/api/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      )

      if (response.data.success) {
        setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt)))
        alert("Appointment cancelled successfully")
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      alert("Failed to cancel appointment")
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "doctor":
        return <Stethoscope className="w-5 h-5 text-blue-600" />
      case "dentist":
        return <div className="text-lg">🦷</div>
      default:
        return <User className="w-5 h-5 text-gray-600" />
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true
    return appointment.status === filter
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-700">
        <Loader2 className="animate-spin text-4xl mb-4" />
        <p className="text-lg">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-yellow-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">My Appointments</h1>
          <p className="text-center text-blue-200">View and manage your clinic appointments</p>
        </div>

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
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {[
              { key: "all", label: "All Appointments", count: appointments.length },
              { key: "pending", label: "Pending", count: appointments.filter((a) => a.status === "pending").length },
              {
                key: "confirmed",
                label: "Confirmed",
                count: appointments.filter((a) => a.status === "confirmed").length,
              },
              {
                key: "completed",
                label: "Completed",
                count: appointments.filter((a) => a.status === "completed").length,
              },
              {
                key: "cancelled",
                label: "Cancelled",
                count: appointments.filter((a) => a.status === "cancelled").length,
              },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === key ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-sm text-gray-400 mt-2">
                {filter === "all" ? "You haven't booked any appointments yet" : `No ${filter} appointments found`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-8 border-blue-400"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        {getServiceIcon(appointment.service_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800 text-lg capitalize">
                          {appointment.service_type} Appointment
                        </h3>
                        <p className="text-gray-600 text-sm">Appointment ID: #{appointment.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(appointment.status)}
                          <span className="ml-2 capitalize">{appointment.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-800 text-sm">Date</h4>
                      </div>
                      <p className="text-blue-900 font-semibold">{formatDate(appointment.appointment_date)}</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-800 text-sm">Time</h4>
                      </div>
                      <p className="text-green-900 font-semibold">{formatTime(appointment.appointment_time)}</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 text-yellow-600 mr-2" />
                        <h4 className="font-medium text-yellow-800 text-sm">Booked On</h4>
                      </div>
                      <p className="text-yellow-900 font-semibold">
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-800 text-sm mb-2">Reason for Visit</h4>
                    <p className="text-gray-700">{appointment.reason}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>

                    {appointment.status === "pending" && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        title="Cancel Appointment"
                      >
                        {cancellingId === appointment.id ? (
                          <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 inline mr-1" />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewAppointments
