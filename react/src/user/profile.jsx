import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
  const navigate = useNavigate();

  // Simulated fetched data
  const profileData = {
    name: 'Juan Dela Cruz',
    course: 'BS Computer Science',
    idNumber: '2023-12345',
    department: 'College of Computing',
    email: 'juan.delacruz@university.edu.ph',
  };

  const personalInfo = {
    salutation: 'Mr.',
    lastName: 'Dela Cruz',
    firstName: 'Juan',
    middleName: 'Santos',
    gender: 'Male',
    dateOfBirth: '2001-06-12',
  };

  const addressInfo = {
    street: '123 Purok 1, Barangay Mabini',
    state: 'Batangas',
    zipcode: '4217',
    mobileNo: '09171234567',
    city: 'Lipa City',
    country: 'Philippines',
    emergencyContact: 'Maria Dela Cruz - 09181234567',
  };

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

      {/* Profile Header */}
      <div className="bg-white border rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-full  bg-gray-300 mr-6 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-800"><strong>{profileData.name}</strong></p>
            <p>Course: <span className="font-bold">{profileData.course}</span></p>
            <p>ID number: <span className="font-bold">{profileData.idNumber}</span> </p>
            <p>Department: <span className="font-bold">{profileData.department}</span> </p>
            <p>Official email address: <span className="font-bold">{profileData.email} </span> </p>
          </div>
        </div>
      </div>

      {/* Personal Info + Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          {Object.entries(personalInfo).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">{value}</div>
            </div>
          ))}
        </div>

        {/* Address And Contacts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Address And Contacts</h2>
          {Object.entries(addressInfo).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
