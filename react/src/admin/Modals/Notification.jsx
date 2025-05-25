import React from 'react';

const Notification = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
      {message}
      {onClose && (
        <button
          className="ml-4 font-bold"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Notification;
