'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = Boolean(token && user);

  // Função para limpar dados de autenticação
  const clearAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    setToken(null);
    setUser(null);
  }, []);

  // Inicializar estado de autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      // Garantir que só executa no cliente
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        const storedToken = localStorage.getItem('access_token');
        
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Simular validação do token
        // Em uma aplicação real, você faria uma chamada para o backend
        setToken(storedToken);
        setUser({ id: '1', email: 'user@example.com' });
        
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuth]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await authService.login({ email, password });
      
      // Salvar token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
      }
      
      setToken(response.access_token);
      setUser({ id: '1', email });
      
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
      
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await authService.register({ email, password });
      
      // Salvar token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
      }
      
      setToken(response.access_token);
      setUser({ id: '1', email });
      
      toast.success('Cadastro realizado com sucesso!');
      router.push('/dashboard');
      
    } catch (error: unknown) {
      console.error('Erro no cadastro:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Logout realizado com sucesso!');
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}