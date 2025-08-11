"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { capitalizeWords } from "../utils" // Corrected path based on your clarification
import { FaSpinner } from "react-icons/fa" // Import FaTimes for close icon, FaSpinner for loading
import CustomModal from "./Modals/CustomModal" // Import the new custom modal

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [activeFilter, setActiveFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true) // New loading state
  const [error, setError] = useState(null) // New error state

  const USERS_PER_PAGE = 6

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const auth_token = localStorage.getItem("auth_token")
        const response = await axios.get("http://localhost:8000/api/users", {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        })

        const usersList = response.data.data
        if (!Array.isArray(usersList)) {
          throw new Error("Users data is not an array")
        }

        const usersData = usersList.map((user) => {
          const normalizedUser = {
            ...user,
            account_type: user.account_type?.toLowerCase() || "",
            first_name: capitalizeWords(user.first_name),
            middle_name: capitalizeWords(user.middle_name || ""),
            last_name: capitalizeWords(user.last_name),
            course: capitalizeWords(user.course || ""),
            city: capitalizeWords(user.city || ""),
            state: capitalizeWords(user.state || ""),
            street: capitalizeWords(user.street || ""),
          }
          return normalizedUser
        })
        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filterGroups = {
    All: ["shs", "college", "employee", "doctor", "nurse", "dentist"], // Include staff in 'All'
    Staff: ["doctor", "nurse", "dentist"],
    SHS: ["shs"],
    College: ["college"],
    Employee: ["employee"],
  }

  // Filter by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users)
    } else {
      const lowerSearch = searchTerm.toLowerCase()
      const filtered = users.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
        return (
          fullName.includes(lowerSearch) ||
          (user.student_number && user.student_number.toLowerCase().includes(lowerSearch)) ||
          (user.employee_id && user.employee_id.toLowerCase().includes(lowerSearch))
        )
      })
      setFilteredUsers(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, users])

  // Filter by account_type (level)
  const handleFilter = (filter) => {
    setActiveFilter(filter)
    if (filter === "All") {
      setFilteredUsers(users) // 'All' means no filter applied to the original list
    } else if (filter === "Staff") {
      const filtered = users.filter((user) => filterGroups[filter].includes(user.account_type))
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users.filter((user) => user.account_type === filter.toLowerCase()))
    }
    setCurrentPage(1)
  }

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE)
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">User Management</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name or student/employee ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label="Search users"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {["All", "SHS", "College", "Employee", "Staff"].map((level) => (
          <button
            key={level}
            onClick={() => handleFilter(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm
              ${
                activeFilter === level
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
          >
            {level}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-blue-700">
          <FaSpinner className="animate-spin text-4xl mb-4" />
          <p className="text-lg">Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10">
          <p>{error}</p>
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="text-center text-gray-600 text-lg py-10">
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* User Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 border-t-4 border-yellow-400"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-blue-800 font-bold text-lg flex-shrink-0">
                    {user.first_name?.[0] || ""}
                    {user.last_name?.[0] || ""}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-blue-800">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.account_type === "employee" ||
                      user.account_type === "doctor" ||
                      user.account_type === "nurse" ||
                      user.account_type === "dentist"
                        ? "Employee ID"
                        : "Student ID"}
                      :{" "}
                      {user.account_type === "employee" ||
                      user.account_type === "doctor" ||
                      user.account_type === "nurse" ||
                      user.account_type === "dentist"
                        ? user.employee_id || "N/A"
                        : user.student_number || "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Type:</span> {capitalizeWords(user.account_type)}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Course/Dept:</span> {user.course || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Last Visit:</span> {user.last_visit || "N/A"}
                </p>
                <button
                  className="text-blue-700 mt-4 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 -ml-2"
                  onClick={() => setSelectedUser(user)}
                >
                  View Information
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
              aria-label="Previous page"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => setCurrentPage(page + 1)}
                className={`px-4 py-2 border rounded-lg font-medium
                  ${
                    currentPage === page + 1
                      ? "bg-blue-700 text-white shadow-md"
                      : "border-blue-700 text-blue-700 hover:bg-blue-100 hover:text-blue-700"
                  } transition-colors duration-200`}
                aria-label={`Page ${page + 1}`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Custom Modal for User Information */}
      <CustomModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Information">
        {selectedUser && (
          <div className="space-y-3 text-gray-800 text-base">
            <p>
              <strong>Name:</strong> {selectedUser.first_name} {selectedUser.middle_name} {selectedUser.last_name}
            </p>
            <p>
              <strong>
                {selectedUser.account_type === "employee" ||
                selectedUser.account_type === "doctor" ||
                selectedUser.account_type === "nurse" ||
                selectedUser.account_type === "dentist"
                  ? "Employee ID"
                  : "Student ID"}
                :
              </strong>{" "}
              {selectedUser.account_type === "employee" ||
              selectedUser.account_type === "doctor" ||
              selectedUser.account_type === "nurse" ||
              selectedUser.account_type === "dentist"
                ? selectedUser.employee_id
                : selectedUser.student_number}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Account Type:</strong> {capitalizeWords(selectedUser.account_type)}
            </p>
            <p>
              <strong>Course/Department:</strong> {selectedUser.course || "N/A"}
            </p>
            <p>
              <strong>Mobile:</strong> {selectedUser.mobile}
            </p>
            <p>
              <strong>Emergency Contact:</strong> {selectedUser.emergency_contact || "N/A"}
            </p>{" "}
            {/* Assuming emergency_contact field */}
            <p>
              <strong>Address:</strong> {selectedUser.street}, {selectedUser.city}, {selectedUser.state},{" "}
              {selectedUser.zipcode}
            </p>
          </div>
        )}
        <div className="mt-6 text-right">
          <button
            onClick={() => setSelectedUser(null)}
            className="px-5 py-2 bg-yellow-500 text-blue-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Close
          </button>
        </div>
      </CustomModal>
    </div>
  )
}

export default UserManagement
