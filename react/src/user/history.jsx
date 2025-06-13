import React from 'react';
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const records = [
  {
    id: 1,
    type: "General Checkup",
    status: "Completed",
    date: "April 15, 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    notes:
      "Routine checkup. Blood pressure normal at 120/80. Mild seasonal allergies discussed, recommended over-the-counter antihistamines as needed.",
  },
  {
    id: 2,
    type: "General Checkup",
    status: "Completed",
    date: "April 15, 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    notes:
      "Routine checkup. Blood pressure normal at 120/80. Mild seasonal allergies discussed, recommended over-the-counter antihistamines as needed.",
  },
  {
    id: 3,
    type: "General Checkup",
    status: "Completed",
    date: "April 15, 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    notes:
      "Routine checkup. Blood pressure normal at 120/80. Mild seasonal allergies discussed, recommended over-the-counter antihistamines as needed.",
  },
];

export default function ConsultationHistory() {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50">
      <div
        className="flex items-center text-black cursor-pointer hover:underline mb-4 w-fit"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        <span className="text-lg font-semibold">Back</span>
      </div>

      <h1 className="text-3xl font-light text-gray-800 mb-6">Consultation History</h1>

      {/* Wrapper div for search and records */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        {/* Search Input */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search Record..."
            className="border border-gray-300 px-4 py-2 rounded-md w-full md:w-1/3 text-gray-700"
          />
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-md border border-gray-200 shadow-sm p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium text-gray-800">{record.type}</h2>
              </div>

              <div className="flex justify-between text-sm mt-2 text-gray-600">
                <p>
                  <span className="font-semibold">Date:</span> {record.date}
                </p>
                <p>
                  <span className="font-semibold">Doctor:</span> {record.doctor}
                </p>
              </div>

              <div className="flex items-start text-sm text-gray-600 mt-3">
                <span className="mr-2">📄</span>
                <p>{record.notes}</p>
              </div>

              <div className="text-right mt-4">
                <button className="flex items-center text-blue-600 hover:underline text-sm font-medium">
                  <Eye size={16} className="mr-1" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            className="border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
