import { createBrowserRouter } from "react-router-dom"

// Views
import Login from "./views/Login"
import Signup from "./views/Signup"
import Index from "./views/Index"

// User Pages & Layout
import UserLayout from "./user/components/UserLayout"
import User from "./user/user"
import ConsultationHistory from "./user/history"
import AppointmentBooking from "./user/AppointmentBooking"
import StudentProfile from "./user/profile"
import ViewAppointments from "./user/viewAppointments"

// Admin Pages & Layout
import { AdminDashboard } from "./admin/AdminDashboard"
import AdminRoute from "./admin/components/AdminRoute"
import UserManagement from "./admin/userManagement"
import AdminLayout from "./admin/components/AdminLayout"
import InventorySystem from "./admin/InventorySystem"
import ManageMedicalRecords from "./admin/MedicalRecords/ManageMedicalRecords"
import UserDetail from "./admin/MedicalRecords/UserDetail"
import AppointmentTable from "./admin/AppointmentTable"

// MedicalStaff
import MedicalStaffLayout from "./medicalStaff/components/medicalStaffLayout"
import MedicalStaffRoute from "./medicalStaff/medicalStaffRoute"
import MedicalStaffDashboard from "./medicalStaff/medicalStaffDashboard"

import UserRoute from "./user/userRoute"
import RoleBasedRedirect from "./RoleBaseRedirect"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: <RoleBasedRedirect />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  
  {
    path: "/user",
    element: (
      <UserRoute allowedRoles={["SHS", "College", "Employee"]}>
        <UserLayout />
      </UserRoute>
    ),
    children: [
      {
        index: true,
        element: <User />,
      },
      {
        path: "history",
        element: <ConsultationHistory />,
      },
      {
        path: "appointmentBooking",
        element: <AppointmentBooking />,
      },
      {
        path: "viewAppointments",
        element: <ViewAppointments />,
      },
      {
        path: "profile",
        element: <StudentProfile />,
      },
    ],
  },
  
  {
    path: "/admin",
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
        path: "userManagement",
        element: <UserManagement />,
      },
      {
        path: "appointments",
        element: <AppointmentTable />,
      },
      {
        path: "Inventory",
        element: <InventorySystem />,
      },
      {
        path: "ManageMedicalRecords",
        element: <ManageMedicalRecords />,
      },
      {
        path: "MedicalRecords",
        children: [
          {
            path: "UserDetail/:id",
            element: <UserDetail />,
          },
        ],
      },
    ],
  },



  {
    path: "/medicalStaff",
    element: (
      <MedicalStaffRoute>
        <MedicalStaffLayout />
      </MedicalStaffRoute>
    ),
    children: [
      {
        index: true,
        element: <MedicalStaffDashboard />,
      },
      {
        path: "appointments",
        element: <AppointmentTable />,
      },
      {
        path: "Inventory",
        element: <InventorySystem />,
      },
      {
        path: "ManageMedicalRecords",
        element: <ManageMedicalRecords />,
      },
      {
        path: "MedicalRecords",
        children: [
          {
            path: "UserDetail/:id",
            element: <UserDetail />,
          },
        ],
      },
      {
        path: "reports",
        element: <div>Medical Staff Reports - Coming Soon</div>, // You can replace this with your actual reports component
      },
    ],
  },
])

export default router
