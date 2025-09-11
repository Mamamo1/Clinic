import { useEffect, useState } from "react"
import {
  FaUserGraduate,
  FaUserMd,
  FaFileMedical,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCalendarCheck,
  FaWifi,
  FaRedo,
} from "react-icons/fa"
import axios from "axios"
import HorizontalBarChart from "./components/HorizontalBarChart"
import UserRegistrationChart from "./components/UserRegistrationChart"

const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="w-10 h-10 border-4 border-[#2E3192] border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const ConnectionStatus = ({ isConnected, onRetry, errors }) => {
  if (isConnected) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <FaWifi className="text-red-600 text-xl" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">Laravel Backend Connection Issues</h3>
          <p className="text-sm text-red-700 mt-1">Unable to connect to your Laravel server. Please ensure:</p>
          <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
            <li>
              Laravel server is running at <code className="bg-red-100 px-1 rounded">http://localhost:8000</code>
            </li>
            <li>CORS is properly configured for React frontend</li>
            <li>API routes are accessible and authentication is working</li>
          </ul>

          {errors.length > 0 && (
            <div className="mt-3 p-2 bg-red-100 rounded border-l-4 border-red-400">
              <p className="text-xs font-medium text-red-800 mb-1">Failed API Endpoints:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <FaRedo className="w-3 h-3" />
          Retry Connection
        </button>
      </div>
    </div>
  )
}

