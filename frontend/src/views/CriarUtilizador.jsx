import React, { useState, useRef } from 'react';
import { api } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import UserList from '../components/UserListGestor';
import { FaPlus, FaArrowLeft, FaIdCard, FaUser, FaEnvelope, FaUserTie } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import Loading from '../components/Loading';

const CriarUtilizador = () => {
  const [form, setForm] = useState({
    workerNumber: '',
    name: '',
    email: '',
    primaryRole: 'formando'
  });
  
  const [loading, setLoading] = useState(false);
  const { selectedRole } = useAuth();
  const navigate = useNavigate();

  const userListRef = useRef(null);

  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage('');
    setIsSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }
      
      if (!selectedRole) {
        throw new Error('Selecione uma função válida antes de continuar');
      }

      const payload = {
        name: form.name,
        email: form.email,
        workerNumber: form.workerNumber.toString(),
        role: form.primaryRole
      };

      const res = await api.post('/users/create', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-selected-role': selectedRole
        },
        timeout: 15000
      });

      console.log('Resposta da criação:', res.data);

      const newUserId = res.data.id || res.data.userId || res.data.user?.id;
      if (!newUserId) {
        throw new Error('ID do novo utilizador não foi retornado pelo servidor');
      }

      setResultMessage(`Utilizador criado com sucesso! ID: ${newUserId}`);
      setIsSuccess(true);
      setShowResultModal(true);

      setForm({
        workerNumber: '',
        name: '',
        email: '',
        primaryRole: 'formando'
      });

      if (userListRef.current) {
        userListRef.current.loadUsers();
      }

    } catch (err) {
      console.error("Erro ao criar utilizador:", err);
      
      let errorMessage = 'Erro desconhecido: ' + err.message;
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = 'O servidor demorou muito para responder. Tente novamente.';
      } 
      else if (err.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      }
      else if (err.response?.data) {
        const serverError = err.response.data;
        if (serverError.error === 'Violação de unicidade') {
          errorMessage = 'Dados duplicados: ' + 
            serverError.details.map(d => d.campo).join(', ') + 
            ' já estão em uso.';
        } 
        else if (serverError.details) {
          errorMessage = 'Erros: ' + serverError.details.map(d => d.mensagem).join(', ');
        } 
        else {
          errorMessage = serverError.error || 'Erro ao criar utilizador';
        }
      } 
      else if (err.request) {
        errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
      }
      else if (err.message) {
        errorMessage = err.message;
      }

      setResultMessage(errorMessage);
      setIsSuccess(false);
      setShowResultModal(true);

    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Header />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft className="me-2" /> Voltar ao Dashboard
          </button>
          <h2 className="mb-0 fw-bold text-primary">Gestão de Utilizadores</h2>
        </div>
        
        <div className="row">
          <div className="col-lg-8 mb-4">
            <UserList ref={userListRef} />
          </div>
          
          <div className="col-lg-4">
            <div className="card shadow border-0 rounded-4">
              <div className="card-header bg-primary text-white py-3 rounded-top-4">
                <h5 className="mb-0 d-flex align-items-center">
                  Criação de Utilizador
                </h5>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="workerNumber" className="form-label fw-medium text-muted">
                      Nº Trabalhador
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaIdCard className="text-primary" />
                      </span>
                      <input
                        type="text"
                        id="workerNumber"
                        name="workerNumber"
                        className="form-control border-start-0 py-2"
                        placeholder="Insira o número de trabalhador"
                        value={form.workerNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium text-muted">
                      Nome completo
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaUser className="text-primary" />
                      </span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control border-start-0 py-2"
                        placeholder="Insira o nome completo"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium text-muted">
                      E-mail
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaEnvelope className="text-primary" />
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control border-start-0 py-2"
                        placeholder="Introduza o e-mail"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="primaryRole" className="form-label fw-medium text-muted">
                      Tipo de Utilizador
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaUserTie className="text-primary" />
                      </span>
                      <select
                        id="primaryRole"
                        name="primaryRole"
                        className="form-select border-start-0 py-2"
                        value={form.primaryRole}
                        onChange={handleChange}
                      >
                        <option value="formando">Formando</option>
                        <option value="formador">Formador</option>
                        <option value="gestor">Gestor</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary py-2 fw-medium d-flex justify-content-center align-items-center shadow-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Criando...
                        </>
                      ) : (
                        <>
                          <FaPlus className="me-2" /> Criar Utilizador
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    </>
  );
};

export default CriarUtilizador;