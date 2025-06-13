"use client"

import { useState } from "react"
import axios from "axios"

const DeleteInventoryModal = ({ item, onClose, onDeleted, showNotification }) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setDeleting(true)

      // Get the auth token
      const token = localStorage.getItem("auth_token")

      if (!token) {
        showNotification("Authentication required")
        return
      }

      await axios.delete(`http://localhost:8000/api/inventory/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      showNotification("Deleted Successfully")
      onDeleted() // Refresh inventory
      onClose() // Close modal
    } catch (err) {
      console.error("Delete failed:", err)
      console.error("Error response:", err.response)
      console.error("Error response data:", err.response?.data)

      // Show specific error message
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete item"
      showNotification(`Delete failed: ${errorMessage}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div className="bg-white rounded-2xl shadow-2xl w-[550px] max-w-[90%] mx-4">
    {/* Header */}
    <div className="bg-[#2E3192] text-white px-8 py-5 rounded-t-2xl">
      <h2 className="text-2xl font-bold tracking-wide">⚠️ Confirm Deletion</h2>
    </div>

    {/* Content */}
    <div className="p-8 text-base">
      <div className="flex items-start mb-6">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mr-5">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-[#2E3192] mb-1">Are you sure you want to delete this?</p>
          <p className="text-gray-600">This action is permanent and cannot be undone.</p>
        </div>
      </div>

      {/* Item Details */}
      <div className="mb-8 p-5 bg-gray-50 rounded-lg border-l-4 border-[#ffc72c]">
        <h3 className="font-semibold text-[#2E3192] mb-3 text-lg">Item Details</h3>
        {item.category === "Medicine" ? (
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium text-[#2E3192]">Generic:</span> {item.generic}</p>
            <p><span className="font-medium text-[#2E3192]">Brand:</span> {item.brand_name}</p>
            <p><span className="font-medium text-[#2E3192]">Dosage:</span> {item.dosage}</p>
            <p><span className="font-medium text-[#2E3192]">Category:</span> {item.category}</p>
          </div>
        ) : (
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium text-[#00205b]">Name:</span> {item.name}</p>
            <p><span className="font-medium text-[#00205b]">Category:</span> {item.category}</p>
          </div>
        )}
        <p className="mt-3 text-sm"><span className="font-medium text-[#00205b]">Current Quantity:</span> <span className="font-semibold">{item.quantity}</span></p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          disabled={deleting}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-7 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px]"
          disabled={deleting}
        >
          {deleting ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Deleting...
            </span>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
</div>

  )
}

export default DeleteInventoryModal
