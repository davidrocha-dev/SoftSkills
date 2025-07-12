import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, selectedRole, loading, availableRoles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === '/role-selection') {
    return children;
  }

  const isFormando = availableRoles.length === 1 && availableRoles[0] === 'formando';
  
  if (isFormando && !selectedRole) {
    return children;
  }
  
  if (!selectedRole && !isFormando) {
    return <Navigate to="/role-selection" replace />;
  }

  if (selectedRole && allowedRoles.length > 0 && !allowedRoles.includes(selectedRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;