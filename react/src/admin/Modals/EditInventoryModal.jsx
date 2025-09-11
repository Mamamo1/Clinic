import { useState } from "react"
import axios from "axios"

const EditInventoryModal = ({ item, onClose, onSaved, showNotification }) => {
  const [form, setForm] = useState({
    generic: item.generic || "",
    brand_name: item.brand_name || "",
    dosage: item.dosage || "",
    name: item.name || "",
    quantity: item.quantity || "",
    threshold: item.threshold || "",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const isFormValid = () => {
    if (item.category === "Medicine") {
      return form.generic && form.brand_name && form.dosage && form.quantity && form.threshold
    }
    return form.name && form.quantity && form.threshold
  }

  const handleUpdate = async () => {
    if (!isFormValid()) {
      showNotification("Please fill in all required fields")
      return
    }

    try {
      setIsUpdating(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        showNotification("Authentication required")
        return
      }

      await axios.put(`http://localhost:8000/api/inventory/${item.id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      showNotification("Updated Successfully")
      onSaved()
      onClose()
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message)
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update item"
      showNotification(`Update failed: ${errorMessage}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="bg-[#2E3192] text-white px-6 py-4 rounded-t-lg relative">
          <h2 className="text-xl font-bold">Edit {item.category}</h2>
          <button
            className="absolute top-3 right-4 text-white hover:text-[#ffc72c] text-2xl transition-colors duration-200"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[#ffc72c] bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-[#ffc72c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#2E3192]">Edit {item.category}</p>
              <p className="text-gray-600">Update the details below</p>
            </div>
          </div>

          <form className="space-y-4">
            {item.category === "Medicine" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#2E3192] mb-2">Generic Name</label>
                  <input
                    className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                    value={form.generic}
                    onChange={(e) => setForm({ ...form, generic: e.target.value })}
                    placeholder="Enter generic name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2E3192] mb-2">Brand Name</label>
                  <input
                    className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                    value={form.brand_name}
                    onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2E3192] mb-2">Dosage</label>
                  <input
                    className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-[#2E3192] mb-2">Supply Name</label>
                <input
                  className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter supply name"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2E3192] mb-2">Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2E3192] mb-2">Threshold</label>
                <input
                  type="number"
                  min="0"
                  className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Current vs New Values */}
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#ffc72c]">
              <h4 className="font-semibold text-[#2E3192] mb-2">Current Values:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {item.category === "Medicine" ? (
                  <>
                    <p>
                      <span className="font-medium">Generic:</span> {item.generic}
                    </p>
                    <p>
                      <span className="font-medium">Brand:</span> {item.brand_name}
                    </p>
                    <p>
                      <span className="font-medium">Dosage:</span> {item.dosage}
                    </p>
                  </>
                ) : (
                  <p>
                    <span className="font-medium">Name:</span> {item.name}
                  </p>
                )}
                <p>
                  <span className="font-medium">Quantity:</span> {item.quantity}
                </p>
                <p>
                  <span className="font-medium">Threshold:</span> {item.threshold}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating || !isFormValid()}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium min-w-[100px] ${
                  isUpdating || !isFormValid()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#2E3192] hover:bg-[#003875] text-white"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </span>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditInventoryModal
