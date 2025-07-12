import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);
  const [areas, setAreas] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/categorias')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Erro ao buscar categorias:', err));
  }, []);

  const handleCategoryHover = (catId) => {
    setHoveredCategory(catId);
    const cat = categories.find(c => c.id === catId);
    setAreas(cat?.areas || []);
    setHoveredArea(null);
    setTopics([]);
  };

  const handleAreaHover = async (areaId) => {
    try {
      const res = await api.get(`/topicos?areaId=${areaId}`);
      setTopics(res.data);
      setHoveredArea(areaId);
    } catch (err) {
      console.error('Erro ao buscar tópicos:', err);
    }
  };

  const navigateAndDispatch = (path, eventName, detail) => {
    navigate(path);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }, 150);
  };

  const handleCategoryClick = (categoryId) => {
    navigateAndDispatch('/dashboard', 'filterChange', { categoryId, areaId: null, topicId: null });
  };

  const handleAreaClick = (areaId) => {
    navigateAndDispatch('/dashboard', 'filterChange', { categoryId: null, areaId, topicId: null });
  };

  const handleTopicClick = (topicId) => {
    navigateAndDispatch('/dashboard', 'filterChange', { categoryId: null, areaId: null, topicId });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigateAndDispatch('/dashboard', 'searchCourses', { searchTerm: searchTerm.trim() });
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/dashboard');
    window.dispatchEvent(new CustomEvent('filterChange', {
      detail: { 
        categoryId: null, 
        areaId: null, 
        topicId: null 
      }
    }));
    window.dispatchEvent(new CustomEvent('searchCourses', {
      detail: { searchTerm: '' }
    }));
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link 
          className="navbar-brand fw-bold text-dark" 
          to="/dashboard"
          onClick={handleHomeClick}
        >
          <i className="bi bi-house-door me-2"></i>Início
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav me-auto">
            {categories.map(category => (
              <li
                key={category.id}
                className="nav-item dropdown"
                onMouseEnter={() => handleCategoryHover(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <span
                  className="nav-link dropdown-toggle d-flex align-items-center text-dark"
                  role="button"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <i className="bi bi-grid me-1"></i>
                  {category.description}
                </span>
                {hoveredCategory === category.id && (
                  <div
                    className="dropdown-menu show p-0 border shadow"
                    style={{ minWidth: '250px' }}
                  >
                    <div className="list-group list-group-flush">
                      {areas.map(area => (
                        <div
                          key={area.id}
                          className="list-group-item list-group-item-action p-0 bg-hover-light"
                          onMouseEnter={() => handleAreaHover(area.id)}
                        >
                          <div
                            className="d-flex justify-content-between align-items-center p-3 text-dark"
                            onClick={() => handleAreaClick(area.id)}
                          >
                            <span>
                              <i className="bi bi-folder me-2"></i>
                              {area.description}
                            </span>
                            <i className="bi bi-chevron-right"></i>
                          </div>
                          {hoveredArea === area.id && topics.length > 0 && (
                            <div
                              className="position-absolute start-100 top-0 h-100 bg-white shadow rounded-end"
                              style={{ minWidth: '250px', zIndex: 1000 }}
                            >
                              <div className="list-group list-group-flush">
                                {topics.map(topic => (
                                  <div
                                    key={topic.id}
                                    className="list-group-item list-group-item-action d-flex align-items-center p-3 text-dark bg-hover-light"
                                    onClick={() => handleTopicClick(topic.id)}
                                  >
                                    <i className="bi bi-file-earmark me-2"></i>
                                    {topic.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <form className="d-flex me-3" onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control border-dark"
                placeholder="Pesquisar curso..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-dark d-flex align-items-center justify-content-center" type="submit">
                <i className="bi bi-search me-1"></i>
                <span className="d-none d-md-inline">Pesquisar</span>
              </button>
            </div>
          </form>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center fw-bold text-dark" to="/forum">
                <i className="bi bi-chat-dots me-2"></i>Fórum
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;