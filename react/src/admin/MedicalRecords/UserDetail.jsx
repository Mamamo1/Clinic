import React, { useState, useEffect } from 'react';
import { capitalizeWords } from '../../utils';
import { useParams } from 'react-router-dom';
import AddMedicalRecordsModal from '../Modals/AddMedicalRecordsModal';

const UserDetail = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    physician: '',
    reason: '',
    includeVitals: false,
    temperature: '',
    bloodPressure: '',
    pulseRate: '',
    respiratoryRate: '',
    allergies: '',
    allergyNote: '',
    medicineIssued: '',
  });
  const [records, setRecords] = useState([]);

  const personalInfoFields = ['first_name', 'middle_name', 'last_name', 'salutation', 'gender', 'date_of_birth', 'email'];
  const addressFields = ['mobile', 'telephone', 'zipcode', 'state', 'city', 'street'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error('No auth token found');

        const res = await fetch(`http://localhost:8000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch user data');
        }

        const json = await res.json();
        setUserData(json.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    setRecords((prev) => [...prev, formData]);
    setFormData({
      date: '',
      physician: '',
      reason: '',
      includeVitals: false,
      temperature: '',
      bloodPressure: '',
      pulseRate: '',
      respiratoryRate: '',
      allergies: '',
      allergyNote: '',
      medicineIssued: '',
    });
    setShowModal(false);
  };

  const handleCancel = () => {
    setFormData({
      date: '',
      physician: '',
      reason: '',
      includeVitals: false,
      temperature: '',
      bloodPressure: '',
      pulseRate: '',
      respiratoryRate: '',
      allergies: '',
      allergyNote: '',
      medicineIssued: '',
    });
    setShowModal(false);
  };

  const fetchStaffAndInventory = async () => {
    // Optionally define shared logic for fetching staff/inventory if needed later
  };

  const handleDeleteRecord = (index) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!userData) return <div>No user data found.</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#00205b]">Personal Information</h2>
              {personalInfoFields.map((key) => (
                <div key={key} className="mb-4">
                  <label className="block font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                  <div className="border border-gray-300 p-2 rounded bg-gray-100">
                    {capitalizeWords(userData[key] || '')}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#00205b]">Address And Contacts</h2>
              {addressFields.map((key) => (
                <div key={key} className="mb-4">
                  <label className="block font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                  <div className="border border-gray-300 p-2 rounded bg-gray-100">
                    {userData[key] || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'records':
        return (
          <div className="mt-4 text-[#00205b]">
            <button
              onClick={() => setShowModal(true)}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Record
            </button>

            {records.length === 0 && <p>No medical records found.</p>}

            {records.map((record, index) => (
              <div key={index} className="border p-4 mb-4 rounded shadow">
                <p><strong>Date:</strong> {record.date}</p>
                <p><strong>Physician/Nurse:</strong> {record.physician}</p>
                <p><strong>Reason:</strong> {record.reason}</p>
                <div className="mt-2 space-x-2">
                  <button className="px-2 py-1 bg-green-500 text-white rounded cursor-not-allowed opacity-70">View</button>
                  <button className="px-2 py-1 bg-yellow-500 text-white rounded cursor-not-allowed opacity-70">Edit</button>
                  <button onClick={() => handleDeleteRecord(index)} className="px-2 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {showModal && (
              <AddMedicalRecordsModal
                formData={formData}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={handleCancel}
                fetchStaffAndInventory={fetchStaffAndInventory}
              />
            )}
          </div>
        );

      default:
        return <div className="mt-4 text-[#00205b]">Content goes here...</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-3xl font-bold mb-4 text-[#00205b]">Profile</h1>
      <div className="flex items-center">
        <div className="w-20 h-20 rounded-full bg-gray-300 mr-6 flex-shrink-0" />
        <div>
          <p className="text-lg font-bold text-[#00205b]">
            {userData.salutation} {userData.first_name} {userData.middle_name} {userData.last_name}
          </p>
          <p>Course: <span className="font-bold">{userData.course}</span></p>
          <p>ID number: <span className="font-bold">{userData.student_number}</span></p>
          <p>Official email: <span className="font-bold">{userData.email}</span></p>
        </div>
      </div>

      <div className="flex space-x-2 mt-6 border-b">
        {[
          ['basic', 'Basic Information'],
          ['medicalHistory', 'Medical Health History'],
          ['records', 'Medical Records'],
          ['certificate', 'Medical Certificate'],
          ['dental', 'Dental Records'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-2 text-sm border-b-4 transition-colors duration-200 ${
              activeTab === key ? 'border-[#ffc72c] text-[#00205b] font-bold' : 'border-transparent text-gray-500 hover:text-[#00205b]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default UserDetail;
