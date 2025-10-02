import axios, { AxiosError, AxiosResponse } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, ApiError } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Se o token expirou ou é inválido
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      // Redirecionar para login apenas se não estivermos já nas páginas públicas
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/register', data);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignorar erros de logout, pois vamos limpar o token localmente de qualquer forma
      console.warn('Error during logout:', error);
    }
  },

  handleError: (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
      return {
        response: {
          data: error.response?.data,
          status: error.response?.status,
        },
        message: error.message,
      };
    }
    
    return {
      message: 'Erro desconhecido',
    };
  },
};