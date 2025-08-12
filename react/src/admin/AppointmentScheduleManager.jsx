"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  Settings,
  CheckCircle,
  XCircle,
  GraduationCap,
  Building,
  Stethoscope,
  Smile,
  Save,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react"
import axios from "axios"

const AppointmentScheduleManager = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [scheduleSettings, setScheduleSettings] = useState({
    appointments_enabled: true,
    doctor_enabled: true,
    dentist_enabled: true,
    enabled_courses: [],
    enabled_departments: [],
    custom_message: "Appointments are currently unavailable for your course/department.",
  })

  // Course and Department data
  const shsCourses = [
    { value: "ABM", text: "ABM - Accountancy, Business and Management" },
    { value: "STEM", text: "STEM - Science, Technology, Engineering and Mathematics" },
    { value: "HUMSS", text: "HUMSS - Humanities and Social Sciences" },
  ]

  const collegeDepartments = {
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
  }

  // Fetch current schedule settings
  const fetchScheduleSettings = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.get("http://localhost:8000/api/appointment-schedule", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.data.success) {
        setScheduleSettings(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching schedule settings:", error)
      setError(error.response?.data?.message || "Failed to load schedule settings")
    } finally {
      setLoading(false)
    }
  }

  // Save schedule settings
  const saveScheduleSettings = async () => {
    setSaving(true)
    setError("")
    setSuccessMessage("")
    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.post("http://localhost:8000/api/appointment-schedule", scheduleSettings, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (response.data.success) {
        setSuccessMessage("Schedule settings saved successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error saving schedule settings:", error)
      setError(error.response?.data?.message || "Failed to save schedule settings")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchScheduleSettings()
  }, [])

  const handleToggle = (field) => {
    setScheduleSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleCourseToggle = (courseValue) => {
    setScheduleSettings((prev) => ({
      ...prev,
      enabled_courses: prev.enabled_courses.includes(courseValue)
        ? prev.enabled_courses.filter((c) => c !== courseValue)
        : [...prev.enabled_courses, courseValue],
    }))
  }

  const handleDepartmentToggle = (departmentValue) => {
    setScheduleSettings((prev) => ({
      ...prev,
      enabled_departments: prev.enabled_departments.includes(departmentValue)
        ? prev.enabled_departments.filter((d) => d !== departmentValue)
        : [...prev.enabled_departments, departmentValue],
    }))
  }

  const handleSelectAllCourses = () => {
    const allCourses = shsCourses.map((c) => c.value)
    setScheduleSettings((prev) => ({
      ...prev,
      enabled_courses: prev.enabled_courses.length === allCourses.length ? [] : allCourses,
    }))
  }

  const handleSelectAllDepartments = () => {
    const allDepartments = Object.values(collegeDepartments)
      .flat()
      .map((d) => d.value)
    setScheduleSettings((prev) => ({
      ...prev,
      enabled_departments: prev.enabled_departments.length === allDepartments.length ? [] : allDepartments,
    }))
  }

  const getStatistics = () => {
    const totalCourses = shsCourses.length
    const totalDepartments = Object.values(collegeDepartments).flat().length
    const enabledCourses = scheduleSettings.enabled_courses.length
    const enabledDepartments = scheduleSettings.enabled_departments.length

    return {
      totalCourses,
      totalDepartments,
      enabledCourses,
      enabledDepartments,
      coursesPercentage: Math.round((enabledCourses / totalCourses) * 100),
      departmentsPercentage: Math.round((enabledDepartments / totalDepartments) * 100),
    }
  }

  const stats = getStatistics()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-yellow-400">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Appointment Schedule Manager</h2>
          <p className="text-blue-200">Control appointment availability by course and department</p>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600">Loading schedule settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-yellow-400">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center">
              <Clock className="mr-3" />
              Appointment Schedule Manager
            </h2>
            <p className="text-blue-200">Control appointment availability by course and department</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchScheduleSettings}
              className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
              title="Refresh settings"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={saveScheduleSettings}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">System Status</p>
                <p className="text-2xl font-bold text-blue-800">
                  {scheduleSettings.appointments_enabled ? "OPEN" : "CLOSED"}
                </p>
              </div>
              {scheduleSettings.appointments_enabled ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">SHS Courses</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {stats.enabledCourses}/{stats.totalCourses}
                </p>
                <p className="text-xs text-yellow-600">{stats.coursesPercentage}% enabled</p>
              </div>
              <GraduationCap className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">College Depts</p>
                <p className="text-2xl font-bold text-green-800">
                  {stats.enabledDepartments}/{stats.totalDepartments}
                </p>
                <p className="text-xs text-green-600">{stats.departmentsPercentage}% enabled</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Services</p>
                <p className="text-2xl font-bold text-purple-800">
                  {(scheduleSettings.doctor_enabled ? 1 : 0) + (scheduleSettings.dentist_enabled ? 1 : 0)}/2
                </p>
                <p className="text-xs text-purple-600">
                  {scheduleSettings.doctor_enabled && scheduleSettings.dentist_enabled
                    ? "Both active"
                    : scheduleSettings.doctor_enabled
                      ? "Doctor only"
                      : scheduleSettings.dentist_enabled
                        ? "Dentist only"
                        : "None active"}
                </p>
              </div>
              <Stethoscope className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Settings className="mr-2" />
            Global Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <h4 className="font-semibold text-gray-800">Appointments System</h4>
                <p className="text-sm text-gray-600">Enable/disable all appointments</p>
              </div>
              <button
                onClick={() => handleToggle("appointments_enabled")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  scheduleSettings.appointments_enabled ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    scheduleSettings.appointments_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-1" />
                  Doctor Services
                </h4>
                <p className="text-sm text-gray-600">Medical consultations</p>
              </div>
              <button
                onClick={() => handleToggle("doctor_enabled")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  scheduleSettings.doctor_enabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    scheduleSettings.doctor_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <Smile className="w-4 h-4 mr-1" />
                  Dentist Services
                </h4>
                <p className="text-sm text-gray-600">Dental consultations</p>
              </div>
              <button
                onClick={() => handleToggle("dentist_enabled")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  scheduleSettings.dentist_enabled ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    scheduleSettings.dentist_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* SHS Courses */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-yellow-800 flex items-center">
                <GraduationCap className="mr-2" />
                Senior High School Courses
              </h3>
              <button
                onClick={handleSelectAllCourses}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
              >
                {scheduleSettings.enabled_courses.length === shsCourses.length ? "Clear All" : "Select All"}
              </button>
            </div>
            <div className="space-y-3">
              {shsCourses.map((course) => (
                <div key={course.value} className="flex items-center p-3 bg-white rounded-lg border">
                  <input
                    type="checkbox"
                    id={`course-${course.value}`}
                    checked={scheduleSettings.enabled_courses.includes(course.value)}
                    onChange={() => handleCourseToggle(course.value)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`course-${course.value}`}
                    className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {course.text}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* College Departments */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-800 flex items-center">
                <Building className="mr-2" />
                College Departments
              </h3>
              <button
                onClick={handleSelectAllDepartments}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
              >
                {scheduleSettings.enabled_departments.length === Object.values(collegeDepartments).flat().length
                  ? "Clear All"
                  : "Select All"}
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(collegeDepartments).map(([deptName, courses]) => (
                <div key={deptName} className="bg-white rounded-lg border p-3">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">{deptName}</h4>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <div key={course.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`dept-${course.value}`}
                          checked={scheduleSettings.enabled_departments.includes(course.value)}
                          onChange={() => handleDepartmentToggle(course.value)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`dept-${course.value}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                          {course.text}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
            <Info className="mr-2" />
            Custom Unavailability Message
          </h3>
          <textarea
            value={scheduleSettings.custom_message}
            onChange={(e) => setScheduleSettings((prev) => ({ ...prev, custom_message: e.target.value }))}
            className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Message shown to users when appointments are unavailable for their course/department"
          />
          <p className="text-sm text-blue-600 mt-2">
            This message will be displayed to students whose courses/departments are not enabled for appointments.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AppointmentScheduleManager
