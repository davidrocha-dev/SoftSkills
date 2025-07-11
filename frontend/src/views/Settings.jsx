// src/views/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import Header from '../components/Header';
import Loading from '../components/Loading';

const SettingsPage = () => {
    const { user, logout } = useAuth();
    const [form, setForm] = useState({ name: '', email: '' });
    const [passwordResetting, setPasswordResetting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, email: user.email });
            setLoading(false);
        }
    }, [user]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async e => {
        e.preventDefault();
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const resp = await api.put(
                `/users/${user.id}`,
                { name: form.name, email: form.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Dados atualizados com sucesso!');
            if (form.email !== user.email) logout();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao atualizar dados.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Tem a certeza que quer eliminar a sua conta?')) return;
        setDeleting(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const url = `/users/${user.id}`;
            console.log('DELETE URL:', api.defaults.baseURL + url);
            await api.delete(
                url,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            logout();
        } catch (err) {
            console.error('Erro ao eliminar conta:', err);
            const serverMsg = err.response?.data?.error || err.message;
            setError(serverMsg);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            <Header />
            <Container className="my-5">
                <h1 className="mb-4 fw-bold text-primary">Configurações da Conta</h1>
                <Row className="g-4">
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 rounded-3">
                            <Card.Header className="bg-primary text-white py-3">
                                <h4 className="mb-0 d-flex align-items-center">
                                    <i className="bi bi-person-circle me-2"></i>
                                    Dados Pessoais
                                </h4>
                            </Card.Header>
                            <Card.Body>
                                {message && <Alert variant="success" className="mb-4">{message}</Alert>}
                                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                                
                                <Form onSubmit={handleSave} className="py-2">
                                    <Form.Group className="mb-4" controlId="name">
                                        <Form.Label className="fw-medium">Nome Completo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            className="py-2 border-2"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4" controlId="email">
                                        <Form.Label className="fw-medium">Endereço de E-mail</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="py-2 border-2"
                                        />
                                        <Form.Text className="text-muted">
                                            Alterar seu e-mail exigirá novo login
                                        </Form.Text>
                                    </Form.Group>
                                    <div className="d-flex justify-content-end mt-4">
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            className="px-4 py-2 fw-medium"
                                        >
                                            <i className="bi bi-save me-2"></i>
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 rounded-3 mb-4">
                            <Card.Header className="bg-warning text-dark py-3">
                                <h4 className="mb-0 d-flex align-items-center">
                                    <i className="bi bi-shield-lock me-2"></i>
                                    Segurança
                                </h4>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-grid gap-3">
                                    <Button
                                        variant="outline-warning"
                                        className="text-start d-flex align-items-center py-3"
                                        onClick={async () => {
                                            setPasswordResetting(true);
                                            setMessage(null); setError(null);
                                            try {
                                                const token = localStorage.getItem('token');
                                                await api.post(
                                                    `/users/${user.id}/password-reset`,
                                                    {},
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                setMessage('Um e-mail de redefinição foi enviado para sua caixa de entrada!');
                                            } catch (err) {
                                                setError(err.response?.data?.error || 'Erro ao enviar e-mail de redefinição.');
                                            } finally {
                                                setPasswordResetting(false);
                                            }
                                        }}
                                        disabled={passwordResetting}
                                    >
                                        <i className="bi bi-key fs-4 me-3"></i>
                                        <div>
                                            <h5 className="mb-1">Alterar Senha</h5>
                                            <p className="mb-0 small text-muted">Receba um link para redefinir sua senha</p>
                                        </div>
                                        {passwordResetting && 
                                            <Spinner animation="border" size="sm" className="ms-auto" />}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        <Card className="shadow-sm border-0 rounded-3">
                            <Card.Header className="bg-danger text-white py-3">
                                <h4 className="mb-0 d-flex align-items-center">
                                    <i className="bi bi-exclamation-octagon me-2"></i>
                                    Zona de Perigo
                                </h4>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-grid">
                                    <Button
                                        variant="outline-danger"
                                        className="text-start d-flex align-items-center py-3"
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                    >
                                        <i className="bi bi-trash fs-4 me-3"></i>
                                        <div>
                                            <h5 className="mb-1">Excluir Conta Permanentemente</h5>
                                            <p className="mb-0 small text-muted">
                                                Todos os seus dados serão removidos do sistema
                                            </p>
                                        </div>
                                        {deleting && 
                                            <Spinner animation="border" size="sm" className="ms-auto" />}
                                    </Button>
                                </div>
                                <div className="mt-3 text-center small text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Esta ação não pode ser desfeita
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default SettingsPage;