import React from 'react';
import { User as UserIcon } from 'lucide-react';
import axios from 'axios'; // Make sure axios is imported
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const authToken = localStorage.getItem('auth_token');

    if (authToken) {
      axios
        .post('http://localhost:8000/api/logout', {}, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then(() => {
          // Clear the auth token and account type from localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('account_type');
          navigate('/login');
        })
        .catch((error) => {
          // Handle the error if the API request fails
          console.error('Logout error:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('account_type');
          navigate('/login');
        });
    } else {
      // Handle case where there is no token (if this ever happens)
      navigate('/login');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="px-8 py-4">
        <button
          onClick={handleLogout}
          className="text-red-600 text-lg font-semibold flex items-center"
        >
          <UserIcon className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>
      {/* Your Admin Dashboard content goes here */}
    </div>
  );
};
