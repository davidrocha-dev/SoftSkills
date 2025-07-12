import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { Container, Alert, Spinner } from 'react-bootstrap';
import Loading from '../components/Loading';

const VerifyAccount = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAccount = async () => {
      const queryParams = new URLSearchParams(location.search);
      const email = queryParams.get('email');
      
      if (!email) {
        setStatus('error');
        setMessage('Email não fornecido para verificação');
        navigate('/login');
        return;
      }
      
      try {
        const stateResponse = await api.get(`/users/activation-state?email=${encodeURIComponent(email)}`);
        
        if (stateResponse.data.isVerified) {
          navigate('/login');
          return;
        }

        const response = await api.post('/api/auth/verify-account', { email });
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Conta verificada com sucesso! Redirecionando para login...');
          
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(response.data.error || 'Falha na verificação');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erro ao verificar conta: ' + (error.response?.data?.error || error.message));
      }
    };
    
    verifyAccount();
  }, [location, navigate]);

  if (loading) return <Loading />;

  return (
    <Container className="mt-5 text-center">
      {status === 'verifying' && (
        <>
          <Spinner animation="border" role="status" />
          <p className="mt-3">Verificando sua conta...</p>
        </>
      )}
      
      {status === 'success' && (
        <Alert variant="success">
          <Alert.Heading>Conta Verificada!</Alert.Heading>
          <p>{message}</p>
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert variant="danger">
          <Alert.Heading>Erro na Verificação</Alert.Heading>
          <p>{message}</p>
        </Alert>
      )}
    </Container>
  );
};

export default VerifyAccount;