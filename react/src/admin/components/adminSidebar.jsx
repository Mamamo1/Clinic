import {
  FaUserShield,
  FaClipboardList,
  FaCubes,
  FaChartBar,
  FaBell,
  FaFileMedical,
  FaCalendarAlt,
} from "react-icons/fa"
import { NavLink } from "react-router-dom"

const AdminSidebar = ({ userType = "Admin", baseRoute = "/admin" }) => {
  // get role from localStorage (saved during login)
  const accountType = localStorage.getItem("account_type")
  // values: "super_admin", "doctor", "nurse", "dentist"

  return (
    <div className="w-64 h-screen fixed left-0 bg-gradient-to-br from-blue-800 to-blue-900 text-white p-6 shadow-xl flex flex-col border-r-4 border-yellow-400">
      <div className="mb-8 text-center"></div>
      <nav className="flex-1">
        <ul className="space-y-4">
          {/* Dashboard */}
          <li>
            <NavLink
              to={baseRoute}
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-yellow-500 text-blue-900 shadow-md"
                    : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                }`
              }
            >
              <FaChartBar className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
              Dashboard
            </NavLink>
          </li>

          {/* User Management - ONLY for Super Admin and only in admin routes */}
          {accountType === "SuperAdmin" && baseRoute === "/admin" && (
            <li>
              <NavLink
                to={`${baseRoute}/userManagement`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-yellow-500 text-blue-900 shadow-md"
                      : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                  }`
                }
              >
                <FaUserShield className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
                User Management
              </NavLink>
            </li>
          )}

          {/* Appointments */}
          <li>
            <NavLink
              to={`${baseRoute}/appointments`}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-yellow-500 text-blue-900 shadow-md"
                    : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                }`
              }
            >
              <FaCalendarAlt className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
              Appointments
            </NavLink>
          </li>

          {/* Medical Records */}
          <li>
            <NavLink
              to={`${baseRoute}/ManageMedicalRecords`}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-yellow-500 text-blue-900 shadow-md"
                    : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                }`
              }
            >
              <FaFileMedical className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
              Manage Medical Records
            </NavLink>
          </li>

          {/* Inventory */}
          <li>
            <NavLink
              to={`${baseRoute}/Inventory`}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-yellow-500 text-blue-900 shadow-md"
                    : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                }`
              }
            >
              <FaCubes className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
              Inventory
            </NavLink>
          </li>

          {/* Reports */}
          <li>
            <NavLink
              to={`${baseRoute}/reports`}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-yellow-500 text-blue-900 shadow-md"
                    : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                }`
              }
            >
              <FaClipboardList className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
              Reports
            </NavLink>
          </li>

          {/* Security Logs - ONLY for Super Admin and only in admin routes */}
          {accountType === "SuperAdmin" && baseRoute === "/admin" && (
            <li>
              <NavLink
                to={`${baseRoute}/logs`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-yellow-500 text-blue-900 shadow-md"
                      : "hover:bg-blue-700 hover:text-yellow-300 text-blue-200"
                  }`
                }
              >
                <FaBell className="mr-3 text-lg group-hover:text-yellow-400 transition-colors" />
                Security Logs
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="mt-auto pt-6 border-t border-blue-700 text-center">
        <p className="text-blue-400 text-xs">© 2025 NU-CARES {userType}</p>
      </div>
    </div>
  )
}

export default AdminSidebar
