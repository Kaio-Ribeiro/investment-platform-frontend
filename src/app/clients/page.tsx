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
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { clientService } from '../../services/adaptedClientService';
import type { Client, ClientStats } from '../../types/client';

export default function ClientsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const clientsData = await clientService.getClients(
          { search: searchTerm }, 
          { field: 'name', direction: 'asc' },
          1,
          10
        );
        
        // Mock stats for now
        const mockStats: ClientStats = {
          total: clientsData.total,
          active: Math.floor(clientsData.total * 0.8),
          prospects: Math.floor(clientsData.total * 0.2),
          totalInvestments: 50000000,
          averagePortfolioValue: clientsData.total > 0 ? 50000000 / clientsData.total : 0
        };
        
        setClients(clientsData.items);
        setStats(mockStats);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      prospect: 'outline',
      suspended: 'destructive',
    };

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      prospect: 'Prospect',
      suspended: 'Suspenso',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getInvestmentProfileBadge = (profile: string) => {
    const colors = {
      conservative: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      aggressive: 'bg-red-100 text-red-800',
      not_defined: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      conservative: 'Conservador',
      moderate: 'Moderado',
      aggressive: 'Arrojado',
      not_defined: 'Não definido',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[profile as keyof typeof colors] || colors.not_defined}`}>
        {labels[profile as keyof typeof labels] || profile}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando clientes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestão de Clientes
              </h1>
              <p className="text-gray-600 mt-2">
                Cadastre e gerencie seus clientes e suas informações
              </p>
            </div>
            <Link href="/clients/new">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Cliente</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prospects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.prospects}</div>
                <p className="text-xs text-muted-foreground">
                  Potenciais clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvestments}</div>
                <p className="text-xs text-muted-foreground">
                  Total de aplicações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patrimônio Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averagePortfolioValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Por cliente
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, CPF ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filtros Avançados</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} encontrado{clients.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client.name}
                        </h3>
                        {getStatusBadge(client.status)}
                        {getInvestmentProfileBadge(client.investmentProfile)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">CPF:</span> {client.cpf}</p>
                          <p><span className="font-medium">Email:</span> {client.contact.email}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Telefone:</span> {client.contact.phone}</p>
                          <p><span className="font-medium">Cidade:</span> {client.address.city}/{client.address.state}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Renda:</span> {client.monthlyIncome ? formatCurrency(client.monthlyIncome) : 'Não informado'}</p>
                          <p><span className="font-medium">Patrimônio:</span> {client.netWorth ? formatCurrency(client.netWorth) : 'Não informado'}</p>
                        </div>
                      </div>

                      {client.tags && client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {client.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/clients/${client.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {clients.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece cadastrando seu primeiro cliente.
                </p>
                <div className="mt-6">
                  <Link href="/clients/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}