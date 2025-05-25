import React from 'react';

const EditInventoryModal = ({ isOpen, onClose, current, form, setForm, onSave }) => {
  if (!isOpen || !current) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">Edit Quantity</h3>

        <p className="mb-2 text-sm text-gray-600">
          {current.category === 'Medicine'
            ? `${current.generic} (${current.brand_name}) - ${current.dosage}`
            : current.name}
        </p>

        <input
          type="number"
          name="quantity"
          placeholder="New Quantity"
          value={form.quantity || ''}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onSave}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryModal;
