import { createBrowserRouter } from 'react-router-dom';

// Views
import Login from './views/Login';
import Signup from './views/Signup';
import Index from './views/Index';

// User Pages & Layout
import UserLayout from './user/components/UserLayout';
import User from './user/user';
import ConsultationHistory from './user/history';
import PendingRequirements from './user/pending';
import StudentProfile from './user/profile';

// Admin Pages & Layout
import { AdminDashboard } from './admin/AdminDashboard';
import AdminRoute from './admin/components/AdminRoute';
import UserManagement from './admin/userManagement';
import AdminLayout from './admin/components/AdminLayout';
import InventorySystem from './admin/InventorySystem';
import ManageMedicalRecords from './admin/MedicalRecords/ManageMedicalRecords';
import UserDetail from './admin/MedicalRecords/UserDetail';


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
      {
        path: 'ManageMedicalRecords',
        element: <ManageMedicalRecords />,
      },
      {
        path: 'MedicalRecords',
        children: [
          {
            path: 'UserDetail/:id',
            element: <UserDetail />,
          },
        ],
      },
    ],
  },
]);

export default router;
