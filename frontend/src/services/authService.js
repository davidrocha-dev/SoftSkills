// src/services/authService.js
import axios from 'axios';

// Instância Axios configurada para a API
export const api = axios.create({
  baseURL: 'https://pint2.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Desabilita credentials para evitar problemas de CORS
});

// Interceptor para injetar o token em todas as requisições
api.interceptors.request.use(
  config => {
    console.log('🔍 [Axios Request] URL:', config.url);
    console.log('🔍 [Axios Request] Method:', config.method);
    console.log('🔍 [Axios Request] BaseURL:', config.baseURL);
    console.log('🔍 [Axios Request] Full URL:', config.baseURL + config.url);
    console.log('🔍 [Axios Request] Headers:', config.headers);
    console.log('🔍 [Axios Request] Data:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  err => {
    console.error('🔍 [Axios Request Error]:', err);
    return Promise.reject(err);
  }
);

// Interceptor para tratar respostas de erro (e.g., token expirado)
api.interceptors.response.use(
  resp => {
    console.log('🔍 [Axios Response] Status:', resp.status);
    console.log('🔍 [Axios Response] Data:', resp.data);
    return resp;
  },
  err => {
    console.error('🔍 [Axios Response Error]:', err);
    console.error('🔍 [Axios Response Error] Config:', err.config);
    console.error('🔍 [Axios Response Error] Response:', err.response);
    console.error('🔍 [Axios Response Error] Request:', err.request);
    
    // Não redirecionar para login se for uma requisição de primeiro login
    if (err.config.url.includes('/first-login')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      // Token expirou ou inválido: limpa credenciais
      localStorage.removeItem('token');
      sessionStorage.removeItem('selectedRole');
      // Só mostrar o alert e redirecionar se não estiver na página de login
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        window.alert('Sessão expirada. Por favor, inicie sessão novamente.');
        window.location.href = '/login';
      }
      // Se já estamos na página de login, apenas rejeita o erro normalmente
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

/**
 * Realiza o login do usuário.
 * Se for necessário trocar a senha no primeiro acesso, retorna { requiresPasswordChange, token }.
 * Caso contrário, armazena o token e retorna { token, user }.
 */
export const login = async credentials => {
  try {
    const { data } = await api.post('/auth/login', credentials);

    // Primeiro trate o caso de troca obrigatória de senha
    if (data.requiresPasswordChange) {
      return {
        requiresPasswordChange: true,
        token: data.token
      };
    }

    // Verifica resposta válida
    if (!data.token || !data.user) {
      throw new Error('Resposta inválida do servidor');
    }

    // Armazena o JWT para uso nas próximas requisições
    localStorage.setItem('token', data.token);

    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    let msg = 'Falha na autenticação';

    if (error.response) {
      // Usa mensagem específica do backend, se disponível
      msg = error.response.data.message || error.response.data.error || msg;
    } else if (error.request) {
      msg = 'Sem resposta do servidor. Verifique sua conexão.';
    }

    throw new Error(msg);
  }
};
