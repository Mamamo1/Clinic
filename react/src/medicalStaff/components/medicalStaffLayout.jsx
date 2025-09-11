import { Outlet } from "react-router-dom";
import MedicalStaffNavbar from "./medicalStaffNavbar";
import MedicalStaffSidebar from "./medicalStaffSidebar";

const MedicalStaffLayout = () => {
  return (
    <div className="h-screen overflow-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <MedicalStaffNavbar />
      </div>

      {/* Sidebar */}
      <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white z-40">
        <MedicalStaffSidebar />
      </div>

      {/* Main Content */}
      <div className="ml-64 mt-16 h-[calc(100vh-4rem)] overflow-auto p-4 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default MedicalStaffLayout;
