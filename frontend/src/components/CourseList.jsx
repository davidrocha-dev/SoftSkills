// src/components/CourseList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/authService';
import { FaSearch, FaPlus, FaArrowLeft, FaTrash, FaEdit, FaCalendarAlt, FaUserTie, FaGraduationCap } from 'react-icons/fa';
import Header from './Header';
import { Card, Button, Form, InputGroup, Modal, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Typeahead } from 'react-bootstrap-typeahead'; // Adicionado
import 'react-bootstrap-typeahead/css/Typeahead.css'; // Estilos necessários

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [topics, setTopics] = useState([]);
  const { selectedRole } = useAuth();
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    level: '',
    startDate: '',
    endDate: '',
    vacancies: 0,
    instructor: '',
    status: true,
    visible: true,
    topicId: '',
    hours: 0,
    courseType: true
  });
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    level: '',
    startDate: '',
    endDate: '',
    vacancies: 10,
    instructor: '',
    status: true,
    visible: true,
    topicId: '',
    hours: 0,
    courseType: true
  });

   const today = useMemo(() => {
   const d = new Date(); d.setHours(0,0,0,0);return d; }, [])

    const canEditVacancies = useMemo(() => {
      if (!editData.startDate) return false;
      const start = new Date(editData.startDate);
      start.setHours(0,0,0,0);
      return start > today;
    }, [editData.startDate, today]);

  // Estados para upload de imagem
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [createImageFile, setCreateImageFile] = useState(null);
  const [createImagePreview, setCreateImagePreview] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/cursos');
        
        // Ordenar cursos por ID ascendente (menor para maior)
        const sortedCourses = [...response.data].sort((a, b) => a.id - b.id);
        setCourses(sortedCourses);
        
        const topicsRes = await api.get('/topicos');
        setTopics(topicsRes.data);

        const usersRes = await api.get('/users', { headers: { 'x-selected-role': selectedRole } });
        setInstructors(usersRes.data.users);
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEditClick = course => {
    setSelectedCourse(course);
    setEditData({
      title: course.title,
      description: course.description,
      level: course.level,
      startDate: course.startDate.slice(0, 10),
      endDate: course.endDate.slice(0, 10),
      vacancies: course.vacancies || 0,
      instructor: course.instructor || '',
      status: course.status,
      visible: course.visible,
      topicId: course.topicId || '',
      hours: course.hours || 0,
      courseType: course.courseType
    });
    // Definir a pré-visualização da imagem existente, se houver
    setEditImagePreview(course.image || null);
    setEditImageFile(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleChange = e => {
    const { name, value, type: inputType, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }))
     setEditData(prev => ({
     ...prev,
     [name]: type === 'checkbox' ? checked : value
   }));;
  };

  // Função para fazer upload da imagem
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-selected-role': selectedRole
        }
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error('Falha no upload da imagem');
    }
  };

  const handleEditImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de ficheiro
      if (!file.type.startsWith('image/')) {
        showResult('Por favor, selecione apenas ficheiros de imagem (JPG, PNG, GIF, etc.)', false);
        return;
      }
      
      // Validar tamanho (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showResult('O ficheiro é muito grande. Tamanho máximo: 5MB', false);
        return;
      }
      
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const isChanged = Object.keys(editData).some(key => {
      if (!(key in selectedCourse)) return false;
      
      const originalValue = selectedCourse[key];
      const newValue = editData[key];
      
      if (key === 'startDate' || key === 'endDate') {
        const originalDate = new Date(originalValue).toISOString().split('T')[0];
        const newDate = newValue;
        return originalDate !== newDate;
      }
      
      if (typeof originalValue === 'boolean' || typeof originalValue === 'number') {
        return originalValue.toString() !== newValue.toString();
      }
      
      return originalValue !== newValue;
    });

    // Verificar se a imagem foi alterada
    const imageChanged = editImageFile !== null;

    if (!isChanged && !imageChanged) {
      showResult('Nenhuma alteração foi feita.', false);
      return;
    }

    if (parseInt(editData.hours, 10) <= 0) {
      showResult('Horas devem ser maiores que zero.', false);
      return;
    }

    if (new Date(editData.startDate) > new Date(editData.endDate)) {
      showResult('A data de início não pode ser posterior à data de fim.', false);
      return;
    }

    const enrolledCount = selectedCourse?.enrollments?.length || 0;
    if (parseInt(editData.vacancies, 10) < enrolledCount) {
      showResult(`Vagas não podem ser inferiores a inscrições (${enrolledCount}).`, false);
      return;
    }
    
    try {
      let imageUrl = selectedCourse.image || '';
      if (editImageFile) {
        try {
          imageUrl = await uploadImage(editImageFile);
        } catch (error) {
          showResult('Erro ao fazer upload da imagem. ' + error.message, false);
          return;
        }
      }

      // Preparar os dados para envio, incluindo a imagem
      const updatedEditData = {
        ...editData,
        image: imageUrl
      };

      const response = await api.put(`/cursos/id/${selectedCourse.id}`, updatedEditData, { 
        headers: { 'x-selected-role': selectedRole } 
      });
      
      // Atualizar mantendo a ordem
      setCourses(prev => {
        const updatedCourses = prev.map(c => 
          c.id === selectedCourse.id ? response.data : c
        );
        return updatedCourses.sort((a, b) => a.id - b.id);
      });
      
      showResult('Curso atualizado com sucesso!', true);
      
      setTimeout(() => {
        setShowModal(false);
        setSelectedCourse(null);
        setEditImageFile(null);
        setEditImagePreview(null);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      showResult('Não foi possível atualizar o curso. Tente novamente.', false);
    }
  };

  const showResult = (message, success) => {
    setResultMessage(message);
    setIsSuccess(success);
    setShowResultModal(true);
    
    setTimeout(() => {
      setShowResultModal(false);
    }, 3000);
  };

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      await api.delete(`/cursos/${courseToDelete.id}`, { 
        headers: { 'x-selected-role': selectedRole } 
      });
      
      setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
      closeDeleteModal();
      showResult('Curso excluído com sucesso!', true);
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      showResult('Não foi possível excluir o curso. Tente novamente.', false);
    }
  };

  const openCreateModal = () => {
    setCreateData({
      title: '',
      description: '',
      level: '',
      startDate: '',
      endDate: '',
      vacancies: 10,
      instructor: '',
      status: true,
      visible: true,
      topicId: '',
      hours: 0,
      courseType: true
    });
    setCreateImageFile(null);
    setCreateImagePreview(null);
    setShowCreateModal(true);
  };

  const handleCreateChange = e => {
    const { name, value, type, checked } = e.target;
    setCreateData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de ficheiro
      if (!file.type.startsWith('image/')) {
        showResult('Por favor, selecione apenas ficheiros de imagem (JPG, PNG, GIF, etc.)', false);
        return;
      }
      
      // Validar tamanho (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showResult('O ficheiro é muito grande. Tamanho máximo: 5MB', false);
        return;
      }
      
      setCreateImageFile(file);
      setCreateImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!createData.title || !createData.description || !createData.topicId || !createData.level) {
      showResult('Preencha todos os campos obrigatórios.', false);
      return;
    }

    if (parseInt(createData.hours, 10) <= 0) {
      showResult('Horas devem ser maiores que zero.', false);
      return;
    }

    if (new Date(createData.startDate) > new Date(createData.endDate)) {
      showResult('A data de início não pode ser posterior à data de fim.', false);
      return;
    }

    try {
      let imageUrl = 'https://res.cloudinary.com/dnhahua4h/image/upload/v1751910616/my-website/1751910615728-Como-Criar-um-Curso-Online-com-Qualidade-Profissional-Guia-Passo-a-Passo--1-.jpg';
      if (createImageFile) {
        try {
          imageUrl = await uploadImage(createImageFile);
        } catch (error) {
          showResult('Erro ao fazer upload da imagem. ' + error.message, false);
          return;
        }
      }

      const createPayload = {
        ...createData,
        image: imageUrl
      };

      const response = await api.post('/cursos', createPayload, {
        headers: { 'x-selected-role': selectedRole }
      });
      
      // Adicionar novo curso no final da lista
      setCourses(prev => {
        const newCourses = [...prev, response.data];
        return newCourses.sort((a, b) => a.id - b.id);
      });
      
      showResult('Curso criado com sucesso!', true);
      
      setTimeout(() => {
        setShowCreateModal(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      const errorMsg = error.response?.data?.message || 
                      'Não foi possível criar o curso. Tente novamente.';
      showResult(errorMsg, false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const filteredCourses = courses.filter(course => {
    const titleMatch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const typeName = course.courseType ? 'Síncrono' : 'Assíncrono';
    const typeMatch = type === 'Todos' || typeName === type;
    const statusMatch =
      status === 'Todos' ||
      (status === 'Ativo' ? course.status : !course.status);
    return titleMatch && typeMatch && statusMatch;
  });

  return (
    <>
      <Header />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft className="me-2" />
            Voltar ao Dashboard
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold text-primary">Lista de Cursos</h2>
          <Button 
            variant="primary" 
            onClick={openCreateModal}
            className="d-flex align-items-center shadow-sm"
          >
            <FaPlus className="me-2" />
            Criar Novo Curso
          </Button>
        </div>

        <Card className="mb-4 shadow-sm border-0">
          <Card.Body className="py-3">
            <Form onSubmit={e => e.preventDefault()}>
              <div className="row g-3">
                <div className="col-lg-5">
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Pesquisar por nome do curso"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="border-start-0 py-2"
                    />
                  </InputGroup>
                </div>
                <div className="col-lg-3">
                  <Form.Select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="form-select py-2"
                  >
                    <option value="Todos">Todos os Tipos</option>
                    <option value="Síncrono">Síncrono</option>
                    <option value="Assíncrono">Assíncrono</option>
                  </Form.Select>
                </div>
                <div className="col-lg-3">
                  <Form.Select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="form-select py-2"
                  >
                    <option value="Todos">Todos os Estados</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </Form.Select>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <div className="row">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => {
              const instructor = instructors.find(inst => inst.workerNumber === course.instructor);
              const instructorName = instructor ? `${instructor.workerNumber} - ${instructor.name}` : 'Sem instrutor';

              return (
                <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={course.id}>
                  <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden transition-all">
                    <div className="position-relative">
                      <div 
                        className="bg-image-placeholder"
                        style={{ 
                          height: '180px',
                          backgroundImage: `url(${course.image || '/default-image.jpg'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="position-absolute top-0 end-0 p-2">
                          <span className={`badge rounded-pill ${course.status ? 'bg-success' : 'bg-danger'}`}>
                            {course.status ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column pb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0 fw-bold text-truncate" style={{ maxWidth: '70%' }}>
                          {course.title}
                        </Card.Title>
                        <Badge bg={course.courseType ? 'info' : 'secondary'} className="fs-6 rounded-pill">
                          {course.courseType ? 'Síncrono' : 'Assíncrono'}
                        </Badge>
                      </div>
                      
                      <Card.Text className="text-muted mb-3 flex-grow-1" style={{ minHeight: '60px' }}>
                        {course.description.length > 100 
                          ? `${course.description.substring(0, 100)}...` 
                          : course.description}
                      </Card.Text>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted mb-1">
                          <FaCalendarAlt className="me-2" />
                          <small>
                            {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <FaUserTie className="me-2" />
                          <small className="text-truncate" style={{ maxWidth: '200px' }}>{instructorName}</small>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                        <div>
                          <Badge bg="light" text="dark" className="me-1 rounded-pill">
                            <FaGraduationCap className="me-1" />
                            {course.enrollments?.length || 0}/{course.vacancies}
                          </Badge>
                          <Badge bg={course.visible ? 'primary' : 'secondary'} className="rounded-pill">
                            {course.visible ? 'Visível' : 'Oculto'}
                          </Badge>
                        </div>
                        <div className="d-flex">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2 p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => handleEditClick(course)}
                          >
                            <FaEdit size={14} />
                          </Button>
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => confirmDelete(course)}
                          >
                            <FaTrash size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <Card className="text-center p-5 border-0 shadow-sm rounded-4 bg-light">
                <Card.Body>
                  <div className="display-5 text-muted mb-3">📚</div>
                  <h4 className="text-muted mb-3">Nenhum curso encontrado</h4>
                  <p className="text-muted mb-4">
                    Tente ajustar os filtros ou criar um novo curso
                  </p>
                  <Button 
                    variant="primary"
                    className="px-4 py-2"
                    onClick={openCreateModal}
                  >
                    <FaPlus className="me-2" />
                    Criar Novo Curso
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>

        <Modal show={showModal} onHide={handleClose} centered size="lg">
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">Editar Curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Título</Form.Label>
                    <Form.Control
                      name="title"
                      value={editData.title}
                      onChange={handleChange}
                      className="border-2"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tópico</Form.Label>
                    {/* Substituído por Typeahead */}
                    <Typeahead
                      id="topic-edit"
                      labelKey={option => `${option.id} - ${option.description}`}
                      options={topics}
                      selected={topics.filter(topic => topic.id === editData.topicId)}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          setEditData(prev => ({ ...prev, topicId: selected[0].id }));
                        } else {
                          setEditData(prev => ({ ...prev, topicId: '' }));
                        }
                      }}
                      placeholder="Selecione um tópico"
                      className="border-2"
                    />
                  </Form.Group>
                </div>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={editData.description}
                  onChange={handleChange}
                  className="border-2"
                />
              </Form.Group>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Nível</Form.Label>
                    <Form.Select
                      name="level"
                      value={editData.level}
                      onChange={handleChange}
                      className="border-2"
                    >
                      <option value="" disabled>Selecione um nível</option>
                      {['Básico', 'Intermédio', 'Avançado'].map(lvl => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Horas</Form.Label>
                    <Form.Control
                      type="number"
                      name="hours"
                      value={editData.hours}
                      min={1}
                      onChange={handleChange}
                      className="border-2"
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Data Início</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={editData.startDate}
                      onChange={handleChange}
                      max={editData.endDate} 
                      className="border-2"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Data Fim</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={editData.endDate}
                      onChange={handleChange}
                      min={editData.startDate}
                      className="border-2"
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Vagas</Form.Label>
                    <Form.Control
                      type="number"
                      name="vacancies"
                      value={editData.vacancies}
                      onChange={handleChange}
                      className="border-2"
                      disabled={!canEditVacancies}
                    />
                    <Form.Text className="text-muted">
                      Inscrições atuais: {selectedCourse?.enrollments?.length || 0}
                    </Form.Text>
                    {!canEditVacancies && (
                      <Form.Text className="text-danger d-block">
                        Só é possível editar as vagas para cursos que ainda não começaram.
                      </Form.Text>
                    )}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Instrutor</Form.Label>
                    {/* Substituído por Typeahead */}
                    <Typeahead
                      id="instructor-edit"
                      labelKey={option => `${option.workerNumber} - ${option.name}`}
                      options={instructors.filter(inst => {
                        if (editData.courseType) {
                          return inst.primaryRole === 'formador';
                        } else {
                          return inst.primaryRole === 'gestor';
                        }
                      })}
                      selected={instructors.filter(inst => inst.workerNumber === editData.instructor)}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          setEditData(prev => ({ ...prev, instructor: selected[0].workerNumber }));
                        } else {
                          setEditData(prev => ({ ...prev, instructor: '' }));
                        }
                      }}
                      placeholder="Selecione um instrutor"
                      className="border-2"
                    />
                  </Form.Group>
                </div>
              </div>
              
              {/* Campo para upload de imagem */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Imagem do Curso</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="border-2"
                />
              </Form.Group>
              {editImagePreview && (
                <div className="mt-2">
                  <img 
                    src={editImagePreview} 
                    alt="Preview" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }} 
                  />
                  <div className="text-muted small mt-1">
                    Pré-visualização da nova imagem
                  </div>
                </div>
              )}
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Visível"
                  name="visible"
                  checked={editData.visible}
                  onChange={handleChange}
                  className="fw-medium"
                />
              </Form.Group>

              <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Ativo"
                name="status"
                checked={editData.status}
                onChange={handleChange}
                className="fw-medium"
              />
            </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar Alterações
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">Criar Novo Curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Título *</Form.Label>
                    <Form.Control
                      name="title"
                      value={createData.title}
                      onChange={handleCreateChange}
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tópico *</Form.Label>
                    {/* Substituído por Typeahead */}
                    <Typeahead
                      id="topic-create"
                      labelKey={option => `${option.id} - ${option.description}`}
                      options={topics}
                      selected={topics.filter(topic => topic.id === createData.topicId)}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          setCreateData(prev => ({ ...prev, topicId: selected[0].id }));
                        } else {
                          setCreateData(prev => ({ ...prev, topicId: '' }));
                        }
                      }}
                      placeholder="Selecione um tópico"
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Descrição *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={createData.description}
                  onChange={handleCreateChange}
                  className="border-2"
                  required
                />
              </Form.Group>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Nível *</Form.Label>
                    <Form.Select
                      name="level"
                      value={createData.level}
                      onChange={handleCreateChange}
                      className="border-2"
                      required
                    >
                      <option value="" disabled>Selecione um nível</option>
                      {['Básico', 'Intermédio', 'Avançado'].map(lvl => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Horas *</Form.Label>
                    <Form.Control
                      type="number"
                      name="hours"
                      value={createData.hours}
                      min={1}
                      onChange={handleCreateChange}
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Data Início *</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={createData.startDate}
                      onChange={handleCreateChange}
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Data Fim *</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={createData.endDate}
                      onChange={handleCreateChange}
                      min={createData.startDate}
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Vagas *</Form.Label>
                    <Form.Control
                      type="number"
                      name="vacancies"
                      value={createData.vacancies}
                      min={1}
                      onChange={handleCreateChange}
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Instrutor *</Form.Label>
                    {/* Substituído por Typeahead */}
                    <Typeahead
                      id="instructor-create"
                      labelKey={option => `${option.workerNumber} - ${option.name}`}
                      options={instructors.filter(inst => {
                        if (createData.courseType) {
                          return inst.primaryRole === 'formador';
                        } else {
                          return inst.primaryRole === 'gestor';
                        }
                      })}
                      selected={instructors.filter(inst => inst.workerNumber === createData.instructor)}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          setCreateData(prev => ({ ...prev, instructor: selected[0].workerNumber }));
                        } else {
                          setCreateData(prev => ({ ...prev, instructor: '' }));
                        }
                      }}
                      placeholder="Selecione um instrutor"
                      className="border-2"
                      required
                    />
                  </Form.Group>
                </div>
              </div>
              
              {/* Campo para upload de imagem na criação */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Imagem do Curso</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleCreateImageChange}
                  className="border-2"
                />
              </Form.Group>
              {createImagePreview && (
                <div className="mt-2">
                  <img 
                    src={createImagePreview} 
                    alt="Preview" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }} 
                  />
                  <div className="text-muted small mt-1">
                    Pré-visualização da imagem
                  </div>
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tipo de Curso</Form.Label>
                    <Form.Check
                      type="switch"
                      id="courseTypeSwitch"
                      label={createData.courseType ? 'Síncrono' : 'Assíncrono'}
                      name="courseType"
                      checked={createData.courseType}
                      onChange={handleCreateChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Visibilidade</Form.Label>
                    <Form.Check
                      type="switch"
                      id="visibleSwitch"
                      label="Visível"
                      name="visible"
                      checked={createData.visible}
                      onChange={handleCreateChange}
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Criar Curso
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal 
          show={showResultModal} 
          onHide={() => setShowResultModal(false)}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton className={isSuccess ? "bg-success text-white" : "bg-danger text-white"}>
            <Modal.Title>
              {isSuccess ? 'Sucesso!' : 'Erro'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{resultMessage}</p>
          </Modal.Body>
        </Modal>

        <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Exclusão</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem certeza que deseja excluir o curso <strong>{courseToDelete?.title}</strong>?</p>
            <p className="text-danger">Esta ação não pode ser desfeita.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Sim, Excluir
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default CourseList;