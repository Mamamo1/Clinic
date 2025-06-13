"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function AddMedicalRecordsModal({ formData, onChange, onSave, onCancel }) {
  const [staff, setStaff] = useState([])
  const [inventory, setInventory] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token")

        if (!token) {
          console.error("No token found")
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        }

        const [usersRes, inventoryRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users", { headers }),
          axios.get("http://localhost:8000/api/inventory", { headers }),
        ])

        const usersList = usersRes.data?.data || usersRes.data
        const filteredStaff = usersList
          .filter((user) => user.account_type === "Doctor" || user.account_type === "Nurse")
          .map((user) => ({
            ...user,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
          }))

        const inventoryList = inventoryRes.data?.data || inventoryRes.data
        const medicineOnly = inventoryList.filter((item) => item.category === "Medicine")

        setStaff(filteredStaff)
        setInventory(medicineOnly)
      } catch (error) {
        if (error.response) {
          console.error("API Error:", error.response.status, error.response.data)
        } else {
          console.error("Fetch error:", error.message)
        }
      }
    }

    fetchData()
  }, [])

  const handleCheckboxChange = (e) => {
    onChange({
      target: {
        name: e.target.name,
        value: e.target.checked,
      },
    })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#2E3192] to-[#3d42a8] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Add Medical Record</h2>
              <p className="text-blue-100 text-sm">National University Health Services</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#2E3192] mb-4 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date || ""} 
                  onChange={onChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Physician/Nurse</label>
                <select 
                  name="physician_nurse" 
                  value={formData.physician_nurse || ""} 
                  onChange={onChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Physician or Nurse</option>
                  {staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name} ({person.account_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#2E3192] mb-4 border-b border-gray-200 pb-2">
              Chief Complaint
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit / Chief Complaint</label>
              <textarea 
                name="reason" 
                value={formData.reason || ""} 
                onChange={onChange} 
                rows="4"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Please describe the reason for this visit..."
              />
            </div>
          </div>

          {/* Vital Signs Toggle */}
          <div className="mb-6">
            <label className="inline-flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                name="includeVitals" 
                checked={!!formData.includeVitals} 
                onChange={handleCheckboxChange} 
                className="w-5 h-5 text-[#2E3192] border-gray-300 rounded focus:ring-[#2E3192] focus:ring-2" 
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Include Vital Signs</span>
            </label>
          </div>

          {/* Vital Signs Section */}
          {formData.includeVitals && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#2E3192] mb-4">Vital Signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['temperature', 'bloodPressure', 'pulseRate', 'respiratoryRate'].map((vital) => (
                  <div key={vital}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {vital.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input 
                      type="text" 
                      name={vital} 
                      value={formData[vital] || ""} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200"
                      placeholder={`Enter ${vital.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (if any)</label>
                  <select 
                    name="allergies" 
                    value={formData.allergies || ""} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                {formData.allergies === "Yes" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergy Note</label>
                    <textarea 
                      name="allergyNote" 
                      value={formData.allergyNote || ""} 
                      onChange={onChange} 
                      rows="3"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Please specify allergies and reactions..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medicines Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#2E3192] mb-4 border-b border-gray-200 pb-2">
              Medicines Issued
            </h3>
            <div className="space-y-3">
              {formData.medicines?.map((med, index) => (
                <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-grow">
                    <select
                      value={med.id}
                      onChange={(e) => {
                        const newMeds = [...formData.medicines];
                        newMeds[index].id = e.target.value;
                        onChange({ target: { name: "medicines", value: newMeds } });
                      }}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Medicine</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.generic} {item.brand_name} {item.dosage}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent transition-all duration-200 text-center"
                      value={med.quantity}
                      onChange={(e) => {
                        const newMeds = [...formData.medicines];
                        newMeds[index].quantity = parseInt(e.target.value) || 1;
                        onChange({ target: { name: "medicines", value: newMeds } });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={() => {
                      const newMeds = formData.medicines.filter((_, i) => i !== index);
                      onChange({ target: { name: "medicines", value: newMeds } });
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  target: {
                    name: "medicines",
                    value: [...(formData.medicines || []), { id: "", quantity: 1 }],
                  },
                })
              }
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#252b7a] focus:outline-none focus:ring-2 focus:ring-[#2E3192] focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Medicine
            </button>
          </div>
        </div>

        {/* Footer Section - Fixed positioning */}
        <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-200 shadow-lg">
          <div className="flex justify-end space-x-4">
            <button 
              onClick={onCancel} 
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium text-base"
            >
              Cancel
            </button>
            <button 
              onClick={onSave} 
              className="px-8 py-3 bg-[#2E3192] text-white rounded-lg hover:bg-[#252b7a] focus:outline-none focus:ring-2 focus:ring-[#2E3192] focus:ring-offset-2 transition-all duration-200 font-medium text-base shadow-md"
            >
              Save Medical Record
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}