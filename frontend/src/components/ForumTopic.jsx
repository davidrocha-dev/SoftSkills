import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { BiLike, BiDislike } from 'react-icons/bi';
import { BiErrorCircle } from 'react-icons/bi';
import FileUpload from '../components/FileUpload';

function CommentTree({ replies, level = 0, handleReact, handleReply, handleSubmitReply, handleReport, replyingId }) {
  if (!replies || replies.length === 0) return null;
  return replies.map(reply => {
    const [localReplyContent, setLocalReplyContent] = useState('');
    const [localFileUrl, setLocalFileUrl] = useState('');
    const isReplying = replyingId === reply.id;
    const handleLocalSubmit = (e) => {
      e.preventDefault();
      handleSubmitReply(reply.id, localReplyContent, localFileUrl);
      setLocalReplyContent('');
      setLocalFileUrl('');
    };
    return (
      <div key={reply.id} style={{ marginLeft: level * 32, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e0e0e0', padding: 12, marginBottom: 12 }}>
        <div className="d-flex align-items-center mb-1">
          <img src={reply.authorAvatar || '/default-avatar.png'} alt="avatar" className="rounded-circle me-2" width={22} height={22} />
          <span className="fw-semibold">{reply.authorName}</span>
          <span className="text-muted small ms-2">{reply.date ? new Date(reply.date).toLocaleDateString('pt-PT') : ''}</span>
        </div>
        <div className="fst-italic text-secondary mb-2">{reply.content}</div>
        {reply.ficheiro && (
          <div className="mb-2">
            <small className="text-muted">Anexo: </small>
            <a href={reply.ficheiro} target="_blank" rel="noopener noreferrer" className="text-primary">
              {reply.ficheiro.split('/').pop()}
            </a>
          </div>
        )}
        <div className="d-flex align-items-center gap-2 mb-1">
          <button className="btn btn-xs btn-outline-success d-flex align-items-center py-0 px-2" style={{ fontSize: 14 }} onClick={e => handleReact(reply.id, true, e)}>
            <BiLike className="me-1" />
            <span>{reply.Reaction ? reply.Reaction.filter(r => r.type).length : 0}</span>
          </button>
          <button className="btn btn-xs btn-outline-danger d-flex align-items-center py-0 px-2" style={{ fontSize: 14 }} onClick={e => handleReact(reply.id, false, e)}>
            <BiDislike className="me-1" />
            <span>{reply.Reaction ? reply.Reaction.filter(r => !r.type).length : 0}</span>
          </button>
          <button className="btn btn-xs btn-outline-primary py-0 px-2 ms-2" style={{ fontSize: 14 }} onClick={() => handleReply(reply.id)}>
            Responder
          </button>
          <button className="btn btn-xs btn-outline-warning py-0 px-2 ms-2" style={{ fontSize: 14 }} onClick={() => handleReport(reply.id)}>
            <BiErrorCircle />
          </button>
        </div>
        {isReplying && (
          <form onSubmit={handleLocalSubmit} className="mt-2">
            <textarea className="form-control mb-2" rows={2} value={localReplyContent} onChange={e => setLocalReplyContent(e.target.value)} required />
            <FileUpload onUploadSuccess={fileUrl => setLocalFileUrl(fileUrl)} onUploadError={() => setLocalFileUrl('')} uploadType="comment-attachment" acceptedFiles="*" />
            {localFileUrl && <div className="mt-2 small text-success">Ficheiro anexado: <a href={localFileUrl} target="_blank" rel="noopener noreferrer">{localFileUrl}</a></div>}
            <button type="submit" className="btn btn-sm btn-primary mt-2">Enviar resposta</button>
          </form>
        )}
        <CommentTree replies={reply.replies} level={level + 1} handleReact={handleReact} handleReply={handleReply} handleSubmitReply={handleSubmitReply} handleReport={handleReport} replyingId={replyingId} />
      </div>
    );
  });
}

const ForumTopic = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [mainReplyContent, setMainReplyContent] = useState('');
  const [mainFileUrl, setMainFileUrl] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  useEffect(() => {
    fetchTopic();
    // eslint-disable-next-line
  }, [id]);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/forum/topics`); // Reutiliza endpoint, filtra no frontend
      const found = (res.data.topics || []).find(t => t.id === Number(id));
      setTopic(found || null);
      setError(found ? '' : 'Tópico não encontrado.');
    } catch (err) {
      setTopic(null);
      setError('Erro ao carregar tópico.');
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (commentId, type, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await api.post('/forum/reactions', {
        commentId,
        type, // Enviar booleano diretamente
        userId: user.id
      });
      fetchTopic();
    } catch (err) {
      alert('Erro ao registar reação.');
    }
  };

  const handleReply = (commentId) => {
    setReplyingId(commentId);
  };

  const handleSubmitReply = async (parentCommentId, content, fileUrl) => {
    if (!user) return;
    try {
      await api.post('/forum/comments', {
        topicId: topic.topicId || topic.id,
        parentCommentId,
        content: content,
        ficheiro: fileUrl || null,
        userId: user.id
      });
      fetchTopic();
    } catch (err) {
      alert('Erro ao enviar resposta.');
    }
  };

  const handleReport = (commentId) => {
    setReportCommentId(commentId);
    setReportReason('');
    setReportMsg('');
    setShowReportModal(true);
  };
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!user) return;
    setReporting(true);
    setReportMsg('');
    try {
      await api.post('/forum/reports', {
        commentId: reportCommentId,
        userId: user.id,
        reason: reportReason
      });
      setReportMsg('Comentário denunciado com sucesso!');
      setTimeout(() => setShowReportModal(false), 1200);
    } catch (err) {
      setReportMsg('Erro ao denunciar comentário.');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <><Header /><Container className="py-4 text-center"><Spinner /></Container></>;
  if (error) return <><Header /><Container className="py-4"><Alert variant="danger">{error}</Alert></Container></>;
  if (!topic) return <><Header /><Container className="py-4"><Alert variant="warning">Tópico não encontrado.</Alert></Container></>;

  const main = topic.firstComment;
  const replies = main?.replies || [];
  const isReplyingMain = replyingId === main.id;
  const handleMainSubmit = (e) => {
    e.preventDefault();
    handleSubmitReply(main.id, mainReplyContent, mainFileUrl);
    setMainReplyContent('');
    setMainFileUrl('');
    setReplyingId(null);
  };

  return (
    <>
      <Header />
      <Container className="py-4">
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <div className="d-flex align-items-center mb-2">
              <img src={topic.authorAvatar || '/default-avatar.png'} alt="avatar" className="rounded-circle me-2" width={36} height={36} />
              <div>
                <div className="fw-bold">{topic.authorName}</div>
                <div className="text-muted small">{topic.category}</div>
                <div className="h5 mb-2 mt-2">{topic.title}</div>
              </div>
            </div>
            <Card.Text className="fst-italic text-secondary mb-3">{main?.content}</Card.Text>
            {main?.ficheiro && (
              <div className="mb-3">
                <small className="text-muted">Anexo: </small>
                <a href={main.ficheiro} target="_blank" rel="noopener noreferrer" className="text-primary">
                  {main.ficheiro.split('/').pop()}
                </a>
              </div>
            )}
            <div className="d-flex align-items-center gap-2 mb-2">
              <button className="btn btn-sm btn-outline-success d-flex align-items-center" onClick={e => handleReact(main.id, true, e)}>
                <BiLike className="me-1" />
                <span>{main.Reaction ? main.Reaction.filter(r => r.type).length : 0}</span>
              </button>
              <button className="btn btn-sm btn-outline-danger d-flex align-items-center" onClick={e => handleReact(main.id, false, e)}>
                <BiDislike className="me-1" />
                <span>{main.Reaction ? main.Reaction.filter(r => !r.type).length : 0}</span>
              </button>
              <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => handleReply(main.id)}>
                Responder
              </button>
              <button className="btn btn-sm btn-outline-warning ms-2" onClick={() => handleReport(main.id)}>
                <BiErrorCircle />
              </button>
            </div>
          </Card.Body>
        </Card>
        <h6 className="mb-3">Respostas</h6>
        {replies.length === 0 && <div className="text-muted">Nenhuma resposta ainda.</div>}
        <div className="mb-4">
          <CommentTree replies={replies} handleReact={handleReact} handleReply={handleReply} handleSubmitReply={handleSubmitReply} handleReport={handleReport} replyingId={replyingId} />
        </div>
        {isReplyingMain && (
          <form onSubmit={handleMainSubmit} className="mt-2">
            <textarea className="form-control mb-2" rows={2} value={mainReplyContent} onChange={e => setMainReplyContent(e.target.value)} required />
            <FileUpload onUploadSuccess={fileUrl => setMainFileUrl(fileUrl)} onUploadError={() => setMainFileUrl('')} uploadType="comment-attachment" acceptedFiles="*" />
            {mainFileUrl && <div className="mt-2 small text-success">Ficheiro anexado: <a href={mainFileUrl} target="_blank" rel="noopener noreferrer">{mainFileUrl}</a></div>}
            <button type="submit" className="btn btn-sm btn-primary mt-2">Enviar resposta</button>
          </form>
        )}
        <Button as={Link} to="/forum" variant="secondary" className="mt-3">Voltar ao Fórum</Button>
      </Container>
      {/* Modal de denúncia */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Denunciar comentário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitReport}>
            <Form.Group className="mb-3">
              <Form.Label>Motivo</Form.Label>
              <Form.Select value={reportReason} onChange={e => setReportReason(e.target.value)} required>
                <option value="">Selecione o motivo...</option>
                <option value="Comentário ofensivo">Comentário ofensivo</option>
                <option value="Spam">Spam</option>
                <option value="Fora de contexto">Fora de contexto</option>
                <option value="Informação incorreta">Informação incorreta</option>
                <option value="Irrelevante">Irrelevante</option>
                <option value="Linguagem inadequada">Linguagem inadequada</option>
                <option value="Duplicado">Duplicado</option>
              </Form.Select>
            </Form.Group>
            {reportMsg && <Alert variant={reportMsg.includes('sucesso') ? 'success' : 'danger'}>{reportMsg}</Alert>}
            <Button type="submit" className="btn btn-warning" disabled={reporting}>
              {reporting ? 'A denunciar...' : 'Denunciar'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ForumTopic; 