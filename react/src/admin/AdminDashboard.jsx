import React, { useEffect, useState } from 'react';
import {
  FaUserGraduate,
  FaUserMd,
  FaFileMedical,
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './adminNavbar';
import AdminSidebar from './adminSidebar';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [firstName] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInventory: 0,
    lowStock: 0,
  });

  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navbar */}
      <AdminNavbar />

      {/* Sidebar + Main content wrapper */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 ml-64 bg-white">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold">Welcome, Dr. {firstName}</div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div className="cursor-pointer">&#9660;</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-800 text-white p-4 rounded shadow-md flex items-center justify-between">
              <div>
                <div className="text-sm">Total Students</div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </div>
              <FaUserGraduate size={32} />
            </div>
            <div className="bg-blue-800 text-white p-4 rounded shadow-md flex items-center justify-between">
              <div>
                <div className="text-sm">Health Records</div>
                <div className="text-2xl font-bold">3,434</div>
              </div>
              <FaFileMedical size={32} />
            </div>
            <div className="bg-blue-800 text-white p-4 rounded shadow-md flex items-center justify-between">
              <div>
                <div className="text-sm">Medical Staff</div>
                <div className="text-2xl font-bold">5</div>
              </div>
              <FaUserMd size={32} />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Monthly Health Trends</h3>
              <div className="border rounded p-4 h-40 flex items-center justify-center text-gray-400">
                [ Chart Placeholder ]
              </div>
              <div className="flex justify-end mt-2 gap-4 text-sm">
                <span className="underline cursor-pointer">Monthly</span>
                <span className="cursor-pointer">Weekly</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Inventory Status</h3>
              <div className="border rounded p-4 h-40 flex items-center justify-center text-gray-400">
                [ Inventory Table Placeholder ]
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
