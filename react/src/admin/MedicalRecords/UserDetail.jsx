"use client"
import { useState, useEffect } from "react"
import { capitalizeWords } from "../../utils"
import { useParams } from "react-router-dom"
import AddMedicalRecordsModal from "../Modals/AddMedicalRecordsModal"
import axios from "axios"
import { FileText, Plus, Eye, Edit3, Trash2, Stethoscope, Loader2, Heart, Save, X, Edit } from 'lucide-react'

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

  // Medical History State
  const [medicalHistory, setMedicalHistory] = useState({
    is_pwd: false,
    pwd_disability: "",
    anemia: false,
    bleeding_disorders: false,
    vertigo_dizziness: false,
    migraine: false,
    epilepsy: false,
    panic_anxiety: false,
    hyperacidity_gerd: false,
    heart_disease: false,
    kidney_disease: false,
    asthma: false,
    sexually_transmitted_illness: false,
    congenital_heart_disease: false,
    immunocompromised: false,
    immunocompromised_specify: "",
    musculoskeletal_injury: false,
    musculoskeletal_injury_specify: "",
    mumps: false,
    chickenpox: false,
    hepatitis: false,
    scoliosis: false,
    diabetes_mellitus: false,
    head_injury: false,
    visual_defect: false,
    visual_defect_specify: "",
    hearing_defect: false,
    hearing_defect_specify: "",
    tuberculosis: false,
    hypertension: false,
    g6pd: false,
    rheumatic_heart_disease: false,
    allergies_specify: "",
  })
  const [isEditingMedicalHistory, setIsEditingMedicalHistory] = useState(false)
  const [savingMedicalHistory, setSavingMedicalHistory] = useState(false)

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

  const medicalConditions = [
    { key: "anemia", label: "Anemia" },
    { key: "bleeding_disorders", label: "Bleeding Tendencies/Disorders" },
    { key: "vertigo_dizziness", label: "Vertigo/Dizziness" },
    { key: "migraine", label: "Migraine/Severe Headaches" },
    { key: "epilepsy", label: "Epilepsy/Seizure/Convulsion" },
    { key: "panic_anxiety", label: "Panic/Anxiety Attacks" },
    { key: "hyperacidity_gerd", label: "Hyperacidity/GERD" },
    { key: "heart_disease", label: "Heart Disease" },
    { key: "kidney_disease", label: "Kidney Disease" },
    { key: "asthma", label: "Asthma" },
    { key: "sexually_transmitted_illness", label: "Sexually Transmitted Illness" },
    { key: "congenital_heart_disease", label: "Congenital Heart Disease" },
    {
      key: "immunocompromised",
      label: "Immunocompromised (ex. Cancer, Lupus, HIV, etc)",
      hasSpecify: true,
      specifyKey: "immunocompromised_specify",
    },
    {
      key: "musculoskeletal_injury",
      label: "Musculo-Skeletal Injury",
      hasSpecify: true,
      specifyKey: "musculoskeletal_injury_specify",
    },
    { key: "mumps", label: "Mumps" },
    { key: "chickenpox", label: "Chickenpox" },
    { key: "hepatitis", label: "Hepatitis" },
    { key: "scoliosis", label: "Scoliosis" },
    { key: "diabetes_mellitus", label: "Diabetes Mellitus" },
    { key: "head_injury", label: "Head Injury" },
    { key: "visual_defect", label: "Visual Defect", hasSpecify: true, specifyKey: "visual_defect_specify" },
    { key: "hearing_defect", label: "Hearing Defect", hasSpecify: true, specifyKey: "hearing_defect_specify" },
    { key: "tuberculosis", label: "Tuberculosis" },
    { key: "hypertension", label: "Hypertension" },
    { key: "g6pd", label: "G6PD" },
    { key: "rheumatic_heart_disease", label: "Rheumatic Heart Disease" },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)
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
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const fetchMedicalHistory = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      
      const response = await axios.get(`http://localhost:8000/api/medical-history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
           
      if (response.data.success && response.data.data) {
        setMedicalHistory(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching medical history:", err)
      if (err.response?.status !== 404) {
        console.error("Medical history fetch error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        })
      }
    }
  }

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No auth token found")

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
          setRecords([])
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
    } else if (activeTab === "medicalHistory") {
      fetchMedicalHistory()
    }
  }, [activeTab, id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleMedicalHistoryChange = (field, value) => {
    console.log("Medical history field changed:", field, value)
    setMedicalHistory((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveMedicalHistory = async () => {
    setSavingMedicalHistory(true)
    
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        alert("Authentication token not found. Please login again.")
        return
      }

      console.log("Saving medical history for user:", id)
      console.log("Medical history data before save:", medicalHistory)

      // Prepare payload with proper data types
      const payload = {
        // Convert all boolean fields explicitly
        is_pwd: Boolean(medicalHistory.is_pwd),
        pwd_disability: medicalHistory.pwd_disability || "",
        anemia: Boolean(medicalHistory.anemia),
        bleeding_disorders: Boolean(medicalHistory.bleeding_disorders),
        vertigo_dizziness: Boolean(medicalHistory.vertigo_dizziness),
        migraine: Boolean(medicalHistory.migraine),
        epilepsy: Boolean(medicalHistory.epilepsy),
        panic_anxiety: Boolean(medicalHistory.panic_anxiety),
        hyperacidity_gerd: Boolean(medicalHistory.hyperacidity_gerd),
        heart_disease: Boolean(medicalHistory.heart_disease),
        kidney_disease: Boolean(medicalHistory.kidney_disease),
        asthma: Boolean(medicalHistory.asthma),
        sexually_transmitted_illness: Boolean(medicalHistory.sexually_transmitted_illness),
        congenital_heart_disease: Boolean(medicalHistory.congenital_heart_disease),
        immunocompromised: Boolean(medicalHistory.immunocompromised),
        immunocompromised_specify: medicalHistory.immunocompromised_specify || "",
        musculoskeletal_injury: Boolean(medicalHistory.musculoskeletal_injury),
        musculoskeletal_injury_specify: medicalHistory.musculoskeletal_injury_specify || "",
        mumps: Boolean(medicalHistory.mumps),
        chickenpox: Boolean(medicalHistory.chickenpox),
        hepatitis: Boolean(medicalHistory.hepatitis),
        scoliosis: Boolean(medicalHistory.scoliosis),
        diabetes_mellitus: Boolean(medicalHistory.diabetes_mellitus),
        head_injury: Boolean(medicalHistory.head_injury),
        visual_defect: Boolean(medicalHistory.visual_defect),
        visual_defect_specify: medicalHistory.visual_defect_specify || "",
        hearing_defect: Boolean(medicalHistory.hearing_defect),
        hearing_defect_specify: medicalHistory.hearing_defect_specify || "",
        tuberculosis: Boolean(medicalHistory.tuberculosis),
        hypertension: Boolean(medicalHistory.hypertension),
        g6pd: Boolean(medicalHistory.g6pd),
        rheumatic_heart_disease: Boolean(medicalHistory.rheumatic_heart_disease),
        allergies_specify: medicalHistory.allergies_specify || "",
      }

      console.log("Payload being sent:", payload)

      // Use the correct API endpoint with user_id in the URL
      const response = await axios.post(`http://localhost:8000/api/medical-history/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log("Save response:", response.data)

      if (response.data.success) {
        setIsEditingMedicalHistory(false)
        alert("Medical history saved successfully!")
        // Refresh the medical history data
        fetchMedicalHistory()
      } else {
        throw new Error(response.data.message || "Failed to save medical history")
      }

    } catch (err) {
      console.error("Error saving medical history:", err)
      
      let errorMessage = "Failed to save medical history. Please try again."
      
      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        })
        
        if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please login again."
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to perform this action."
        } else if (err.response.status === 422) {
          const validationErrors = err.response.data.errors
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat()
            errorMessage = `Validation errors: ${errorMessages.join(", ")}`
          } else {
            errorMessage = err.response.data.message || "Validation failed"
          }
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      alert(errorMessage)
    } finally {
      setSavingMedicalHistory(false)
    }
  }

  const handleCancelMedicalHistory = () => {
    setIsEditingMedicalHistory(false)
    fetchMedicalHistory() // Reload original data
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("auth_token")
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

      const response = await axios.post("http://localhost:8000/api/medical-records", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      alert("Medical record saved successfully!")
      setShowModal(false)
      setFormData({
        date: "",
        physician_nurse: "",
        reason: "",
        temperature: "",
        bloodPressure: "",
        allergies: "",
        medicines: [],
      })
      fetchMedicalRecords()
    } catch (error) {
      console.error("Full error object:", error)
      let errorMessage = "Unknown error occurred"

      if (error.response?.data?.errors) {
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
  }

  const handleDeleteRecord = async (record, index) => {
    if (!confirm("Are you sure you want to delete this medical record?")) {
      return
    }

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

      const response = await axios.delete(`http://localhost:8000/api/medical-records/${record.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      setRecords((prev) => prev.filter((_, i) => i !== index))
      alert("Medical record deleted successfully!")
    } catch (error) {
      console.error("Error deleting record:", error)
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

  const getActiveConditions = () => {
    return medicalConditions.filter((condition) => medicalHistory[condition.key])
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-blue-700">
        <Loader2 className="animate-spin text-4xl mb-4" />
        <p className="text-lg">Loading user data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-center py-10">Error: {error}</div>
  }

  if (!userData) {
    return <div className="text-center text-gray-600 py-10">No user data found.</div>
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-800">Personal Information</h2>
              {personalInfoFields.map((key) => (
                <div key={key} className="mb-4">
                  <label className="block font-medium mb-1 capitalize text-gray-700">{key.replace(/_/g, " ")}</label>
                  <div className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-800 shadow-sm">
                    {capitalizeWords(userData[key] || "N/A")}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-800">Address And Contacts</h2>
              {addressFields.map((key) => (
                <div key={key} className="mb-4">
                  <label className="block font-medium mb-1 capitalize text-gray-700">{key.replace(/_/g, " ")}</label>
                  <div className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-800 shadow-sm">
                    {userData[key] || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "medicalHistory":
        return (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold ml-3 text-blue-800">Medical History</h2>
              </div>
              <div className="flex gap-2">
                {!isEditingMedicalHistory ? (
                  <button
                    onClick={() => setIsEditingMedicalHistory(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Medical History
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancelMedicalHistory}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMedicalHistory}
                      disabled={savingMedicalHistory}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 text-sm"
                    >
                      {savingMedicalHistory ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {!isEditingMedicalHistory ? (
              // View Mode
              <div className="space-y-6">
                {/* PWD Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Person with Disability (PWD) Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1">PWD Status</label>
                      <div
                        className={`p-4 rounded-lg text-base ${
                          medicalHistory.is_pwd
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <span className={`font-medium ${medicalHistory.is_pwd ? "text-orange-700" : "text-gray-700"}`}>
                          {medicalHistory.is_pwd ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    {medicalHistory.is_pwd && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">
                          Disability Specification
                        </label>
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                          <span className="text-orange-700 text-base">
                            {medicalHistory.pwd_disability || "Not specified"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Medical Conditions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Active Medical Conditions</h4>
                  {getActiveConditions().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-base">No active medical conditions recorded</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getActiveConditions().map((condition) => (
                        <div key={condition.key} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="font-medium text-red-800 text-base">{condition.label}</span>
                          </div>
                          {condition.hasSpecify && medicalHistory[condition.specifyKey] && (
                            <p className="text-sm text-red-600 mt-2 ml-6">
                              <strong>Details:</strong> {medicalHistory[condition.specifyKey]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Allergies */}
                {medicalHistory.allergies_specify && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Allergies</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-base">{medicalHistory.allergies_specify}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-6">
                {/* PWD Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Person with Disability (PWD) Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Are you a Person with Disability (PWD)?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center text-base">
                          <input
                            type="radio"
                            name="is_pwd"
                            checked={medicalHistory.is_pwd === true}
                            onChange={() => handleMedicalHistoryChange("is_pwd", true)}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center text-base">
                          <input
                            type="radio"
                            name="is_pwd"
                            checked={medicalHistory.is_pwd === false}
                            onChange={() => handleMedicalHistoryChange("is_pwd", false)}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    </div>
                    {medicalHistory.is_pwd && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">Specify Disability</label>
                        <input
                          type="text"
                          value={medicalHistory.pwd_disability}
                          onChange={(e) => handleMedicalHistoryChange("pwd_disability", e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Please specify the disability"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Conditions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Medical Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalConditions.map((condition) => (
                      <div key={condition.key} className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            checked={medicalHistory[condition.key]}
                            onChange={(e) => handleMedicalHistoryChange(condition.key, e.target.checked)}
                            className="mr-3 mt-1 flex-shrink-0"
                          />
                          <span className="text-base font-medium leading-tight">{condition.label}</span>
                        </label>
                        {condition.hasSpecify && medicalHistory[condition.key] && (
                          <input
                            type="text"
                            value={medicalHistory[condition.specifyKey]}
                            onChange={(e) => handleMedicalHistoryChange(condition.specifyKey, e.target.value)}
                            className="w-full mt-2 px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Please specify..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Allergies. Specify.</h4>
                  <textarea
                    value={medicalHistory.allergies_specify}
                    onChange={(e) => handleMedicalHistoryChange("allergies_specify", e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Please specify any allergies (food, medication, environmental, etc.)"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case "records":
        return (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold ml-3 text-blue-800">Medical Records</h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md"
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
                  <div
                    key={record.id || index}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-8 border-yellow-400"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center shadow-sm">
                          <Stethoscope className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-blue-800 text-lg">{record.reason_for_visit || "N/A"}</h3>
                          <p className="text-gray-600 text-sm">
                            {record.visit_date &&
                              new Date(record.visit_date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record, index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                          disabled={deletingRecordId === record.id}
                        >
                          {deletingRecordId === record.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                        <h4 className="font-medium text-blue-800 text-sm mb-2">Physician/Nurse</h4>
                        <p className="text-gray-900">
                          {record.physician
                            ? `${record.physician.first_name} ${record.physician.last_name}`
                            : `ID: ${record.physician_nurse_id || "N/A"}`}
                        </p>
                      </div>
                      {record.temperature && (
                        <div className="bg-red-50 rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-red-700 text-sm mb-2">Temperature</h4>
                          <p className="text-gray-900 font-semibold">{record.temperature}</p>
                        </div>
                      )}
                      {record.blood_pressure && (
                        <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-green-700 text-sm mb-2">Blood Pressure</h4>
                          <p className="text-gray-900 font-semibold">{record.blood_pressure}</p>
                        </div>
                      )}
                    </div>

                    {record.allergies && (
                      <div className="bg-orange-50 rounded-lg p-4 mb-4 shadow-sm">
                        <h4 className="font-medium text-orange-700 text-sm mb-2">Allergies</h4>
                        <p className="text-gray-900">{record.allergies}</p>
                      </div>
                    )}

                    {record.medicines && record.medicines.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
                        <h4 className="font-medium text-purple-700 text-sm mb-3">Medicines Issued</h4>
                        <div className="space-y-2">
                          {record.medicines.map((medicine, medIndex) => (
                            <div
                              key={medIndex}
                              className="flex items-center justify-between bg-white rounded-md p-2 border border-gray-100"
                            >
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

      case "dental":
        return (
          <div className="mt-4 text-blue-800 p-6 bg-white rounded-lg shadow-md border-l-4 border-yellow-400">
            <h3 className="text-xl font-semibold mb-4">Dental Records</h3>
            <p className="text-gray-600">Dental records functionality will be implemented here.</p>
          </div>
        )

      default:
        return (
          <div className="mt-4 text-blue-800 p-6 bg-white rounded-lg shadow-md border-l-4 border-yellow-400">
            <h3 className="text-xl font-semibold mb-4">Content</h3>
            <p className="text-gray-600">Content goes here...</p>
          </div>
        )
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto shadow-xl rounded-2xl overflow-hidden border-t-4 border-yellow-400 bg-white">
        <div className="space-y-1 bg-blue-800 text-white p-6 pb-8 border-b-2 border-yellow-400">
          <h1 className="text-3xl font-bold text-center text-yellow-400">User Profile</h1>
          <p className="text-center text-blue-200">
            Detailed information and medical records for {userData.first_name} {userData.last_name}
          </p>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="h-24 w-24 border-4 border-yellow-400 shadow-md flex-shrink-0 rounded-full flex items-center justify-center bg-yellow-400 text-blue-800 text-4xl font-bold">
              {userData.first_name?.[0] || ""}
              {userData.last_name?.[0] || ""}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-800">
                {userData.salutation} {userData.first_name} {userData.middle_name} {userData.last_name}
              </h2>
              <p className="text-gray-700 mt-1">
                Course: <span className="font-semibold">{userData.course || "N/A"}</span>
              </p>
              <p className="text-gray-700">
                ID number:{" "}
                <span className="font-semibold">{userData.student_number || userData.employee_id || "N/A"}</span>
              </p>
              <p className="text-gray-700">
                Official email: <span className="font-semibold">{userData.email || "N/A"}</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-2 mt-6 border-b border-gray-200 overflow-x-auto pb-2">
            {[
              ["basic", "Basic Information"],
              ["medicalHistory", "Medical History"],
              ["records", "Medical Records"],
              ["dental", "Dental Records"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm border-b-4 transition-all duration-200 whitespace-nowrap rounded-none flex items-center gap-2
                  ${
                    activeTab === key
                      ? "border-yellow-400 text-blue-800 font-bold bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-blue-800 hover:bg-gray-100"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default UserDetail
