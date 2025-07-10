import '../assets/styles/header.css';
import logo from '../assets/img/softinsa1.png';
import { Link } from 'react-router-dom';


import SidebarGestor from './SidebarGestor';
import SidebarFormador from './SidebarFormador';
import SidebarFormando from './SidebarFormando';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';


const Header = () => {
  const { selectedRole, user } = useAuth();

  const isResetPage = location.pathname.startsWith('/reset-password');
  const isSettingsPage = location.pathname.startsWith('/settings');

  return (
    <div className="flex-grow-1">
      <div className="header-bar">
        <div className="header-logo">
          {selectedRole === 'gestor' && <SidebarGestor />}
          {selectedRole === 'formador' && <SidebarFormador />}
          {selectedRole === 'formando' && <SidebarFormando />}
          <Link to="/dashboard">
            <img src={logo} alt="Logo" className="header-logo-img" />
          </Link>
        </div>
      </div>
      {selectedRole === 'formando' && !isResetPage && !isSettingsPage && <Navbar />}
    </div>
  );
};

export default Header;
