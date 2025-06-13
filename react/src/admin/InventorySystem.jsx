"use client"

import { useEffect, useState } from "react"
import AddInventoryModal from "./Modals/AddInventoryModal"
import EditInventoryModal from "./Modals/EditInventoryModal"
import DeleteInventoryModal from "./Modals/DeleteInventoryModal"
import Notification from "./Modals/Notification"
import axios from "axios"

const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const InventorySystem = () => {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [activeTab, setActiveTab] = useState("Medicine")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [notification, setNotification] = useState("")
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    generic: "",
    brand_name: "",
    dosage: "",
    name: "",
    quantity: "",
    threshold: "",
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")

      const res = await axios.get("http://localhost:8000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      setItems(res.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const lowStockMedicineCount = items.filter(
    (item) => item.category === "Medicine" && Number.parseInt(item.quantity) <= Number.parseInt(item.threshold || 0),
  ).length

  const lowStockSuppliesCount = items.filter(
    (item) => item.category === "Supplies" && Number.parseInt(item.quantity) <= Number.parseInt(item.threshold || 0),
  ).length

  const filtered = items.filter((item) => {
    const categoryMatch = item.category?.toLowerCase() === activeTab.toLowerCase()
    if (!categoryMatch) return false

    const quantity = Number.parseInt(item.quantity)
    const threshold = Number.parseInt(item.threshold || 0)

    if (showLowStockOnly && quantity > threshold) return false

    const searchTerm = search.toLowerCase()
    if (activeTab === "Medicine") {
      return (
        !searchTerm ||
        item.generic?.toLowerCase().includes(searchTerm) ||
        item.brand_name?.toLowerCase().includes(searchTerm)
      )
    } else {
      return !searchTerm || item.name?.toLowerCase().includes(searchTerm)
    }
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const openAddModal = () => {
    setForm({
      generic: "",
      brand_name: "",
      dosage: "",
      name: "",
      quantity: "",
      threshold: "",
    })
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!form.quantity || isNaN(form.quantity)) {
      alert("Please enter a valid quantity.")
      return
    }

    try {
      const token = localStorage.getItem("auth_token")

      const payload = {
        category: activeTab,
        quantity: Number(form.quantity),
        threshold: Number(form.threshold),
        ...(activeTab === "Medicine"
          ? {
              generic: form.generic,
              brand_name: form.brand_name,
              dosage: form.dosage,
            }
          : { name: form.name }),
      }

      await axios.post("http://localhost:8000/api/inventory", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      setShowAddModal(false)
      fetchItems()
      showNotification("Added Successfully")
    } catch (err) {
      console.error("Save failed:", err)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, search, showLowStockOnly])

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(""), 3000)
  }

  // Show spinner while loading
  if (loading) return <Spinner />

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Inventory System</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 items-center">
        {["Medicine", "Supplies"].map((tab) => {
          const count = tab === "Medicine" ? lowStockMedicineCount : lowStockSuppliesCount
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
              {count > 0 && <span className="ml-2 bg-red-600 text-white px-2 rounded-full text-xs">{count}</span>}
            </button>
          )
        })}

        <button
          onClick={() => setShowLowStockOnly((prev) => !prev)}
          className={`px-3 py-2 rounded ${showLowStockOnly ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          {showLowStockOnly ? "Showing Low Stock" : "Show Low Stock Only"}
        </button>
      </div>

      {/* Search & Add */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={openAddModal} className="bg-green-600 text-white px-4 py-2 rounded">
          Add {activeTab === "Medicine" ? "Medicine" : "Supply"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-blue-600 text-white">
            <tr>
              {activeTab === "Medicine" ? (
                <>
                  <th className="w-1/6 px-3 py-2 text-left">Generic</th>
                  <th className="w-1/6 px-3 py-2 text-left">Brand Name</th>
                  <th className="w-1/6 px-3 py-2 text-left">Dosage</th>
                  <th className="w-1/6 px-3 py-2 text-left">Category</th>
                  <th className="w-1/6 px-3 py-2 text-center">Quantity</th>
                  <th className="w-1/6 px-3 py-2 text-center">Action</th>
                </>
              ) : (
                <>
                  <th className="w-1/3 px-3 py-2 text-left">Name</th>
                  <th className="w-1/3 px-3 py-2 text-center">Quantity</th>
                  <th className="w-1/3 px-3 py-2 text-center">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "Medicine" ? 6 : 3} className="p-4 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            ) : (
              paginated.map((item) => {
                const quantity = Number.parseInt(item.quantity)
                const threshold = Number.parseInt(item.threshold || 0)
                const isLowStock = quantity <= threshold

                return (
                  <tr key={item.id} className={`border-b ${isLowStock ? "bg-red-100" : ""}`}>
                    {activeTab === "Medicine" ? (
                      <>
                        <td className="px-3 py-2">{item.generic}</td>
                        <td className="px-3 py-2">{item.brand_name}</td>
                        <td className="px-3 py-2">{item.dosage}</td>
                        <td className="px-3 py-2">{item.category}</td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            onClick={() => setEditItem(item)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-center space-x-2">
                          <button
                            onClick={() => setEditItem(item)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddInventoryModal
          activeTab={activeTab}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowAddModal(false)}
          showNotification={showNotification}
        />
      )}
      {editItem && (
        <EditInventoryModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            fetchItems()
          }}
          showNotification={showNotification}
        />
      )}
      {deleteItem && (
        <DeleteInventoryModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onDeleted={fetchItems}
          showNotification={showNotification}
        />
      )}
      {notification && <Notification message={notification} onClose={() => setNotification("")} />}
    </div>
  )
}

export default InventorySystem
