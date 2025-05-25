import React, { useEffect, useState } from 'react';
import AddInventoryModal from './Modals/AddInventoryModal';
import EditInventoryModal from './Modals/EditInventoryModal';
import DeleteInventoryModal from './Modals/DeleteInventoryModal';
import axios from 'axios';

const InventorySystem = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [activeTab, setActiveTab] = useState('Medicine');

  // Thresholds for low stock
  const [medicineThreshold, setMedicineThreshold] = useState(5);
  const [suppliesThreshold, setSuppliesThreshold] = useState(10);

  // Toggle to show only low stock items
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Form state for Add Modal
  const [form, setForm] = useState({
    generic: '',
    brand_name: '',
    dosage: '',
    name: '',
    quantity: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setItems([]);
    }
  };

  // Calculate low stock counts for badges
  const lowStockMedicineCount = items.filter(
    (item) => item.category === 'Medicine' && item.quantity <= medicineThreshold
  ).length;

  const lowStockSuppliesCount = items.filter(
    (item) => item.category === 'Supplies' && item.quantity <= suppliesThreshold
  ).length;

  // Filter items based on active tab, search input and low stock filter
  const filtered = (items || []).filter((i) => {
  const categoryMatch = activeTab === 'Medicine' ? i.category === 'Medicine' : i.category === 'Supplies';
  if (!categoryMatch) return false;

  if (showLowStockOnly) {
    const threshold = activeTab === 'Medicine' ? medicineThreshold : suppliesThreshold;
    if (i.quantity > threshold) return false;
  }

  const searchTerm = search.toLowerCase();

  if (activeTab === 'Medicine') {
    const generic = i.generic ? i.generic.toLowerCase() : '';
    const brandName = i.brand_name ? i.brand_name.toLowerCase() : '';
    return generic.includes(searchTerm) || brandName.includes(searchTerm);
  } else {
    const name = i.name ? i.name.toLowerCase() : '';
    return name.includes(searchTerm);
  }
});


  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEdit = (item) => setEditItem(item);
  const openDelete = (item) => setDeleteItem(item);

  const openAddModal = () => {
    setForm({ generic: '', brand_name: '', dosage: '', name: '', quantity: '' });
    setShowAddModal(true);
  };

const handleSave = async () => {
  try {
    const payload = {
      category: activeTab,
      quantity: Number(form.quantity),
      ...(activeTab === 'Medicine'
        ? {
            generic: form.generic,
            brand_name: form.brand_name,
            dosage: form.dosage,
          }
        : { name: form.name }),
    };
    console.log('Saving payload:', payload);
    await axios.post('http://localhost:8000/api/inventory', form);
    setShowAddModal(false);
    fetchItems();
  } catch (err) {
    console.error('Save failed:', err);
  }
};

 return (
  <div className="p-6 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold mb-6">Inventory System</h1>

    {/* Tabs with low stock badges + new toggle button */}
    <div className="flex gap-2 mb-4 items-center">
      <button
        onClick={() => setActiveTab('Medicine')}
        className={`px-4 py-2 rounded ${activeTab === 'Medicine' ? 'bg-nu-blue text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        Medicine{' '}
        {lowStockMedicineCount > 0 && (
          <span className="ml-2 bg-red-600 text-white px-2 rounded-full text-xs">{lowStockMedicineCount}</span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('Supplies')}
        className={`px-4 py-2 rounded ${activeTab === 'Supplies' ? 'bg-nu-blue text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        Supplies{' '}
        {lowStockSuppliesCount > 0 && (
          <span className="ml-2 bg-red-600 text-white px-2 rounded-full text-xs">{lowStockSuppliesCount}</span>
        )}
      </button>

      {/* New button to toggle low stock filter */}
      <button
        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
        className={`px-3 py-2 rounded ${
          showLowStockOnly ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
        }`}
        title="Toggle Low Stock Filter"
      >
        {showLowStockOnly ? 'Showing Low Stock' : 'Show Low Stock Only'}
      </button>
    </div>

    {/* Removed old standalone low stock checkbox, no longer needed */}

    {/* Threshold input to set low stock level dynamically */}
    <div className="mb-4 flex items-center space-x-4">
      {activeTab === 'Medicine' ? (
        <>
          <label>Medicine Low Stock Level:</label>
          <input
            type="number"
            value={medicineThreshold}
            onChange={(e) => setMedicineThreshold(Number(e.target.value))}
            className="border px-2 py-1 rounded w-16"
            min={0}
          />
        </>
      ) : (
        <>
          <label>Supplies Low Stock Level:</label>
          <input
            type="number"
            value={suppliesThreshold}
            onChange={(e) => setSuppliesThreshold(Number(e.target.value))}
            className="border px-2 py-1 rounded w-16"
            min={0}
          />
        </>
      )}
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
          Add {activeTab === 'Medicine' ? 'Medicine' : 'Supply'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-nu-blue text-white">
            <tr>
              {activeTab === 'Medicine' ? (
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
                  <th className="w-1/2 px-3 py-2 text-left">Name</th>
                  <th className="w-1/4 px-3 py-2 text-center">Quantity</th>
                  <th className="w-1/4 px-3 py-2 text-center">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className="border-b">
                  {activeTab === 'Medicine' ? (
                    <>
                      <td className="px-3 py-2">{item.generic}</td>
                      <td className="px-3 py-2">{item.brand_name}</td>
                      <td className="px-3 py-2">{item.dosage}</td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-center space-x-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(item)}
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
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(item)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? 'bg-nu-blue text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddInventoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          form={form}
          setForm={setForm}
          type={activeTab.toLowerCase()}
        />
      )}
      {editItem && <EditInventoryModal item={editItem} close={() => setEditItem(null)} fetchItems={fetchItems} />}
      {deleteItem && <DeleteInventoryModal item={deleteItem} close={() => setDeleteItem(null)} fetchItems={fetchItems} />}
    </div>
  );
};

export default InventorySystem;
