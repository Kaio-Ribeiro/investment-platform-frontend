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
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  FileText,
  Table
} from 'lucide-react';
import { clientService } from '../../services/adaptedClientService';
import { clientInvestmentService } from '../../services/clientInvestmentService';
import { exportClientsData } from '../../utils/exportUtils';
import type { Client, ClientStats, ClientInvestmentStats } from '../../types/client';

export default function ClientsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [clientInvestmentStats, setClientInvestmentStats] = useState<Map<string, ClientInvestmentStats>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvestmentStats, setIsLoadingInvestmentStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh function (can be called from other components)
  const refreshClientList = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Listen for page visibility changes to refresh data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshClientList();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get paginated clients for display
        const clientsData = await clientService.getClients(
          { search: debouncedSearchTerm || undefined }, // Only send if not empty
          { field: 'name', direction: 'asc' },
          1,
          10
        );
        
        // Get all clients for accurate statistics (without search filter)
        const allClientsData = debouncedSearchTerm ? clientsData : await clientService.getClients(
          {}, // No filters to get all clients
          { field: 'name', direction: 'asc' },
          1,
          1000 // Large number to get all clients
        );
        
        // Verificar se os dados são válidos
        if (clientsData && Array.isArray(clientsData.items)) {
          setClients(clientsData.items);
          
          // Calculate real stats from all client data
          const allClients = allClientsData?.items || [];
          
          // Load investment statistics for displayed clients
          setIsLoadingInvestmentStats(true);
          try {
            const clientIds = clientsData.items.map(client => client.id);
            const investmentStatsMap = await clientInvestmentService.getMultipleClientInvestmentStats(clientIds);
            setClientInvestmentStats(investmentStatsMap);
            
            // Calculate basic client statistics (no need for global investment stats)
            const total = allClients.length;
            const active = allClients.filter(client => client.status === 'active').length;
            const prospects = allClients.filter(client => client.status === 'prospect').length;
            
            const realStats: ClientStats = {
              total: total,
              active: active,
              prospects: prospects,
              totalInvestments: 0, // Not needed anymore
              averagePortfolioValue: 0 // Not needed anymore
            };
            
            setStats(realStats);
          } catch (investmentError) {
            console.error('Error loading investment statistics:', investmentError);
            // Continue with basic stats even if investment stats fail
            const total = allClients.length;
            const active = allClients.filter(client => client.status === 'active').length;
            const prospects = allClients.filter(client => client.status === 'prospect').length;
            
            const basicStats: ClientStats = {
              total: total,
              active: active,
              prospects: prospects,
              totalInvestments: 0,
              averagePortfolioValue: 0
            };
            
            setStats(basicStats);
          } finally {
            setIsLoadingInvestmentStats(false);
          }
        } else {
          // Se não temos dados válidos, usar dados mock
          setClients([]);
          setStats(null);
        }
      } catch (error) {
        // Garantir que clients seja sempre um array
        setClients([]);
        setStats(null);
        
        // Definir mensagem de erro baseada no tipo
        if (error instanceof Error) {
          if (error.message.includes('403') || error.message.includes('Forbidden')) {
            setError('Acesso negado. Verifique se você está logado corretamente.');
          } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            setError('Sessão expirada. Faça login novamente.');
          } else {
            setError(`Erro ao carregar clientes: ${error.message}`);
          }
        } else {
          setError('Erro desconhecido ao carregar clientes');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, debouncedSearchTerm, refreshTrigger]); // React to debounced search and refresh trigger

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

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${clientName}"?`)) {
      return;
    }

    try {
      await clientService.deleteClient(clientId);
      
      // Refresh the client list
      refreshClientList();
      
      // Show success message (you can add toast notification here)
      alert('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente. Tente novamente.');
    }
  };

  const handleToggleClientStatus = async (clientId: string, clientName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'ativar' : 'desativar';
    
    if (!confirm(`Tem certeza que deseja ${action} o cliente "${clientName}"?`)) {
      return;
    }

    try {
      await clientService.updateClient(clientId, { status: newStatus as any });
      
      // Refresh the client list
      refreshClientList();
      
      // Show success message
      alert(`Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      alert('Erro ao alterar status do cliente. Tente novamente.');
    }
  };

  const handleExportExcel = () => {
    try {
      exportClientsData(clients, clientInvestmentStats, 'excel');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar dados para Excel. Tente novamente.');
    }
  };

  const handleExportCSV = () => {
    try {
      exportClientsData(clients, clientInvestmentStats, 'csv');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar dados para CSV. Tente novamente.');
    }
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

        {/* Stats Card */}
        {stats && (
          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Clientes Cadastrados</CardTitle>
                <Users className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center">{stats.total}</div>
                <div className="flex justify-center space-x-4 mt-3 text-sm text-muted-foreground">
                  <span>{stats.active} ativos</span>
                  <span>•</span>
                  <span>{stats.prospects} prospects</span>
                  <span>•</span>
                  <span>{stats.total - stats.active - stats.prospects} inativos</span>
                </div>
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
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtros Avançados</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  className="flex items-center space-x-2"
                  title="Exportar para Excel"
                >
                  <Table className="w-4 h-4" />
                  <span>Excel</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2"
                  title="Exportar para CSV"
                >
                  <FileText className="w-4 h-4" />
                  <span>CSV</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <div className="rounded-full bg-red-100 p-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <div className="mt-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Tentar novamente
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {(clients || []).length} cliente{(clients || []).length !== 1 ? 's' : ''} encontrado{(clients || []).length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(clients || []).map((client) => (
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">CPF:</span> {client.cpf}</p>
                          <p><span className="font-medium">Email:</span> {client.contact.email}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Telefone:</span> {client.contact.phone}</p>
                        </div>
                        <div>
                          {isLoadingInvestmentStats ? (
                            <p className="text-gray-400">Carregando...</p>
                          ) : (
                            <>
                              <p><span className="font-medium">Investimentos:</span> {clientInvestmentStats.get(client.id)?.total_allocations || 0}</p>
                              <p><span className="font-medium">Valor Investido:</span> {formatCurrency(clientInvestmentStats.get(client.id)?.total_invested || 0)}</p>
                            </>
                          )}
                        </div>
                        <div>
                          {isLoadingInvestmentStats ? (
                            <p className="text-gray-400">Carregando...</p>
                          ) : (
                            <>
                              <p><span className="font-medium">Patrimônio:</span> {formatCurrency(clientInvestmentStats.get(client.id)?.net_balance || 0)}</p>
                              {clientInvestmentStats.get(client.id)?.last_investment_date && (
                                <p><span className="font-medium">Último Investimento:</span> {new Date(clientInvestmentStats.get(client.id)!.last_investment_date!).toLocaleDateString('pt-BR')}</p>
                              )}
                            </>
                          )}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={client.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        onClick={() => handleToggleClientStatus(client.id, client.name, client.status)}
                        title={client.status === 'active' ? 'Desativar cliente' : 'Ativar cliente'}
                      >
                        {client.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(clients || []).length === 0 && !isLoading && (
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