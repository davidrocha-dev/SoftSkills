import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/Notification';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const decodeToken = token => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro na decodificação do token:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenData = decodeToken(token);
      if (tokenData) {
        setUser({ id: tokenData.id, email: tokenData.email, name: tokenData.name, workerNumber: tokenData.workerNumber });
        const roles = tokenData.roles || [];
        setAvailableRoles(roles);

        const savedRole = sessionStorage.getItem('selectedRole');
        if (savedRole && roles.includes(savedRole)) {
          setSelectedRole(savedRole);
        } else if (roles.length === 1) {
          setSelectedRole(roles[0]);
          sessionStorage.setItem('selectedRole', roles[0]);
        }
      } else {
        localStorage.removeItem('token');
        sessionStorage.removeItem('selectedRole');
        notify('Sessão expirada. Faça login novamente.', 'error');
      }
    }
    setLoading(false);
  }, [navigate, notify]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    const tokenData = decodeToken(token);
    setUser({ ...userData, workerNumber: tokenData.workerNumber });
    const roles = tokenData.roles || [];
    setAvailableRoles(roles);
    if (roles.length === 1) {
      setSelectedRole(roles[0]);
      sessionStorage.setItem('selectedRole', roles[0]);
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedRole(null);
    setAvailableRoles([]);
    localStorage.removeItem('token');
    sessionStorage.removeItem('selectedRole');
    notify('Você saiu da sessão.', 'info');
    navigate('/login');
  };

  const selectRole = role => {
    setSelectedRole(role);
    sessionStorage.setItem('selectedRole', role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedRole,
        availableRoles,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        selectRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
