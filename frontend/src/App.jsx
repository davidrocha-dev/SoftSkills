import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './views/Login';
import RoleSelection from './views/RoleSelection';
import Dashboard from './views/Dashboard';
import Unauthorized from './views/Unauthorized';
import ForgotPassword from './views/ForgotPassword';
import ContactManager from './views/ContactManager';
import CriarUtilizador from './views/CriarUtilizador';
import ACTListGestor from './components/ACTListGestor';
import CourseList from './components/CourseList';
import Profile from './views/Profile';
import VerifyAccount from './views/VerifyAccount';
import FirstLogin from './views/FirstLogin';
import Requests from './views/Requests';
import RequestsDetails from './views/RequestsDetails';
import SettingsPage from './views/Settings';
import ResetPassword from './views/ResetPassword';
import UserDetails from './components/UserDetails';
//import Forum from './components/Forum';
import Course from './views/Course';
//import Discussion from './components/Discussion';
import EditCourse from './views/EditCourse';
import CourseEnrollments from './views/CourseEnrollments';
import CertificateManagement from './views/CertificateManagement';
import CertificateList from './views/CertificateList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/main.css';
import Forum from './views/Forum';
import ForumTopic from './views/ForumTopic';
import ForumModeration from './views/ForumModeration';


// Componente para rotas públicas (redireciona se autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Componente para páginas não encontradas
const NotFoundRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }
  
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/verify-account" element={<VerifyAccount />} />

          <Route path="/first-login" element={<FirstLogin />} />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/contact-manager" element={<ContactManager />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Rotas protegidas */}
          <Route path="/role-selection" element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['gestor','formador','formando']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <CriarUtilizador />
            </ProtectedRoute>
          } />

          <Route path="/areas" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <ACTListGestor />
            </ProtectedRoute>
          } />
          
          <Route path="/categorias" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <ACTListGestor/>
            </ProtectedRoute>
          } />

          <Route path="/topicos" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <ACTListGestor/>
            </ProtectedRoute>
          } />

          <Route path="/cursos" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <CourseList/>
            </ProtectedRoute>
          } />

          <Route path="/forum" element={
            <ProtectedRoute allowedRoles={['gestor','formador','formando']}>
              <Forum />
            </ProtectedRoute>
          } />

          <Route path="/forum/:id" element={
            <ProtectedRoute allowedRoles={['gestor','formador','formando']}>
              <ForumTopic />
            </ProtectedRoute>
          } />

          <Route path="/id/:workerNumber" element={
            <ProtectedRoute allowedRoles={['gestor','formador','formando']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/user/:id" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <UserDetails />
            </ProtectedRoute>
          } />

          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <Requests />
            </ProtectedRoute>
          } />

          <Route path="/forum-moderation" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <ForumModeration />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['gestor','formador','formando']}>
              <SettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/requests/:id" element={
            <ProtectedRoute allowedRoles={['gestor']}>
              <RequestsDetails />
            </ProtectedRoute>
          } />

          <Route
            path="/cursos/:id"
            element={
              <ProtectedRoute allowedRoles={['gestor','formador','formando']}>
                <Course/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cursos/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['gestor','formador']}>
                <EditCourse/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cursos/:id/inscricoes"
            element={
              <ProtectedRoute allowedRoles={['gestor','formador']}>
                <CourseEnrollments/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificate-management/:courseId"
            element={
              <ProtectedRoute allowedRoles={['gestor','formador']}>
                <CertificateManagement/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificate-list/:courseId"
            element={
              <ProtectedRoute allowedRoles={['gestor','formador']}>
                <CertificateList/>
              </ProtectedRoute>
            }
          />


          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
