// src/services/authService.js
import axios from 'axios';

// Instância Axios configurada para a API
export const api = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para injetar o token em todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  err => Promise.reject(err)
);

// Interceptor para tratar respostas de erro (e.g., token expirado)
api.interceptors.response.use(
  resp => resp,
  err => {
    // Não redirecionar para login se for uma requisição de primeiro login
    if (err.config.url.includes('/first-login')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      // Token expirou ou inválido: limpa credenciais
      localStorage.removeItem('token');
      sessionStorage.removeItem('selectedRole');
      // Aviso ao utilizador
      window.alert('Sessão expirada. Por favor, inicie sessão novamente.');
      // Redireciona para login
      window.location.href = '/login';
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
