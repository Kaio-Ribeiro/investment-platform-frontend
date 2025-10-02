'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  Eye
} from 'lucide-react';
import { mockAssetService } from '../../services/assetService';
import { assetTypeLabels, formatCurrency, formatPercentage } from '../../schemas/investment';
import type { Asset, PortfolioSummary } from '../../types/investment';

export default function AssetsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'assets' | 'portfolio'>('portfolio');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [assetsData, portfolioData] = await Promise.all([
          mockAssetService.getAssets(),
          mockAssetService.getPortfolioSummary('1') // Mock client ID
        ]);
        
        setAssets(assetsData.assets);
        setPortfolioSummary(portfolioData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const getAssetTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      stocks: 'bg-blue-100 text-blue-800',
      real_estate_funds: 'bg-green-100 text-green-800',
      investment_funds: 'bg-purple-100 text-purple-800',
      fixed_income: 'bg-yellow-100 text-yellow-800',
      crypto: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {assetTypeLabels[type] || type}
      </span>
    );
  };

  const getProfitLossColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitLossIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando ativos..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Alocação de Ativos
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie investimentos e alocações de ativos dos clientes
              </p>
            </div>
            <Link href="/assets/new">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Investimento</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {portfolioSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(portfolioSummary.totalPortfolioValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Patrimônio total investido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(portfolioSummary.totalInvested)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aporte total realizado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>
                {getProfitLossIcon(portfolioSummary.totalProfitLoss)}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getProfitLossColor(portfolioSummary.totalProfitLoss)}`}>
                  {formatCurrency(portfolioSummary.totalProfitLoss)}
                </div>
                <p className={`text-xs ${getProfitLossColor(portfolioSummary.totalProfitLoss)}`}>
                  {formatPercentage(portfolioSummary.totalProfitLossPercentage)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(portfolioSummary.assetAllocation).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tipos de ativos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ativos Disponíveis
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por ativo, símbolo ou tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {activeTab === 'portfolio' && portfolioSummary && (
          <div className="space-y-6">
            {/* Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Alocação por Tipo de Ativo</CardTitle>
                <CardDescription>
                  Distribuição do patrimônio por categoria de investimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(portfolioSummary.assetAllocation).map(([type, allocation]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: allocation.color }}
                        />
                        <span className="font-medium">{allocation.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(allocation.value)}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(allocation.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Melhores Performances</CardTitle>
                <CardDescription>
                  Investimentos com melhor desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioSummary.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{performer.assetName}</h4>
                        <p className="text-sm text-gray-500">{performer.symbol}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(performer.currentValue)}</div>
                        <div className={`text-sm flex items-center space-x-1 ${getProfitLossColor(performer.profitLossPercentage)}`}>
                          {getProfitLossIcon(performer.profitLossPercentage)}
                          <span>{formatPercentage(performer.profitLossPercentage)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assets List */}
        {activeTab === 'assets' && (
          <Card>
            <CardHeader>
              <CardTitle>Ativos Disponíveis</CardTitle>
              <CardDescription>
                {assets.length} ativo{assets.length !== 1 ? 's' : ''} disponível{assets.length !== 1 ? 'eis' : ''} para investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {asset.symbol}
                          </h3>
                          {getAssetTypeBadge(asset.type)}
                          {asset.sector && (
                            <Badge variant="outline" className="text-xs">
                              {asset.sector}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{asset.name}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Preço:</span> {asset.currentPrice ? formatCurrency(asset.currentPrice) : 'N/A'}</p>
                            <p><span className="font-medium">Moeda:</span> {asset.currency}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Dividend Yield:</span> {asset.dividendYield ? formatPercentage(asset.dividendYield) : 'N/A'}</p>
                            <p><span className="font-medium">Gestor:</span> {asset.manager || 'N/A'}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Valor de Mercado:</span> {asset.marketCap ? formatCurrency(asset.marketCap) : 'N/A'}</p>
                            <p><span className="font-medium">Atualizado:</span> {asset.lastUpdate.toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/assets/new?assetId=${asset.id}`}>
                          <Button size="sm">
                            Investir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {assets.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ativo encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Adicione novos ativos ao sistema para começar a investir.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}