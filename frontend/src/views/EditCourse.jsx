import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { Button, Form, Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import Header from '../components/Header';

export default function EditCourse() {
    const { id } = useParams();  // Obter o ID do curso da URL
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sections, setSections] = useState([]);

    // Carregar os dados do curso
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/cursos/${id}`);
                setCourse(response.data.course);
                setSections(response.data.course.sections || []);
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar curso');
                setLoading(false);
                console.error(err);
            }
        };

        fetchCourse();
    }, [id]);

    // Função para atualizar os dados do curso
    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setCourse(prev => ({ ...prev, [name]: value }));
    };

    // Função para atualizar as seções e recursos aninhados
    const handleSectionChange = (sectionIndex, field, ...args) => {
        const updatedSections = [...sections];
        if (field === 'resources') {
            // Atualizar campo de um recurso específico
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

    // Adicionar nova seção (POST imediato para o backend)
    const addSection = async () => {
        try {
            const newSection = {
                title: 'Nova Seção',
                order: sections.length + 1,
                status: true,
                courseId: course?.id
            };
            const response = await api.post(`/cursos/${course.id}/sections`, newSection);
            // O backend deve devolver a seção criada já com id
            setSections([...sections, { ...response.data, resources: [] }]);
        } catch (err) {
            setError('Erro ao criar seção');
            console.error('Erro ao criar seção:', err);
            if (err.response) {
                console.error('Resposta do backend:', err.response.data);
            }
        }
    };

    // Adicionar recurso à seção
    const addResource = (sectionIndex) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].resources.push({
            title: 'Novo Recurso',
            typeId: 1, // valor default, pode ser alterado pelo utilizador
            text: '',
            file: '',
            link: '',
            order: updatedSections[sectionIndex].resources.length + 1
        });
        setSections(updatedSections);
    };

    // Remover seção
    const removeSection = (index) => {
        const updatedSections = sections.filter((_, i) => i !== index);
        setSections(updatedSections);
    };

    // Remover recurso
    const removeResource = (sectionIndex, resourceIndex) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].resources = updatedSections[sectionIndex].resources.filter(
            (_, i) => i !== resourceIndex
        );
        setSections(updatedSections);
    };

    // Salvar as alterações
    const saveCourse = async () => {
        try {
            // Apenas os campos necessários para o backend
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

            const courseData = {
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
                topicId,
                sections: sections.map(section => {
                    const sectionData = {
                        title: section.title,
                        order: section.order,
                        status: section.status,
                        resources: (section.resources || []).map(resource => {
                            const resourceData = {
                                title: resource.title,
                                typeId: resource.typeId || resource.type || 1,
                                text: resource.text || resource.content || '',
                                file: resource.file || '',
                                link: resource.link || '',
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

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>{error}</div>;

    return (
        <>
            <Header />
            <Container className="mt-4">
                <h2>Editar Curso: {course.title}</h2>

                {/* Formulário do curso */}
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

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Data de Início</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="startDate"
                                            value={new Date(course.startDate).toISOString().split('T')[0]}
                                            onChange={handleCourseChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Data de Término</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="endDate"
                                            value={new Date(course.endDate).toISOString().split('T')[0]}
                                            onChange={handleCourseChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Seções do curso */}
                <h3 className="mb-3">Seções do Curso</h3>
                {/* Lista simples das seções já criadas */}
                <ul className="list-group mb-3">
                    {sections.length === 0 && <li className="list-group-item">Nenhuma seção criada ainda.</li>}
                    {sections.map((section, idx) => (
                        <li key={section.id || idx} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <strong>{section.title}</strong> (Ordem: {section.order})
                                {section.status ? <span className="badge bg-success ms-2">Ativa</span> : <span className="badge bg-secondary ms-2">Inativa</span>}
                            </span>
                            <Button variant="outline-danger" size="sm" onClick={() => removeSection(idx)}>
                                Remover
                            </Button>
                        </li>
                    ))}
                </ul>

                <Button variant="success" className="mb-3" onClick={addSection}>
                    Adicionar Seção
                </Button>

                <Accordion defaultActiveKey="0">
                    {sections.map((section, sectionIndex) => (
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Ordem</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={section.order}
                                        onChange={(e) => handleSectionChange(sectionIndex, 'order', parseInt(e.target.value))}
                                    />
                                </Form.Group>

                                <Form.Check
                                    type="switch"
                                    label="Ativa"
                                    checked={section.status}
                                    onChange={(e) => handleSectionChange(sectionIndex, 'status', e.target.checked)}
                                />

                                {/* Recursos da seção */}
                                <h4 className="mt-4">Recursos</h4>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="mb-3"
                                    onClick={() => addResource(sectionIndex)}
                                >
                                    Adicionar Recurso
                                </Button>

                                {section.resources?.map((resource, resourceIndex) => (
                                    <Card key={resourceIndex} className="mb-3">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5>{resource.title || `Recurso ${resourceIndex + 1}`}</h5>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => removeResource(sectionIndex, resourceIndex)}
                                                >
                                                    Remover
                                                </Button>
                                            </div>

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
                                                <Form.Label>Texto</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={resource.text || resource.content || ''}
                                                    onChange={(e) => handleSectionChange(
                                                        sectionIndex,
                                                        'resources',
                                                        resourceIndex,
                                                        'text',
                                                        e.target.value
                                                    )}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Link</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={resource.link || ''}
                                                    onChange={(e) => handleSectionChange(
                                                        sectionIndex,
                                                        'resources',
                                                        resourceIndex,
                                                        'link',
                                                        e.target.value
                                                    )}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Ficheiro</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={resource.file || ''}
                                                    onChange={(e) => handleSectionChange(
                                                        sectionIndex,
                                                        'resources',
                                                        resourceIndex,
                                                        'file',
                                                        e.target.value
                                                    )}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tipo de Recurso (typeId)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={resource.typeId || resource.type || 1}
                                                    onChange={(e) => handleSectionChange(
                                                        sectionIndex,
                                                        'resources',
                                                        resourceIndex,
                                                        'typeId',
                                                        parseInt(e.target.value)
                                                    )}
                                                />
                                            </Form.Group>
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
            </Container>
        </>
    );
}
