import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../assets/styles/login.css';
import logo from '../assets/img/softinsa-logo.png';
import { api } from '../services/authService';
import Loading from '../components/Loading';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/users/password-reset-request', { email });
      if (data.success) {
        setMessage('Se o e-mail estiver registado, receberá um link para redefinir a sua password.');
      } else {
        setError(data.error || 'Ocorreu um erro. Tente novamente mais tarde.');
      }
    } catch (err) {
      console.error('Erro ao pedir reset de password:', err);
      // Se o backend enviar mensagem de erro:
      const errMsg = err.response?.data?.error || err.response?.data?.message;
      setError(errMsg || 'Falha ao contactar o servidor. Verifique a sua ligação.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-content">
          <img src={logo} alt="Logo" className="img-logo" />
          <h2 className="login-title">Recuperar Senha</h2>
          <p className="login-subtitle">
            Por favor, introduza o seu e-mail para recuperação
          </p>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          {message && (
            <div className="login-success">
              {message}
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
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Pedir Nova Chave de Acesso'}
            </button>
          </form>
          
          <div className="signup-container">
            <p>
              <Link to="/login" className="signup-link">Voltar para o Login</Link>
            </p>
          </div>
        </div>
      
        <div className="login-footer">
          <p>© 2025 SOFTINSA. Todos os direitos reservados.</p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;