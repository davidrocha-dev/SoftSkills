import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://pint2.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

api.interceptors.request.use(
  config => {
    console.log('[Axios Request] URL:', config.url);
    console.log('[Axios Request] Method:', config.method);
    console.log('[Axios Request] BaseURL:', config.baseURL);
    console.log('[Axios Request] Full URL:', config.baseURL + config.url);
    console.log('[Axios Request] Headers:', config.headers);
    console.log('[Axios Request] Data:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  err => {
    console.error('[Axios Request Error]:', err);
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  resp => {
    console.log('[Axios Response] Status:', resp.status);
    console.log('[Axios Response] Data:', resp.data);
    return resp;
  },
  err => {
    console.error('[Axios Response Error]:', err);
    console.error('[Axios Response Error] Config:', err.config);
    console.error('[Axios Response Error] Response:', err.response);
    console.error('[Axios Response Error] Request:', err.request);
    
    if (err.config.url.includes('/first-login')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('selectedRole');

      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        window.alert('Sessão expirada. Por favor, inicie sessão novamente.');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

export const login = async credentials => {
  try {
    const { data } = await api.post('/auth/login', credentials);

    if (data.requiresPasswordChange) {
      return {
        requiresPasswordChange: true,
        token: data.token
      };
    }

    if (!data.token || !data.user) {
      throw new Error('Resposta inválida do servidor');
    }

    localStorage.setItem('token', data.token);

    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    let msg = 'Falha na autenticação';

    if (error.response) {
      msg = error.response.data.message || error.response.data.error || msg;
    } else if (error.request) {
      msg = 'Sem resposta do servidor. Verifique sua conexão.';
    }

    throw new Error(msg);
  }
};
