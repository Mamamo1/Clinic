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
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="w-64 h-screen fixed left-0 bg-gray-100 p-6 shadow-md flex flex-col">
      <nav className="flex-1">
        <ul className="space-y-6 text-gray-700">
          <li>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`
              }
            >
              <FaChartBar className="mr-3 text-lg" /> Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/userManagement"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`
              }
            >
              <FaUserShield className="mr-3 text-lg" /> User Management
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/ManageMedicalRecords"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`
              }
            >
              <FaFileMedical className="mr-3 text-lg" /> Manage Medical Records
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/Inventory"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`
              }
            >
              <FaCubes className="mr-3 text-lg" /> Inventory
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`
              }
            >
              <FaClipboardList className="mr-3 text-lg" /> Reports
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/logs"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`
              }
            >
              <FaBell className="mr-3 text-lg" /> Security Logs
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
