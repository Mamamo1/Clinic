import React, { useEffect, useState } from 'react';
import { FaUserGraduate, FaUserMd, FaFileMedical } from 'react-icons/fa';
import axios from 'axios';

export const AdminDashboard = () => {
  const [firstName, setFirstName] = useState(() => localStorage.getItem('first_name'));
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInventory: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');

    // Fetch user count
    axios.get('http://localhost:8000/api/users', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    .then(response => {
      const users = response.data.data || [];
      setStats(prev => ({ ...prev, totalUsers: users.length }));
    })
    .catch(error => {
      console.error('Failed to fetch users:', error);
    });

    // Fetch inventory count
    axios.get('http://localhost:8000/api/inventory', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    .then(response => {
      const inventory = response.data.data || [];
      const lowStockCount = inventory.filter(item => item.quantity <= item.threshold).length;
      setStats(prev => ({
        ...prev,
        totalInventory: inventory.length,
        lowStock: lowStockCount,
      }));
    })
    .catch(error => {
      console.error('Failed to fetch inventory:', error);
    });
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-2xl font-semibold text-nu-blue">Welcome, Dr. {firstName}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Total Users */}
        <div className="bg-nu-blue text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-8 border-nu-gold hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm">Total Users</div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
          <FaUserGraduate size={32} className="text-nu-gold" />
        </div>

        {/* Medical Records */}
        <div className="bg-nu-blue text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-8 border-nu-gold hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm">Medical Records</div>
            <div className="text-2xl font-bold">3,434</div> {/* Static placeholder */}
          </div>
          <FaFileMedical size={32} className="text-nu-gold" />
        </div>

        {/* Inventory */}
        <div className="bg-nu-blue text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-8 border-nu-gold hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm">Inventory</div>
            <div className="text-2xl font-bold">{stats.totalInventory}</div>
          </div>
          <FaFileMedical size={32} className="text-nu-gold" />
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-nu-blue text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-8 border-nu-gold hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm">Low Stock Alerts</div>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </div>
          <FaFileMedical size={32} className="text-nu-gold" />
        </div>

        {/* Medical Staff */}
        <div className="bg-nu-blue text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-8 border-nu-gold hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm">Medical Staff</div>
            <div className="text-2xl font-bold">5</div> {/* Replace with dynamic if needed */}
          </div>
          <FaUserMd size={32} className="text-nu-gold" />
        </div>
      </div>

      {/* Placeholder Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-nu-blue">Monthly Health Trends</h3>
          <div className="border rounded p-4 h-40 flex items-center justify-center text-gray-400 bg-white">
            [ Chart Placeholder ]
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-nu-blue">Inventory Status</h3>
          <div className="border rounded p-4 h-40 flex items-center justify-center text-gray-400 bg-white">
            [ Inventory Table Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
};
