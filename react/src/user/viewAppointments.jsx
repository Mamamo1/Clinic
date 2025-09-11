import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  ArrowLeft,
} from "lucide-react"
import axios from "axios"

const ViewAppointments = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
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
      alert("Please log in to view your appointments")
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
      alert("Failed to load appointments. Please try again.")
      setAppointments([])
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

      if (err.response?.data?.message) {
        alert(`Failed to cancel appointment: ${err.response.data.message}`)
      } else if (err.response?.data?.error) {
        alert(`Failed to cancel appointment: ${err.response.data.error}`)
      } else {
        alert(`Failed to cancel appointment: ${err.message}`)
      }
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

  const canCancelAppointment = (appointment) => {
    return appointment.status === "pending"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-700">
        <Loader2 className="animate-spin text-4xl mb-4" />
        <p className="text-xl font-medium">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-700 hover:text-blue-900 transition-colors duration-200 mb-6 px-6 py-4 rounded-xl bg-blue-100 hover:bg-blue-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <ArrowLeft className="w-6 h-6 mr-3" />
        <span className="text-xl font-bold">Back to Dashboard</span>
      </button>

      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-yellow-200">
        <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

        <div className="p-6 sm:p-10 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg border-4 border-white">
              <Calendar className="w-8 h-8 text-blue-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center mb-2">My Appointments</h1>
          <p className="text-center text-blue-200 text-lg">View and manage your clinic appointments</p>
        </div>

        {userInfo && (
          <div className="bg-blue-50 p-6 sm:p-10 border-b border-blue-100">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-lg border-4 border-yellow-400">
                <User className="w-8 h-8 text-blue-700" />
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-1">
                  {userInfo.first_name} {userInfo.middle_name} {userInfo.last_name}
                </h3>
                <p className="text-blue-700 text-lg">
                  ID:{" "}
                  <span className="font-bold">
                    {userInfo.student_number || userInfo.employee_id || `USER-${userInfo.id}`}
                  </span>
                </p>
                <p className="text-blue-600 text-md">
                  Email: <span className="font-bold">{userInfo.email}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap gap-3 mb-8 border-b border-blue-100 pb-6">
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
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 whitespace-nowrap text-base shadow-md hover:shadow-lg ${
                  filter === key
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white transform scale-105 border-2 border-yellow-400"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl border-2 border-dashed border-blue-300">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Calendar className="w-10 h-10 text-blue-800" />
              </div>
              <p className="text-blue-900 text-2xl font-bold mb-2">No appointments found</p>
              <p className="text-blue-700 text-lg">
                {filter === "all" ? "You haven't booked any appointments yet" : `No ${filter} appointments found`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white border-2 border-yellow-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
                >
                  <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-xl -mt-8 -mx-8 mb-6"></div>

                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mr-5">
                        {getServiceIcon(appointment.service_type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-800 text-2xl capitalize leading-tight">
                          {appointment.service_type} Appointment
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`px-4 py-2 rounded-full font-semibold border ${getStatusColor(appointment.status)}`}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(appointment.status)}
                          <span className="ml-2 capitalize text-base">{appointment.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-bold text-blue-800">Date</h4>
                      </div>
                      <p className="text-blue-900 font-bold text-lg leading-tight">
                        {formatDate(appointment.appointment_date)}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <Clock className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-bold text-green-800">Time</h4>
                      </div>
                      <p className="text-green-900 font-bold text-lg">{formatTime(appointment.appointment_time)}</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <FileText className="w-5 h-5 text-yellow-600 mr-2" />
                        <h4 className="font-bold text-yellow-800">Booked On</h4>
                      </div>
                      <p className="text-yellow-900 font-bold text-lg">
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-bold text-gray-800 text-lg mb-3">Reason for Visit</h4>
                    <p className="text-gray-700 text-base leading-relaxed font-medium">{appointment.reason}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold text-base"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 inline mr-2" />
                      View Details
                    </button>

                    {appointment.status === "pending" && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-base"
                        title="Cancel Appointment"
                      >
                        {cancellingId === appointment.id ? (
                          <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 inline mr-2" />
                        )}
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-6 bg-blue-900 text-white">
          <p className="font-semibold mb-2 text-lg">
            <Calendar className="inline-block w-5 h-5 mr-2 text-yellow-400" />
            Your appointments are managed securely
          </p>
          <p className="text-blue-300 text-sm">
            © 2025 National University - Lipa Campus Medical Center. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ViewAppointments
