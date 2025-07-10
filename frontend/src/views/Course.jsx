import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/authService';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Accordion,
  ListGroup
} from 'react-bootstrap';
import {
  FaFileAlt,
  FaVideo,
  FaLink,
  FaAudioDescription
} from 'react-icons/fa';
import '../assets/styles/course.css';

export default function Course() {
  const { id } = useParams();
  const { selectedRole, user } = useAuth();

  const [course, setCourse]                     = useState(null);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [isEnrolled, setIsEnrolled]             = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState('');
  const [showMore, setShowMore]                 = useState(false);
  const [showToggle, setShowToggle]             = useState(false);
  const descRef = useRef(null);

  // Função para ordenar os recursos pela "order"
  const getSortedResources = (resources) => {
    return [...resources].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { 'x-selected-role': selectedRole };
        const { data } = await api.get(`/cursos/${id}`, { headers });
        setCourse(data.course);
        setTotalEnrollments(data.totalEnrollments);
        setIsEnrolled(data.isEnrolled);
      

      } catch (err) {
        console.error('Erro ao carregar detalhes do curso:', err);
        setError('Não foi possível carregar os detalhes do curso.');
      } finally {
        setLoading(false);
      }
    };
    if (selectedRole && user?.id) fetchData();
  }, [id, selectedRole, user]);

  useEffect(() => {
    const el = descRef.current;
    if (el) setShowToggle(el.scrollHeight > el.clientHeight);
  }, [course, showMore]);

  const handleEnroll = async () => {
    try {
      const headers = { 'x-selected-role': selectedRole };
      const requestBody = {
        courseId: id,
        userId: user.id
      };
      console.log('Enviando dados para inscrição:', requestBody);  // Adicione o log para verificar os dados
      await api.post(
        '/inscricoes/create',
        requestBody,
        { headers }
      );
      setIsEnrolled(true);
      setTotalEnrollments(prev => prev + 1);
    } catch (err) {
      console.error('Erro ao inscrever no curso', err);
      setError('Não foi possível inscrever no curso.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '80vh' }}
        >
          <Spinner animation="border" role="status" />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <p>Curso não encontrado.</p>
          <Link to="/dashboard" className="btn btn-secondary mt-3">
            &larr; Voltar
          </Link>
        </Container>
      </>
    );
  }

  if (!course.visible || !course.status) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <Alert variant="warning">
            Este curso não está disponível no momento.
          </Alert>
          <Link to="/dashboard" className="btn btn-secondary">
            Voltar ao Dashboard
          </Link>
        </Container>
      </>
    );
  }

  const vacancies = course.vacancies ?? Infinity;
const isFull = totalEnrollments >= vacancies;
// A constante `disableEnroll` já considera ambas as condições.
const disableEnroll = isEnrolled || (vacancies !== Infinity && totalEnrollments >= vacancies);

return (
  <>
    <Header />
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-start">
          <h4 className="mb-1">{course.title}</h4>
          <Button
            variant={isEnrolled ? 'secondary' : 'primary'}
            disabled={disableEnroll}
            onClick={!disableEnroll ? handleEnroll : undefined}
            style={{ 
              cursor: disableEnroll ? 'default' : 'pointer',
              opacity: disableEnroll ? 0.65 : 1 
            }}
          >
            {isEnrolled ? 'Inscrito' : 'Inscrever'}
          </Button>
        </Card.Header>

          <Card.Body>
            <Row>
              <Col md={4}>
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="img-fluid rounded"
                    style={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover'
                    }}
                  />
                )}
              </Col>
              <Col md={8}>
                <div className="description-container">
                  <div
                    ref={descRef}
                    className={`clamped-text ${showMore ? 'expanded' : ''}`}
                  >
                    {course.description}
                  </div>
                  {showToggle && (
                    <div className="toggle-wrapper">
                      <button
                        className="btn btn-outline-primary btn-sm toggle-btn"
                        onClick={() => setShowMore(prev => !prev)}
                      >
                        {showMore ? 'Ver Menos' : 'Ver Mais'}
                      </button>
                    </div>
                  )}
                </div>

                <Row className="mb-3 text-nowrap">
                  {course.courseType && (
                    <Col className="col-auto">
                      <strong>Formador:</strong> {course.instructor}
                    </Col>
                  )}
                  <Col className="col-auto">
                    <strong>Início:</strong>{' '}
                    {new Date(course.startDate).toLocaleDateString()}
                  </Col>
                  <Col className="col-auto">
                    <strong>Fim:</strong>{' '}
                    {new Date(course.endDate).toLocaleDateString()}
                  </Col>
                  <Col className="col-auto">
                    <strong>Inscrições:</strong>{' '}
                    {totalEnrollments}/{vacancies === Infinity ? '–' : vacancies}
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Mostrar sempre as seções do curso */}
            {course.sections && course.sections.length > 0 ? (
              <Accordion defaultActiveKey="0" className="w-100 mt-4">
                {getSortedResources(course.sections).map((sec, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={sec.id}>
                    <Accordion.Header>
                      Seção {sec.order}: {sec.title}
                    </Accordion.Header>
                    <Accordion.Body>
                      {isEnrolled ? (
                        sec.resources.length === 0 ? (
                          <p>Nenhum recurso nesta seção.</p>
                        ) : (
                          <ListGroup variant="flush">
                            {getSortedResources(sec.resources).map(res => (
                              <ListGroup.Item
                                key={res.id}
                                className="d-flex align-items-start"
                              >
                                <span className="me-2">
                                  {res.resourceType?.type === 1 && <FaFileAlt />}
                                  {res.resourceType?.type === 2 && <FaVideo />}
                                  {res.resourceType?.type === 3 && <FaLink />}
                                </span>
                                <div className="flex-grow-1">
                                  <strong>{res.nome_recurso || res.title || 'Sem título'}</strong>
                                  {res.text && <p>{res.text}</p>}
                                  {res.link && (
                                    <a
                                      href={res.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FaLink className="me-1" /> {res.nome_recurso}
                                    </a>
                                  )}
                                  {res.file && (
                                    <a href={res.file} download>
                                      <FaFileAlt className="me-1" /> {res.nome_recurso}
                                    </a>
                                  )}
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )
                      ) : (
                        <Alert variant="info" className="mb-0">
                          Faça a sua inscrição para ver os recursos desta seção.
                        </Alert>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <p className="mt-4">Nenhuma seção disponível.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
