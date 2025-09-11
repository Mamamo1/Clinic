import { useState } from "react"

const AddInventoryModal = ({ activeTab, form, setForm, onSave, onClose }) => {
  const [isSaving, setIsSaving] = useState(false)

  const isFormValid = () => {
    if (activeTab === "Medicine") {
      return form.generic && form.brand_name && form.dosage && form.quantity && form.threshold
    }
    return form.name && form.quantity && form.threshold
  }

  const handleSave = async () => {
    if (!isFormValid()) {
      alert("Please fill in all fields before submitting.")
      return
    }

    if (isSaving) return

    setIsSaving(true)
    try {
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="bg-[#2E3192] text-white px-6 py-4 rounded-t-lg relative">
          <h2 className="text-xl font-bold">Add {activeTab}</h2>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#2E3192]">Add New {activeTab}</p>
              <p className="text-gray-600">Fill in the details below</p>
            </div>
          </div>

          <form className="space-y-4" autoComplete="off">
            {activeTab === "Medicine" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#2E3192] mb-2">Generic Name</label>
                  <input
                    autoComplete="off"
                    className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                    value={form.generic}
                    onChange={(e) => setForm({ ...form, generic: e.target.value })}
                    placeholder="Enter generic name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2E3192] mb-2">Brand Name</label>
                  <input
                    autoComplete="off"
                    className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                    value={form.brand_name}
                    onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2E3192] mb-2">Dosage</label>
                  <input
                    autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
                  type="number"
                  min="0"
                  className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#ffc72c] focus:border-[#ffc72c] transition-colors duration-200"
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#ffc72c]">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-[#2E3192]">Note:</span> The threshold is the minimum quantity that
                triggers a low stock warning.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium disabled:opacity-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !isFormValid()}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium min-w-[100px] ${
                  isSaving || !isFormValid()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#2E3192] hover:bg-[#003875] text-white"
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddInventoryModal
