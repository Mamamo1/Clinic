import React from 'react';
import AdminSidebar from './adminSidebar';
import AdminNavbar from './adminNavbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <AdminNavbar />

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
