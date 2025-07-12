import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '../components/Header';
import Loading from '../components/Loading';


const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const resp = await api.get(`/requests/${id}`, {
          headers: { 'x-selected-role': 'gestor' }
        });
        if (resp.data.success && resp.data.request) {
          setRequest(resp.data.request);
        } else {
          setError('Pedido não encontrado');
        }
      } catch {
        setError('Erro ao carregar detalhes do pedido');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleResolve = async () => {
    if (!resolutionText.trim()) return;
    setResolving(true);
    try {
      const resp = await api.put(
        `/requests/${id}/resolve`,
        { resolutionDetails: resolutionText },
        { headers: { 'x-selected-role': 'gestor' } }
      );
      if (resp.data.success && resp.data.request) {
        setRequest(resp.data.request);
        setResolutionText('');
      } else {
        throw new Error();
      }
    } catch {
      setError('Erro ao resolver o pedido');
    } finally {
      setResolving(false);
    }
  };

  const formatDate = d => (d ? new Date(d).toLocaleString('pt-PT') : '-');
  const getStatusColor = status => {
    if (status === 'Pendente') return 'warning';
    if (status === 'Resolvido') return 'success';
    return 'secondary';
  };

  if (loading) return <Loading />;

  const isResolved = request?.status === 'Resolvido';
  const leftColSize = isResolved ? 12 : 8;

  return (
    <>
      <Header />
      <Container className="mt-4">
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="mb-0">Detalhes do Pedido #{request.id}</h1>
              <span className="badge bg-info">Gestor: {user?.name}</span>
            </div>
          </Col>
        </Row>

        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate('/requests')}
        >
          <FaArrowLeft className="me-2" /> Voltar aos Pedidos
        </button>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          <Col md={leftColSize}>
            <Card className="mb-4">
              <Card.Header>
                <h5>Informações Básicas</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Nº Funcionário:</strong> {request.workerNumber}
                </p>
                <p>
                  <strong>Nome:</strong> {request.name}
                </p>
                <p>
                  <strong>Email:</strong> {request.email}
                </p>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5>Detalhes do Pedido</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Assunto:</strong> {request.subject}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge bg={getStatusColor(request.status)}>{request.status}</Badge>
                </p>
                <p>
                  <strong>Criado Em:</strong> {formatDate(request.createdAt)}
                </p>
                {request.resolvedAt && (
                  <p>
                    <strong>Resolução Em:</strong> {formatDate(request.resolvedAt)}
                  </p>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5>Mensagem Enviada</h5>
              </Card.Header>
              <Card.Body>{request.message}</Card.Body>
            </Card>

            {isResolved && request.resolutionDetails && (
              <Card className="mb-4">
                <Card.Header>
                  <h5>Detalhes da Resolução</h5>
                </Card.Header>
                <Card.Body>{request.resolutionDetails}</Card.Body>
              </Card>
            )}
          </Col>

          {!isResolved && (
            <Col md={4} className="d-flex flex-column align-items-start">
              <Card className="mb-4 w-100">
                <Card.Header>
                  <h5>Resolver Pedido</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group
                    className="mb-3"
                    controlId="resolutionDetails"
                  >
                    <Form.Label>Detalhes da Resolução</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Escreva aqui a mensagem de resolução..."
                      value={resolutionText}
                      onChange={e => setResolutionText(e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={handleResolve}
                    disabled={resolving || !resolutionText.trim()}
                  >
                    {resolving ? 'A Resolver...' : 'Marcar como Resolvido'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default RequestDetailsPage;
