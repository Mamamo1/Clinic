import React from 'react';
import { ArrowUpTrayIcon, ExclamationCircleIcon, InformationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from "react-router-dom";

const PendingRequirements = () => {
    const navigate = useNavigate();
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Back Button */}
      <div
              className="flex items-center text-black cursor-pointer hover:underline mb-4 w-fit"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span className="text-lg font-semibold">Back</span>
            </div>

      {/* Title */}
      <div className="flex items-center justify-center mb-6">
        <InformationCircleIcon className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold">Pending Requirements</h1>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-black">
          <thead className="bg-white border-b">
            <tr>
              <th className="text-left px-6 py-3 font-bold">Requirements</th>
              <th className="text-left px-6 py-3 font-bold">Due Date</th>
              <th className="text-left px-6 py-3 font-bold">File Type</th>
              <th className="text-left px-6 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border border-black">
              <td className="px-6 py-4 flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                Xray
              </td>
              <td className="px-6 py-4">04-20-25</td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4">
                <button className="hover:text-blue-600">
                  <ArrowUpTrayIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default PendingRequirements;
