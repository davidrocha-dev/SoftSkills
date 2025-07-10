import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import Header from '../components/Header';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const FirstLogin = () => {
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                   = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isValidating, setIsValidating]     = useState(true);
  const [valid, setValid]                   = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const token    = new URLSearchParams(location.search).get('token');
  const { logout } = useAuth();

  useEffect(() => {
    if (!token) {
      return navigate('/login', { replace: true });
    }
    // valida token no servidor
    api.get(`/auth/first-login/validate?token=${encodeURIComponent(token)}`)
      .then(() => setValid(true))
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setIsValidating(false));
  }, [token, navigate]);

  if (isValidating) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (!valid) return null; // já redirecionou no catch

  const handleSubmit = async e => {
    e.preventDefault();

    // validações
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    // regex para número + maiúscula
    if (!/(?=.*\d)(?=.*[A-Z])/.test(newPassword)) {
      setError('A senha deve conter pelo menos 1 número e 1 letra maiúscula');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const resp = await api.post('/auth/first-login', { token, newPassword });
      localStorage.setItem('token', resp.data.token);
      navigate('/role-selection', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-5">
        <Card className="p-4 mx-auto" style={{ maxWidth: 500 }}>
          <h2 className="text-center mb-4">Primeiro Acesso</h2>
          <p className="text-center">Por favor, defina sua nova senha</p>

          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>Nova Senha</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Mín. 8 chars, 1 número e 1 maiúscula"
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmar Senha</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Processando...
                </>
              ) : (
                'Definir Senha'
              )}
            </Button>
          </Form>
        </Card>
      </Container>
    </>
  );
};

export default FirstLogin;
