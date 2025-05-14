import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLoading } from '../components/LoadingContext'; 
import '../index.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('NU Lipa');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Get the loading context
  const { loading, showLoading, hideLoading } = useLoading();

  // Check if user is logged in and redirect based on account type
  useEffect(() => {
    const userToken = localStorage.getItem('auth_token');
    const accountType = localStorage.getItem('account_type');
    
    console.log('Account Type:', accountType);

    if (userToken) {
      if (accountType === 'Super Admin') {
        navigate('/admin-dashboard');
      } else if (accountType === 'Admin_Nurse') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Check if email and password are empty
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    showLoading(); // Trigger global loading state

    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password,
        campus,
      });

      hideLoading(); // Hide global loading state

      if (response.data.success) {
        // Save token and account type in localStorage
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('account_type', response.data.user.account_type); // Save the account type

        // Redirect based on account type
        if (response.data.user.account_type === 'Super Admin') {
          navigate('/admin-dashboard');
        } else if (response.data.user.account_type === 'Admin_Nurse') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      } else {
        // Specific error handling for invalid email or password
        if (response.data.error === 'Invalid email') {
          setGeneralError('Invalid email or username.');
        } else if (response.data.error === 'Invalid password') {
          setGeneralError('Incorrect password.');
        } else {
          setGeneralError('Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      hideLoading(); // Hide global loading state in case of error
      console.error('Login error:', error);

      if (error.response) {
        setGeneralError('Login failed. Please check your credentials.');
      } else if (error.request) {
        setGeneralError('Network error. Please try again later.');
      } else {
        setGeneralError('An error occurred while logging in.');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#35408E]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-3x1 "></div>
      </div>

      {/* Login Container with higher z-index */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="flex w-[900px] shadow-lg rounded-lg overflow-hidden">
          {/* Left Section */}
          <div className="w-1/2 bg-[#FED339] p-10 flex flex-col items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
              alt="NU Logo"
              className="mb-4 w-24"
            />
            <h2 className="text-2xl font-bold text-center text-[#2C3E91]">Welcome to NU-CARES</h2>
            <p className="text-sm text-center text-[#2C3E91] mt-2">Make Health record easy for you...</p>
          </div>

          {/* Right Section */}
          <div className="w-1/2 bg-white p-10">
            <NavLink to="/" className="text-sm float-right text-blue-500 hover:underline">
              <small style={{ fontSize: '15px' }}>Back to home page</small>
            </NavLink>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sign in</h2>

            <label className="block text-sm font-medium text-gray-600">Select Campus:</label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full px-4 py-3 border rounded mt-1"
            >
              <option>NU Lipa</option>
            </select>

            <label className="block text-sm font-medium text-gray-600 mt-3">NU-CARES Credentials:</label>
            <input
              required
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(''); // Clear email error when typing
              }}
              placeholder="Email/Username"
              className="w-full px-4 py-3 border rounded mt-1"
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

            <input
              required
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(''); // Clear password error when typing
              }}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded mt-2"
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

            {/* Show general error only below the password field */}
            {generalError && <p className="text-red-500 text-sm mt-2">{generalError}</p>}

            <button
              onClick={handleLogin}
              className="w-full mt-4 bg-[#5CB85C] text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login with NU CARES'}
            </button>

            <div className="flex justify-between mt-4 text-sm">
              <NavLink to="/signup" className="text-blue-500">Create an account</NavLink>
              <a href="#" className="text-blue-500">Forgot password</a>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">Need help?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
