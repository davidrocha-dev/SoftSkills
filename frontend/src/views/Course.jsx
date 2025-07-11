import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import Loading from '../components/Loading';

export default function Course() {
  const { id } = useParams();
  const { selectedRole, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse]                     = useState(null);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [isEnrolled, setIsEnrolled]             = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState('');
  const [showMore, setShowMore]                 = useState(false);
  const [showToggle, setShowToggle]             = useState(false);
  const descRef = useRef(null);
  // Adicionar estado para enrollmentStatus
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

  // Função para ordenar os recursos pela "order"
  const getSortedResources = (resources) => {
    return [...resources].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  // Função para formatar datas em dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        setEnrollmentStatus(data.enrollmentStatus);
      

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

  // Adicionar variável para verificar se é o formador
  const isInstructor = user?.workerNumber && course?.instructor && user.workerNumber === course.instructor;

  useEffect(() => {
    if (
      course &&
      course.visible === false &&
      course.status === false &&
      course.inscricoes === false &&
      !isInstructor
    ) {
      navigate('/dashboard');
    }
  }, [course, isInstructor, navigate]);

  const handleEnroll = async () => {
    try {
      const headers = { 'x-selected-role': selectedRole };
      const requestBody = {
        courseId: id,
        userId: user.id
      };
      console.log('Enviando dados para inscrição:', requestBody);  // Adicione o log para verificar os dados
      await api.post(
        '/enrollments/',
        requestBody,
        { headers }
      );
      setIsEnrolled(true);
      setEnrollmentStatus('Pendente');
      setTotalEnrollments(prev => prev + 1);
    } catch (err) {
      console.error('Erro ao inscrever no curso', err);
      setError('Não foi possível inscrever no curso.');
    }
  };

  if (loading) {
    return <Loading />;
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


console.log('user.workerNumber:', user?.workerNumber, 'course.instructor:', course?.instructor);

return (
  <>
    <Header />
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-start">
          <h4 className="mb-1">{course.title}</h4>
          {isInstructor ? (
            <Button
              variant="primary"
              onClick={() => window.location.href = `/cursos/${id}/edit`}
              style={{ cursor: 'pointer' }}
            >
              Editar Curso
            </Button>
          ) : (
            <Button
              variant={isEnrolled ? (enrollmentStatus === 'Pendente' ? 'warning' : 'secondary') : 'primary'}
              disabled={isEnrolled || disableEnroll}
              onClick={(!isEnrolled && !disableEnroll) ? handleEnroll : undefined}
              style={{ 
                cursor: (isEnrolled || disableEnroll) ? 'default' : 'pointer',
                opacity: (isEnrolled || disableEnroll) ? 0.65 : 1 
              }}
            >
              {isEnrolled ? (enrollmentStatus === 'Pendente' ? 'Pendente' : 'Inscrito') : 'Inscrever'}
            </Button>
          )}
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
                    {formatDate(course.startDate)}
                  </Col>
                  <Col className="col-auto">
                    <strong>Fim:</strong>{' '}
                    {formatDate(course.endDate)}
                  </Col>
                  <Col className="col-auto">
                    <strong>Inscrições:</strong>{' '}
                    {totalEnrollments}/{vacancies === Infinity ? '–' : vacancies}
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Mostrar sempre as seções do curso */}
            {((isEnrolled && enrollmentStatus === 'Ativo') || isInstructor) ? (
              course.sections && course.sections.length > 0 ? (
                <Accordion className="w-100 mt-4">
                  {getSortedResources(course.sections)
                    .filter(sec => sec.status)
                    .map((sec, idx) => (
                      <Accordion.Item eventKey={String(idx)} key={sec.id}>
                        <Accordion.Header>
                          Seção {idx + 1}: {sec.title}
                        </Accordion.Header>
                        <Accordion.Body>
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
                                  {res.text ? (
                                    <>
                                      <strong>{res.nome_recurso || res.title || 'Sem título'}</strong>
                                      <p>{res.text}</p>
                                      {(res.file || res.link) && (
                                        <a
                                          href={res.file || res.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ textDecoration: 'underline', cursor: 'pointer', display: 'inline-block', marginTop: 4 }}
                                        >
                                          {res.nome_recurso || res.title || 'Sem título'}
                                        </a>
                                      )}
                                    </>
                                  ) : (
                                    (res.file || res.link) ? (
                                      <a
                                        href={res.file || res.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'underline', cursor: 'pointer', display: 'inline-block' }}
                                      >
                                        {res.nome_recurso || res.title || 'Sem título'}
                                      </a>
                                    ) : (
                                      <strong>{res.nome_recurso || res.title || 'Sem título'}</strong>
                                    )
                                  )}
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
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                </Accordion>
              ) : (
                <p className="mt-4">Nenhuma seção disponível.</p>
              )
            ) : (
              isEnrolled && enrollmentStatus === 'Pendente' ? (
                <Alert variant="info" className="mt-4">
                  Sua inscrição está pendente de aprovação. Aguarde a validação do formador.
                </Alert>
              ) : (
                <Alert variant="warning" className="mt-4">
                  Apenas alunos inscritos com inscrição ativa ou o formador podem ver os conteúdos deste curso.
                </Alert>
              )
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
