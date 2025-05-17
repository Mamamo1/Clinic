import {
  User as UserIcon,
  Info,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const navigate = useNavigate();

  const Card = ({ icon, title, subtitle, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition p-6 rounded-2xl shadow-md w-full sm:w-72 h-48 flex flex-col items-center justify-center text-center space-y-3"
    >
      <div className="text-primary">{icon}</div>
      <div className="text-xl font-bold">{title}</div>
      <p className="text-sm text-gray-700 px-2">{subtitle}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome back</h1>
        <p className="text-gray-600 text-sm">
          Dashboard &gt; <span className="text-blue-600 font-medium">Home</span>
        </p>
      </div>

      {/* Main Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <Card
            icon={<UserIcon className="h-9 w-9" />}
            title="Profile"
            subtitle="View your personal information and update your account settings."
            onClick={() => navigate("/user/profile")}
          />
          <Card
            icon={<Info className="h-8 w-8 text-black" />}
            title="Pending Records"
            subtitle="Track pending medical records and submit missing information."
            onClick={() => navigate("/user/pending")}
          />
          <Card
            icon={<FileText className="h-8 w-9" />}
            title="Consultation History"
            subtitle="Review previous consultations and check doctor’s notes."
            onClick={() => navigate("/user/history")}
          />
        </div>
      </div>
    </div>
  );
}
