import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { capitalizeWords } from '../utils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const USERS_PER_PAGE = 6;

  useEffect(() => {
    const auth_token = localStorage.getItem('auth_token');

    axios
      .get('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      })
      .then(response => {
        const usersData = response.data.map(user => {
          return Object.fromEntries(
            Object.entries(user).map(([key, value]) => {
              if (typeof value === 'string') {
                return [key, capitalizeWords(value)];
              }
              return [key, value];
            })
          );
        });
        setUsers(usersData);
        setFilteredUsers(usersData);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  // Filter by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          (user.student_number && user.student_number.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, users]);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.level === filter));
    }
    setCurrentPage(1);
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-nu-blue">User Management</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name or student ID..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-nu-blue"
      />

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        {['All', 'Student', 'Faculty'].map(level => (
          <button
            key={level}
            onClick={() => handleFilter(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeFilter === level
                ? 'bg-nu-blue text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-nu-blue hover:text-white'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedUsers.map(user => (
          <div key={user.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-nu-blue font-bold text-lg">
                {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
              </div>
              <div>
                <p className="font-semibold text-lg text-nu-blue">{user.first_name} {user.last_name}</p>
                <p className="text-sm text-gray-600">Student ID: {user.student_number}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">📘 {user.course}</p>
            <p className="text-sm text-gray-700">🗓 Last Visit: {user.last_visit || 'N/A'}</p>
            <button
              className="text-nu-blue mt-4 font-medium hover:underline"
              onClick={() => setSelectedUser(user)}
            >
              View Information
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 border-nu-blue text-nu-blue hover:bg-nu-blue hover:text-white transition"
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map(page => (
          <button
            key={page + 1}
            onClick={() => setCurrentPage(page + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === page + 1
                ? 'bg-nu-blue text-white'
                : 'border-nu-blue text-nu-blue hover:bg-nu-blue hover:text-white'
            } transition`}
          >
            {page + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 border-nu-blue text-nu-blue hover:bg-nu-blue hover:text-white transition"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded max-w-md w-full p-6 shadow-lg border border-nu-blue">
            <Dialog.Title className="text-xl font-bold mb-4 text-nu-blue">Student Information</Dialog.Title>
            {selectedUser && (
              <div className="space-y-2 text-gray-800">
                <p><strong>Name:</strong> {selectedUser.first_name} {selectedUser.middle_name} {selectedUser.last_name}</p>
                <p><strong>Student ID:</strong> {selectedUser.student_number}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Course:</strong> {selectedUser.course}</p>
                <p><strong>Mobile:</strong> {selectedUser.mobile}</p>
                <p><strong>Emergency Contact:</strong> {selectedUser.mobile}</p>
                <p><strong>Address:</strong> {selectedUser.street}, {selectedUser.city}, {selectedUser.state}, {selectedUser.zipcode}</p>
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-nu-gold text-nu-blue font-semibold rounded hover:bg-yellow-400 transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default UserManagement;
