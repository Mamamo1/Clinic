import { useState, useEffect } from "react"
import { format, parseISO, isPast } from "date-fns"
import { XCircle, Info } from "lucide-react"

export default function UserAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const currentUserId = localStorage.getItem("mock_user_id") || "user123" // Mock current user

  const fetchAppointments = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await mockApi.getUserAppointments(currentUserId)
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

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return
    }
    setLoading(true)
    setError("")
    setSuccessMessage("")
    try {
      const response = await mockApi.cancelAppointment(id, currentUserId)
      if (response.success) {
        setSuccessMessage(response.message)
        fetchAppointments() // Refresh the list
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError("Failed to cancel appointment. Please try again.")
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

  const isCancellable = (appointment) => {
    const apptDateTime = parseISO(`${appointment.appointment_date}T${appointment.appointment_time}:00`)
    return !isPast(apptDateTime) && appointment.status !== "completed" && appointment.status !== "cancelled"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">My Appointments</h2>
          <p className="text-blue-200 text-sm sm:text-base">View and manage your upcoming and past appointments.</p>
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

          {loading ? (
            <div className="text-blue-600 text-center py-8">Loading your appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-yellow-600 text-center py-8 flex flex-col items-center justify-center">
              <Info className="h-8 w-8 mb-2" />
              <p className="text-lg">You have no appointments scheduled yet.</p>
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
                  {appointments.map((appt) => (
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
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                        {isCancellable(appt) ? (
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </button>
                        ) : (
                          <span className="text-gray-500 flex items-center">
                            <Info className="h-4 w-4 mr-1" /> Not Cancellable
                          </span>
                        )}
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
