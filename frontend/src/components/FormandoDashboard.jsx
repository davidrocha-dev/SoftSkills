import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CoursesCarousel from '../components/CoursesCarousel';
import EnrolledCoursesCarousel from '../components/EnrolledCoursesCarousel';
import { Alert, Button, Spinner, Badge } from 'react-bootstrap';
import { api } from '../services/authService';

const FormandoDashboard = () => {
  const { user, selectedRole } = useAuth();

  const [filters, setFilters] = useState({
    categoryId: null,
    areaId: null,
    topicId: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const hasFilters = Boolean(
    filters.categoryId ||
    filters.areaId ||
    filters.topicId ||
    searchTerm
  );

  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);

  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, areaRes, topicRes] = await Promise.all([
          api.get('/categorias', { headers: { 'x-selected-role': selectedRole } }),
          api.get('/areas',      { headers: { 'x-selected-role': selectedRole } }),
          api.get('/topicos',    { headers: { 'x-selected-role': selectedRole } })
        ]);
        setCategories(catRes.data);
        setAreas(areaRes.data);
        setTopics(topicRes.data);
      } catch (err) {
        console.error('Erro ao carregar metadados:', err);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [selectedRole]);

  useEffect(() => {
    const onFilterChange = e => {
      setFilters(prev => ({ ...prev, ...e.detail }));
      setSearchTerm('');
    };
    const onSearch = e => {
      setSearchTerm(e.detail.searchTerm);
      setFilters({ categoryId: null, areaId: null, topicId: null });
    };
    window.addEventListener('filterChange', onFilterChange);
    window.addEventListener('searchCourses', onSearch);
    return () => {
      window.removeEventListener('filterChange', onFilterChange);
      window.removeEventListener('searchCourses', onSearch);
    };
  }, []);

  useEffect(() => {
    if (loadingMeta) return;
    const list = [];
    const findName = (arr, id) => arr.find(x => x.id === id)?.description || `ID:${id}`;
    if (filters.categoryId) list.push({ type:'Categoria', id:filters.categoryId, name:findName(categories, filters.categoryId) });
    if (filters.areaId)     list.push({ type:'Área',      id:filters.areaId,     name:findName(areas, filters.areaId) });
    if (filters.topicId)    list.push({ type:'Tópico',    id:filters.topicId,    name:findName(topics, filters.topicId) });
    if (searchTerm)         list.push({ type:'Pesquisa',  id:null,               name:searchTerm });
    setActiveFilters(list);
  }, [filters, searchTerm, categories, areas, topics, loadingMeta]);

  useEffect(() => {
    if (!hasFilters) return;
    (async () => {
      setLoadingFiltered(true);
      try {
        const params = new URLSearchParams();
        if (filters.categoryId) params.append('categoriaId', filters.categoryId);
        if (filters.areaId)     params.append('areaId', filters.areaId);
        if (filters.topicId)    params.append('topicoId', filters.topicId);
        if (searchTerm)         params.append('search', searchTerm);
        const res = await api.get(`/cursos/available?${params}`, {
          headers: { 'x-selected-role': selectedRole }
        });
        setFilteredCourses(res.data);
      } catch (err) {
        console.error('Erro ao buscar cursos filtrados:', err);
      } finally {
        setLoadingFiltered(false);
      }
    })();
  }, [filters, searchTerm, hasFilters, selectedRole]);

  useEffect(() => {
    (async () => {
      setLoadingEnrolled(true);
      try {
        const res = await api.get(`/enrollments/enrolled/${user.id}`, {
          headers: { 'x-selected-role': selectedRole }
        });
        const ids = res.data.courseIds || [];
        const courses = await Promise.all(
          ids.map(id =>
            api.get(`/cursos/${id}`, { headers: { 'x-selected-role': selectedRole } })
              .then(r => r.data.course)
              .catch(() => null)
          )
        );
        setEnrolledCourses(courses.filter(Boolean));
      } catch (err) {
        console.error('Erro ao buscar cursos inscritos:', err);
      } finally {
        setLoadingEnrolled(false);
      }
    })();
  }, [user.id, selectedRole]);

  const clearFilter = type => {
    if (type === 'Pesquisa') setSearchTerm('');
    else setFilters(prev => ({ ...prev, [`${type.toLowerCase()}Id`]: null }));
  };
  const clearAllFilters = () => {
    setFilters({ categoryId:null, areaId:null, topicId:null });
    setSearchTerm('');
  };

  return (
    <div className="container py-4">
      <div className="bg-primary bg-gradient text-white rounded-3 p-4 mb-5 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h2 mb-0">Bem-vindo, {user?.name}!</h1>
          <i className="bi bi-person-circle text-white" style={{ fontSize: '3rem' }} />
        </div>
      </div>

      {!hasFilters && (
        <div className="card border-0 shadow mb-5">
          <div className="card-header bg-white py-3">
            <h2 className="h4 mb-0">
              <i className="bi bi-journal-bookmark-fill text-primary me-2" />
              Os Meus Cursos
            </h2>
          </div>
          <div className="card-body p-4">
            {loadingEnrolled ? (
              <div className="text-center"><Spinner /></div>
            ) : enrolledCourses.length ? (
              <EnrolledCoursesCarousel courses={enrolledCourses} />
            ) : (
              <Alert variant="info">Ainda não está inscrito em nenhum curso.</Alert>
            )}
          </div>
        </div>
      )}

      {hasFilters && (
        <div className="card border-0 shadow mb-5">
          <div className="card-header bg-white py-3 d-flex justify-content-between">
            <div>
              <h2 className="h4 mb-2">
                <i className="bi bi-funnel-fill text-info me-2" />
                Cursos Filtrados
              </h2>
              <div className="d-flex flex-wrap gap-2">
                {activeFilters.map((f,i) => (
                  <Badge key={i} bg="primary" pill className="d-flex align-items-center">
                    {f.type}: {f.name}
                    <button
                      className="btn btn-link btn-sm text-white p-0 ms-2"
                      onClick={() => clearFilter(f.type)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="outline-primary" size="sm" onClick={clearAllFilters}>
              Limpar Todos
            </Button>
          </div>
          <div className="card-body p-4">
            {loadingFiltered ? (
              <div className="text-center"><Spinner /></div>
            ) : filteredCourses.length ? (
              <CoursesCarousel courses={filteredCourses} />
            ) : (
              <Alert variant="warning">Nenhum curso encontrado com esses filtros.</Alert>
            )}
          </div>
        </div>
      )}

      {!hasFilters && (
        <div className="card border-0 shadow">
          <div className="card-header bg-white py-3">
            <h2 className="h4 mb-0">
              <i className="bi bi-compass-fill text-success me-2" />
              Descubra Novos Cursos
            </h2>
          </div>
          <div className="card-body p-4">
            <CoursesCarousel />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormandoDashboard;
