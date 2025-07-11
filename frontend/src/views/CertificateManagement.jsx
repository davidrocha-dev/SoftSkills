import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { Button, Container, Row, Col, Card, Table, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft, Award, CheckCircle, XCircle, FileEarmarkPdf } from 'react-bootstrap-icons';
import Header from '../components/Header';

export default function CertificateManagement() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [grade, setGrade] = useState('');
    const [issuingCertificate, setIssuingCertificate] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Buscar inscrições e dados do curso em paralelo
                const [enrollmentsResponse, courseResponse] = await Promise.all([
                    api.get(`/certificates/enrollments/${courseId}`),
                    api.get(`/cursos/${courseId}`)
                ]);
                
                setEnrollments(enrollmentsResponse.data);
                setCourse(courseResponse.data.course);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError('Sessão expirada. Redirecionando para login...');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError('Erro ao carregar dados');
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, navigate]);

    const handleIssueCertificate = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setGrade('');
        setShowModal(true);
    };

    const handleSubmitCertificate = async () => {
        if (!grade || grade < 0 || grade > 20) {
            setError('A nota deve estar entre 0 e 20');
            return;
        }

        try {
            setIssuingCertificate(true);
            setError('');

            const response = await api.post('/certificates/issue', {
                courseId: parseInt(courseId),
                workerNumber: selectedEnrollment.user.workerNumber,
                grade: parseInt(grade),
                observation: null
            });

            setSuccessMessage(`Certificado emitido com sucesso! ${response.data.pdfUrl ? 'PDF disponível para download.' : ''}`);
            setShowModal(false);
            
            // Atualizar a lista de inscrições removendo o que acabou de receber certificado
            setEnrollments(prev => prev.filter(e => e.user.workerNumber !== selectedEnrollment.user.workerNumber));
            
            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Já existe um certificado emitido para este utilizador');
            } else {
                setError('Erro ao emitir certificado');
                console.error(err);
            }
        } finally {
            setIssuingCertificate(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <Container className="mt-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header />
            <Container className="mt-4">
                <Row>
                    <Col>
                        <div className="d-flex align-items-center mb-4">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate(`/cursos/${courseId}/edit`)}
                                className="me-3"
                            >
                                <ArrowLeft size={16} className="me-1" />
                                Voltar ao Curso
                            </Button>
                            <div className="flex-grow-1">
                                <h2 className="mb-1">
                                    <Award className="me-2" />
                                    Emitir Certificados
                                </h2>
                                {course && (
                                    <p className="text-muted mb-0">
                                        Curso: {course.title}
                                    </p>
                                )}
                            </div>
                            <Button 
                                variant="outline-info" 
                                onClick={() => navigate(`/certificate-list/${courseId}`)}
                            >
                                <FileEarmarkPdf size={16} className="me-1" />
                                Ver Certificados Emitidos
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
                                {successMessage}
                            </Alert>
                        )}

                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Inscritos Elegíveis para Certificado</h5>
                                <small className="text-muted">
                                    Apenas inscrições ativas são mostradas
                                </small>
                            </Card.Header>
                            <Card.Body>
                                {enrollments.length === 0 ? (
                                    <div className="text-center py-4">
                                        <XCircle size={48} className="text-muted mb-3" />
                                        <h5>Nenhum inscrito elegível</h5>
                                        <p className="text-muted">
                                            Não há inscrições ativas neste curso para emissão de certificados.
                                        </p>
                                    </div>
                                ) : (
                                    <Table responsive striped hover>
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Email</th>
                                                <th>Nº Trabalhador</th>
                                                <th>Data de Inscrição</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrollments.map((enrollment) => (
                                                <tr key={enrollment.id}>
                                                    <td>{enrollment.user.name}</td>
                                                    <td>{enrollment.user.email}</td>
                                                    <td>{enrollment.user.workerNumber}</td>
                                                    <td>
                                                        {new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleIssueCertificate(enrollment)}
                                                        >
                                                            <CheckCircle size={16} className="me-1" />
                                                            Emitir Certificado
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal para emitir certificado */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Award className="me-2" />
                        Emitir Certificado
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEnrollment && (
                        <div className="mb-3">
                            <h6>Utilizador:</h6>
                            <p className="mb-1"><strong>Nome:</strong> {selectedEnrollment.user.name}</p>
                            <p className="mb-1"><strong>Email:</strong> {selectedEnrollment.user.email}</p>
                            <p className="mb-3"><strong>Nº Trabalhador:</strong> {selectedEnrollment.user.workerNumber}</p>
                        </div>
                    )}
                    
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nota *</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="20"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="Digite a nota (0-20)"
                                required
                            />
                            <Form.Text className="text-muted">
                                A nota deve estar entre 0 e 20
                            </Form.Text>
                        </Form.Group>


                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleSubmitCertificate}
                        disabled={issuingCertificate || !grade || grade < 0 || grade > 20}
                    >
                        {issuingCertificate ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Emitindo...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} className="me-1" />
                                Emitir Certificado
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
} 