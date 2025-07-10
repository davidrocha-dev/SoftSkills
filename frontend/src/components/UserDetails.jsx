import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import Header from '../components/Header';
import { FaArrowLeft, FaUser, FaGraduationCap } from 'react-icons/fa';
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Table
} from 'react-bootstrap';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedRole } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/gestor/users/${id}/details`, {
          headers: { 'x-selected-role': selectedRole }
        });
        if (response.data.success) {
          setUserData(response.data);
        } else {
          setError('Falha ao carregar dados do utilizador');
        }
      } catch (err) {
        setError('Erro ao carregar dados do utilizador');
      } finally {
        setLoading(false);
      }
    };
    if (id && selectedRole) fetchUserDetails();
  }, [id, selectedRole]);

  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          </div>
        </Container>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <Alert variant="danger">
            {error || 'Utilizador não encontrado'}
          </Alert>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" /> Voltar
          </button>
        </Container>
      </>
    );
  }

  const { user, enrollments = [] } = userData;
  // Função para filtrar cursos pelo intervalo de datas
  const filteredEnrollments = enrollments.filter(e => {
    const start = e.startDate ? e.startDate.slice(0, 10) : '';
    const end = e.endDate ? e.endDate.slice(0, 10) : '';
    const afterStart = !startDateFilter || (start && start >= startDateFilter);
    const beforeEnd = !endDateFilter || (end && end <= endDateFilter);
    return afterStart && beforeEnd;
  });

  return (
    <>
      <Header />
      <Container className="mt-4">
        {/* Header com botão voltar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Detalhes do Utilizador</h1>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" /> Voltar
          </button>
        </div>

        {/* Informações do Utilizador */}
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FaUser className="me-2" />
              Informações Pessoais
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <strong>ID:</strong> {user.id}
            </div>
            <div className="mb-3">
              <strong>Nome:</strong> {user.name}
            </div>
            <div className="mb-3">
              <strong>Nº Trabalhador:</strong> {user.workerNumber}
            </div>
            <div className="mb-3">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="mb-3">
              <strong>Função:</strong> 
              <Badge bg="info" className="ms-2">
                {user.primaryRole === 'gestor' ? 'Gestor' : 
                 user.primaryRole === 'formador' ? 'Formador' : 'Formando'}
              </Badge>
            </div>
            <div>
              <strong>Estado:</strong>
              <Badge bg={user.status ? 'success' : 'danger'} className="ms-2">
                {user.status ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </Card.Body>
        </Card>

        {/* Filtro por intervalo de datas */}
        <div className="mb-3">
          <label className="form-label me-2"><strong>Filtrar por intervalo de datas:</strong></label>
          <span className="me-2">Início</span>
          <input
            type="date"
            className="form-control d-inline-block w-auto me-2"
            value={startDateFilter}
            onChange={e => setStartDateFilter(e.target.value)}
          />
          <span className="me-2">Fim</span>
          <input
            type="date"
            className="form-control d-inline-block w-auto me-2"
            value={endDateFilter}
            onChange={e => setEndDateFilter(e.target.value)}
          />
          {(startDateFilter || endDateFilter) && (
            <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }}>Limpar</button>
          )}
        </div>

        {/* Cursos Inscritos */}
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <FaGraduationCap className="me-2" />
              Cursos Inscritos ({filteredEnrollments.length})
            </h5>
          </Card.Header>
          <Card.Body>
            {filteredEnrollments.length === 0 ? (
              <p className="text-muted">Nenhum curso inscrito.</p>
            ) : (
              <Table responsive striped className="text-center">
                <thead>
                  <tr>
                    <th className="text-center">ID</th>
                    <th className="text-center">Curso</th>
                    <th className="text-center">Horas Totais</th>
                    <th className="text-center">Data Início</th>
                    <th className="text-center">Data Fim</th>
                    <th className="text-center">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment, index) => (
                    <tr key={index}>
                      <td className="text-center">{enrollment.courseId}</td>
                      <td className="text-center">{enrollment.courseTitle}</td>
                      <td className="text-center">{enrollment.horas || 'Curso Incompleto'}</td>
                      <td className="text-center">{enrollment.startDate ? new Date(enrollment.startDate).toLocaleDateString('pt-PT') : 'N/A'}</td>
                      <td className="text-center">{enrollment.endDate ? new Date(enrollment.endDate).toLocaleDateString('pt-PT') : 'N/A'}</td>
                      <td className="text-center">
                        {enrollment.grade !== null && enrollment.grade !== undefined ? (
                          <Badge bg={enrollment.grade >= 10 ? 'success' : 'danger'}>
                            {enrollment.grade}/100
                          </Badge>
                        ) : (
                          <span className="text-muted">Curso Incompleto</span>
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
};

export default UserDetails; 