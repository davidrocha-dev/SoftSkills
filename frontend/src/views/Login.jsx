import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import Header from '../components/Header';
import '../assets/styles/login.css';
import logo from '../assets/img/softinsa-logo.png'; 
import { Link } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Carregar email salvo se existir
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
  const result = await login({ email, password });
  
  // Se precisar alterar senha
  if (result.requiresPasswordChange) {
    // Redirecionar para a página de primeiro acesso
    navigate(`/first-login?token=${result.token}`);
    return;
  }
      
      // Verificar manualmente o token
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('Token não foi armazenado corretamente');
      }
      
      authLogin(storedToken, result.user);
      
      // Salvar email se "Relembrar login" estiver marcado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Redirecionamento
      if (result.user.roles?.includes('formando') && result.user.roles.length === 1) {
        navigate('/dashboard');
      } else {
        navigate('/role-selection');
      }
    } catch (err) {
      if (err.response?.data?.error?.includes('não verificada')) {
        setError('Conta não verificada. Verifique seu email para ativar a conta.');
      } else {
        setError(err.message || 'Credenciais inválidas');
      }

      console.error("Erro no login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-content">
          <img src={logo} alt="Logo" className="img-logo" />
          <h2 className="login-title">Entre na sua conta</h2>
          <p className="login-subtitle">Bem-vindo! Por favor, introduza os seus dados.</p>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Insira o seu e-mail institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Insira a palavra passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe">Relembrar login</label>
              </div>
              
              <Link to="/forgot-password" className="forgot-password">Esqueci-me dos dados</Link>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="signup-container">
            Não tem uma conta? <Link to="/contact-manager" className="signup-link">Contactar Gestor</Link>
          </div>
        </div>
      
        <div className="login-footer">
          <p>© 2025 SOFTINSA. Todos os direitos reservados.</p>
        </div>
      </div>
    </>
  );
};

export default Login;