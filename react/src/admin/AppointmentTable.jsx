"use client"

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
} from "lucide-react"
import axios from "axios"
import AppointmentScheduleManager from "./AppointmentScheduleManager"

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [error, setError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showScheduleManager, setShowScheduleManager] = useState(false)

  // Fetch appointments from API
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

  useEffect(() => {
    fetchAppointments()
  }, [filter, sortBy, sortOrder])

  // Debounced search
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
        return <Stethoscope className="w-4 h-4 text-blue-600" />
      case "dentist":
        return <Smile className="w-4 h-4 text-green-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
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
        // Show success message
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
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    }
  }

  const stats = getStatistics()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-yellow-400">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
            <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">Appointment Management</h1>
            <p className="text-center text-blue-200">National University Clinic School - Admin Dashboard</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-blue-700">
            <Loader2 className="animate-spin h-12 w-12 mb-4" />
            <p className="text-lg">Loading appointments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-yellow-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">Appointment Management</h1>
              <p className="text-blue-200">National University Clinic School - Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowScheduleManager(!showScheduleManager)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  showScheduleManager
                    ? "bg-yellow-500 text-blue-900 hover:bg-yellow-600"
                    : "bg-blue-700 hover:bg-blue-600 text-white"
                }`}
                title="Manage appointment schedules"
              >
                <Clock className="w-5 h-5 mr-2 inline" />
                Schedule Manager
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
                title="Refresh appointments"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Manager */}
        {showScheduleManager && (
          <div className="mb-8">
            <AppointmentScheduleManager />
          </div>
        )}

        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error loading appointments</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, student ID, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="service">Sort by Service</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Confirmed</p>
                  <p className="text-2xl font-bold text-green-800">{stats.confirmed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Cancelled</p>
                  <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          {filteredAndSortedAppointments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No appointments have been scheduled yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.full_name || "N/A"}</div>
                            <div className="text-sm text-gray-500">ID: {appointment.student_id || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getServiceIcon(appointment.service_type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {appointment.service_type || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {appointment.appointment_date
                            ? new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.appointment_time || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={appointment.reason}>
                          {appointment.reason || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                          disabled={updatingStatus === appointment.id}
                          className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                            appointment.status,
                          )} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingStatus === appointment.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500 mt-1" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit Appointment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            disabled={deletingId === appointment.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Appointment"
                          >
                            {deletingId === appointment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
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
