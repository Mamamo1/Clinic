import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const firstName = localStorage.getItem('first_name');

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('account_type');
      localStorage.removeItem('first_name');

      // Redirect to login page
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Optionally handle UI error here
    }
  };

  return (
    <nav className="bg-[#35408E] p-4 text-white flex justify-between items-center shadow">
      <div className="text-lg font-bold">NU-CARES</div>
      <div className="flex items-center gap-4">
        <span className="text-sm">Welcome, {firstName}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
