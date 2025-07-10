import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import GestorDashboard from '../components/GestorDashboard';
import FormadorDashboard from '../components/FormadorDashboard';
import FormandoDashboard from '../components/FormandoDashboard';



const Dashboard = () => {
  const { selectedRole } = useAuth();

  return (
    <>
      <Header />
      <div className="container py-4">

        {selectedRole === 'gestor' && <GestorDashboard />}
        {selectedRole === 'formador' && <FormadorDashboard />}
        {selectedRole === 'formando' && <FormandoDashboard />}
        

      </div>
    </>
  );
};

export default Dashboard;
