import React from 'react';

const DeleteInventoryModal = ({ isOpen, onClose, current, onDelete }) => {
  if (!isOpen || !current) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>

        <p className="mb-4">
          Are you sure you want to delete{' '}
          <strong>
            {current.category === 'Medicine'
              ? `${current.generic} (${current.brand_name}) - ${current.dosage}`
              : current.name}
          </strong>
          ?
        </p>

        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInventoryModal;
