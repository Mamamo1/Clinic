"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  Search,
  Calendar,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Stethoscope,
  Activity,
  Heart,
  Clipboard,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ConsultationHistory() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [dentalRecords, setDentalRecords] = useState([])
  const [activeTab, setActiveTab] = useState("medical")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const recordsPerPage = 5

  useEffect(() => {
    fetchMedicalRecords()
    fetchDentalRecords()
  }, [])

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No authentication token found. Please log in again.")
      }
      const url = "http://localhost:8000/api/medical-records/user"
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        throw new Error("Authentication failed. Please log in again.")
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch medical records: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setRecords(data.data || [])
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchDentalRecords = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token found. Please log in again.")

      const userResponse = await fetch("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })

      if (!userResponse.ok) throw new Error("Failed to get user info")

      const userData = await userResponse.json()
      const userId = userData.id

      console.log("[v0] Fetching dental records for user ID:", userId)

      const url = `http://localhost:8000/api/dental-records/user/${userId}`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })

      console.log("[v0] Dental records API response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Raw dental records API data:", result)

        // Fix: Handle the nested data structure properly
        let records = [];
        
        if (result?.success && result?.data) {
          // If it's paginated data (has .data property)
          if (result.data.data && Array.isArray(result.data.data)) {
            records = result.data.data;
          } 
          // If it's direct array data
          else if (Array.isArray(result.data)) {
            records = result.data;
          }
        }

        console.log("[v0] Extracted dental records:", records);
        console.log("[v0] Dental records count:", records.length);

        setDentalRecords(records)
      } else {
        const errorText = await response.text()
        console.error("[v0] Dental records API error:", response.status, errorText)
        setDentalRecords([])
      }
    } catch (err) {
      console.error("Dental records fetch error:", err)
      setDentalRecords([])
    }
  }

  const getPhysicianName = (record) => {
    if (record.physician) {
      const role = record.physician.account_type || "Staff"
      return `${role}: ${record.physician.first_name} ${record.physician.last_name}`
    }
    return "Physician not assigned"
  }

  const getDentistName = (record) => {
    // Check if there's a dentist relationship first
    if (record.dentist) {
      const role = record.dentist.account_type || "Dentist"
      return `${role}: ${record.dentist.first_name} ${record.dentist.last_name}`
    }
    // Fallback to school_dentist field if no relationship
    if (record.school_dentist) {
      return `Dentist: ${record.school_dentist}`
    }
    return "Dentist not assigned"
  }

  const getTreatmentInfo = (record) => {
    const treatments = []
    
    // Check for specific treatments
    if (record.oral_prophylaxis_treatment) {
      treatments.push(`Oral Prophylaxis: ${record.oral_prophylaxis_treatment}`)
    }
    if (record.tooth_filling_treatment) {
      treatments.push(`Tooth Filling: ${record.tooth_filling_treatment}`)
    }
    if (record.tooth_extraction_treatment) {
      treatments.push(`Tooth Extraction: ${record.tooth_extraction_treatment}`)
    }
    if (record.other_treatments) {
      treatments.push(`Other: ${record.other_treatments}`)
    }
    
    if (treatments.length > 0) {
      return treatments.join(', ')
    }
    
    // Check if there's a purpose field (array)
    if (record.purpose && Array.isArray(record.purpose) && record.purpose.length > 0) {
      return record.purpose.join(', ')
    }
    
    // Check for general treatment field
    if (record.treatment) {
      return record.treatment
    }
    
    return "General Dental Examination"
  }

  const getPurposeDisplay = (record) => {
    if (record.purpose && Array.isArray(record.purpose)) {
      return record.purpose.join(', ')
    }
    if (typeof record.purpose === 'string') {
      return record.purpose
    }
    return "General checkup"
  }

  const getMedicinesList = (medicines) => {
    if (!medicines || medicines.length === 0) return []

    return medicines.map((medicine) => {
      if (typeof medicine === "string") {
        return { name: medicine, quantity: "N/A" }
      }
      const name =
        medicine.name ||
        (medicine.generic && medicine.brand_name
          ? `${medicine.generic} (${medicine.brand_name})`
          : medicine.generic || medicine.brand_name || "Unknown Medicine")

      return {
        name,
        quantity: medicine.pivot?.quantity_issued || "N/A",
        unit: medicine.unit || "pcs",
        dosage: medicine.dosage || "",
      }
    })
  }

  // Helper function for displaying tooth colors in the dental chart
  const getToothDisplayColor = (toothNumber) => {
    if (!selectedRecord.teeth_conditions) return "bg-white border-gray-300"
    
    const condition = selectedRecord.teeth_conditions[toothNumber] || "normal"
    switch (condition) {
      case "caries":
        return "bg-red-500 border-red-600 shadow-md"
      case "composite":
        return "bg-blue-600 border-blue-700 shadow-md"
      case "extraction":
        return "bg-gray-800 border-gray-900 shadow-md"
      default:
        return "bg-white border-gray-300"
    }
  }

  const currentRecords = activeTab === "medical" ? records : dentalRecords
  const safeCurrentRecords = Array.isArray(currentRecords) ? currentRecords : []

  const filteredRecords = safeCurrentRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase()
    
    if (activeTab === "medical") {
      return (
        record.reason_for_visit?.toLowerCase().includes(searchLower) ||
        record.illness_name?.toLowerCase().includes(searchLower) ||
        record.diagnosis?.toLowerCase().includes(searchLower) ||
        getPhysicianName(record).toLowerCase().includes(searchLower)
      )
    } else {
      return (
        getTreatmentInfo(record).toLowerCase().includes(searchLower) ||
        getPurposeDisplay(record).toLowerCase().includes(searchLower) ||
        record.school_dentist?.toLowerCase().includes(searchLower) ||
        record.oral_hygiene?.toLowerCase().includes(searchLower) ||
        record.remarks?.toLowerCase().includes(searchLower) ||
        getDentistName(record).toLowerCase().includes(searchLower)
      )
    }
  })

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage)

  const formatTime12Hour = (time24) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-700">
        <Loader2 className="animate-spin text-4xl mb-4" />
        <p className="text-xl font-medium">Loading consultation history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-yellow-200">
          <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-bold text-xl mb-4">Error: {error}</p>
            <button
              onClick={() => {
                fetchMedicalRecords()
                fetchDentalRecords()
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
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
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg border-4 border-white">
              <Stethoscope className="w-8 h-8 text-blue-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center mb-2">Medical & Dental History</h1>
          <p className="text-center text-blue-200 text-lg">View your medical and dental consultation records</p>
        </div>

        <div className="bg-blue-50 border-b border-blue-100">
          <div className="flex">
            <button
              onClick={() => handleTabChange("medical")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === "medical"
                  ? "bg-blue-600 text-white border-b-4 border-yellow-400"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <Stethoscope className="w-5 h-5 inline mr-2" />
              Medical Records ({records.length})
            </button>
            <button
              onClick={() => handleTabChange("dental")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === "dental"
                  ? "bg-blue-600 text-white border-b-4 border-yellow-400"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <Activity className="w-5 h-5 inline mr-2" />
              Dental Records ({dentalRecords.length})
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-6 sm:p-10 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-lg border-4 border-yellow-400">
                {activeTab === "medical" ? (
                  <Stethoscope className="w-6 h-6 text-blue-700" />
                ) : (
                  <Activity className="w-6 h-6 text-blue-700" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {filteredRecords.length} {filteredRecords.length === 1 ? "Record" : "Records"} Found
                </h3>
                <p className="text-blue-700">
                  National University Philippines - {activeTab === "medical" ? "Medical" : "Dental"} Records
                </p>
              </div>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab} records...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white shadow-md font-medium"
              />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {paginatedRecords.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl border-2 border-dashed border-blue-300">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                {activeTab === "medical" ? (
                  <Stethoscope className="w-10 h-10 text-blue-800" />
                ) : (
                  <Activity className="w-10 h-10 text-blue-800" />
                )}
              </div>
              <p className="text-blue-900 text-2xl font-bold mb-2">No {activeTab} records found</p>
              <p className="text-blue-700 text-lg">
                {searchTerm ? "Try adjusting your search terms" : `Your ${activeTab} history will appear here`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border-2 border-yellow-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
                >
                  <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-xl -mt-8 -mx-8 mb-6"></div>

                  {activeTab === "medical" ? (
                    <>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-5">
                            <Stethoscope className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-800 text-2xl leading-tight">
                              {record.reason_for_visit || "General Consultation"}
                            </h3>
                            {record.illness_name && (
                              <p className="text-red-600 font-semibold bg-red-100 px-3 py-1 rounded-full text-sm inline-block mt-2 border border-red-200">
                                Illness: {record.illness_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-full font-semibold border bg-green-100 text-green-800 border-green-200">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-base">Completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-5">
                          <div className="flex items-center mb-3">
                            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="font-bold text-blue-800">Date & Time</h4>
                          </div>
                          <p className="text-blue-900 font-bold text-lg leading-tight">
                            {formatDate(record.visit_date)}
                          </p>
                          {record.visit_time && (
                            <p className="text-blue-700 font-medium text-base mt-1">
                              {formatTime12Hour(record.visit_time)}
                            </p>
                          )}
                        </div>

                        <div className="bg-green-50 rounded-lg p-5">
                          <div className="flex items-center mb-3">
                            <User className="w-5 h-5 text-green-600 mr-2" />
                            <h4 className="font-bold text-green-800">Physician</h4>
                          </div>
                          <p className="text-green-900 font-bold text-lg">{getPhysicianName(record)}</p>
                        </div>

                        {record.diagnosis && (
                          <div className="bg-yellow-50 rounded-lg p-5">
                            <div className="flex items-center mb-3">
                              <FileText className="w-5 h-5 text-yellow-600 mr-2" />
                              <h4 className="font-bold text-yellow-800">Diagnosis</h4>
                            </div>
                            <p className="text-yellow-900 font-bold text-lg leading-tight">{record.diagnosis}</p>
                          </div>
                        )}
                      </div>

                      {(record.temperature || record.blood_pressure) && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                          <h4 className="font-bold text-gray-800 text-lg mb-3">Vital Signs</h4>
                          <div className="flex flex-wrap gap-4">
                            {record.temperature && (
                              <div className="bg-orange-100 px-4 py-2 rounded-lg border border-orange-200">
                                <span className="text-orange-800 font-semibold">
                                  Temperature: {record.temperature}°C
                                </span>
                              </div>
                            )}
                            {record.blood_pressure && (
                              <div className="bg-red-100 px-4 py-2 rounded-lg border border-red-200">
                                <span className="text-red-800 font-semibold">
                                  Blood Pressure: {record.blood_pressure}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Dental Records Display */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-5">
                            <Activity className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-800 text-2xl leading-tight">
                              {getTreatmentInfo(record)}
                            </h3>
                            <p className="text-blue-600 text-sm mt-1">
                              Purpose: {getPurposeDisplay(record)}
                            </p>
                            {/* Show tooth counts if available */}
                            {(record.decayed_teeth_count > 0 || record.extraction_teeth_count > 0) && (
                              <div className="flex gap-2 mt-2">
                                {record.decayed_teeth_count > 0 && (
                                  <p className="text-red-600 font-semibold bg-red-100 px-3 py-1 rounded-full text-sm inline-block border border-red-200">
                                    Decayed: {record.decayed_teeth_count}
                                  </p>
                                )}
                                {record.extraction_teeth_count > 0 && (
                                  <p className="text-orange-600 font-semibold bg-orange-100 px-3 py-1 rounded-full text-sm inline-block border border-orange-200">
                                    Extractions: {record.extraction_teeth_count}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-full font-semibold border bg-green-100 text-green-800 border-green-200">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-base">Completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-5">
                          <div className="flex items-center mb-3">
                            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="font-bold text-blue-800">Examination Date</h4>
                          </div>
                          <p className="text-blue-900 font-bold text-lg leading-tight">
                            {formatDate(record.examination_date || record.created_at)}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-5">
                          <div className="flex items-center mb-3">
                            <User className="w-5 h-5 text-green-600 mr-2" />
                            <h4 className="font-bold text-green-800">Dentist</h4>
                          </div>
                          <p className="text-green-900 font-bold text-lg">{getDentistName(record)}</p>
                        </div>

                        {record.oral_hygiene && (
                          <div className="bg-yellow-50 rounded-lg p-5">
                            <div className="flex items-center mb-3">
                              <Heart className="w-5 h-5 text-yellow-600 mr-2" />
                              <h4 className="font-bold text-yellow-800">Oral Hygiene</h4>
                            </div>
                            <p className={`font-bold text-lg leading-tight capitalize ${
                              record.oral_hygiene === 'excellent' ? 'text-green-700' :
                              record.oral_hygiene === 'good' ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                              {record.oral_hygiene}
                            </p>
                          </div>
                        )}
                      </div>

                      {record.remarks && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                          <h4 className="font-bold text-gray-800 text-lg mb-3">
                            <Clipboard className="w-5 h-5 inline mr-2" />
                            Remarks
                          </h4>
                          <p className="text-gray-700 font-medium">{record.remarks}</p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold text-base"
                    >
                      <Eye className="w-5 h-5 inline mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-blue-100">
              <p className="text-blue-700 font-medium text-lg">
                Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredRecords.length)} of{" "}
                {filteredRecords.length} records
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 border-2 border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-blue-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white transform scale-105 border-2 border-yellow-400 shadow-lg"
                        : "border-2 border-blue-200 hover:bg-blue-50 text-blue-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 border-2 border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center py-6 bg-blue-900 text-white">
          <p className="font-semibold mb-2 text-lg">
            <Stethoscope className="inline-block w-5 h-5 mr-2 text-yellow-400" />
            Your medical and dental records are managed securely
          </p>
          <p className="text-blue-300 text-sm">
            © 2025 National University - Lipa Campus Medical Center. All rights reserved.
          </p>
        </div>
      </div>

      {/* Modal for Record Details */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-yellow-200">
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                    {activeTab === "medical" ? (
                      <Stethoscope className="w-6 h-6 text-blue-800" />
                    ) : (
                      <Activity className="w-6 h-6 text-blue-800" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {activeTab === "medical" ? "Medical Consultation" : "Dental Examination"} Details
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-white hover:text-yellow-400 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {activeTab === "medical" ? (
                <>
                  {/* Medical Record Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                      <h3 className="font-bold text-blue-800 mb-4 text-xl flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Visit Information
                      </h3>
                      <div className="space-y-3">
                        <p className="text-blue-900 font-medium">
                          <strong>Date:</strong> {formatDate(selectedRecord.visit_date)}
                        </p>
                        {selectedRecord.visit_time && (
                          <p className="text-blue-900 font-medium">
                            <strong>Time:</strong> {formatTime12Hour(selectedRecord.visit_time)}
                          </p>
                        )}
                        <p className="text-blue-900 font-medium">
                          <strong>Reason:</strong> {selectedRecord.reason_for_visit || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                      <h3 className="font-bold text-green-800 mb-4 text-xl flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Medical Staff
                      </h3>
                      <p className="text-green-900 font-medium">
                        <strong>Physician/Nurse:</strong>
                        <span className="ml-2 font-bold">{getPhysicianName(selectedRecord)}</span>
                      </p>
                    </div>
                  </div>

                  {selectedRecord.illness_name && (
                    <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                      <h3 className="font-bold text-red-800 mb-3 text-xl">Illness</h3>
                      <p className="text-red-700 font-bold text-lg">{selectedRecord.illness_name}</p>
                    </div>
                  )}

                  {selectedRecord.diagnosis && (
                    <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
                      <h3 className="font-bold text-yellow-800 mb-3 text-xl">Diagnosis</h3>
                      <p className="text-yellow-700 font-bold text-lg">{selectedRecord.diagnosis}</p>
                    </div>
                  )}

                  {selectedRecord.allergies && (
                    <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                      <h3 className="font-bold text-orange-800 mb-3 text-xl">Allergies</h3>
                      <p className="text-orange-700 font-bold text-lg">{selectedRecord.allergies}</p>
                    </div>
                  )}

                  {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
                    <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                      <h3 className="font-bold text-purple-800 mb-4 text-xl">Prescribed Medicines</h3>
                      <div className="space-y-3">
                        {getMedicinesList(selectedRecord.medicines).map((medicine, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200"
                          >
                            <div className="flex items-center text-purple-700 font-medium text-lg">
                              <span className="w-3 h-3 bg-purple-500 rounded-full mr-4"></span>
                              <span>{medicine.name}</span>
                            </div>
                            <div className="text-purple-600 font-semibold">
                              Qty: {medicine.quantity} {medicine.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Dental Record Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                      <h3 className="font-bold text-blue-800 mb-4 text-xl flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Examination Information
                      </h3>
                      <div className="space-y-3">
                        <p className="text-blue-900 font-medium">
                          <strong>Date:</strong> {formatDate(selectedRecord.examination_date || selectedRecord.created_at)}
                        </p>
                        <p className="text-blue-900 font-medium">
                          <strong>Purpose:</strong> {getPurposeDisplay(selectedRecord)}
                        </p>
                        <p className="text-blue-900 font-medium">
                          <strong>Oral Hygiene:</strong> 
                          <span className={`ml-2 font-bold capitalize ${
                            selectedRecord.oral_hygiene === 'excellent' ? 'text-green-600' :
                            selectedRecord.oral_hygiene === 'good' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {selectedRecord.oral_hygiene || 'Not assessed'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                      <h3 className="font-bold text-green-800 mb-4 text-xl flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Dental Staff
                      </h3>
                      <p className="text-green-900 font-medium">
                        <strong>Dentist:</strong>
                        <span className="ml-2 font-bold">{getDentistName(selectedRecord)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Interactive Dental Chart Display */}
                  {selectedRecord.teeth_conditions && Object.keys(selectedRecord.teeth_conditions).length > 0 && (
                    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                      <h3 className="font-bold text-blue-800 mb-4 text-xl flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Interactive Dental Chart
                      </h3>
                      
                      <div className="bg-white p-6 rounded-xl shadow-inner">
                        {/* Upper Teeth */}
                        <div className="mb-6">
                          <div className="text-center mb-4">
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              Upper Teeth
                            </span>
                          </div>
                          {/* Upper teeth rows */}
                          <div className="grid grid-cols-8 gap-2 mb-2 justify-center">
                            {[18, 17, 16, 15, 14, 13, 12, 11].map((toothNum) => (
                              <div key={toothNum} className="text-center">
                                <div className="text-xs font-semibold text-blue-700 mb-1 bg-blue-100 rounded px-1 py-1">
                                  {toothNum}
                                </div>
                                <div
                                  className={`w-8 h-12 border-2 rounded-lg ${getToothDisplayColor(toothNum)}`}
                                  title={`Tooth ${toothNum} - ${selectedRecord.teeth_conditions[toothNum] || 'normal'}`}
                                >
                                  {selectedRecord.teeth_conditions[toothNum] === "extraction" && (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-white font-bold text-sm">✕</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-8 gap-2 mb-4 justify-center">
                            {[21, 22, 23, 24, 25, 26, 27, 28].map((toothNum) => (
                              <div key={toothNum} className="text-center">
                                <div
                                  className={`w-8 h-12 border-2 rounded-lg ${getToothDisplayColor(toothNum)}`}
                                  title={`Tooth ${toothNum} - ${selectedRecord.teeth_conditions[toothNum] || 'normal'}`}
                                >
                                  {selectedRecord.teeth_conditions[toothNum] === "extraction" && (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-white font-bold text-sm">✕</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-blue-700 mt-1 bg-blue-100 rounded px-1 py-1">
                                  {toothNum}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* R and L indicators */}
                        <div className="flex justify-between items-center mb-6 px-4">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-900">R</span>
                          </div>
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-900">L</span>
                          </div>
                        </div>

                        {/* Lower Teeth */}
                        <div>
                          <div className="text-center mb-4">
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              Lower Teeth
                            </span>
                          </div>
                          <div className="grid grid-cols-8 gap-2 mb-2 justify-center">
                            {[48, 47, 46, 45, 44, 43, 42, 41].map((toothNum) => (
                              <div key={toothNum} className="text-center">
                                <div className="text-xs font-semibold text-blue-700 mb-1 bg-blue-100 rounded px-1 py-1">
                                  {toothNum}
                                </div>
                                <div
                                  className={`w-8 h-12 border-2 rounded-lg ${getToothDisplayColor(toothNum)}`}
                                  title={`Tooth ${toothNum} - ${selectedRecord.teeth_conditions[toothNum] || 'normal'}`}
                                >
                                  {selectedRecord.teeth_conditions[toothNum] === "extraction" && (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-white font-bold text-sm">✕</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-8 gap-2 justify-center">
                            {[31, 32, 33, 34, 35, 36, 37, 38].map((toothNum) => (
                              <div key={toothNum} className="text-center">
                                <div
                                  className={`w-8 h-12 border-2 rounded-lg ${getToothDisplayColor(toothNum)}`}
                                  title={`Tooth ${toothNum} - ${selectedRecord.teeth_conditions[toothNum] || 'normal'}`}
                                >
                                  {selectedRecord.teeth_conditions[toothNum] === "extraction" && (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-white font-bold text-sm">✕</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-blue-700 mt-1 bg-blue-100 rounded px-1 py-1">
                                  {toothNum}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl border border-yellow-200">
                          <h5 className="font-bold text-blue-800 mb-3 text-sm flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Condition Legend
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                              <span className="font-medium">Normal</span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                              <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded"></div>
                              <span className="font-medium">Caries</span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                              <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded"></div>
                              <span className="font-medium">Composite</span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                              <div className="w-4 h-4 bg-gray-800 border-2 border-gray-900 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✕</span>
                              </div>
                              <span className="font-medium">Extraction</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teeth Condition Summary */}
                  {(selectedRecord.decayed_teeth_count > 0 || selectedRecord.extraction_teeth_count > 0) && (
                    <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                      <h3 className="font-bold text-red-800 mb-4 text-xl flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Teeth Condition Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-red-200">
                          <p className="text-red-700 font-medium">
                            <strong>Decayed Teeth:</strong>
                            <span className="ml-2 text-2xl font-bold text-red-600">
                              {selectedRecord.decayed_teeth_count || 0}
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-orange-200">
                          <p className="text-orange-700 font-medium">
                            <strong>Teeth for Extraction:</strong>
                            <span className="ml-2 text-2xl font-bold text-orange-600">
                              {selectedRecord.extraction_teeth_count || 0}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Treatment Plan & Remarks */}
                  <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-xl flex items-center">
                      <Clipboard className="w-5 h-5 mr-2" />
                      Treatment Plan & Remarks
                    </h3>
                    <div className="space-y-4">
                      {/* Oral Prophylaxis Notes */}
                      {selectedRecord.oral_prophylaxis_notes && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Oral Prophylaxis Notes</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.oral_prophylaxis_notes}</p>
                        </div>
                      )}
                      
                      {/* Tooth Filling Numbers */}
                      {selectedRecord.tooth_filling_numbers && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Tooth Filling Numbers</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.tooth_filling_numbers}</p>
                        </div>
                      )}
                      
                      {/* Tooth Extraction Numbers */}
                      {selectedRecord.tooth_extraction_numbers && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Tooth Extraction Numbers</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.tooth_extraction_numbers}</p>
                        </div>
                      )}

                      {/* Legacy treatment fields for backward compatibility */}
                      {selectedRecord.oral_prophylaxis_treatment && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Oral Prophylaxis Treatment</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.oral_prophylaxis_treatment}</p>
                        </div>
                      )}
                      
                      {selectedRecord.tooth_filling_treatment && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Tooth Filling Treatment</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.tooth_filling_treatment}</p>
                        </div>
                      )}
                      
                      {selectedRecord.tooth_extraction_treatment && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Tooth Extraction Treatment</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.tooth_extraction_treatment}</p>
                        </div>
                      )}
                      
                      {selectedRecord.other_treatments && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="text-purple-700 font-bold mb-2">Other Treatments</h4>
                          <p className="text-purple-600 font-medium">{selectedRecord.other_treatments}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {selectedRecord.other_notes && (
                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                      <h3 className="font-bold text-green-800 mb-3 text-xl flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Additional Notes
                      </h3>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <p className="text-green-700 font-medium text-base leading-relaxed">{selectedRecord.other_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Next Appointment */}
                  {selectedRecord.next_appointment && (
                    <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
                      <h3 className="font-bold text-yellow-800 mb-3 text-xl flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Next Appointment
                      </h3>
                      <p className="text-yellow-700 font-bold text-lg">
                        {formatDate(selectedRecord.next_appointment)}
                      </p>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedRecord.remarks && (
                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                      <h3 className="font-bold text-gray-800 mb-3 text-xl flex items-center">
                        <Clipboard className="w-5 h-5 mr-2" />
                        Remarks
                      </h3>
                      <p className="text-gray-700 font-medium text-lg leading-relaxed">{selectedRecord.remarks}</p>
                    </div>
                  )}

                  {/* Dentist Signature */}
                  {selectedRecord.dentist_signature && (
                    <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                      <h3 className="font-bold text-indigo-800 mb-3 text-xl flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Dentist Signature
                      </h3>
                      <p className="text-indigo-700 font-medium italic">{selectedRecord.dentist_signature}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}