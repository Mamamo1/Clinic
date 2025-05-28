import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const userToken = localStorage.getItem('auth_token');
    const accountType = localStorage.getItem('account_type');

    if (userToken && accountType === 'SuperAdmin') {
      setIsAuthorized(true);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (isAuthorized === null) {
    // You can return a spinner or null while checking
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
