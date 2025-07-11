// src/views/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';

const ResetPasswordPage = () => {
  const [search] = useSearchParams();
  const token = search.get('token');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState(null);
  const [message, setMessage]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]   = useState(true);

  // Regex para validar pelo menos um número e uma letra maiúscula
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d).+$/;

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    api.get(`/users/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then(() => setLoading(false))
      .catch(() => navigate('/login', { replace: true }));
  }, [token, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    // Verifica se as passwords coincidem
    if (password !== confirm) {
      setError('As passwords não coincidem.');
      return;
    }
    // Verifica comprimento mínimo
    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres.');
      return;
    }
    // Verifica presença de número e letra maiúscula
    if (!passwordPattern.test(password)) {
      setError('A password deve conter pelo menos um número e uma letra maiúscula.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/users/reset-password', { token, newPassword: password });
      logout();
      setMessage('Password atualizada com sucesso! A redirecionar para o login...');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao repor password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
    <Header/>
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Header><h4>Repor Password</h4></Card.Header>
        <Card.Body>
          {error   && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Nova Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={submitting}
                placeholder="Pelo menos 8 chars, 1 número, 1 maiúscula"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirm">
              <Form.Label>Confirmar Password</Form.Label>
              <Form.Control
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                disabled={submitting}
                placeholder="Reescreva a password"
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'A processar...' : 'Repor Password'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
    </>
  );
};

export default ResetPasswordPage;
