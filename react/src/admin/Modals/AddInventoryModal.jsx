import React from 'react';

const AddInventoryModal = ({ isOpen, onClose, form, setForm, activeTab, onSave }) => {
  if (!isOpen) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">Add {activeTab}</h3>

        {activeTab === 'Medicine' ? (
          <>
            <input
              type="text"
              name="generic"
              placeholder="Generic Name"
              value={form.generic || ''}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="brand_name"
              placeholder="Brand Name"
              value={form.brand_name || ''}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="dosage"
              placeholder="Dosage"
              value={form.dosage || ''}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
          </>
        ) : (
          <input
            type="text"
            name="name"
            placeholder="Supply Name"
            value={form.name || ''}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
        )}

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity || ''}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        />

        <input
          type="number"
          name="threshold"
          placeholder="Threshold"
          value={form.threshold || ''}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal;
