
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAdminAuthenticated } = useAppContext();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default PrivateRoute;
