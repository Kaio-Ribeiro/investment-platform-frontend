'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
  Building2,
  Calendar,
  Globe,
  BarChart3,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { adaptedAssetService } from '../../../services/adaptedAssetService';

interface Asset {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
}

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetId = params.id as string;

  useEffect(() => {
    if (!authLoading && user && assetId) {
      loadAssetDetails();
    }
  }, [authLoading, user, assetId]);

  const loadAssetDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const assetData = await adaptedAssetService.getAssetById(parseInt(assetId));
      if (assetData) {
        setAsset(assetData);
      } else {
        setError('Asset não encontrado');
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do asset:', err);
      setError('Erro ao carregar detalhes do asset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    
    if (confirm(`Tem certeza que deseja excluir o asset ${asset.ticker}?`)) {
      try {
        await adaptedAssetService.deleteAsset(asset.id);
        router.push('/assets');
      } catch (err) {
        console.error('Erro ao excluir asset:', err);
        alert('Erro ao excluir asset');
      }
    }
  };

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-600">Carregando detalhes do asset...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Asset não encontrado</h3>
          <p className="mt-1 text-gray-500">{error || 'O asset solicitado não foi encontrado.'}</p>
          <Link href="/assets">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Assets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/assets">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{asset.ticker}</h1>
              </div>
            </div>            <div className="flex items-center space-x-2">
              <Link href={`/assets/${asset.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
          
          <h2 className="text-xl text-gray-600 mt-2">{asset.name}</h2>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ticker</label>
                    <p className="text-lg font-semibold">{asset.ticker}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome</label>
                    <p className="text-lg">{asset.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bolsa</label>
                    <p className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      {asset.exchange}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Moeda</label>
                    <p>{asset.currency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Informações de Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID do Asset</label>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{asset.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/assets/new?assetId=${asset.id}`} className="block">
                  <Button className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Fazer Investimento
                  </Button>
                </Link>
                <Link href={`/movements?asset=${asset.ticker}`} className="block">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Movimentações
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}