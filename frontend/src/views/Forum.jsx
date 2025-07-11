import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { api } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BiLike, BiDislike } from 'react-icons/bi';
import Select from 'react-select';

const Forum = () => {
  const { user, selectedRole } = useAuth();
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [order, setOrder] = useState('recent'); // Valor inicial para mais recentes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState(null);
  const [newTopicContent, setNewTopicContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [topicOptions, setTopicOptions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  // 1. Adiciona um estado para a mensagem de sucesso
  const [pendingMsg, setPendingMsg] = useState('');

  useEffect(() => {
    fetchTopics();
    fetchCategories();
    // eslint-disable-next-line
  }, [category, order, search]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/forum/topics', {
        params: {
          search: search || undefined,
          category: category !== 'Todos' ? category : undefined,
          sort: order // Envia 'recent' ou 'oldest' para o backend
        }
      });
      setTopics(res.data.topics || []);
      setError('');
    } catch (err) {
      setTopics([]);
      setError('Erro ao carregar tópicos do fórum.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categorias');
      setCategories(res.data || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTopics();
  };

  const handleReact = async (commentId, type, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await api.post('/forum/reactions', {
        commentId,
        type,
        userId: user.id
      });
      // Atualiza os tópicos para refletir a reação
      fetchTopics();
    } catch (err) {
      alert('Erro ao registar reação.');
    }
  };

  // Preparar opções para o react-select
  const categoryOptions = [
    { value: 'Todos', label: 'Todas as categorias' },
    ...categories.map(cat => ({ value: cat.description, label: cat.description }))
  ];

  // Buscar tópicos para o dropdown ao abrir o modal
  const fetchTopicOptions = async () => {
    try {
      const res = await api.get('/forum/topics-list');
      setTopicOptions((res.data.topics || []).map(t => ({ value: t.id, label: t.description })));
    } catch {
      setTopicOptions([]);
    }
  };

  // Ao abrir o modal, buscar tópicos
  const handleOpenModal = () => {
    setShowModal(true);
    fetchTopicOptions();
  };

  return (
    <>
      <Header />
      {pendingMsg && (
        <div className="d-flex justify-content-center">
          <Alert variant="info" onClose={() => setPendingMsg('')} dismissible className="mt-3 w-100" style={{ maxWidth: 480 }}>
            {pendingMsg}
          </Alert>
        </div>
      )}
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Fórum</h2>
          {selectedRole === 'gestor' && (
            <Link to="/forum-moderation" className="btn btn-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Moderação do Fórum
            </Link>
          )}
        </div>
        <Form className="bg-light p-3 rounded mb-4 d-flex flex-wrap gap-2 align-items-end">
          <Form.Control
            type="text"
            className="w-auto"
            placeholder="Pesquisar por palavras chave..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* Substituir Form.Select por Select pesquisável */}
          <div style={{ minWidth: 220 }}>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(opt => opt.value === category)}
              onChange={opt => setCategory(opt.value)}
              placeholder="Todas as categorias"
              isSearchable
            />
          </div>
          <Form.Select className="w-auto" value={order} onChange={e => setOrder(e.target.value)}>
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </Form.Select>
          {/* Botão para abrir modal de novo tópico */}
          <Button className="btn btn-primary ms-auto" onClick={handleOpenModal}>Criar novo comentário</Button>
        </Form>
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="g-4">
          {loading ? (
            <div className="text-center">A carregar...</div>
          ) : topics.length === 0 ? (
            <div className="text-center text-muted">Nenhum tópico encontrado.</div>
          ) : (
            topics.map(topic => (
              <Col md={4} key={topic.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <img src={topic.authorAvatar || '/default-avatar.png'} alt="avatar" className="rounded-circle me-2" width={36} height={36} />
                      <div>
                        <div className="fw-bold">{topic.authorName}</div>
                        <div className="text-muted small">{topic.category}</div>
                        <div className="h5 mb-2 mt-2">{topic.title}</div>
                      </div>
                    </div>
                    {topic.firstComment && (
                      <Card.Text className="fst-italic text-secondary">{topic.firstComment.content}</Card.Text>
                    )}
                    <Link to={`/forum/${topic.id}`} className="stretched-link"></Link>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">{topic.date ? new Date(topic.date).toLocaleDateString('pt-PT') : ''}</span>
                    <span className="text-muted small">{topic.firstComment && topic.firstComment.replies ? `${topic.firstComment.replies.length} respostas` : '0 respostas'}</span>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
      {/* Modal para criar novo tópico */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar novo comentário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            setCreating(true);
            setCreateError('');
            try {
              await api.post('/forum/comments', {
                topicId: selectedTopic?.value,
                content: newTopicContent,
                userId: user?.id
              });
              // 2. No onSubmit do Form do modal, após criar o comentário com sucesso:
              setShowModal(false);
              setSelectedTopic(null);
              setNewTopicContent('');
              setPendingMsg('Comentário enviado e está a aguardar aprovação de um gestor.');
              fetchTopics();
            } catch (err) {
              setCreateError('Erro ao criar comentário.');
            } finally {
              setCreating(false);
            }
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Tópico</Form.Label>
              <Select
                options={topicOptions}
                value={selectedTopic}
                onChange={opt => setSelectedTopic(opt)}
                placeholder="Escolha o tópico"
                isSearchable
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comentário</Form.Label>
              <Form.Control as="textarea" rows={3} value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} required />
            </Form.Group>
            {createError && <Alert variant="danger">{createError}</Alert>}
            <Button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'A criar...' : 'Criar comentário'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Forum; 