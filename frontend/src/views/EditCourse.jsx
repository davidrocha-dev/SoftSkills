import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { Button, Form, Container, Row, Col, Card, Accordion, Image, Table, Spinner, Alert } from 'react-bootstrap';
import { ChevronUp, ChevronDown, Trash, Plus, Dash, PlusCircle, Award } from 'react-bootstrap-icons';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import Loading from '../components/Loading';

const DEFAULT_COURSE_IMAGE = "https://res.cloudinary.com/dnhahua4h/image/upload/v1751910616/my-website/1751910615728-Como-Criar-um-Curso-Online-com-Qualidade-Profissional-Guia-Passo-a-Passo--1-.jpg";

export default function EditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sections, setSections] = useState([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [dateErrors, setDateErrors] = useState({ startDate: false, endDate: false });
    const [resourceTypes, setResourceTypes] = useState([]);
    const [collapsedResources, setCollapsedResources] = useState({});
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
    const [enrollmentsError, setEnrollmentsError] = useState('');
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('Todos');

    const isDefaultImage = (imageUrl) => {
        return imageUrl === DEFAULT_COURSE_IMAGE;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return '';
        }
    };

    const convertToISO = (dateString) => {
        if (!dateString) return '';
        
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = dateString.match(dateRegex);
        
        if (!match) {
            return dateString;
        }
        
        try {
            const [, day, month, year] = match;
            const date = new Date(year, month - 1, day);
            if (isNaN(date.getTime())) return '';
            return date.toISOString();
        } catch (error) {
            console.error('Erro ao converter data para ISO:', error);
            return '';
        }
    };

    const convertToDisplayFormat = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Erro ao converter data para formato de exibição:', error);
            return '';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Utilizador não autenticado. Redirecionando para login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            try {
                const [courseResponse, resourceTypesResponse] = await Promise.all([
                    api.get(`/cursos/${id}`),
                    api.get('/resource-types')
                ]);
                
                setCourse(courseResponse.data.course);
                setSections(courseResponse.data.course.sections || []);
                setResourceTypes(resourceTypesResponse.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError('Sessão expirada. Redirecionando para login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setError('Erro ao carregar dados');
                    console.error(err);
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                setEnrollmentsLoading(true);
                const { data } = await api.get(`/enrollments/curso/${id}`);
                setEnrollments(data);
            } catch (err) {
                setEnrollmentsError('Erro ao carregar inscrições');
            } finally {
                setEnrollmentsLoading(false);
            }
        };
        fetchEnrollments();
    }, [id]);

    useEffect(() => {
        const collapsed = {};
        sections.forEach((section, sectionIndex) => {
            (section.resources || []).forEach((_, resourceIndex) => {
                collapsed[`${sectionIndex}-${resourceIndex}`] = true;
            });
        });
        setCollapsedResources(collapsed);
    }, [sections.length]);

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'startDate' || name === 'endDate') {
            const isoDate = convertToISO(value);
            const isValid = isoDate !== '' || value === '';
            setDateErrors(prev => ({ ...prev, [name]: !isValid }));
            setCourse(prev => ({ ...prev, [name]: isoDate }));
        } else {
            setCourse(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSectionChange = (sectionIndex, field, ...args) => {
        const updatedSections = [...sections];
        if (field === 'resources') {
            const [resourceIndex, resourceField, resourceValue] = args;
            const updatedResources = [...(updatedSections[sectionIndex].resources || [])];
            updatedResources[resourceIndex] = {
                ...updatedResources[resourceIndex],
                [resourceField]: resourceValue
            };
            updatedSections[sectionIndex].resources = updatedResources;
        } else {
            updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], [field]: args[0] };
        }
        setSections(updatedSections);
    };

    const addSection = async () => {
        try {
            const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) : 0;
            const newOrder = maxOrder + 1;
            
            const newSection = {
                title: 'Nova Seção',
                order: newOrder,
                status: true,
                courseId: course?.id
            };
            const response = await api.post(`/cursos/${course.id}/sections`, newSection);
            setSections([...sections, { ...response.data, resources: [] }]);
        } catch (err) {
            setError('Erro ao criar seção');
            console.error('Erro ao criar seção:', err);
            if (err.response) {
                console.error('Resposta do backend:', err.response.data);
            }
        }
    };

    const addResource = (sectionIndex) => {
        const updatedSections = [...sections];
        const currentResources = updatedSections[sectionIndex].resources || [];
        const newOrder = currentResources.length + 1;
        
        updatedSections[sectionIndex].resources.push({
            title: 'Novo Recurso',
            typeId: 1,
            text: '',
            file: '',
            link: '',
            order: newOrder
        });
        setSections(updatedSections);
    };

    const handleResourceFileUpload = (sectionIndex, resourceIndex, fileUrl) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].resources[resourceIndex].file = fileUrl;
        setSections(updatedSections);
    };

    const handleResourceFileUploadError = (error) => {
        setError(`Erro no upload do ficheiro: ${error}`);
    };

    const removeSection = (index) => {
        const updatedSections = sections.filter((_, i) => i !== index);
        const reorderedSections = updatedSections
            .sort((a, b) => a.order - b.order)
            .map((section, idx) => ({
                ...section,
                order: idx + 1
            }));
        setSections(reorderedSections);
    };

    const moveSectionUp = (index) => {
        if (index === 0) return;
        
        const updatedSections = [...sections];
        const currentSection = updatedSections[index];
        const previousSection = updatedSections[index - 1];
        
        const tempOrder = currentSection.order;
        currentSection.order = previousSection.order;
        previousSection.order = tempOrder;

        updatedSections[index] = previousSection;
        updatedSections[index - 1] = currentSection;
        
        setSections(updatedSections);
    };

    const moveSectionDown = (index) => {
        if (index === sections.length - 1) return;
        
        const updatedSections = [...sections];
        const currentSection = updatedSections[index];
        const nextSection = updatedSections[index + 1];
        
        const tempOrder = currentSection.order;
        currentSection.order = nextSection.order;
        nextSection.order = tempOrder;
        
        updatedSections[index] = nextSection;
        updatedSections[index + 1] = currentSection;
        
        setSections(updatedSections);
    };

    const removeResource = (sectionIndex, resourceIndex) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].resources = updatedSections[sectionIndex].resources.filter(
            (_, i) => i !== resourceIndex
        );
        setSections(updatedSections);
    };

    const handleImageUpload = (imageUrl) => {
        if (isDefaultImage(imageUrl)) {
            setError('Não é possível usar a imagem padrão. Por favor, escolha outra imagem.');
            return;
        }
        
        if (imageUrl === course.image) {
            setNewImageUrl('');
        } else {
            setNewImageUrl(imageUrl);
        }
        
        setCourse(prev => ({ ...prev, image: imageUrl }));
    };

    const handleImageUploadError = (error) => {
        setError(`Erro no upload da imagem: ${error}`);
    };

    const handleRemoveImage = () => {
        if (isDefaultImage(course.image)) {
            return;
        }
        setCourse(prev => ({ ...prev, image: DEFAULT_COURSE_IMAGE }));
        setNewImageUrl('');
    };

    const toggleCollapse = (sectionIndex, resourceIndex) => {
        setCollapsedResources(prev => ({
            ...prev,
            [`${sectionIndex}-${resourceIndex}`]: !prev[`${sectionIndex}-${resourceIndex}`]
        }));
    };

    const moveResource = (sectionIndex, resourceIndex, direction) => {
        const updatedSections = [...sections];
        const resources = [...updatedSections[sectionIndex].resources];
        if (
            (direction === 'up' && resourceIndex === 0) ||
            (direction === 'down' && resourceIndex === resources.length - 1)
        ) return;
        const newIndex = direction === 'up' ? resourceIndex - 1 : resourceIndex + 1;
        [resources[resourceIndex], resources[newIndex]] = [resources[newIndex], resources[resourceIndex]];
        resources.forEach((res, idx) => { res.order = idx + 1; });
        updatedSections[sectionIndex].resources = resources;
        setSections(updatedSections);
    };

    const saveCourse = async () => {
        console.log('Sections antes de salvar:', sections);
        try {
            const {
                id: courseId,
                title,
                description,
                instructor,
                level,
                startDate,
                endDate,
                image,
                vacancies,
                courseType,
                visible,
                status,
                hours,
                topicId
            } = course;

            const orderedSections = sections
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((section, idx) => ({
                    ...section,
                    order: idx + 1
                }));

            const courseData = {
                id: courseId,
                title,
                description,
                instructor,
                level,
                startDate,
                endDate,
                image: isDefaultImage(image) || !image ? DEFAULT_COURSE_IMAGE : image,
                vacancies,
                courseType,
                visible,
                status,
                hours,
                topicId,
                sections: orderedSections.map(section => {
                    const sectionData = {
                        title: section.title,
                        order: section.order,
                        status: section.status,
                        resources: (section.resources || []).map(resource => {
                            const resourceData = {
                                title: resource.title,
                                typeId: resource.typeId || resource.type || 1,
                                text: resource.text || resource.content || '',
                                file: resource.file ?? "",
                                link: resource.link ?? "",
                                order: resource.order || 1
                            };
                            if (resource.id) resourceData.id = resource.id;
                            return resourceData;
                        })
                    };
                    if (section.id) sectionData.id = section.id;
                    return sectionData;
                })
            };

            console.log('Payload enviado para update:', courseData);
            await api.put(`/cursos/id/${id}`, courseData);
            console.log('Update concluído com sucesso');
            navigate(`/cursos/${id}`);
        } catch (err) {
            setError('Erro ao salvar curso');
            console.error('Erro ao salvar curso:', err);
            if (err.response) {
                console.error('Resposta do backend:', err.response.data);
            }
        }
    };

    if (loading) return <Loading />;
    if (error) return (
        <div className="alert alert-danger m-4" role="alert">
            <h4 className="alert-heading">Erro!</h4>
            <p>{error}</p>
            {error.includes('Redirecionando') && (
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            )}
        </div>
    );

    if (!course) {
        return (
            <div className="alert alert-warning m-4" role="alert">
                <h4 className="alert-heading">Aviso!</h4>
                <p>Dados do curso não encontrados.</p>
            </div>
        );
    }

    return (
        <>
            <Header />
                <Container fluid className="mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Row className="w-100 justify-content-center">
                    <Col md={8} className="mx-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3 w-100">
                        <h2 className="text-start mb-0">Editar Curso: {course.title}</h2>
                        <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={() => navigate(`/cursos/${id}/inscricoes`)}>
                            Ver Alunos
                        </Button>
                        <Button 
                            variant="outline-success" 
                            onClick={() => navigate(`/certificate-management/${id}`)}
                        >
                            <Award size={16} className="me-1" />
                            Emitir Certificados
                        </Button>
                        </div>
                    </div>

                        <Card className="mb-4">
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Título</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            value={course.title}
                                            onChange={handleCourseChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Descrição</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="description"
                                            value={course.description}
                                            onChange={handleCourseChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Imagem do Curso</Form.Label>
                                        <div className="mb-3">
                                            {course.image && !isDefaultImage(course.image) && (
                                                <div className="mb-2">
                                                    <div className="position-relative d-inline-block">
                                                        <Image 
                                                            src={course.image} 
                                                            alt="Imagem atual do curso" 
                                                            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                                                            className="border rounded"
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0"
                                                            style={{ transform: 'translate(50%, -50%)' }}
                                                            onClick={handleRemoveImage}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="border rounded p-3 bg-light">
                                                <FileUpload
                                                    onUploadSuccess={handleImageUpload}
                                                    onUploadError={handleImageUploadError}
                                                    uploadType="course-image"
                                                    acceptedFiles="image/*"
                                                />
                                            </div>
                                            {newImageUrl && newImageUrl !== course.image && (
                                                <div className="mt-2">
                                                    <Image 
                                                        src={newImageUrl} 
                                                        alt="Nova imagem do curso" 
                                                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                                                        className="border rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Data de Início</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="startDate"
                                                    placeholder="dd/mm/yyyy"
                                                    value={convertToDisplayFormat(course.startDate)}
                                                    onChange={handleCourseChange}
                                                    isInvalid={dateErrors.startDate}
                                                />
                                                {dateErrors.startDate && (
                                                    <Form.Control.Feedback type="invalid">
                                                        Formato inválido. Use dd/mm/yyyy
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Data de Término</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="endDate"
                                                    placeholder="dd/mm/yyyy"
                                                    value={convertToDisplayFormat(course.endDate)}
                                                    onChange={handleCourseChange}
                                                    isInvalid={dateErrors.endDate}
                                                />
                                                {dateErrors.endDate && (
                                                    <Form.Control.Feedback type="invalid">
                                                        Formato inválido. Use dd/mm/yyyy
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card> 

                        <h3 className="mb-3">Seções do Curso</h3>
                        <ul className="list-group mb-3">
                            {sections.length === 0 && <li className="list-group-item">Nenhuma seção criada ainda.</li>}
                            {sections
                                .sort((a, b) => a.order - b.order)
                                .map((section, idx) => (
                                <li key={section.id || idx} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3 d-flex gap-1">
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => moveSectionUp(idx)}
                                                disabled={idx === 0}
                                                title="Mover para cima"
                                                className="p-0 text-secondary"
                                            >
                                                <ChevronUp size={16} />
                                            </Button>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => moveSectionDown(idx)}
                                                disabled={idx === sections.length - 1}
                                                title="Mover para baixo"
                                                className="p-0 text-secondary"
                                            >
                                                <ChevronDown size={16} />
                                            </Button>
                                        </div>
                                        <span>
                                            <strong>{section.title}</strong> (Ordem: {section.order})
                                            {section.status ? <span className="badge bg-success ms-2">Ativa</span> : <span className="badge bg-secondary ms-2">Inativa</span>}
                                        </span>
                                    </div>
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        onClick={() => removeSection(idx)}
                                        title="Remover seção"
                                        className="p-0 text-danger"
                                    >
                                        <Trash size={16} />
                                    </Button>
                                </li>
                            ))}
                        </ul>

                        <Button variant="outline-success" className="mb-3" onClick={addSection}>
                            <Plus size={16} className="me-1" />
                            Adicionar Seção
                        </Button>

                        <Accordion>
                            {sections
                                .sort((a, b) => a.order - b.order)
                                .map((section, sectionIndex) => (
                                <Accordion.Item key={sectionIndex} eventKey={String(sectionIndex)}>
                                    <Accordion.Header>
                                        {section.title || `Seção ${sectionIndex + 1}`}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Título da Seção</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                                            />
                                        </Form.Group>

                                        <Form.Check
                                            type="switch"
                                            label="Ativa"
                                            checked={section.status}
                                            onChange={(e) => handleSectionChange(sectionIndex, 'status', e.target.checked)}
                                        />

                                        <h4 className="mt-4">Recursos</h4>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="mb-3"
                                            onClick={() => addResource(sectionIndex)}
                                        >
                                            <Plus size={16} className="me-1" />
                                            Adicionar Recurso
                                        </Button>

                                        {section.resources?.map((resource, resourceIndex) => (
                                            <Card key={resourceIndex} className="mb-3">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <h5>{resource.title || `Recurso ${resourceIndex + 1}`}</h5>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => moveResource(sectionIndex, resourceIndex, 'up')}
                                                                title="Mover para cima"
                                                                className="p-0"
                                                                disabled={resourceIndex === 0}
                                                            >
                                                                <ChevronUp size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => moveResource(sectionIndex, resourceIndex, 'down')}
                                                                title="Mover para baixo"
                                                                className="p-0"
                                                                disabled={resourceIndex === section.resources.length - 1}
                                                            >
                                                                <ChevronDown size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => toggleCollapse(sectionIndex, resourceIndex)}
                                                                title={collapsedResources[`${sectionIndex}-${resourceIndex}`] ? 'Expandir' : 'Minimizar'}
                                                                className="p-0"
                                                            >
                                                                {collapsedResources[`${sectionIndex}-${resourceIndex}`] ? <PlusCircle size={16} /> : <Dash size={16} />}
                                                            </Button>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => removeResource(sectionIndex, resourceIndex)}
                                                                title="Remover recurso"
                                                                className="p-0 text-danger"
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {!collapsedResources[`${sectionIndex}-${resourceIndex}`] && (
                                                        <>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Título do Recurso</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={resource.title}
                                                                    onChange={(e) => handleSectionChange(
                                                                        sectionIndex,
                                                                        'resources',
                                                                        resourceIndex,
                                                                        'title',
                                                                        e.target.value
                                                                    )}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Texto/Descrição</Form.Label>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={3}
                                                                    value={resource.text || resource.content || ''}
                                                                    onChange={(e) => handleSectionChange(
                                                                        sectionIndex,
                                                                        'resources',
                                                                        resourceIndex,
                                                                        'text',
                                                                        e.target.value
                                                                    )}
                                                                    placeholder="Digite o texto ou descrição do recurso..."
                                                                />
                                                            </Form.Group>
                                                            {!resource.id && (
                                                                <>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Tipo de Recurso</Form.Label>
                                                                        <div className="d-flex gap-2 align-items-end">
                                                                            <Form.Select
                                                                                value={resource.typeId || resource.type || 1}
                                                                                onChange={(e) => handleSectionChange(
                                                                                    sectionIndex,
                                                                                    'resources',
                                                                                    resourceIndex,
                                                                                    'typeId',
                                                                                    parseInt(e.target.value)
                                                                                )}
                                                                                className="flex-grow-1"
                                                                                disabled={!!resource.id}
                                                                            >
                                                                                {resourceTypes.map(type => (
                                                                                    <option key={type.id} value={type.id}>
                                                                                        {type.icon}
                                                                                    </option>
                                                                                ))}
                                                                            </Form.Select>
                                                                            {(resource.typeId === 1) && (
                                                                                <div className="border rounded p-2 bg-light">
                                                                                    <FileUpload
                                                                                        onUploadSuccess={(fileUrl) => handleResourceFileUpload(sectionIndex, resourceIndex, fileUrl)}
                                                                                        onUploadError={handleResourceFileUploadError}
                                                                                        uploadType="course-resource"
                                                                                        acceptedFiles="*"
                                                                                        buttonText="Upload"
                                                                                        buttonSize="sm"
                                                                                        disabled={!!resource.id}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </Form.Group>
                                                                    {(resource.typeId === 2 || resource.typeId === 3) && (
                                                                        <Form.Group className="mb-3">
                                                                            <Form.Label>{resource.typeId === 2 ? 'Link do Vídeo' : 'Link'}</Form.Label>
                                                                            <Form.Control
                                                                                type="url"
                                                                                value={resource.link || ''}
                                                                                onChange={(e) => handleSectionChange(
                                                                                    sectionIndex,
                                                                                    'resources',
                                                                                    resourceIndex,
                                                                                    'link',
                                                                                    e.target.value
                                                                                )}
                                                                                placeholder="https://..."
                                                                                disabled={!!resource.id}
                                                                            />
                                                                        </Form.Group>
                                                                    )}
                                                                    {resource.file && (
                                                                        <Form.Group className="mb-3">
                                                                            <Form.Label>Ficheiro Atual</Form.Label>
                                                                            <div className="border rounded p-2 bg-light">
                                                                                <small className="text-muted">{resource.file}</small>
                                                                            </div>
                                                                        </Form.Group>
                                                                    )}
                                                                </>
                                                            )} 
                                                            {resource.id && (resource.file || resource.link) && (
                                                                <div className="mb-2">
                                                                    <Form.Group className="mb-2">
                                                                        <Form.Label>Localização do recurso</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={resource.file || resource.link}
                                                                            readOnly
                                                                        />
                                                                    </Form.Group>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        onClick={() => window.open(resource.file || resource.link, '_blank')}
                                                                        title="Abrir ficheiro ou link em nova aba"
                                                                    >
                                                                        Ver recurso
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="primary" onClick={saveCourse}>
                                Salvar Alterações
                            </Button>
                        </div>
                        <div style={{ height: '60px' }} />
                    </Col>
                </Row>
            </Container>
        </>
    );
}
