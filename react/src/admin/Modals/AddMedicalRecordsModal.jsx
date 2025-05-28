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

        // Get both users and inventory in parallel
        const [usersRes, inventoryRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users", { headers }),
          axios.get("http://localhost:8000/api/inventory", { headers }),
        ])

        // Filter users to get only medical staff and add full_name
        const usersList = usersRes.data?.data || usersRes.data
        const filteredStaff = usersList
          .filter((user) => user.account_type === "Doctor" || user.account_type === "Nurse")
          .map((user) => ({
            ...user,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
          }))

        // Filter inventory to only include Medicine
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

  // Helper to handle checkbox change event properly
  const handleCheckboxChange = (e) => {
    onChange({
      target: {
        name: e.target.name,
        value: e.target.checked,
      },
    })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#00205b]">Add Medical Record</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="mb-4">
            <label className="block mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date || ""}
              onChange={onChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Physician/Nurse */}
          <div className="mb-4">
            <label className="block mb-1">Physician/Nurse</label>
            <select
              name="physician_nurse"
              value={formData.physician_nurse || ""}
              onChange={onChange}
              className="border p-2 rounded w-full"
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

        {/* Reason for Visit */}
        <div className="mb-4">
          <label className="block mb-1">Reason for Visit / Chief Complaint</label>
          <textarea
            name="reason"
            value={formData.reason || ""}
            onChange={onChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Include Vitals Checkbox */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="includeVitals"
              checked={!!formData.includeVitals}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Include Vital Signs
          </label>
        </div>

        {/* Vitals Section */}
        {formData.includeVitals && (
          <div className="mb-4 border p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Temperature</label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.temperature || ""}
                  onChange={onChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Blood Pressure</label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure || ""}
                  onChange={onChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Pulse Rate</label>
                <input
                  type="text"
                  name="pulseRate"
                  value={formData.pulseRate || ""}
                  onChange={onChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Respiratory Rate</label>
                <input
                  type="text"
                  name="respiratoryRate"
                  value={formData.respiratoryRate || ""}
                  onChange={onChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="block mb-1">Allergies (if any)</label>
                <select
                  name="allergies"
                  value={formData.allergies || ""}
                  onChange={onChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* Allergy Note */}
              {formData.allergies === "Yes" && (
                <div className="md:col-span-2">
                  <label className="block mb-1">Allergy Note</label>
                  <textarea
                    name="allergyNote"
                    value={formData.allergyNote || ""}
                    onChange={onChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicine Issued */}
        <div className="mb-6">
          <label className="block mb-1">Medicine Issued</label>
          <select
            name="medicine_issued"
            value={formData.medicine_issued || ""}
            onChange={onChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Medicine</option>
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.generic ? `${item.generic} ${item.brand_name} ${item.dosage}` : item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
