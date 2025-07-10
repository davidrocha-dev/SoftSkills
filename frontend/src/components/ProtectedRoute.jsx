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
  
  // Verificação de autenticação para rotas protegidas
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Permitir acesso à página de seleção de roles SEMPRE
  if (location.pathname === '/role-selection') {
    return children;
  }

  const isFormando = availableRoles.length === 1 && availableRoles[0] === 'formando';
  
  // Permitir acesso para formandos mesmo sem selectedRole
  if (isFormando && !selectedRole) {
    return children;
  }
  
  // Redirecionar para seleção apenas se não for formando e não tiver role selecionada
  if (!selectedRole && !isFormando) {
    return <Navigate to="/role-selection" replace />;
  }

  // Verificar permissões
  if (selectedRole && allowedRoles.length > 0 && !allowedRoles.includes(selectedRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;