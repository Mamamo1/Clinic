import AdminDashboard from "../admin/AdminDashboard";

export default function MedicalStaffDashboard() {
  return (
    <AdminDashboard userType="Medical Staff" baseRoute="/medicalStaff" />
  );
}
