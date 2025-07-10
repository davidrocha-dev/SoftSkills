import React, { useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaCog, FaQuestionCircle, FaComments, FaBars, FaSignOutAlt, FaSyncAlt, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle';

const SidebarFormando = () => {
    const { logout, selectRole, availableRoles } = useAuth();
    const navigate = useNavigate();

    const offcanvasRef = useRef(null);
    const offcanvasInstance = useRef(null);

    useEffect(() => {
        if (offcanvasRef.current) {
        offcanvasInstance.current = new bootstrap.Offcanvas(offcanvasRef.current, {
            backdrop: true
        });
        }
    }, []);

    const toggleSidebar = () => {
        offcanvasInstance.current?.toggle();
    };

    const closeSidebar = () => {
        offcanvasInstance.current?.hide();
    };

    const goToSupport = () => {
        closeSidebar();
        navigate('/contact-manager');
    };

    const goToSettings = () => {
        closeSidebar();
        navigate('/settings');
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
            aria-labelledby="sidebarFormandoLabel"
        >
            <div className="offcanvas-header">
            <h5 id="sidebarFormandoLabel" className="offcanvas-title">Menu</h5>
            <button type="button" className="btn-close" onClick={closeSidebar}></button>
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
                <button
                className="nav-link mb-2 bg-white border-0 text-start text-primary"
                onClick={goToSupport}
                >
                <FaQuestionCircle className="me-2" /> Suporte
                </button>
                <button
                className="nav-link mb-2 bg-white border-0 text-start text-primary"
                onClick={goToSettings}
                >
                <FaCog className="me-2" /> Definições
                </button>

                {availableRoles.length > 1 && (
                <button
                    className="nav-link mb-2 bg-white border-0 text-start text-primary"
                    onClick={handleChangeRole}
                >
                    <FaSyncAlt className="me-2" /> Mudar de Role
                </button>
                )}

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

export default SidebarFormando;
