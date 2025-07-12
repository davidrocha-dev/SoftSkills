import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { FaUser } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';

const UserListGestor = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { selectedRole } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    workerNumber: '',
    name: '',
    email: '',
    primaryRole: ''
  });

  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTimer, setSearchTimer] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter
      };
      const response = await api.get('/gestor/users', {
        params,
        headers: { 'x-selected-role': selectedRole }
      });
      
      const sortedUsers = response.data.users.sort((a, b) => a.id - b.id);
      
      setUsers(sortedUsers);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error(err);
      setResultMessage('Falha ao carregar utilizadores');
      setIsSuccess(false);
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    loadUsers
  }));

  useEffect(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 500);
    
    setSearchTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
    loadUsers();
  }, [statusFilter, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.patch(
        `/gestor/users/${id}/status`,
        { status: !currentStatus },
        { headers: { 'x-selected-role': selectedRole } }
      );
      setResultMessage(`Estado do utilizador atualizado com sucesso!`);
      setIsSuccess(true);
      setShowResultModal(true);
      loadUsers();
    } catch (err) {
      console.error(err);
      setResultMessage('Falha ao atualizar estado do utilizador');
      setIsSuccess(false);
      setShowResultModal(true);
    }
  };

  const handleVer = (user) => {
    navigate(`/user/${user.id}`);
  };

  const handleEditar = (user) => {
    setEditForm({
      id: user.id,
      workerNumber: user.workerNumber,
      name: user.name,
      email: user.email,
      primaryRole: user.primaryRole
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(
        `/gestor/users/${editForm.id}`,
        {
          workerNumber: editForm.workerNumber,
          name: editForm.name,
          email: editForm.email,
          primaryRole: editForm.primaryRole
        },
        { headers: { 'x-selected-role': selectedRole } }
      );
      setShowEditModal(false);
      setResultMessage('Utilizador editado com sucesso!');
      setIsSuccess(true);
      setShowResultModal(true);
      loadUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Falha ao editar utilizador';
      setResultMessage(msg);
      setIsSuccess(false);
      setShowResultModal(true);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(
        `/gestor/users/${editForm.id}`,
        { headers: { 'x-selected-role': selectedRole } }
      );
      setShowEditModal(false);
      setShowDeleteModal(false);
      setResultMessage('Utilizador eliminado com sucesso!');
      setIsSuccess(true);
      setShowResultModal(true);
      loadUsers();
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.message) {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setResultMessage(err.response.data.message);
        setIsSuccess(false);
        setShowResultModal(true);
        return;
      }
      const msg = err.response?.data?.message || 'Falha ao eliminar utilizador';
      setResultMessage(msg);
      setIsSuccess(false);
      setShowResultModal(true);
    }
  };

  const handleStatusChange = (e) => {
    const v = e.target.value;
    if (v === 'ativo') setStatusFilter(true);
    else if (v === 'inativo') setStatusFilter(false);
    else setStatusFilter(null);
  };

  const handleRoleChange = (e) => {
    const v = e.target.value;
    if (['gestor', 'formador', 'formando'].includes(v)) setRoleFilter(v);
    else setRoleFilter(null);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => setCurrentPage(i)}>{i}</button>
        </li>
      );
    }
    return (
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >&laquo;</button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >&raquo;</button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        {showEditModal && (
          <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Utilizador</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.id}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nº Trabalhador</label>
                      <input
                        type="text"
                        name="workerNumber"
                        className="form-control"
                        value={editForm.workerNumber}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nome</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Função</label>
                      <select
                        name="primaryRole"
                        className="form-select"
                        value={editForm.primaryRole}
                        onChange={handleEditChange}
                      >
                        <option value="gestor">Gestor</option>
                        <option value="formador">Formador</option>
                        <option value="formando">Formando</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-danger me-auto"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Guardar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <h4>Utilizadores Registados</h4>
        <div className="mb-4 bg-light p-3 rounded">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control border-2"
                placeholder="Pesquisar por nome, Nº ou ID"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter === true ? 'ativo' : statusFilter === false ? 'inativo' : 'todos'}
                onChange={handleStatusChange}
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={roleFilter || 'todos'}
                onChange={handleRoleChange}
              >
                <option value="todos">Todos</option>
                <option value="gestor">Gestor</option>
                <option value="formador">Formador</option>
                <option value="formando">Formando</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive rounded">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center align-middle">ID</th>
                  <th className="text-center align-middle">Nome</th>
                  <th className="text-center align-middle">Email</th>
                  <th className="text-center align-middle">Nº Trabalhador</th>
                  <th className="text-center align-middle">Função</th>
                  <th className="text-center align-middle">Estado</th>
                  <th className="text-center align-middle">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="text-center fw-bold align-middle">{user.id}</td>
                      <td className="text-center align-middle">
                        <div className="d-flex align-items-center justify-content-center">
                          <div className="fw-medium">{user.name}</div>
                        </div>
                      </td>
                      <td className="text-center align-middle">{user.email}</td>
                      <td className="text-center align-middle">{user.workerNumber}</td>
                      <td className="text-center align-middle">
                        {user.primaryRole === 'gestor'
                          ? 'Gestor' 
                          : user.primaryRole === 'formador' 
                          ? 'Formador' 
                          : 'Formando'}
                      </td>
                      <td className="text-center align-middle">
                        <span className={`badge ${user.status ? 'bg-success' : 'bg-danger'} rounded-pill`}>
                          {user.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleVer(user)}
                          >
                            Ver
                          </button>
                          <button
                            className={`btn btn-sm ${user.status ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => toggleUserStatus(user.id, user.status)}
                          >
                            {user.status ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditar(user)}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 align-middle">
                      <FaUser className="display-6 text-muted mb-3" />
                      <p className="text-muted">Nenhum utilizador encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && renderPagination()}
          </div>
        )}

        <Modal 
          show={showResultModal} 
          onHide={() => setShowResultModal(false)}
          centered
          backdrop="static"
          keyboard={false}
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
          <Modal.Footer>
            <Button 
              variant={isSuccess ? "success" : "danger"} 
              onClick={() => setShowResultModal(false)}
            >
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
        
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Exclusão</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem certeza que deseja eliminar o utilizador <strong>{editForm.name}</strong>?</p>
            <p className="text-danger">Esta ação não pode ser desfeita.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Sim, Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
});

export default UserListGestor;