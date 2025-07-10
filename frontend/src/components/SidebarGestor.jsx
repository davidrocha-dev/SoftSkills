import React, { useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaCog, FaList,FaUser, FaTags, FaBook, FaComments, FaBars, FaSignOutAlt, FaSyncAlt, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle';

const SidebarGestor = () => {
  const { logout, selectRole } = useAuth();
  const navigate = useNavigate();

  // ref para o offcanvas
  const offcanvasRef = useRef(null);
  const offcanvasInstance = useRef(null);

  // inicializa o offcanvas do Bootstrap para transições suaves
  useEffect(() => {
    if (offcanvasRef.current) {
      offcanvasInstance.current = new bootstrap.Offcanvas(offcanvasRef.current, {
        backdrop: true
      });
    }
  }, []);

  const toggleSidebar = () => {
    if (offcanvasInstance.current) {
      offcanvasInstance.current.toggle();
    }
  };

  const goToSettings = () => {
        closeSidebar();
        navigate('/settings');
    };

  const closeSidebar = () => {
    if (offcanvasInstance.current) {
      offcanvasInstance.current.hide();
    }
  };

  const handleChangeRole = () => {
    selectRole(null);
    sessionStorage.removeItem('selectedRole');
    closeSidebar();
    navigate('/role-selection');
  };

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  return (
    <>
      <button
        className="btn btn-primary btn-lg m-3"
        onClick={toggleSidebar}
        style={{ backgroundColor: '#2f5fa7', borderColor: '#2f5fa7' }}
      >
        <FaBars />
      </button>

      <div
        ref={offcanvasRef}
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        aria-labelledby="sidebarGestorLabel"
      >
        <div className="offcanvas-header">
          <h5 id="sidebarGestorLabel" className="offcanvas-title">Menu</h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeSidebar}
          ></button>
        </div>

        <div className="offcanvas-body d-flex flex-column justify-content-between">
          <nav className="nav nav-pills flex-column">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => 
                `nav-link mb-2 text-primary ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <FaHome className="me-2" /> Dashboard
            </NavLink>
            <NavLink
              to="/user"
              className={({ isActive }) => 
                `nav-link mb-2 text-primary ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <FaUser className="me-2" /> Utilizadores
            </NavLink>
            <NavLink
              to="/categorias"
              className={({ isActive }) => 
                `nav-link mb-2 text-primary ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <FaTags className="me-2" /> Categorias / Áreas / Tópicos
            </NavLink>
            <NavLink
              to="/cursos"
              className={({ isActive }) => 
                `nav-link mb-2 text-primary ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <FaBook className="me-2" /> Cursos
            </NavLink>
            <NavLink
              to="/forum"
              className={({ isActive }) => 
                `nav-link mb-2 text-primary ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <FaComments className="me-2" /> Fórum
            </NavLink>
          </nav>

          <nav className="nav nav-pills flex-column">
            <NavLink
              to="/requests"
              className={({ isActive }) => 
                `nav-link mb-2 text-primary ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <FaList className="me-2" /> Suporte
            </NavLink>
            <button
              className="nav-link mb-2 bg-white border-0 text-start text-primary"
              onClick={goToSettings}
            >
              <FaCog className="me-2" /> Definições
            </button>
            <button
              className="nav-link mb-2 bg-white border-0 text-start text-primary"
              onClick={handleChangeRole}
            >
              <FaSyncAlt className="me-2" /> Mudar de Role
            </button>
            <button
              className="nav-link mb-2 text-danger bg-white border-0 text-start"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Sair
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default SidebarGestor;