// Enhanced Appointments List Component
const AppointmentsList = ({ appointments, loading, hasError, onRetry }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const handleApprove = (appointmentId) => {
    console.log("[v0] Approving appointment:", appointmentId)
    // TODO: Implement approve functionality
  }

  const handleReject = (appointmentId) => {
    console.log("[v0] Rejecting appointment:", appointmentId)
    // TODO: Implement reject functionality
  }

  const handleReschedule = (appointmentId) => {
    console.log("[v0] Rescheduling appointment:", appointmentId)
    // TODO: Implement reschedule functionality
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime12Hour = (time24) => {
    if (!time24) return "N/A"

    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12

    return `${hour12}:${minutes} ${ampm}`
  }

  const formatCourseName = (courseCode) => {
    if (!courseCode || courseCode === "No Course Specified") return "No Course Specified"

    // Department mapping for full names
    const departmentMapping = {
      ABM: "ABM - Accountancy, Business and Management",
      STEM: "STEM - Science, Technology, Engineering and Mathematics",
      HUMSS: "HUMSS - Humanities and Social Sciences",
      BSA: "BSA - Bachelor of Science in Accountancy",
      "BSBA-FINMGT": "BSBA-FINMGT - BSBA Major in Financial Management",
      "BSBA-MKTGMGT": "BSBA-MKTGMGT - BSBA Major in Marketing Management",
      BSTM: "BSTM - BS in Tourism Management",
      BSARCH: "BSARCH - BS in Architecture",
      BSCE: "BSCE - BS in Civil Engineering",
      BSCS: "BSCS - BS in Computer Science",
      "BSIT-MWA": "BSIT-MWA - BSIT with Mobile/Web App Development",
      BSMT: "BSMT - BS in Medical Technology",
      BSN: "BSN - Bachelor of Science in Nursing",
      BSPSY: "BSPSY - BS in Psychology",
    }

    return departmentMapping[courseCode] || courseCode
  }

  if (loading) return <Spinner />

  if (hasError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2E3192] flex items-center gap-3">
            <FaCalendarAlt className="text-[#ffc72c]" />
            Pending Appointments
          </h3>
        </div>
        <div className="text-center py-12 text-gray-500">
          <FaExclamationTriangle size={64} className="mx-auto mb-4 opacity-30 text-red-400" />
          <div>
            <p className="text-lg font-medium mb-2 text-red-600">Unable to load appointments</p>
            <p className="text-sm mb-4">Connection to Laravel backend failed</p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1e2270] transition-colors flex items-center gap-2 mx-auto"
            >
              <FaRedo className="w-3 h-3" />
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#2E3192] flex items-center gap-3">
          <FaCalendarAlt className="text-[#ffc72c]" />
          Pending Appointments
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredAppointments.length} of {appointments.length} appointments
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by patient name, course, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaCalendarCheck size={64} className="mx-auto mb-4 opacity-30" />
            {searchTerm || filterStatus !== "all" ? (
              <div>
                <p className="text-lg font-medium mb-2">No appointments found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">No pending appointments</p>
                <p className="text-sm">All caught up! New appointments will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#2E3192] text-white rounded-full flex items-center justify-center font-semibold">
                        {appointment.full_name?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {appointment.full_name || "Unknown Patient"}
                        </h4>
                        <p className="text-sm text-gray-600">{formatCourseName(appointment.course)}</p>
                        <p className="text-xs text-gray-500">ID: {appointment.student_id || "N/A"}</p>
                      </div>
                    </div>

                    <div className="ml-13 space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {appointment.reason || "General checkup"}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-[#2E3192]" />
                          {formatDate(appointment.appointment_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {formatTime12Hour(appointment.appointment_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {appointment.status?.toUpperCase() || "PENDING"}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center gap-1"
                        title="Approve appointment"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReschedule(appointment.id)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
                        title="Reschedule appointment"
                      >
                        📅 Reschedule
                      </button>
                      <button
                        onClick={() => handleReject(appointment.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                        title="Reject appointment"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredAppointments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">Showing {filteredAppointments.length} appointments</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Export List
            </button>
            <button className="px-4 py-2 text-sm bg-[#2E3192] text-white rounded-md hover:bg-[#1e2270] transition-colors">
              Bulk Actions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const AdminDashboard = () => {
  const [firstName] = useState(() => localStorage.getItem("first_name"))
  const [userRole] = useState(() => localStorage.getItem("account_type") || localStorage.getItem("account_type"))
  const isSuperAdmin = userRole === "SuperAdmin" || userRole === "SuperAdmin" || userRole === "SuperAdmin"

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInventory: 0,
    lowStock: 0,
    medicalRecords: 0,
    medicalStaff: 5,
    totalAppointments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showBarChart, setShowBarChart] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [userRegistrationData, setUserRegistrationData] = useState([])
  const [registrationLoading, setRegistrationLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState("")

  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: true,
    errors: [],
    hasUsersError: false,
    hasInventoryError: false,
    hasAppointmentsError: false,
  })

  // School to departments mapping
  const schoolDepartments = {
    SHS: ["ABM", "STEM", "HUMSS"],
    SABM: ["BSA", "BSBA-FINMGT", "BSBA-MKTGMGT", "BSTM"],
    SACE: ["BSARCH", "BSCE", "BSCS", "BSIT-MWA"],
    SAHS: ["BSMT", "BSN", "BSPSY"],
  }

  // Department mapping for full names
  const departmentMapping = {
    ABM: "ABM - Accountancy, Business and Management",
    STEM: "STEM - Science, Technology, Engineering and Mathematics",
    HUMSS: "HUMSS - Humanities and Social Sciences",
    BSA: "BSA - Bachelor of Science in Accountancy",
    "BSBA-FINMGT": "BSBA-FINMGT - BSBA Major in Financial Management",
    "BSBA-MKTGMGT": "BSBA-MKTGMGT - BSBA Major in Marketing Management",
    BSTM: "BSTM - BS in Tourism Management",
    BSARCH: "BSARCH - BS in Architecture",
    BSCE: "BSCE - BS in Civil Engineering",
    BSCS: "BSCS - BS in Computer Science",
    "BSIT-MWA": "BSIT-MWA - BSIT with Mobile/Web App Development",
    BSMT: "BSMT - BS in Medical Technology",
    BSN: "BSN - Bachelor of Science in Nursing",
    BSPSY: "BSPSY - BS in Psychology",
  }

  const fetchData = async () => {
    const authToken = localStorage.getItem("auth_token")
    setLoading(true)

    const errors = []
    let hasUsersError = false
    let hasInventoryError = false

    try {
      const [userRes, inventoryRes] = await Promise.all([
        axios
          .get("http://localhost:8000/api/users", {
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 10000, // 10 second timeout
          })
          .catch((error) => {
            console.error("[v0] Users API error:", error)
            hasUsersError = true
            if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
              errors.push("Users API - Connection refused (Laravel server not running)")
            } else if (error.response?.status) {
              errors.push(`Users API - HTTP ${error.response.status}: ${error.response.statusText}`)
            } else {
              errors.push("Users API - Network error")
            }
            return { data: { data: [] } } // Return empty data on error
          }),
        axios
          .get("http://localhost:8000/api/inventory", {
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 10000, // 10 second timeout
          })
          .catch((error) => {
            console.error("[v0] Inventory API error:", error)
            hasInventoryError = true
            if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
              errors.push("Inventory API - Connection refused (Laravel server not running)")
            } else if (error.response?.status) {
              errors.push(`Inventory API - HTTP ${error.response.status}: ${error.response.statusText}`)
            } else {
              errors.push("Inventory API - Network error")
            }
            return { data: { data: [] } } // Return empty data on error
          }),
      ])

      const users = userRes.data.data || []
      const inventory = inventoryRes.data.data || []
      const lowStockCount = inventory.filter((item) => item.quantity <= item.threshold).length

      // Process user registration data by department
      const departmentCounts = {}
      users.forEach((user) => {
        const dept = user.department || user.course
        // Only include users with valid departments, skip 'Other' or undefined
        if (dept && dept !== "Other" && departmentMapping[dept]) {
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1
        }
      })

      const registrationChartData = Object.entries(departmentCounts)
        .map(([dept, count]) => ({
          name: dept,
          fullName: departmentMapping[dept] || dept,
          count: count,
        }))
        .sort((a, b) => b.count - a.count)

      setUserRegistrationData(registrationChartData)

      setStats({
        totalUsers: users.length,
        totalInventory: inventory.length,
        lowStock: lowStockCount,
        medicalRecords: 3434,
        medicalStaff: 5,
        totalAppointments: 0, 
      })

      // Update connection status
      setConnectionStatus({
        isConnected: errors.length === 0,
        errors,
        hasUsersError,
        hasInventoryError,
        hasAppointmentsError: false,
      })
    } catch (error) {
      console.error("[v0] Dashboard fetch error:", error)
      errors.push("General dashboard error")
      setStats({
        totalUsers: 0,
        totalInventory: 0,
        lowStock: 0,
        medicalRecords: 0,
        medicalStaff: 5,
        totalAppointments: 0,
      })
      setUserRegistrationData([])
      setConnectionStatus({
        isConnected: false,
        errors,
        hasUsersError: true,
        hasInventoryError: true,
        hasAppointmentsError: false,
      })
    } finally {
      setLoading(false)
      setRegistrationLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchAppointments = async () => {
    const authToken = localStorage.getItem("auth_token")
    setAppointmentsLoading(true)

    try {
      const response = await axios.get("http://localhost:8000/api/appointments", {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          status: "pending",
          include: "user,student", // Include related user/student data
        },
        timeout: 10000, // 10 second timeout
      })

      const appointmentsData = response.data.data || []
      const pendingAppointments = appointmentsData.filter(
        (appointment) => appointment.status === "pending" || !appointment.status,
      )

      const enhancedAppointments = pendingAppointments.map((appointment) => ({
        ...appointment,
        // Try to get course from different possible sources
        course:
          appointment.course ||
          appointment.user?.course ||
          appointment.student?.course ||
          appointment.user?.department ||
          appointment.student?.department ||
          "No Course Specified",
        full_name:
          appointment.full_name ||
          appointment.user?.full_name ||
          appointment.student?.full_name ||
          `${appointment.user?.first_name || ""} ${appointment.user?.last_name || ""}`.trim() ||
          "Unknown Patient",
        student_id: appointment.student_id || appointment.user?.student_id || appointment.student?.student_id || "N/A",
      }))


      setAppointments(enhancedAppointments.slice(0, 10))
      setStats((prev) => ({
        ...prev,
        totalAppointments: enhancedAppointments.length,
      }))

      // Update connection status for appointments
      setConnectionStatus((prev) => ({
        ...prev,
        hasAppointmentsError: false,
      }))
    } catch (error) {
      console.error("[v0] Appointments fetch error:", error)

      // Update connection status with appointment error
      setConnectionStatus((prev) => {
        const newErrors = [...prev.errors]
        if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
          newErrors.push("Appointments API - Connection refused (Laravel server not running)")
        } else if (error.response?.status) {
          newErrors.push(`Appointments API - HTTP ${error.response.status}: ${error.response.statusText}`)
        } else {
          newErrors.push("Appointments API - Network error")
        }

        return {
          ...prev,
          isConnected: false,
          errors: newErrors,
          hasAppointmentsError: true,
        }
      })

      setAppointments([])
      setStats((prev) => ({
        ...prev,
        totalAppointments: 0,
      }))
    } finally {
      setAppointmentsLoading(false)
    }
  }

  // Fetch appointments (pending only)
  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleRetryConnection = () => {
    setConnectionStatus({
      isConnected: true,
      errors: [],
      hasUsersError: false,
      hasInventoryError: false,
      hasAppointmentsError: false,
    })
    fetchData()
    fetchAppointments()
  }

  // Filter registration data by selected school/department group
  const filteredRegistrationData = selectedDepartment
    ? userRegistrationData.filter((dept) => schoolDepartments[selectedDepartment]?.includes(dept.name))
    : userRegistrationData

  const handleRemoveChart = () => {
    setShowBarChart(false)
  }

  if (loading) return <Spinner />

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2E3192] mb-2">Welcome, Dr. {firstName || "Admin"}!</h1>
        <p className="text-gray-600">Here's your medical center overview</p>
      </div>

      {/* Connection Status */}
      <ConnectionStatus
        isConnected={connectionStatus.isConnected}
        onRetry={handleRetryConnection}
        errors={connectionStatus.errors}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {/* Total Users */}
        {isSuperAdmin && (
          <div
            className={`bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200 ${connectionStatus.hasUsersError ? "opacity-60" : ""}`}
          >
            <div>
              <div className="text-sm opacity-90">Total Users</div>
              <div className="text-2xl font-bold">{connectionStatus.hasUsersError ? "—" : stats.totalUsers}</div>
              {connectionStatus.hasUsersError && <div className="text-xs text-red-200 mt-1">Connection Error</div>}
            </div>
            <FaUserGraduate size={32} className="text-[#ffc72c]" />
          </div>
        )}

        {/* Pending Appointments */}
        <div
          className={`bg-orange-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200 ${connectionStatus.hasAppointmentsError ? "opacity-60" : ""}`}
        >
          <div>
            <div className="text-sm opacity-90">Pending Appointments</div>
            <div className="text-2xl font-bold">
              {connectionStatus.hasAppointmentsError ? "—" : stats.totalAppointments}
            </div>
            {connectionStatus.hasAppointmentsError && <div className="text-xs text-red-200 mt-1">Connection Error</div>}
          </div>
          <FaCalendarAlt size={32} className="text-[#ffc72c]" />
        </div>

        {/* Medical Records */}
        <div className="bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Medical Records</div>
            <div className="text-2xl font-bold">{stats.medicalRecords}</div>
          </div>
          <FaFileMedical size={32} className="text-[#ffc72c]" />
        </div>

        {/* Inventory */}
        <div
          className={`bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200 ${connectionStatus.hasInventoryError ? "opacity-60" : ""}`}
        >
          <div>
            <div className="text-sm opacity-90">Total Inventory</div>
            <div className="text-2xl font-bold">{connectionStatus.hasInventoryError ? "—" : stats.totalInventory}</div>
            {connectionStatus.hasInventoryError && <div className="text-xs text-red-200 mt-1">Connection Error</div>}
          </div>
          <FaFileMedical size={32} className="text-[#ffc72c]" />
        </div>

        {/* Low Stock Alerts */}
        <div
          className={`bg-red-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200 ${connectionStatus.hasInventoryError ? "opacity-60" : ""}`}
        >
          <div>
            <div className="text-sm opacity-90">Low Stock Alerts</div>
            <div className="text-2xl font-bold">{connectionStatus.hasInventoryError ? "—" : stats.lowStock}</div>
            {connectionStatus.hasInventoryError && <div className="text-xs text-red-200 mt-1">Connection Error</div>}
          </div>
          <FaExclamationTriangle size={32} className="text-[#ffc72c]" />
        </div>

        {/* Medical Staff */}
        <div className="bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Medical Staff</div>
            <div className="text-2xl font-bold">{stats.medicalStaff}</div>
          </div>
          <FaUserMd size={32} className="text-[#ffc72c]" />
        </div>
      </div>

      {/* Appointments Section - At the top */}
      <div className="mb-8">
        <AppointmentsList
          appointments={appointments}
          loading={appointmentsLoading}
          hasError={connectionStatus.hasAppointmentsError}
          onRetry={fetchAppointments}
        />
      </div>

      {isSuperAdmin && (
        <div className="mb-8">
          <UserRegistrationChart
            data={filteredRegistrationData}
            loading={registrationLoading}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
          />
        </div>
      )}

      {/* Charts Section - Illness and Medicines */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2E3192] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fbbf24] rounded-lg flex items-center justify-center">
                  <FaFileMedical className="text-[#1e3a8a] text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Illness Cases Analytics</h2>
                </div>
              </div>
            </div>
            <div className="p-6">
              {showBarChart && (
                <div className="min-h-[400px]">
                  <HorizontalBarChart title="Illness Cases Tracking" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
