"use client"

import { useEffect, useState } from "react"
import { FaUserGraduate, FaUserMd, FaFileMedical, FaExclamationTriangle, FaUsers } from "react-icons/fa"
import axios from "axios"
import HorizontalBarChart from "./components/HorizontalBarChart"
import BarChart from "./components/BarChart"

const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="w-10 h-10 border-4 border-[#2E3192] border-t-transparent rounded-full animate-spin"></div>
  </div>
)

export const AdminDashboard = () => {
  const [firstName] = useState(() => localStorage.getItem("first_name"))
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInventory: 0,
    lowStock: 0,
    medicalRecords: 0,
    medicalStaff: 5,
  })
  const [loading, setLoading] = useState(true)
  const [showBarChart, setShowBarChart] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const authToken = localStorage.getItem("auth_token")
      setLoading(true)
      try {
        const [userRes, inventoryRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://localhost:8000/api/inventory", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ])

        const users = userRes.data.data || []
        const inventory = inventoryRes.data.data || []
        const lowStockCount = inventory.filter((item) => item.quantity <= item.threshold).length

        setStats({
          totalUsers: users.length,
          totalInventory: inventory.length,
          lowStock: lowStockCount,
          medicalRecords: 3434,
          medicalStaff: 5,
        })
      } catch (error) {
        console.error("Dashboard fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRemoveChart = () => {
    setShowBarChart(false)
  }

  if (loading) return <Spinner />

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2E3192] mb-2">Welcome, Dr. {firstName || "Admin"}!</h1>
        <p className="text-gray-600">Here's your medical center overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Total Users</div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
          <FaUserGraduate size={32} className="text-[#ffc72c]" />
        </div>

        {/* Medical Records */}
        <div className="bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Medical Records</div>
            <div className="text-2xl font-bold">{stats.medicalRecords}</div>
          </div>
          <FaFileMedical size={32} className="text-[#ffc72c]" />
        </div>

        {/* Inventory */}
        <div className="bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Total Inventory</div>
            <div className="text-2xl font-bold">{stats.totalInventory}</div>
          </div>
          <FaFileMedical size={32} className="text-[#ffc72c]" />
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Low Stock Alerts</div>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </div>
          <FaExclamationTriangle size={32} className="text-[#ffc72c]" />
        </div>

        {/* Medical Staff */}
        <div className="bg-[#2E3192] text-white p-6 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-[#ffc72c] hover:scale-105 transition-transform duration-200">
          <div>
            <div className="text-sm opacity-90">Medical Staff</div>
            <div className="text-2xl font-bold">{stats.medicalStaff}</div>
          </div>
          <FaUserMd size={32} className="text-[#ffc72c]" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Common Illnesses Chart */}
        <div className="lg:col-span-1">
          {showBarChart && <HorizontalBarChart title="Top 5 Common Illnesses" onRemove={handleRemoveChart} />}
        </div>

        {/* Most Used Medicines Chart */}
        <div className="lg:col-span-1">
          <BarChart title="Most Used Medicines" onRemove={() => setShowBarChart(false)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="space-y-6">
        </div>
      </div>
      </div>
  )
}

export default AdminDashboard
