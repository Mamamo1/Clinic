"use client"

import { useState, useEffect } from "react"
import { capitalizeWords } from "../../utils"
import { useParams } from "react-router-dom"
import AddMedicalRecordsModal from "../Modals/AddMedicalRecordsModal"
import axios from "axios"
import { FileText, Plus, Eye, Edit3, Trash2, Stethoscope } from "lucide-react"

const UserDetail = () => {
  const [activeTab, setActiveTab] = useState("basic")
  const { id } = useParams()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    physician_nurse: "",
    reason: "",
    temperature: "",
    bloodPressure: "",
    allergies: "",
    medicines: [],
  })
  const [records, setRecords] = useState([])
  const [deletingRecordId, setDeletingRecordId] = useState(null)

  const personalInfoFields = [
    "first_name",
    "middle_name",
    "last_name",
    "salutation",
    "gender",
    "date_of_birth",
    "email",
  ]
  const addressFields = ["mobile", "telephone", "zipcode", "state", "city", "street"]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) throw new Error("No auth token found")

        const res = await fetch(`http://localhost:8000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.message || "Failed to fetch user data")
        }

        const json = await res.json()
        setUserData(json.data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No auth token found")

      // Using custom route to fetch records by user ID
      const response = await axios.get(`http://localhost:8000/api/medical-records/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      
      setRecords(response.data.records || [])
    } catch (err) {
      console.error("Error fetching medical records:", err)

      if (err.response) {
        console.error("Response status:", err.response.status)
        console.error("Response data:", err.response.data)

        if (err.response.status === 404) {
          setRecords([]) // No records found
        } else if (err.response.status !== 500) {
          alert(`Error fetching medical records: ${err.response.data?.message || "Server error"}`)
        }
      } else {
        console.error("Network error:", err.message)
      }

      setRecords([])
    }
  }

  useEffect(() => {
    if (activeTab === "records") {
      fetchMedicalRecords()
    }
  }, [activeTab, id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("auth_token")

      // Validate required fields
      if (!formData.date || !formData.physician_nurse || !formData.reason) {
        alert("Please fill in all required fields (Date, Physician/Nurse, and Reason)")
        return
      }

      const payload = {
        user_id: id,
        date: formData.date,
        physician_nurse: formData.physician_nurse,
        reason: formData.reason,
        temperature: formData.temperature || null,
        bloodPressure: formData.bloodPressure || null,
        allergies: formData.allergies || null,
        medicines: formData.medicines || [],
      }

      // Using resource route pattern - this will call the store method
      const response = await axios.post("http://localhost:8000/api/medical-records", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      alert("Medical record saved successfully!")
      setShowModal(false)

      // Reset form data
      setFormData({
        date: "",
        physician_nurse: "",
        reason: "",
        temperature: "",
        bloodPressure: "",
        allergies: "",
        medicines: [],
      })

      // Refresh medical records
      fetchMedicalRecords()
    } catch (error) {
      console.error("Full error object:", error)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
      console.error("Error response status:", error.response?.status)
      console.error("Error message:", error.message)

      let errorMessage = "Unknown error occurred"

      if (error.response?.data?.errors) {
        // Validation errors
        const errors = Object.values(error.response.data.errors).flat()
        errorMessage = errors.join(", ")
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(`Failed to save medical record: ${errorMessage}`)
    }
  }

  const handleCancel = () => {
    setFormData({
      date: "",
      physician_nurse: "",
      reason: "",
      temperature: "",
      bloodPressure: "",
      allergies: "",
      medicines: [],
    })
    setShowModal(false)
  }

  const fetchStaffAndInventory = async () => {
    // This function can be implemented later if needed for the modal
    // to fetch available staff and inventory items
  }

  const handleDeleteRecord = async (record, index) => {
    if (!confirm("Are you sure you want to delete this medical record?")) {
      return
    }

    // Check if record has an ID
    if (!record || !record.id) {
      console.error("Record or record ID is missing:", record)
      alert("Cannot delete record: Record ID is missing")
      return
    }

    setDeletingRecordId(record.id)

    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        alert("Authentication required")
        return
      }

      // Using resource route pattern - this will call the destroy method
      const response = await axios.delete(`http://localhost:8000/api/medical-records/${record.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      

      // Remove from local state
      setRecords((prev) => prev.filter((_, i) => i !== index))
      alert("Medical record deleted successfully!")
    } catch (error) {
      console.error("Error deleting record:", error)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
      console.error("Error status:", error.response?.status)

      let errorMessage = "Failed to delete medical record"

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(errorMessage)
    } finally {
      setDeletingRecordId(null)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64">Loading user data...</div>
  if (error) return <div className="text-red-600 text-center">Error: {error}</div>
  if (!userData) return <div className="text-center">No user data found.</div>

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#00205b]">Personal Information</h2>
              {personalInfoFields.map((key) => (
                <div key={key} className="mb-4">
                  <label className="block font-medium mb-1 capitalize">{key.replace(/_/g, " ")}</label>
                  <div className="border border-gray-300 p-2 rounded bg-gray-100">
                    {capitalizeWords(userData[key] || "")}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#00205b]">Address And Contacts</h2>
              {addressFields.map((key) => (
                <div key={key} className="mb-4">
                  <label className="block font-medium mb-1 capitalize">{key.replace(/_/g, " ")}</label>
                  <div className="border border-gray-300 p-2 rounded bg-gray-100">{userData[key] || ""}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case "records":
        return (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#2E3192] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold ml-3 text-[#2E3192]">Medical Records</h2>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#1e2577] transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medical Record
              </button>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No medical records found</p>
                <p className="text-sm text-gray-400 mt-2">Click "Add Medical Record" to create the first record</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div key={record.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#2E3192] rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-[#2E3192] text-lg">{record.reason_for_visit}</h3>
                          <p className="text-gray-500 text-sm">
                            {record.visit_date && new Date(record.visit_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-[#2E3192] hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#ffc72c] hover:bg-yellow-50 rounded-lg transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(record, index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Delete"
                          disabled={deletingRecordId === record.id}
                        >
                          {deletingRecordId === record.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-[#2E3192] text-sm mb-2">Physician/Nurse</h4>
                        <p className="text-gray-900">
                          {record.physician 
                            ? `${record.physician.first_name} ${record.physician.last_name}`
                            : `ID: ${record.physician_nurse_id}`}
                        </p>
                      </div>
                      {record.temperature && (
                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="font-medium text-red-700 text-sm mb-2">Temperature</h4>
                          <p className="text-gray-900 font-semibold">{record.temperature}</p>
                        </div>
                      )}
                      {record.blood_pressure && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-700 text-sm mb-2">Blood Pressure</h4>
                          <p className="text-gray-900 font-semibold">{record.blood_pressure}</p>
                        </div>
                      )}
                    </div>

                    {record.allergies && (
                      <div className="bg-orange-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-orange-700 text-sm mb-2">Allergies</h4>
                        <p className="text-gray-900">{record.allergies}</p>
                      </div>
                    )}

                    {record.medicines && record.medicines.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-700 text-sm mb-3">Medicines Issued</h4>
                        <div className="space-y-2">
                          {record.medicines.map((medicine, medIndex) => (
                            <div key={medIndex} className="flex items-center justify-between bg-white rounded-md p-2">
                              <span className="text-gray-900">{medicine.name || medicine.generic}</span>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Qty: {medicine.pivot?.quantity_issued || "N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showModal && (
              <AddMedicalRecordsModal
                formData={formData}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={handleCancel}
                fetchStaffAndInventory={fetchStaffAndInventory}
              />
            )}
          </div>
        )

      case "medicalHistory":
        return (
          <div className="mt-4 text-[#00205b]">
            <h3 className="text-lg font-semibold mb-4">Medical Health History</h3>
            <p className="text-gray-500">Medical history functionality will be implemented here.</p>
          </div>
        )

      case "certificate":
        return (
          <div className="mt-4 text-[#00205b]">
            <h3 className="text-lg font-semibold mb-4">Medical Certificate</h3>
            <p className="text-gray-500">Medical certificate functionality will be implemented here.</p>
          </div>
        )

      case "dental":
        return (
          <div className="mt-4 text-[#00205b]">
            <h3 className="text-lg font-semibold mb-4">Dental Records</h3>
            <p className="text-gray-500">Dental records functionality will be implemented here.</p>
          </div>
        )

      default:
        return <div className="mt-4 text-[#00205b]">Content goes here...</div>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-3xl font-bold mb-4 text-[#00205b]">Profile</h1>
      <div className="flex items-center">
        <div className="w-20 h-20 rounded-full bg-gray-300 mr-6 flex-shrink-0 flex items-center justify-center">
          <span className="text-gray-600 text-2xl">
            {userData.first_name?.[0]}
            {userData.last_name?.[0]}
          </span>
        </div>
        <div>
          <p className="text-lg font-bold text-[#00205b]">
            {userData.salutation} {userData.first_name} {userData.middle_name} {userData.last_name}
          </p>
          <p>
            Course: <span className="font-bold">{userData.course || "N/A"}</span>
          </p>
          <p>
            ID number: <span className="font-bold">{userData.student_number || userData.employee_id || "N/A"}</span>
          </p>
          <p>
            Official email: <span className="font-bold">{userData.email}</span>
          </p>
        </div>
      </div>

      <div className="flex space-x-2 mt-6 border-b overflow-x-auto">
        {[
          ["basic", "Basic Information"],
          ["medicalHistory", "Medical Health History"],
          ["records", "Medical Records"],
          ["certificate", "Medical Certificate"],
          ["dental", "Dental Records"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-2 text-sm border-b-4 transition-colors duration-200 whitespace-nowrap ${
              activeTab === key
                ? "border-[#ffc72c] text-[#00205b] font-bold"
                : "border-transparent text-gray-500 hover:text-[#00205b]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  )
}

export default UserDetail