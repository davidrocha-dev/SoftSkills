import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const RoleSelection = () => {
  const { availableRoles, selectRole, selectedRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedRole) {
      navigate('/dashboard');
    }
  }, [selectedRole, navigate]);

  const handleSelectRole = (role) => {
    selectRole(role);
  };

  return (
    <>
      <Header />
      <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100 py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold display-5 mb-3">Selecione seu Perfil</h1>
              <div 
                className="progress-bar bg-primary" 
                role="progressbar" 
                style={{ width: '50%' }}
              ></div>
        </div>
        {availableRoles.length === 0 ? (
          <div className="alert alert-warning text-center p-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Nenhuma função disponível. Por favor, contate o administrador.
          </div>
        ) : (
          <div className="row g-4 justify-content-center" style={{ maxWidth: '900px' }}>
            {availableRoles.map(role => (
              <div key={role} className="col-md-4 col-sm-6">
                <div 
                  className="card border-5 border-top border-primary shadow-sm hover-shadow transition-all h-100" 
                  onClick={() => handleSelectRole(role)}
                  style={{ 
                    cursor: 'pointer',
                    transform: 'translateY(0)',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="card-body text-center p-4">
                    <i className="bi bi-person-badge fs-1 text-primary mb-3"></i>
                    <h5 className="card-title text-primary fw-bold">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </h5>
                    <p className="text-muted small mb-0">
                      Clique para acessar como {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <footer className="mt-5 text-center text-muted small">
          <div className="border-top pt-4">
            <p>Selecione a função adequada para suas atividades no sistema</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default RoleSelection;
