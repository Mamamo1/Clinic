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
      className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition p-6 rounded-2xl shadow-md w-full sm:w-72 h-40 flex flex-col justify-between"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <p className="text-sm text-gray-700">{subtitle}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome back </h1>
        <p className="text-gray-600 text-sm">
          Dashboard &gt; <span className="text-blue-600 font-medium">Home</span>
        </p>
      </div>

      {/* Main Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <Card
            icon={<UserIcon className="h-6 w-6" />}
            title="Profile"
            subtitle="View your personal information"
            onClick={() => navigate("/user/profile")}
          />
          <Card
            icon={<Info className="h-6 w-6 text-black" />}
            title="Pending Records"
            subtitle="View your pending requirements"
            onClick={() => navigate("/user/pending")}
          />
          <Card
            icon={<FileText className="h-6 w-6" />}
            title="Consultation History"
            subtitle="View your previous visits and treatments"
            onClick={() => navigate("/user/history")}
          />
        </div>
      </div>
    </div>

  );
}
