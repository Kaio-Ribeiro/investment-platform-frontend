'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Hook para páginas que exigem autenticação
 * Redireciona para login se não autenticado
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    user,
    isLoading: isLoading || (!isAuthenticated && typeof window !== 'undefined'),
    isAuthenticated,
  };
}

/**
 * Hook para páginas que redirecionam se já autenticado (login, register)
 */
export function useRedirectIfAuthenticated() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setShouldShow(true);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    shouldShow: shouldShow && !isLoading && !isAuthenticated,
    isLoading,
  };
}

/**
 * Hook para verificação de permissões (para uso futuro)
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = () => {
    if (!isAuthenticated || !user) return false;
    // Implementar lógica de permissões aqui
    return true;
  };

  return {
    hasPermission,
    isAuthenticated,
  };
}