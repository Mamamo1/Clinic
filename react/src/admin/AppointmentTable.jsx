import { useState, useEffect } from "react"
import {
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  Smile,
  Eye,
  Edit,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react"
import axios from "axios"
import AppointmentScheduleManager from "./AppointmentScheduleManager"

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [error, setError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showScheduleManager, setShowScheduleManager] = useState(false)


  const fetchAppointments = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.get("http://localhost:8000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          status: filter !== "all" ? filter : undefined,
          search: searchTerm || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      })

      if (response.data.success) {
        setAppointments(response.data.data || [])
      } else {
        throw new Error(response.data.message || "Failed to fetch appointments")
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setError(error.response?.data?.message || error.message || "Failed to fetch appointments")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllAppointments = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await axios.get("http://localhost:8000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.data.success) {
        return response.data.data || []
      }
    } catch (error) {
      console.error("Error fetching all appointments for stats:", error)
    }
    return []
  }

  const [allAppointments, setAllAppointments] = useState([])

  useEffect(() => {
    fetchAppointments()
    fetchAllAppointments().then(setAllAppointments)
  }, [filter, sortBy, sortOrder])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        fetchAppointments()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "doctor":
        return <Stethoscope className="w-5 h-5 text-blue-600" />
      case "dentist":
        return <Smile className="w-5 h-5 text-green-600" />
      default:
        return <User className="w-5 h-5 text-gray-600" />
    }
  }

  const formatTime12Hour = (time24) => {
    if (!time24) return "N/A"

    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12

    return `${hour12}:${minutes} ${ampm}`
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingStatus(appointmentId)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.put(
        `http://localhost:8000/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.success) {
        setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)))
        setAllAppointments((prev) =>
          prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)),
        )
        const statusMessages = {
          pending: "set to pending",
          confirmed: "confirmed",
          completed: "marked as completed",
          cancelled: "cancelled",
        }
        alert(`Appointment ${statusMessages[newStatus]} successfully`)
      } else {
        throw new Error(response.data.message || "Failed to update appointment")
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      alert(error.response?.data?.message || "Failed to update appointment")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return
    }

    setDeletingId(appointmentId)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.delete(`http://localhost:8000/api/appointments/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.data.success) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
        setAllAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
        alert("Appointment deleted successfully")
      } else {
        throw new Error(response.data.message || "Failed to delete appointment")
      }
    } catch (error) {
      console.error("Error deleting appointment:", error)
      alert(error.response?.data?.message || "Failed to delete appointment")
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefresh = () => {
    fetchAppointments()
    fetchAllAppointments().then(setAllAppointments)
  }

  const filteredAndSortedAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatistics = () => {
    return {
      total: allAppointments.length,
      pending: allAppointments.filter((a) => a.status === "pending").length,
      confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
      completed: allAppointments.filter((a) => a.status === "completed").length,
      cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
    }
  }

  const stats = getStatistics()
  const filterButtons = [
    { value: "all", label: "All", icon: Calendar, color: "blue" },
    { value: "pending", label: "Pending", icon: AlertCircle, color: "yellow" },
    { value: "confirmed", label: "Confirmed", icon: CheckCircle, color: "green" },
    { value: "completed", label: "Completed", icon: CheckCircle, color: "purple" },
    { value: "cancelled", label: "Cancelled", icon: XCircle, color: "red" },
  ]

  const getFilterButtonStyle = (buttonValue, color) => {
    const isActive = filter === buttonValue
    const baseStyle =
      "px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"

    const colorStyles = {
      blue: isActive
        ? "bg-blue-600 text-white border-2 border-blue-600"
        : "bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100",
      yellow: isActive
        ? "bg-yellow-600 text-white border-2 border-yellow-600"
        : "bg-yellow-50 text-yellow-700 border-2 border-yellow-200 hover:bg-yellow-100",
      green: isActive
        ? "bg-green-600 text-white border-2 border-green-600"
        : "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100",
      purple: isActive
        ? "bg-purple-600 text-white border-2 border-purple-600"
        : "bg-purple-50 text-purple-700 border-2 border-purple-200 hover:bg-purple-100",
      red: isActive
        ? "bg-red-600 text-white border-2 border-red-600"
        : "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100",
    }

    return `${baseStyle} ${colorStyles[color]}`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-t-4 border-yellow-400">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8">
            <h1 className="text-4xl font-bold text-center text-yellow-400 mb-3">Appointment Management</h1>
            <p className="text-center text-blue-200 text-lg">National University Clinic School - Admin Dashboard</p>
          </div>
          <div className="flex flex-col items-center justify-center h-80 text-blue-700">
            <Loader2 className="animate-spin h-16 w-16 mb-6" />
            <p className="text-xl font-medium">Loading appointments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-t-4 border-yellow-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-yellow-400 mb-3">Appointment Management</h1>
              <p className="text-blue-200 text-lg">National University Clinic School - Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowScheduleManager(!showScheduleManager)}
                className={`px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-base shadow-lg ${
                  showScheduleManager
                    ? "bg-yellow-500 text-blue-900 hover:bg-yellow-600 transform hover:scale-105"
                    : "bg-blue-700 hover:bg-blue-600 text-white transform hover:scale-105"
                }`}
                title="Manage appointment schedules"
              >
                <Clock className="w-5 h-5 mr-2 inline" />
                Schedule Manager
              </button>
              <button
                onClick={handleRefresh}
                className="p-3 bg-blue-700 hover:bg-blue-600 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                title="Refresh appointments"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Manager */}
        {showScheduleManager && (
          <div className="border-b-2 border-gray-100">
            <AppointmentScheduleManager />
          </div>
        )}

        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl flex items-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-red-500 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-semibold text-lg">Error loading appointments</p>
                <p className="text-red-600 text-base mt-1">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-base font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-700 mb-3">
              <Search className="inline w-5 h-5 mr-2" />
              Search Appointments
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search by name, student ID, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-base font-semibold">Total Appointments</p>
                  <p className="text-4xl font-bold text-blue-800 mt-2">{stats.total}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-base font-semibold">Pending</p>
                  <p className="text-4xl font-bold text-yellow-800 mt-2">{stats.pending}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-base font-semibold">Confirmed</p>
                  <p className="text-4xl font-bold text-green-800 mt-2">{stats.confirmed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-base font-semibold">Completed</p>
                  <p className="text-4xl font-bold text-purple-800 mt-2">{stats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-base font-semibold">Cancelled</p>
                  <p className="text-4xl font-bold text-red-800 mt-2">{stats.cancelled}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filter Buttons - Moved under statistics */}
          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-700 mb-4">
              <Filter className="inline w-5 h-5 mr-2" />
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-3">
              {filterButtons.map((button) => {
                const IconComponent = button.icon
                return (
                  <button
                    key={button.value}
                    onClick={() => setFilter(button.value)}
                    className={getFilterButtonStyle(button.value, button.color)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{button.label}</span>
                    {button.value !== "all" && (
                      <span className="ml-1 px-2 py-1 bg-white bg-opacity-20 rounded-full text-sm font-bold">
                        {stats[button.value]}
                      </span>
                    )}
                    {button.value === "all" && (
                      <span className="ml-1 px-2 py-1 bg-white bg-opacity-20 rounded-full text-sm font-bold">
                        {stats.total}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                  <option value="service">Sort by Service</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-4 bg-gray-100 border-2 border-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          {filteredAndSortedAppointments.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-500 text-xl font-medium">No appointments found</p>
              <p className="text-base text-gray-400 mt-3">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No appointments have been scheduled yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl shadow-lg">
              <table className="w-full bg-white overflow-hidden">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                      Patient Information
                    </th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200">
                  {filteredAndSortedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4 shadow-md">
                            <User className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              {appointment.full_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">ID: {appointment.student_id || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          {getServiceIcon(appointment.service_type)}
                          <span className="ml-3 text-base font-medium text-gray-900 capitalize">
                            {appointment.service_type || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-base font-medium text-gray-900">
                          {appointment.appointment_date
                            ? new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatTime12Hour(appointment.appointment_time)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div
                          className="text-base text-gray-900 max-w-xs truncate cursor-help"
                          title={appointment.reason}
                        >
                          {appointment.reason || "N/A"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                            disabled={updatingStatus === appointment.id}
                            className={`text-sm font-semibold px-4 py-2 rounded-full border-2 ${getStatusColor(
                              appointment.status,
                            )} focus:outline-none focus:ring-3 focus:ring-blue-500 disabled:opacity-50 min-w-[120px]`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        {updatingStatus === appointment.id && (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500 mt-2" />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-3">
                          <button
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-3 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Edit Appointment"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            disabled={deletingId === appointment.id}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
                            title="Delete Appointment"
                          >
                            {deletingId === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentTable
