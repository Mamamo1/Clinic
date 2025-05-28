import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDetailModal from './UserDetail';

const roles = ['All', 'SHS', 'College', 'Employee', 'Staff'];

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ManageMedicalRecords = () => {
   const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPage = 6;

  const fetchUsers = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found');

    const res = await fetch('http://localhost:8000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to fetch users');
    }

    return await res.json();
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const json = await fetchUsers();
        setUsers(json.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filtered = users.filter(user => {
    if (user.account_type === 'SuperAdmin') return false; // exclude SuperAdmin

    const isStaff = ['Doctor', 'Nurse', 'Dentist'].includes(user.account_type);
    const matchFilter =
      filter === 'All' ||
      (filter === 'Staff' ? isStaff : user.account_type === filter);

    const fullName = `${user.first_name} ${user.middle_name ?? ''} ${user.last_name}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      (user.student_number?.toLowerCase().includes(search.toLowerCase()) || '') ||
      (user.employee_id?.toLowerCase().includes(search.toLowerCase()) || '');

    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) return <Spinner />;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">User Management</h1>

      <input
        className="w-full p-3 rounded-md border mb-4"
        placeholder="Search by name or student/employee ID..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {roles.map(role => (
          <button
            key={role}
            className={`px-4 py-2 rounded-full font-medium ${filter === role ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => {
              setFilter(role);
              setPage(1);
            }}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.length === 0 ? (
          <div className="col-span-full text-center text-gray-600 p-6 bg-white rounded shadow">
            No users found for the selected filter or search query.
          </div>
        ) : (
          paginated.map(user => (
            <div key={user.id} className="bg-white shadow rounded-lg p-4 border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-yellow-400 text-blue-900 font-bold rounded-full flex items-center justify-center">
                  {`${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-blue-800">
                    {`${user.first_name} ${user.middle_name ?? ''} ${user.last_name}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.account_type === 'Employee' ? 'Employee ID' : 'Student ID'}: {user.student_number || user.employee_id || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-1">📘 {user.course || user.program || 'N/A'}</div>
              <div className="text-sm text-gray-700 mb-2">📅 Last Visit: {user.last_visit || 'N/A'}</div>
              <button
                className="text-nu-blue mt-4 font-medium hover:underline"
                onClick={() => navigate(`/admin/MedicalRecords/UserDetail/${user.id}`)}
                style={{
                  backgroundColor: '#f0f4ff',
                  color: '#1e40af',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {paginated.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-4 py-2 rounded border text-blue-900 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={`px-3 py-1 rounded border ${page === num ? 'bg-blue-900 text-white' : 'text-blue-900'}`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="px-4 py-2 rounded border text-blue-900 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default ManageMedicalRecords;
