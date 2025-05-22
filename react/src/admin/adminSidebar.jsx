import React from 'react';
import {
  FaCog,
  FaUserShield,
  FaClipboardList,
  FaCubes,
  FaChartBar,
  FaBell,
  FaFileMedical,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="w-64 h-screen fixed left-0 bg-gray-200 p-4 shadow-md flex flex-col">
      <nav className="flex-1">
        <ul className="space-y-4 text-gray-800">
          <li className="flex items-center text-blue-600 font-bold">
            <Link to="/admin" className="flex items-center w-full">
              <FaChartBar className="mr-2" /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className="flex items-center hover:text-blue-600 hover:underline">
              <FaUserShield className="mr-2" /> User Management
            </Link>
          </li>
          <li>
            <Link to="/admin/records" className="flex items-center hover:text-blue-600 hover:underline">
              <FaFileMedical className="mr-2" /> Medical Records
            </Link>
          </li>
          <li>
            <Link to="/admin/inventory" className="flex items-center hover:text-blue-600 hover:underline">
              <FaCubes className="mr-2" /> Inventory
            </Link>
          </li>
          <li>
            <Link to="/admin/reports" className="flex items-center hover:text-blue-600 hover:underline">
              <FaClipboardList className="mr-2" /> Reports
            </Link>
          </li>
          <li>
            <Link to="/admin/logs" className="flex items-center hover:text-blue-600 hover:underline">
              <FaBell className="mr-2" /> Security Logs
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
