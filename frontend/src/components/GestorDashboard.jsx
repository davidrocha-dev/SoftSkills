import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';

const Dashboard = () => {
  const { user, selectedRole, logout } = useAuth();
  const [counts, setCounts] = useState({ formador: 0, formando: 0, active: 0, finished: 0 });

  useEffect(() => {
    if (selectedRole === 'gestor') {
      const headers = { 'x-selected-role': selectedRole };
      Promise.all([
        api.get('/gestor/users/counts',   { headers }),
        api.get('/gestor/courses/counts', { headers })
      ])
      .then(([uRes, cRes]) => {
        setCounts({
          formador: uRes.data.formador || 0,
          formando: uRes.data.formando || 0,
          active:   cRes.data.active  || 0,
          finished: cRes.data.finished|| 0
        });
      })
      .catch(err => console.error('Erro ao buscar counts:', err));
    } else if (selectedRole === 'formando') {
      fetchAvailableCourses();
    }
  }, [selectedRole]);

  const fetchAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await api.get('/cursos/available', {
        headers: { 'x-selected-role': selectedRole }
      });
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const renderStatsDashboard = () => (
    <div className="row mb-4">
      <div className="col-sm-3 mb-3">
        <div className="card text-center h-100" style={{ backgroundColor: '#d1e7dd' }}>
          <div className="card-body">
            <h5 className="card-title text-secondary mb-2">Cursos ativos</h5>
            <p className="display-4 mb-0">{counts.active}</p>
          </div>
        </div>
      </div>
      <div className="col-sm-3 mb-3">
        <div className="card text-center h-100" style={{ backgroundColor: '#f8d7da' }}>
          <div className="card-body">
            <h5 className="card-title text-secondary mb-2">Cursos finalizados</h5>
            <p className="display-4 mb-0">{counts.finished}</p>
          </div>
        </div>
      </div>
      <div className="col-sm-3 mb-3">
        <div className="card bg-light text-center h-100">
          <div className="card-body">
            <h5 className="card-title text-secondary mb-2">Formadores</h5>
            <p className="display-4 mb-0">{counts.formador}</p>
          </div>
        </div>
      </div>
      <div className="col-sm-3 mb-3">
        <div className="card bg-light text-center h-100">
          <div className="card-body">
            <h5 className="card-title text-secondary mb-2">Formandos</h5>
            <p className="display-4 mb-0">{counts.formando}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Bem-vindo, {user?.name}!</h1>
          <span className="badge bg-primary mt-2">Função atual: {selectedRole || 'Nenhuma selecionada'}</span>
        </div>
      </div>

      {renderStatsDashboard()}
      {selectedRole === 'gestor'}
    </>
  );
};

export default Dashboard;
