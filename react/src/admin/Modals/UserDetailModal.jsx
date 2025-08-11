import { useState } from 'react';
import StudentProfile from "../MedicalRecords/StudentProfile";


const UserDetailModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');
  if (!user) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <StudentProfile userData={user} />;
      case 'medicalHistory':
        return <div className="mt-4">Medical history content goes here...</div>;
      case 'records':
        return <div className="mt-4">Medical records content goes here...</div>;
      case 'dental':
        return <div className="mt-4">Dental records content goes here...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-lg overflow-auto max-h-[90vh]">

        <div className="flex space-x-2 mt-4 border-b">
          {[
            ['basic', 'Basic Information'],
            ['medicalHistory', 'Medical Health History'],
            ['records', 'Medical Records'],
            ['certificate', 'Medical Certificate'],
            ['dental', 'Dental Records']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1 border-b-2 ${activeTab === key ? 'border-blue-600 font-bold' : 'border-transparent'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default UserDetailModal;
