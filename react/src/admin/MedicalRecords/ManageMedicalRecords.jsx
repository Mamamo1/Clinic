"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaSpinner } from "react-icons/fa" // Import FaSpinner and FaTimes
import { capitalizeWords } from "../../utils" // Assuming utils/index.js is in the same directory or adjust path

// UserDetailModal is assumed to be an existing component
// import UserDetailModal from './UserDetail';

const ManageMedicalRecords = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null) // State for modal

  const itemsPerPage = 6

  // Define filter groups for consistency with UserManagement
  const filterGroups = {
    All: ["shs", "college", "employee", "doctor", "nurse", "dentist"],
    Staff: ["doctor", "nurse", "dentist"],
    SHS: ["shs"],
    College: ["college"],
    Employee: ["employee"],
  }

  const fetchUsers = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      navigate("/login") // Redirect to login if no token
      throw new Error("No auth token found")
    }
    const res = await fetch("http://localhost:8000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || "Failed to fetch users")
    }
    return await res.json()
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const json = await fetchUsers()
        const usersList = json.data || []

        // Normalize user data similar to UserManagement
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
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    loadUsers()
  }, [navigate])

  const filtered = users.filter((user) => {
    // Exclude SuperAdmin
    if (user.account_type === "superadmin") return false

    const matchFilter =
      filter === "All" ||
      (filter === "Staff" ? filterGroups.Staff.includes(user.account_type) : user.account_type === filter.toLowerCase())

    const fullName = `${user.first_name} ${user.middle_name ?? ""} ${user.last_name}`.toLowerCase()
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      user.student_number?.toLowerCase().includes(search.toLowerCase()) ||
      "" ||
      user.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      ""

    return matchFilter && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Manage Medical Records</h1>

      {/* Search Input */}
      <input
        className="w-full max-w-md p-3 rounded-lg border border-gray-300 mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search by name or student/employee ID..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        aria-label="Search medical records"
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {Object.keys(filterGroups).map((role) => (
          <button
            key={role}
            className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 shadow-sm
              ${
                filter === role
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
            onClick={() => {
              setFilter(role)
              setPage(1)
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-blue-700">
          <FaSpinner className="animate-spin text-4xl mb-4" />
          <p className="text-lg">Loading medical records...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10">
          <p>Error: {error}</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="col-span-full text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">
          No users found for the selected filter or search query.
        </div>
      ) : (
        <>
          {/* User Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((user) => (
              <div
                key={user.id}
                className="bg-white shadow rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 border-t-4 border-yellow-400"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-yellow-400 text-blue-800 font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-blue-800">
                      {`${user.first_name} ${user.middle_name ?? ""} ${user.last_name}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.account_type === "employee" ||
                      user.account_type === "doctor" ||
                      user.account_type === "nurse" ||
                      user.account_type === "dentist"
                        ? "Employee ID"
                        : "Student ID"}
                      : {user.student_number || user.employee_id || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Type:</span> {capitalizeWords(user.account_type)}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Course/Dept:</span> {user.course || user.program || "N/A"}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Last Visit:</span> {user.last_visit || "N/A"}
                </div>
                <button
                  className="text-blue-700 mt-4 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 -ml-2"
                  onClick={() => {
                    // Assuming UserDetailModal is a separate component that takes user data
                    // For direct navigation, you would use:
                    navigate(`/admin/MedicalRecords/UserDetail/${user.id}`)
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {paginated.length > 0 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg border border-blue-700 text-blue-700 disabled:opacity-50 hover:bg-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`px-4 py-2 rounded-lg font-medium
                    ${
                      page === num
                        ? "bg-blue-700 text-white shadow-md"
                        : "border border-blue-700 text-blue-700 hover:bg-blue-100 hover:text-blue-700"
                    } transition-colors duration-200`}
                  onClick={() => setPage(num)}
                  aria-label={`Page ${num}`}
                >
                  {num}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-lg border border-blue-700 text-blue-700 disabled:opacity-50 hover:bg-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ManageMedicalRecords
