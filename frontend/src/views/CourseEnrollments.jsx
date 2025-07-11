import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { Container, Card, Table, Spinner, Alert, Button, Form } from 'react-bootstrap';
import Header from '../components/Header';

export default function CourseEnrollments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/enrollments/curso/${id}`);
        setEnrollments(data);
      } catch (err) {
        setError('Erro ao carregar inscrições');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [id]);

  // Função para aceitar inscrição
  const handleAccept = async (enrollmentId) => {
    try {
      await api.patch(`/enrollments/${enrollmentId}`, { status: 'Ativo' });
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: 'Ativo' } : e));
    } catch (err) {
      setError('Erro ao aceitar inscrição');
    }
  };

  // Função para remover inscrição
  const handleRemove = async (enrollmentId) => {
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (err) {
      setError('Erro ao remover inscrição');
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Inscrições do Curso</h2>
          <Button variant="secondary" onClick={() => navigate(`/cursos/${id}/edit`)}>
            Voltar para Edição
          </Button>
        </div>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <span>Inscrições</span>
              <Form.Select
                size="sm"
                style={{ width: 140 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Ativo">Ativo</option>
              </Form.Select>
            </div>
          </Card.Header>
          <Card.Body style={{ maxHeight: 600, overflowY: 'auto' }}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments
                    .filter(e => statusFilter === 'Todos' || e.status === statusFilter)
                    .map(e => (
                      <tr key={e.id}>
                        <td>{e.user?.name || '-'}</td>
                        <td>{e.user?.email || '-'}</td>
                        <td>{e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString('pt-PT') : '-'}</td>
                        <td>{e.status}</td>
                        <td>
                          {e.status === 'Ativo' && (
                            <Button variant="danger" size="sm" onClick={() => handleRemove(e.id)}>
                              Remover
                            </Button>
                          )}
                          {e.status === 'Pendente' && (
                            <>
                              <Button variant="success" size="sm" className="me-2" onClick={() => handleAccept(e.id)}>
                                Aceitar
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleRemove(e.id)}>
                                Remover
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
} 