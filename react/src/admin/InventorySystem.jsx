import { useEffect, useState } from "react"
import AddInventoryModal from "./Modals/AddInventoryModal"
import EditInventoryModal from "./Modals/EditInventoryModal"
import DeleteInventoryModal from "./Modals/DeleteInventoryModal"
import Notification from "./Modals/Notification"
import axios from "axios"
import { FaSpinner, FaPlus, FaSearch, FaFilter } from "react-icons/fa"

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
      setNotification("Failed to load inventory items.")
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
      showNotification("Please enter a valid quantity.", "error")
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
      showNotification("Item Added Successfully!")
    } catch (err) {
      console.error("Save failed:", err)
      showNotification("Failed to add item.", "error")
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, search, showLowStockOnly])

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type: type })
    setTimeout(() => setNotification(""), 3000)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Inventory System</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-4 items-center flex-wrap">
        {["Medicine", "Supplies"].map((tab) => {
          const count = tab === "Medicine" ? lowStockMedicineCount : lowStockSuppliesCount
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm
                ${
                  activeTab === tab
                    ? "bg-blue-700 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                }`}
            >
              {tab}
              {count > 0 && (
                <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
              )}
            </button>
          )
        })}
        <button
          onClick={() => setShowLowStockOnly((prev) => !prev)}
          className={`px-5 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm flex items-center gap-2
            ${
              showLowStockOnly
                ? "bg-yellow-500 text-blue-900 shadow-md"
                : "bg-gray-300 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700"
            }`}
        >
          <FaFilter /> {showLowStockOnly ? "Showing Low Stock" : "Show Low Stock Only"}
        </button>
      </div>

      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-1/2 lg:w-1/3">
          <input
            type="text"
            placeholder="Search by name or brand..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search inventory"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-800 transition-colors duration-200 flex items-center gap-2"
        >
          <FaPlus /> Add {activeTab === "Medicine" ? "Medicine" : "Supply"}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-blue-700">
          <FaSpinner className="animate-spin text-4xl mb-4" />
          <p className="text-lg">Loading inventory...</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">
          No items found for the selected filter or search query.
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <table className="min-w-full text-sm table-auto">
              <thead className="bg-blue-800 text-white">
                <tr>
                  {activeTab === "Medicine" ? (
                    <>
                      <th className="px-4 py-3 text-left">Generic Name</th>
                      <th className="px-4 py-3 text-left">Brand Name</th>
                      <th className="px-4 py-3 text-left">Dosage</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-center">Threshold</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-center">Threshold</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => {
                  const quantity = Number.parseInt(item.quantity)
                  const threshold = Number.parseInt(item.threshold || 0)
                  const isLowStock = quantity <= threshold
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 ${isLowStock ? "bg-red-50" : "hover:bg-gray-50"}`}
                    >
                      {activeTab === "Medicine" ? (
                        <>
                          <td className="px-4 py-3">{item.generic}</td>
                          <td className="px-4 py-3">{item.brand_name}</td>
                          <td className="px-4 py-3">{item.dosage}</td>
                          <td className="px-4 py-3">{item.category}</td>
                          <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.threshold}</td>
                          <td className="px-4 py-3 text-center space-x-2">
                            <button
                              onClick={() => setEditItem(item)}
                              className="px-3 py-1 bg-yellow-500 text-blue-900 rounded-md text-sm hover:bg-yellow-400 transition-colors shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteItem(item)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.category}</td>
                          <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.threshold}</td>
                          <td className="px-4 py-3 text-center space-x-2">
                            <button
                              onClick={() => setEditItem(item)}
                              className="px-3 py-1 bg-yellow-500 text-blue-900 rounded-md text-sm hover:bg-yellow-400 transition-colors shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteItem(item)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg border border-blue-700 text-blue-700 disabled:opacity-50 hover:bg-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`px-4 py-2 rounded-lg font-medium
                    ${
                      currentPage === num
                        ? "bg-blue-700 text-white shadow-md"
                        : "border border-blue-700 text-blue-700 hover:bg-blue-100 hover:text-blue-700"
                    } transition-colors duration-200`}
                  onClick={() => setCurrentPage(num)}
                  aria-label={`Page ${num}`}
                >
                  {num}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-lg border border-blue-700 text-blue-700 disabled:opacity-50 hover:bg-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
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
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification("")} />
      )}
    </div>
  )
}

export default InventorySystem
