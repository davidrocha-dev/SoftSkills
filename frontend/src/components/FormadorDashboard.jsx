import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/authService';

const FormadorDashboard = () => {
  const { user, selectedRole, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    finished: 0
  });
  

  useEffect(() => {
    if (selectedRole === 'formador') {
      fetchFormadorData();
    }
  }, [selectedRole]);

  const fetchFormadorData = async () => {
    try {
      setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          'x-selected-role': selectedRole,
          'Authorization': `Bearer ${token}`
        };
      
      const [coursesRes, statsRes] = await Promise.all([
        api.get('/formador/courses', { headers }),
        api.get('/formador/stats', { headers })
      ]);

      setCourses(coursesRes.data);
      setStats({
        active: statsRes.data.activeStatusCourses || 0,
        finished: statsRes.data.finishedCourses || 0
      });
    } catch (error) {
      console.error('Error fetching formador data:', error);
    } finally {
      setLoading(false);
    }
  };

    const renderStatsCards = () => (
    <div className="row mb-4">
      <div className="col-md-6 mb-3">
        <div className="card text-center h-100" style={{ backgroundColor: '#d1e7dd' }}>
          <div className="card-body">
            <h5 className="card-title text-secondary mb-2">Cursos Ativos</h5>
            <p className="display-4 mb-0">{stats.active}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card text-center h-100" style={{ backgroundColor: '#fff3cd' }}>
          <div className="card-body">
            <h5 className="card-title text-secondary mb-2">Cursos Finalizados</h5>
            <p className="display-4 mb-0">{stats.finished}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Bem-vindo, {user?.name}!</h1>
          <span className="badge bg-info mt-2">Função: Formador</span>
        </div>
      </div>

      {renderStatsCards()}
      
      <div className="card">
        <div className="card-header bg-white text-center">
          <h5 className="mb-0">Os meus cursos</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr className="text-center">
                  <th>ID</th>
                  <th>Nome do Curso</th>
                  <th>Estado</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.name}</td>
                    <td>
                      <span className={`badge ${course.status === 'Ativo' ? 'bg-success' : 'bg-secondary'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/cursos/${course.id}/edit`} className="btn btn-primary btn-sm">
                        Ver Curso
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormadorDashboard;