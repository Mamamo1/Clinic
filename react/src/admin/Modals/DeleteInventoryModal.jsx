import React from 'react';
import axios from 'axios';

const DeleteInventoryModal = ({ item, onClose, onDeleted, showNotification }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/inventory/${item.id}`);
      onDeleted();
      showNotification("Deleted Successfully"); // Refresh inventory
      onClose();   // Close modal
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete this item?</p>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInventoryModal;
