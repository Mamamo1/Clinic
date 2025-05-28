import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { capitalizeWords } from '../utils';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useLoading } from './components/LoadingContext';
import LoadingScreen from './components/LoadingScreen';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { loading, showLoading, hideLoading } = useLoading();
  const excludedFields = ['email', 'course'];

  useEffect(() => {
    const auth_token = localStorage.getItem('auth_token');
    showLoading();

    axios
      .get('http://localhost:8000/api/user', {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      })
      .then(response => {
        const data = response.data;

        const capitalizedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            if (typeof value === 'string' && !excludedFields.includes(key)) {
              return [key, capitalizeWords(value)];
            }
            return [key, value];
          })
        );

        setUserData(capitalizedData);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      })
      .finally(() => {
        hideLoading();
      });
  }, []);

  const personalInfoFields = [
    'first_name',
    'middle_name',
    'last_name',
    'salutation',
    'gender',
    'date_of_birth',
    'email',
  ];

  const addressFields = [
    'mobile',
    'telephone',
    'zipcode',
    'state',
    'city',
    'street',
  ];

  if (loading) return <LoadingScreen />;
  if (!userData) return <p>Loading user data...</p>;


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
          <div className="w-20 h-20 rounded-full bg-gray-300 mr-6 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-800">
              {userData.salutation} {userData.first_name} {userData.middle_name} {userData.last_name}
            </p>
            <p>Course: <span className="font-bold">{userData.course}</span></p>
            <p>ID number: <span className="font-bold">{userData.student_number}</span></p>
            <p>Official email address: <span className="font-bold">{userData.email}</span></p>
          </div>
        </div>
      </div>

      {/* Personal Info + Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          {personalInfoFields.map((key) => (
            <div key={key} className="mb-4">
              <label className="block font-medium mb-1 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {userData[key]}
              </div>
            </div>
          ))}
        </div>

        {/* Address And Contacts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Address And Contacts</h2>
          {addressFields.map((key) => (
            <div key={key} className="mb-4">
              <label className="block font-medium mb-1 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {userData[key]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
