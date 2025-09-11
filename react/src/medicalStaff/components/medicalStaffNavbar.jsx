import AdminNavbar from "../../admin/components/adminNavbar"

export default function MedicalStaffNavbar() {
  return (
    <AdminNavbar userType="Medical Staff" baseRoute="/medicalStaff" showNotifications={true} showSettings={false} />
  )
}
