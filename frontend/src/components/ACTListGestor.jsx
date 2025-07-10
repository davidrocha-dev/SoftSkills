import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Header from './Header';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { api } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'; // Adicionado
import 'react-bootstrap-typeahead/css/Typeahead.css'; // Adicionado

const ACTListGestor = () => {
  const { selectedRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState('categorias');
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);

  // Estados para os modais de resultado e confirmação
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const titles = {
    categorias: { card: 'Gestão Categorias', cols: ['ID', 'Descrição', 'Ações'] },
    areas:      { card: 'Gestão Áreas',      cols: ['ID', 'Descrição', 'Categoria', 'Ações'] },
    topicos:    { card: 'Gestão Tópicos',    cols: ['ID', 'Título', 'Área', 'Ações'] }
  };

  useEffect(() => {
    const path = location.pathname.replace('/', '');
    setView(['categorias', 'areas', 'topicos'].includes(path) ? path : 'categorias');
  }, [location.pathname]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const headers = selectedRole ? { 'x-selected-role': selectedRole } : {};
      let url;
      if (view === 'categorias') url = '/categorias';
      else if (view === 'areas')  url = '/areas';
      else                        url = '/topicos';

      const resp = await api.get(url, { headers });
      let data = resp.data.map(item => ({ ...item, id: Number(item.id) }));
      if (view === 'topicos') {
        data = data.map(d => ({ ...d, title: d.description, area: d.area }));
      }
      data.sort((a, b) => a.id - b.id);
      setItems(data);
      setFiltered(data);
    } catch (err) {
      console.error(`Erro ao carregar ${view}:`, err);
      setError(`Falha ao carregar ${view}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const headers = selectedRole ? { 'x-selected-role': selectedRole } : {};
      const resp = await api.get('/categorias', { headers });
      const data = resp.data.map(cat => ({ ...cat, id: Number(cat.id) }));
      data.sort((a, b) => a.id - b.id);
      setCategories(data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const fetchAreas = async () => {
    try {
      const headers = selectedRole ? { 'x-selected-role': selectedRole } : {};
      const resp = await api.get('/areas', { headers });
      const data = resp.data.map(a => ({ ...a, id: Number(a.id) }));
      data.sort((a, b) => a.id - b.id);
      setAreas(data);
    } catch (err) {
      console.error('Erro ao buscar áreas:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    if (view === 'areas')   fetchCategories();
    if (view === 'topicos') fetchAreas();
  }, [view]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFiltered(items);
    } else {
      setFiltered(
        items.filter(item =>
          view === 'topicos'
            ? item.title.toLowerCase().includes(term)
            : item.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, items, view]);

  const handleOpenCreate = () => {
    setEditMode(false);
    setEditingId(null);
    setDescription('');
    setCategoryId('');
    setAreaId('');
    setShowModal(true);
  };

  const handleOpenEdit = item => {
    setEditMode(true);
    setEditingId(item.id);
    setDescription(view === 'topicos' ? item.title : item.description);
    setCategoryId(item.category?.id || '');
    setAreaId(item.area?.id || '');
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const headers = selectedRole ? { 'x-selected-role': selectedRole } : {};
    try {
      if (view === 'categorias') {
        if (editMode) await api.put(`/categorias/${editingId}`, { description }, { headers });
        else          await api.post('/categorias',               { description }, { headers });
      } else if (view === 'areas') {
        if (editMode) await api.put(`/areas/${editingId}`,      { description, categoryId }, { headers });
        else          await api.post('/areas',                  { description, categoryId }, { headers });
      } else {
        if (editMode) await api.put(`/topicos/${editingId}`,    { description, areaId },     { headers });
        else          await api.post('/topicos',                { description, areaId },     { headers });
      }
      setShowModal(false);
      fetchItems();
      showResult(
        `${view === 'categorias' ? 'Categoria' : view === 'areas' ? 'Área' : 'Tópico'} ${
          editMode ? 'atualizado' : 'criado'
        } com sucesso!`,
        true
      );
    } catch (err) {
      console.error(`Erro ao ${editMode ? 'editar' : 'criar'} ${view}:`, err);
      showResult(
        `Falha ao ${editMode ? 'editar' : 'criar'} ${
          view === 'categorias' ? 'categoria' : view === 'areas' ? 'área' : 'tópico'
        }`,
        false
      );
    }
  };

  // Função para mostrar resultados
  const showResult = (message, success) => {
    setResultMessage(message);
    setIsSuccess(success);
    setShowResultModal(true);
    setTimeout(() => setShowResultModal(false), 3000);
  };

  // Função para confirmar exclusão
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Função para efetuar a exclusão
  const handleDelete = async (id) => {
    try {
      const headers = selectedRole ? { 'x-selected-role': selectedRole } : {};

      let checkFkUrl = '';
      let deleteUrl = '';
      if (view === 'categorias') {
        checkFkUrl = `/categorias/checkFk/${id}`;
        deleteUrl = `/categorias/${id}`;
      } else if (view === 'areas') {
        checkFkUrl = `/areas/checkFk/${id}`;
        deleteUrl = `/areas/${id}`; 
      } else if (view === 'topicos') {
        checkFkUrl = `/topicos/checkFk/${id}`;
        deleteUrl = `/topicos/${id}`; 
      }

      // Verificar FK
      const fkResponse = await api.get(checkFkUrl, { headers });
      if (fkResponse.data.hasFk === true) {
        showResult('Não é possível excluir este item porque ele está associado a outras entidades.', false);
        return;
      }

      // Excluir item
      await api.delete(deleteUrl, { headers });
      fetchItems();
      showResult(`${view.charAt(0).toUpperCase() + view.slice(1)} excluído com sucesso!`, true);
    } catch (err) {
      console.error(`Erro ao excluir ${view}:`, err);
      showResult(`Falha ao excluir ${view}`, false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger text-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft className="me-2" /> Voltar ao Dashboard
          </button>
          
          <h2 className="mb-0 text-primary fw-bold">
            {titles[view].card}
          </h2>
        </div>

        <div className="d-flex gap-2 mb-4">
          <NavLink
            to="/categorias"
            className={({ isActive }) => 
              `btn ${isActive ? 'btn-primary' : 'btn-outline-primary'} px-4 py-2`
            }
            style={{ borderRadius: '4px' }}
          >
            Categorias
          </NavLink>
          <NavLink
            to="/areas"
            className={({ isActive }) => 
              `btn ${isActive ? 'btn-primary' : 'btn-outline-primary'} px-4 py-2`
            }
            style={{ borderRadius: '4px' }}
          >
            Áreas
          </NavLink>
          <NavLink
            to="/topicos"
            className={({ isActive }) => 
              `btn ${isActive ? 'btn-primary' : 'btn-outline-primary'} px-4 py-2`
            }
            style={{ borderRadius: '4px' }}
          >
            Tópicos
          </NavLink>
        </div>

        <div className="card shadow border-0 rounded-3 overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold text-muted">
                {view === 'categorias' ? 'Categorias Registadas' : 
                 view === 'areas' ? 'Áreas Registadas' : 'Tópicos Registados'}
              </h5>
              
              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center"
                onClick={handleOpenCreate}
              >
                <FaPlus className="me-2" />
                {`Criar ${view === 'categorias' ? 'Categoria' : view === 'areas' ? 'Área' : 'Tópico'}`}
              </button>
            </div>
            
            <div className="mt-4 bg-light p-3 rounded-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="card-body p-0">
            <div className="table-responsive rounded-3">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-center">
                    {titles[view].cols.map(col => 
                      <th key={col} className="py-3 fw-semibold">{col}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map(item => (
                    <tr key={item.id} className="text-center">
                      <td className="fw-medium">{item.id}</td>
                      <td>{view === 'topicos' ? item.title : item.description}</td>
                      {view === 'areas' && <td>{item.category?.description || '-'}</td>}
                      {view === 'topicos' && <td>{item.area?.description || '-'}</td>}
                      <td className="py-2">
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center me-2"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <FaEdit className="me-1" /> Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center"
                            onClick={() => confirmDelete(item)}
                          >
                            <FaTrash className="me-1" /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td 
                        colSpan={titles[view].cols.length} 
                        className="text-center text-muted py-5"
                      >
                        <div className="py-4">
                          <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                          <h5 className="fw-normal">
                            Nenhum {view === 'categorias' ? 'categoria' : view === 'areas' ? 'área' : 'tópico'} encontrado
                          </h5>
                          <p className="text-muted mb-0">
                            Tente ajustar sua pesquisa ou criar um novo item
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Edição/Criação */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header bg-primary text-white rounded-top-3">
                  <h5 className="modal-title">
                    {editMode
                      ? `Editar ${view === 'categorias' ? 'Categoria' : view === 'areas' ? 'Área' : 'Tópico'}`
                      : `Criar ${view === 'categorias' ? 'Categoria' : view === 'areas' ? 'Área' : 'Tópico'}`
                    }
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body py-4">
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        {view === 'topicos' ? 'Título' : 'Descrição'}
                      </label>
                      <input
                        type="text"
                        className="form-control border-2 py-2"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    {view === 'areas' && (
                      <div className="mb-3">
                        <label className="form-label fw-medium">Categoria</label>
                        {/* Substituído por Typeahead */}
                        <Typeahead
                          id="category-typeahead"
                          labelKey="description"
                          options={categories}
                          selected={categories.filter(cat => cat.id === categoryId)}
                          onChange={(selected) => {
                            setCategoryId(selected.length > 0 ? selected[0].id : '');
                          }}
                          placeholder="Selecione uma categoria..."
                          className="border-2"
                          required
                        />
                      </div>
                    )}
                    {view === 'topicos' && (
                      <div className="mb-3">
                        <label className="form-label fw-medium">Área</label>
                        {/* Substituído por Typeahead */}
                        <Typeahead
                          id="area-typeahead"
                          labelKey="description"
                          options={areas}
                          selected={areas.filter(area => area.id === areaId)}
                          onChange={(selected) => {
                            setAreaId(selected.length > 0 ? selected[0].id : '');
                          }}
                          placeholder="Selecione uma área..."
                          className="border-2"
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4"
                    >
                      {editMode ? 'Salvar Alterações' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Resultado */}
        <Modal 
          show={showResultModal} 
          onHide={() => setShowResultModal(false)}
          centered
          backdrop="static"
          keyboard={false}
          className="fade"
        >
          <Modal.Header 
            closeButton 
            className={isSuccess ? "bg-success text-white" : "bg-danger text-white"}
          >
            <Modal.Title>
              {isSuccess ? 'Sucesso!' : 'Erro'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{resultMessage}</p>
          </Modal.Body>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          centered
          className="fade"
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Exclusão</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-1">
              Tem certeza que deseja excluir {itemToDelete ? 
                `${view === 'categorias' ? 'a categoria' : view === 'areas' ? 'a área' : 'o tópico'}` : 'este item'} 
              <strong> {itemToDelete ? (view === 'topicos' ? itemToDelete.title : itemToDelete.description) : ''}</strong>?
            </p>
            <p className="text-danger mb-0">
              <small>Esta ação não pode ser desfeita.</small>
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                if (itemToDelete) {
                  handleDelete(itemToDelete.id);
                  setShowDeleteModal(false);
                }
              }}
            >
              Confirmar Exclusão
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default ACTListGestor;