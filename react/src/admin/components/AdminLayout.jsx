import React from 'react';
import AdminSidebar from './adminSidebar';
import AdminNavbar from './adminNavbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="h-screen overflow-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminNavbar />
      </div>

      {/* Sidebar */}
      <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white z-40">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="ml-64 mt-16 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-100 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
