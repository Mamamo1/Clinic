import React, { useState } from 'react';
import axios from 'axios';

const EditInventoryModal = ({ item, onClose, onSaved, showNotification }) => {
  const [form, setForm] = useState({
    generic: item.generic || '',
    brand_name: item.brand_name || '',
    dosage: item.dosage || '',
    name: item.name || '',
    quantity: item.quantity || '',
    threshold: item.threshold || '',
  });

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/api/inventory/${item.id}`, {
        ...item,
        ...form,
      });
      onSaved();
      showNotification("Edited Successfully");
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Edit {item.category}</h2>

        {item.category === 'Medicine' ? (
          <>
            <label className="block text-sm font-semibold text-blue-800 mb-1">Generic Name</label>
            <input
              className="w-full p-2 border rounded mb-3"
              value={form.generic}
              onChange={(e) => setForm({ ...form, generic: e.target.value })}
            />

            <label className="block text-sm font-semibold text-blue-800 mb-1">Brand Name</label>
            <input
              className="w-full p-2 border rounded mb-3"
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
            />

            <label className="block text-sm font-semibold text-blue-800 mb-1">Dosage</label>
            <input
              className="w-full p-2 border rounded mb-3"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            />
          </>
        ) : (
          <>
            <label className="block text-sm font-semibold text-blue-800 mb-1">Supply Name</label>
            <input
              className="w-full p-2 border rounded mb-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </>
        )}

        <label className="block text-sm font-semibold text-blue-800 mb-1">Quantity</label>
        <input
          type="number"
          min="0"
          className="w-full p-2 border rounded mb-3"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />

        <label className="block text-sm font-semibold text-blue-800 mb-1">Threshold</label>
        <input
          type="number"
          min="0"
          className="w-full p-2 border rounded mb-5"
          value={form.threshold}
          onChange={(e) => setForm({ ...form, threshold: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryModal;
