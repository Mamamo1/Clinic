import React from 'react';

const AddInventoryModal = ({ activeTab, form, setForm, onSave, onClose }) => {
  const isFormValid = () => {
    if (activeTab === 'Medicine') {
      return form.generic && form.brand_name && form.dosage && form.quantity && form.threshold;
    }
    return form.name && form.quantity && form.threshold;
  };

  const handleSave = () => {
    if (!isFormValid()) {
      alert('Please fill in all fields before submitting.');
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add {activeTab}</h2>

        <form className="space-y-4">
          {activeTab === 'Medicine' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                <input
                  autoComplete="off"
                  className="border rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.generic}
                  onChange={(e) => setForm({ ...form, generic: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                <input
                  autoComplete="off"
                  className="border rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.brand_name}
                  onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  autoComplete="off"
                  className="border rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supply Name</label>
              <input
                autoComplete="off"
                className="border rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              autoComplete="off"
              type="number"
              min="0"
              className="border rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
            <input
              autoComplete="off"
              type="number"
              min="0"
              className="border rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
