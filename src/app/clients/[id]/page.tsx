'use client';

import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';

interface ClientDetailPageProps {
  params: {
    id: string;
  };
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <AuthLoadingScreen text="Carregando cliente..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Detalhes do Cliente
          </h1>
          <p className="text-gray-600 mt-2">
            Cliente ID: {params.id}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Informações do Cliente
            </h3>
            <p className="text-gray-500 mb-4">
              Em breve: Visualização completa e edição
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <span className="text-sm font-medium">Em desenvolvimento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}