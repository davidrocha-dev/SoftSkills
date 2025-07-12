import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';

const GestorRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/requests', {
          headers: { 'x-selected-role': 'gestor' }
        });
        if (response.data.success && Array.isArray(response.data.requests)) {
          setRequests(response.data.requests);
        } else {
          setError('Formato de resposta inesperado da API');
        }
      } catch (err) {
        setError(err.message || 'Erro ao carregar pedidos de suporte');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const getStatusBadge = status => {
    switch (status) {
      case 'Pendente':      return <Badge bg="warning">Pendente</Badge>;
      case 'Em Progresso':  return <Badge bg="secondary">Em Progresso</Badge>;
      case 'Resolvido':     return <Badge bg="success">Resolvido</Badge>;
      default:              return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = dateString =>
    dateString ? new Date(dateString).toLocaleDateString('pt-PT') : '-';

  if (loading) return <Loading />;

  return (
    <>
    <Header/>
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Pedidos de Suporte</h1>
        <span className="badge bg-info">Gestor: {user?.name}</span>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => navigate('/dashboard')}
      >
        <FaArrowLeft className="me-2" /> Voltar ao Dashboard
      </button>

      <Card className="mt-3">
        <Card.Header>
          <h5 className="mb-0">Lista de Pedidos</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {requests.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0 text-center">
                <thead>
                  <tr>
                    <th>Nº Funcionário</th>
                    <th>Assunto</th>
                    <th>Status</th>
                    <th>Data de Criação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td>{req.workerNumber}</td>
                      <td>{req.subject}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td>{formatDate(req.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/requests/${req.id}`)}
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>{error || 'Nenhum pedido de suporte encontrado'}</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
    </>
  );
};

export default GestorRequestsPage;
