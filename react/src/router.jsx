import { createBrowserRouter } from 'react-router-dom';
import Login from './views/Login';
import Signup from './views/Signup';
import Index from './views/Index';
import UserLayout from './components/UserLayout';
import User from './user/user';
import ConsultationHistory from './user/history';
import { AdminDashboard } from './admin/AdminDashboard';
import AdminRoute from './admin/AdminRoute';
import PendingRequirements from './user/pending';
import StudentProfile from './user/profile';

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
      <AdminDashboard />
    </AdminRoute>
  ),
},

]);

export default router;
