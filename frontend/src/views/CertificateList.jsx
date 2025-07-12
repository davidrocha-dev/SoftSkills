import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { Button, Container, Row, Col, Card, Table, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { ArrowLeft, Download, Award, FileEarmarkPdf, Trash } from 'react-bootstrap-icons';
import Header from '../components/Header';

export default function CertificateList() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [certificateToRevoke, setCertificateToRevoke] = useState(null);
    const [revoking, setRevoking] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [certificatesResponse, courseResponse] = await Promise.all([
                    api.get(`/certificates/course/${courseId}`),
                    api.get(`/cursos/${courseId}`)
                ]);
                
                setCertificates(certificatesResponse.data);
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

    const handleDownloadCertificate = (certificate) => {
        if (certificate.pdfUrl) {
            window.open(certificate.pdfUrl, '_blank');
        } else {
            setError('PDF do certificado não está disponível');
        }
    };

    const handleRevokeCertificate = (certificate) => {
        setCertificateToRevoke(certificate);
        setShowRevokeModal(true);
    };

    const confirmRevokeCertificate = async () => {
        if (!certificateToRevoke) return;

        try {
            setRevoking(true);
            await api.delete(`/certificates/revoke/${certificateToRevoke.id}`);
            
            // Atualizar a lista de certificados
            setCertificates(prevCertificates => 
                prevCertificates.filter(cert => cert.id !== certificateToRevoke.id)
            );
            
            setShowRevokeModal(false);
            setCertificateToRevoke(null);
            setError('');
        } catch (err) {
            console.error('Erro ao revogar certificado:', err);
            setError('Erro ao revogar certificado. Tente novamente.');
        } finally {
            setRevoking(false);
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
                                onClick={() => navigate(`/certificate-management/${courseId}`)}
                                className="me-3"
                            >
                                <ArrowLeft size={16} className="me-1" />
                                Voltar
                            </Button>
                            <div>
                                <h2 className="mb-1">
                                    <Award className="me-2" />
                                    Certificados Emitidos
                                </h2>
                                {course && (
                                    <p className="text-muted mb-0">
                                        Curso: {course.title}
                                    </p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Certificados Emitidos</h5>
                                <small className="text-muted">
                                    Total: {certificates.length} certificado(s)
                                </small>
                            </Card.Header>
                            <Card.Body>
                                {certificates.length === 0 ? (
                                    <div className="text-center py-4">
                                        <Award size={48} className="text-muted mb-3" />
                                        <h5>Nenhum certificado emitido</h5>
                                        <p className="text-muted">
                                            Ainda não foram emitidos certificados para este curso.
                                        </p>
                                    </div>
                                ) : (
                                    <Table responsive striped hover>
                                        <thead>
                                            <tr>
                                                <th>Utilizador</th>
                                                <th>Nº Trabalhador</th>
                                                <th>Nota</th>
                                                <th>Data de Emissão</th>
                                                <th>Status PDF</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certificates.map((certificate) => (
                                                <tr key={certificate.id}>
                                                    <td>
                                                        <div>
                                                            <strong>{certificate.user.name}</strong>
                                                            <br />
                                                            <small className="text-muted">{certificate.user.email}</small>
                                                        </div>
                                                    </td>
                                                    <td>{certificate.user.workerNumber}</td>
                                                    <td>
                                                        <Badge 
                                                            bg={certificate.grade >= 10 ? 'success' : 'warning'}
                                                            className="fs-6"
                                                        >
                                                            {certificate.grade}/20
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {new Date().toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td>
                                                        {certificate.pdfUrl ? (
                                                            <Badge bg="success">
                                                                <FileEarmarkPdf size={12} className="me-1" />
                                                                Disponível
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="danger">
                                                                Indisponível
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleDownloadCertificate(certificate)}
                                                                disabled={!certificate.pdfUrl}
                                                                title="Baixar PDF"
                                                            >
                                                                <Download size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleRevokeCertificate(certificate)}
                                                                title="Revogar Certificado"
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
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

            <Modal show={showRevokeModal} onHide={() => setShowRevokeModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Revogação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {certificateToRevoke && (
                        <div>
                            <p>
                                Tem a certeza que deseja revogar o certificado de{' '}
                                <strong>{certificateToRevoke.user.name}</strong>?
                            </p>
                            <div className="alert alert-warning">
                                <strong>Atenção:</strong> Esta ação irá:
                                <ul className="mb-0 mt-2">
                                    <li>Eliminar o certificado da base de dados</li>
                                    <li>Eliminar o PDF do servidor de hosting</li>
                                    <li>Esta ação não pode ser desfeita</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRevokeModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmRevokeCertificate}
                        disabled={revoking}
                    >
                        {revoking ? 'A revogar...' : 'Confirmar Revogação'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
} 