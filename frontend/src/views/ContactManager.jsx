import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { FaPaperPlane,FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import '../assets/styles/login.css';
import logo from '../assets/img/softinsa-logo.png';
import { api } from '../services/authService';

const ContactManager = () => {
  const predefinedSubjects = [
    "Criar Conta",
    "Problemas com o login",
    "Problemas técnicos no site",
    "Feedback/Sugestões",
    "Outros"
  ];

  const [formData, setFormData] = useState({
    workerNumber: '',
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showOtherSubject, setShowOtherSubject] = useState(false);
  const [errors, setErrors] = useState({});

  const [requestId, setRequestId] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.workerNumber) newErrors.workerNumber = 'Número de trabalhador é obrigatório';
    if (!formData.name) newErrors.name = 'Nome completo é obrigatório';
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.subject) newErrors.subject = 'Assunto é obrigatório';
    if (!formData.message) newErrors.message = 'Mensagem é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subject') {
      const isOther = value === 'Outros';
      setShowOtherSubject(isOther);
      setFormData(prev => ({ 
        ...prev, 
        [name]: isOther ? 'Outros' : value 
      }));
    } 
    else if (name === 'otherSubject') {
      setFormData(prev => ({ 
        ...prev, 
        subject: value 
      }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro ao digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionStatus(null);
    
    try {
      // Enviar dados para o backend
      const response = await api.post('/requests/create', formData);
      
      if (response.data.success) {
        setSubmissionStatus('success');
        // Resetar formulário
        setRequestId(response.data.requestId);
        setFormData({
          workerNumber: '',
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setShowOtherSubject(false);
      } else {
        setSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
    
    // Mensagem de erro mais detalhada
    let errorMsg = 'Erro ao enviar pedido';
    if (error.response) {
      if (error.response.status === 404) {
        errorMsg = 'Endpoint não encontrado. Verifique a configuração do servidor.';
      } else {
        errorMsg = error.response.data?.error || 
                  `Erro no servidor (${error.response.status})`;
      }
    }
    setErrors(errorMsg);
    setSubmissionStatus('error');
  } finally {
    setIsSubmitting(false);
  }
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-content">

          {errors.server && (
            <div className="login-error">
              {errors.server}
            </div>
          )}

          {submissionStatus === 'success' ? (
            <div className="success-container">
              <div className="success-card">
                <div className="success-icon">
                  <FaCheckCircle />
                </div>
                
                <h2 className="success-title">Pedido Enviado com Sucesso!</h2>

                {requestId && (
                  <p className="success-message">
                    O seu pedido foi registado com o número <strong>#{requestId}</strong>.
                  </p>
                )}
                
                <p className="success-message">
                  Receberá uma confirmação por email em breve. A nossa equipa analisará o seu pedido e entrará em contato se necessário.
                </p>
                
                <div className="success-actions">
                  <button 
                    className="success-button"
                    onClick={() => setSubmissionStatus(null)}
                  >
                    Enviar Novo Pedido
                  </button>
                  <Link to="/login" className="login-link">
                    Voltar
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <img src={logo} alt="Logo" className="img-logo" />
              <h2 className="login-title">Contactar Gestor</h2>
              <p className="login-subtitle">
                Por favor, introduza os seus dados.
              </p>

              {errors.server && (
                <div className="login-error">
                  {errors.server}
                </div>
              )}

              {submissionStatus === 'error' && !errors.server && (
                <div className="login-error">
                  Ocorreu um erro ao enviar o pedido. Por favor, tente novamente.
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Número de Trabalhador
                  </label>
                  <input
                    type="text"
                    name="workerNumber"
                    className={`form-input ${errors.workerNumber ? 'input-error' : ''}`}
                    placeholder=""
                    value={formData.workerNumber}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.workerNumber && <div className="error-message">{errors.workerNumber}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                    placeholder=""
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder=""
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Assunto
                  </label>
                  <select
                    name="subject"
                    className={`form-input ${errors.subject ? 'input-error' : ''}`}
                    value={formData.subject === 'Outros' || showOtherSubject ? 'Outros' : formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    style={{ padding: '12px 15px' }}
                  >
                    <option value="" disabled>Selecione um assunto</option>
                    {predefinedSubjects.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <div className="error-message">{errors.subject}</div>}
                  
                  {/* Campo para "Outros" assunto */}
                  {showOtherSubject && (
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        name="otherSubject"
                        className={`form-input ${errors.subject ? 'input-error' : ''}`}
                        placeholder="Especifique o assunto"
                        value={formData.subject === 'Outros' ? '' : formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    name="message"
                    className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                    placeholder="Explique brevemente o motivo do seu contato."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows="4"
                  ></textarea>
                  {errors.message && <div className="error-message">{errors.message}</div>}
                </div>
                
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      <FaPaperPlane style={{ marginRight: '8px' }} />
                      Enviar
                    </>
                  )}
                </button>
              </form>
              
              <div className="signup-container">
                <p>
                  <Link to="/login" className="signup-link">Voltar</Link>
                </p>
              </div>
            </>
          )}
        </div>
      
        <div className="login-footer">
          <p>© 2025 SOFTINSA. Todos os direitos reservados.</p>
        </div>
      </div>
    </>
  );
};

export default ContactManager;