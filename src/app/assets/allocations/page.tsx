'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  DollarSign,
  TrendingUp,
  Users,
  PieChart,
  ArrowLeft
} from 'lucide-react';
import { adaptedAllocationService } from '../../../services/adaptedAllocationService';
import { clientService } from '../../../services/adaptedClientService';
import type { AllocationWithDetails, AllocationSummary } from '../../../types/allocation';
import type { Client } from '../../../types/client';

export default function AllocationsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [allocations, setAllocations] = useState<AllocationWithDetails[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState<AllocationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const filters = selectedClientId && selectedClientId !== 'all' ? { client_id: parseInt(selectedClientId) } : {};
        
        const [allocationsData, clientsData, summaryData] = await Promise.all([
          adaptedAllocationService.getAllocations(filters),
          clientService.getClients(),
          adaptedAllocationService.getAllocationSummary()
        ]);
        
        setAllocations(allocationsData);
        setClients(clientsData.items);
        setSummary(summaryData);
      } catch (error) {
        console.error('Erro ao carregar alocações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, selectedClientId]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredAllocations = allocations.filter(allocation =>
    allocation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.asset_ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientFilterChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando alocações..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/assets">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Alocações de Ativos</h1>
                <Link href="/assets/allocations/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Alocação
                  </Button>
                </Link>
              </div>
              <p className="mt-2 text-gray-600">
                Gerencie as alocações de ativos por cliente
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alocações</CardTitle>
                <PieChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.total_allocations}
                </div>
                <p className="text-xs text-muted-foreground">
                  Posições ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_invested)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Capital alocado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {summary.unique_clients}
                </div>
                <p className="text-xs text-muted-foreground">
                  Com alocações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos Únicos</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {summary.unique_assets}
                </div>
                <p className="text-xs text-muted-foreground">
                  Diversificação
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Por cliente, ativo ou ticker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="client" className="text-sm font-medium text-gray-700 mb-1 block">
                Cliente
              </Label>
              <Select value={selectedClientId} onValueChange={handleClientFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id?.toString() || `client-${client.name}`}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Allocations List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Lista de Alocações
            </h3>
            
            {filteredAllocations.length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma alocação encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || (selectedClientId && selectedClientId !== 'all') ? 'Tente ajustar seus filtros.' : 'Comece criando uma nova alocação.'}
                </p>
                <div className="mt-6">
                  <Link href="/assets/allocations/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Alocação
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAllocations.map((allocation) => (
                  <div key={allocation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              {allocation.asset_ticker}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {allocation.asset_name}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Cliente:</span> {allocation.client_name}
                            </div>
                            <div>
                              <span className="font-medium">Quantidade:</span> {allocation.quantity.toLocaleString('pt-BR')}
                            </div>
                            <div>
                              <span className="font-medium">Preço de Compra:</span> {formatCurrency(allocation.buy_price)}
                            </div>
                            <div>
                              <span className="font-medium">Data:</span> {new Date(allocation.buy_date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(allocation.total_invested)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Investido
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}