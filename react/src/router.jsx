import { createBrowserRouter } from 'react-router-dom';
import Login from './views/Login';
import Signup from './views/Signup';
import Index from './views/Index';
import UserLayout from './components/UserLayout';
import User from './user/user';
import ConsultationHistory from './user/history';
import PendingRequirements from './user/pending';
import StudentProfile from './user/profile';
import { AdminDashboard } from './admin/AdminDashboard';
import AdminRoute from './admin/AdminRoute';
import UserManagement from './admin/userManagement';
import AdminLayout from './admin/AdminLayout';
import InventorySystem from './admin/InventorySystem';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <User />,
      },
      {
        path: 'history',
        element: <ConsultationHistory />,
      },
      {
        path: 'pending',
        element: <PendingRequirements />,
      },
      {
        path: 'profile',
        element: <StudentProfile />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'userManagement',
        element: <UserManagement />,
      },
      {
        path: 'Inventory',
        element: <InventorySystem />,  // Use the imported InventorySystem here
      },
      // add other admin pages here
    ],
  },
]);

export default router;
