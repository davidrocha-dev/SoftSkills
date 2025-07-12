import React, { useState, useEffect } from 'react';
import { Container, Spinner, Card, Table, Badge, Button, Alert, Modal, Nav, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import { FaArrowLeft, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ForumModeration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingComments, setPendingComments] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    fetchPendingComments();
    fetchPendingReports();
  }, []);

  const fetchPendingComments = async () => {
    try {
      const response = await api.get('/forum/pending-comments');
      if (response.data.success && Array.isArray(response.data.pendingComments)) {
        setPendingComments(response.data.pendingComments);
      } else {
        setError('Formato de resposta inesperado da API');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar comentários pendentes');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const response = await api.get('/forum/pending-reports');
      if (response.data.success && Array.isArray(response.data.pendingReports)) {
        setPendingReports(response.data.pendingReports);
      }
    } catch (err) {
      console.error('Erro ao carregar denúncias:', err);
    }
  };

  const handleModerate = async (commentId, action) => {
    try {
      setActionLoading(true);
      await api.put(`/forum/moderate-comment/${commentId}`, { action });
      
      await fetchPendingComments();
      
      setShowModal(false);
      setSelectedComment(null);
    } catch (err) {
      setError(err.message || 'Erro ao moderar comentário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      setActionLoading(true);
      await api.put(`/forum/resolve-report/${reportId}`, { action });
      
      await fetchPendingReports();
      
      setShowModal(false);
      setSelectedReport(null);
    } catch (err) {
      setError(err.message || 'Erro ao resolver denúncia');
    } finally {
      setActionLoading(false);
    }
  };

  const openCommentModal = (comment) => {
    setSelectedComment(comment);
    setSelectedReport(null);
    setShowModal(true);
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setSelectedComment(null);
    setShowModal(true);
  };

  const formatDate = dateString =>
    dateString ? new Date(dateString).toLocaleDateString('pt-PT') : '-';

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Moderação do Fórum</h1>
          <span className="badge bg-info">Gestor: {user?.name}</span>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate('/forum')}
        >
          <FaArrowLeft className="me-2" /> Voltar ao Fórum
        </button>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Card className="mt-3">
          <Card.Header>
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="comments">
                  Comentários Pendentes ({pendingComments.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reports">
                  <FaExclamationTriangle className="me-2" />
                  Denúncias ({pendingReports.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-0">
            <Tab.Content>
              <Tab.Pane active={activeTab === 'comments'}>
                {pendingComments.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped bordered hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Autor</th>
                          <th>Nº Funcionário</th>
                          <th>Tópico</th>
                          <th>Categoria</th>
                          <th>Comentário</th>
                          <th>Data</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingComments.map(comment => (
                          <tr key={comment.id}>
                            <td>{comment.authorName}</td>
                            <td>{comment.workerNumber}</td>
                            <td>{comment.topicTitle}</td>
                            <td>{comment.category}</td>
                            <td>
                              <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {comment.content}
                              </div>
                            </td>
                            <td>{formatDate(comment.commentDate)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleModerate(comment.id, 'approve')}
                                  disabled={actionLoading}
                                >
                                  <FaCheck className="me-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => openCommentModal(comment)}
                                  disabled={actionLoading}
                                >
                                  <FaTimes className="me-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">Nenhum comentário pendente de moderação</p>
                  </div>
                )}
              </Tab.Pane>

              <Tab.Pane active={activeTab === 'reports'}>
                {pendingReports.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped bordered hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Denunciante</th>
                          <th>Motivo</th>
                          <th>Autor do Comentário</th>
                          <th>Tópico</th>
                          <th>Comentário Denunciado</th>
                          <th>Data Denúncia</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingReports.map(report => (
                          <tr key={report.id}>
                            <td>
                              {report.reporterName}<br />
                              <small className="text-muted">{report.reporterWorkerNumber}</small>
                            </td>
                            <td>{report.reason}</td>
                            <td>
                              {report.commentAuthorName}<br />
                              <small className="text-muted">{report.commentAuthorWorkerNumber}</small>
                            </td>
                            <td>{report.topicTitle}</td>
                            <td>
                              <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {report.commentContent}
                              </div>
                            </td>
                            <td>{formatDate(report.reportDate)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleResolveReport(report.id, 'dismiss')}
                                  disabled={actionLoading}
                                >
                                  Arquivar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => openReportModal(report)}
                                  disabled={actionLoading}
                                >
                                  <FaTimes className="me-1" />
                                  Remover
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">Nenhuma denúncia pendente</p>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Container>

      {selectedComment && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Rejeição</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem certeza que deseja rejeitar este comentário?</p>
            <div className="border p-3 bg-light rounded">
              <strong>Autor:</strong> {selectedComment?.authorName}<br />
              <strong>Tópico:</strong> {selectedComment?.topicTitle}<br />
              <strong>Comentário:</strong> {selectedComment?.content}
            </div>
            <p className="text-danger mt-3">
              <strong>Atenção:</strong> Esta ação irá eliminar permanentemente o comentário.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleModerate(selectedComment?.id, 'reject')}
              disabled={actionLoading}
            >
              {actionLoading ? 'A processar...' : 'Confirmar Rejeição'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {selectedReport && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Remoção</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem certeza que deseja remover este comentário denunciado?</p>
            <div className="border p-3 bg-light rounded">
              <strong>Denunciante:</strong> {selectedReport?.reporterName}<br />
              <strong>Motivo:</strong> {selectedReport?.reason}<br />
              <strong>Autor do Comentário:</strong> {selectedReport?.commentAuthorName}<br />
              <strong>Tópico:</strong> {selectedReport?.topicTitle}<br />
              <strong>Comentário:</strong> {selectedReport?.commentContent}
            </div>
            <p className="text-danger mt-3">
              <strong>Atenção:</strong> Esta ação irá eliminar permanentemente o comentário.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleResolveReport(selectedReport?.id, 'remove_comment')}
              disabled={actionLoading}
            >
              {actionLoading ? 'A processar...' : 'Confirmar Remoção'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default ForumModeration; 