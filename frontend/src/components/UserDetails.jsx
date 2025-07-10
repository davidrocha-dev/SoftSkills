import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import Header from '../components/Header';
import { FaArrowLeft, FaUser, FaGraduationCap, FaStar } from 'react-icons/fa';
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
        console.error('Erro ao carregar detalhes do utilizador:', err);
        setError('Erro ao carregar dados do utilizador');
      } finally {
        setLoading(false);
      }
    };

    if (id && selectedRole) {
      fetchUserDetails();
    }
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

  const { user, enrollments } = userData;

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

        {/* Cursos Inscritos */}
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <FaGraduationCap className="me-2" />
              Cursos Inscritos ({enrollments.length})
            </h5>
          </Card.Header>
          <Card.Body>
            {enrollments.length === 0 ? (
              <p className="text-muted">Nenhum curso inscrito.</p>
            ) : (
              <Table responsive striped className="text-center">
                <thead>
                  <tr>
                    <th className="text-center">ID</th>
                    <th className="text-center">Curso</th>
                    <th className="text-center">Horas Totais</th>
                    <th className="text-center">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment, index) => (
                    <tr key={index}>
                      <td className="text-center">{enrollment.courseId}</td>
                      <td className="text-center">{enrollment.courseTitle}</td>
                      <td className="text-center">{enrollment.horas || 'N/A'}</td>
                      <td className="text-center">
                        {enrollment.grade ? (
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