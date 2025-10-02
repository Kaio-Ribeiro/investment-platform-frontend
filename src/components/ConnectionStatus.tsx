'use client';

import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../lib/api';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        const available = await checkBackendHealth();
        setIsBackendAvailable(available);
      } catch (error) {
        setIsBackendAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Verificando...</span>
      </Badge>
    );
  }

  if (isBackendAvailable) {
    return (
      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3" />
        <span>API Conectada</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 border-yellow-200">
      <AlertCircle className="w-3 h-3" />
      <span>Modo Demo</span>
    </Badge>
  );
}