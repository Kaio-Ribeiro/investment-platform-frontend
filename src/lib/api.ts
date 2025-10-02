// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Construir headers dinamicamente
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Adicionar token de autenticação se disponível
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Tratamento específico para erro 403 Forbidden
        if (response.status === 403) {
          console.error('Access forbidden - check authentication');
          // Remover token inválido
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            // Redirecionar para login se não estivermos em páginas públicas
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/login', '/register'];
            
            if (!publicPaths.includes(currentPath)) {
              window.location.href = '/login';
            }
          }
        }
        
        // Tratamento específico para erro 401 Unauthorized
        if (response.status === 401) {
          console.error('Unauthorized - token expired or invalid');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/login', '/register'];
            
            if (!publicPaths.includes(currentPath)) {
              window.location.href = '/login';
            }
          }
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch (error) {
    console.warn('Backend not available, using mock services');
    return false;
  }
};

export default apiClient;