import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Info, Trash2 } from "lucide-react"

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")

  const fetchAppointments = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await mockApi.getAppointments()
      if (response.success) {
        setAppointments(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError("Failed to fetch appointments. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      return
    }
    setLoading(true)
    setError("")
    setSuccessMessage("")
    try {
      const response = await mockApi.updateAppointmentStatus(id, newStatus, "") // Notes can be added later
      if (response.success) {
        setSuccessMessage(response.message)
        fetchAppointments() // Refresh the list
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError("Failed to update status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return
    }
    setLoading(true)
    setError("")
    setSuccessMessage("")
    try {
      const response = await mockApi.deleteAppointment(id)
      if (response.success) {
        setSuccessMessage(response.message)
        fetchAppointments() // Refresh the list
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError("Failed to delete appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const filteredAppointments = appointments.filter((appt) => {
    const matchesType = filterType === "all" || appt.appointment_type === filterType
    const matchesStatus = filterStatus === "all" || appt.status === filterStatus
    const matchesDate = filterDate === "" || appt.appointment_date === filterDate
    return matchesType && matchesStatus && matchesDate
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Appointment Management</h2>
          <p className="text-blue-200 text-sm sm:text-base">Oversee and manage all patient appointments.</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-blue-900 mb-1">
                Filter by Type
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-blue-800"
              >
                <option value="all">All Types</option>
                <option value="doctor">Doctor</option>
                <option value="dentist">Dentist</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-blue-900 mb-1">
                Filter by Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-blue-800"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterDate" className="block text-sm font-medium text-blue-900 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                id="filterDate"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-blue-800"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-blue-600 text-center py-8">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-yellow-600 text-center py-8 flex flex-col items-center justify-center">
              <Info className="h-8 w-8 mb-2" />
              <p className="text-lg">No appointments found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-blue-900">{appt.studentId}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-blue-900">{appt.fullName}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-blue-900 capitalize">
                        {appt.appointment_type}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-blue-900">
                        {format(parseISO(appt.appointment_date), "MMM dd, yyyy")}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-blue-900">
                        {format(parseISO(`2000-01-01T${appt.appointment_time}:00`), "h:mm a")}
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-900 max-w-xs truncate">{appt.reason}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(appt.status)}`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                        <select
                          value={appt.status}
                          onChange={(e) => handleUpdateStatus(appt.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-blue-800 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                          title="Delete Appointment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
