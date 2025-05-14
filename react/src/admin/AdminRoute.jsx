import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem('auth_token');
    const accountType = localStorage.getItem('account_type');

    // If no token or accountType is not Admin_Nurse, redirect to login
    if (!userToken || accountType !== 'Admin_Nurse') {
      navigate('/login');
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AdminRoute;
