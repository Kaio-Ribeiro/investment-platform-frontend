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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  BarChart3
} from 'lucide-react';
import { mockMovementService } from '../../services/movementService';
import { 
  formatCurrency, 
  movementTypeConfig
} from '../../schemas/movement';
import { 
  movementStatusLabels,
  paymentMethodLabels
} from '../../types/movement';
import type { MovementWithClient, MovementSummary, MovementFilters } from '../../types/movement';

export default function MovementsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [movements, setMovements] = useState<MovementWithClient[]>([]);
  const [summary, setSummary] = useState<MovementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MovementFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [movementsData, summaryData] = await Promise.all([
          mockMovementService.getMovements(
            { ...filters, search: searchTerm }, 
            { field: 'requestedDate', direction: 'desc' },
            currentPage,
            10
          ),
          mockMovementService.getMovementSummary(filters)
        ]);
        
        setMovements(movementsData.movements);
        setTotalPages(movementsData.totalPages);
        setSummary(summaryData);
      } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, filters, searchTerm, currentPage]);

  const getMovementTypeIcon = (type: string) => {
    const config = movementTypeConfig[type as keyof typeof movementTypeConfig];
    if (!config) return <DollarSign className="w-5 h-5" />;
    
    switch (config.icon) {
      case 'ArrowDownCircle': return <ArrowDownCircle className="w-5 h-5" />;
      case 'ArrowUpCircle': return <ArrowUpCircle className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    const config = movementTypeConfig[type as keyof typeof movementTypeConfig];
    if (!config) return null;
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      yellow: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {movementStatusLabels[status as keyof typeof movementStatusLabels]}
      </span>
    );
  };

  const getAmountColor = (type: string) => {
    const config = movementTypeConfig[type as keyof typeof movementTypeConfig];
    if (!config) return 'text-gray-900';
    
    if (['deposit', 'transfer_in', 'dividend', 'interest', 'bonus'].includes(type)) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getAmountPrefix = (type: string) => {
    if (['deposit', 'transfer_in', 'dividend', 'interest', 'bonus'].includes(type)) {
      return '+';
    } else {
      return '-';
    }
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando movimentações..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Movimentações Financeiras
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie entradas e saídas de dinheiro dos clientes
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/movements/analytics">
                <Button variant="outline" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
              </Link>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </Button>
              <Link href="/movements/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nova Movimentação</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Depósitos</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalDeposits)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entradas de capital
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Saques</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalWithdrawals)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saídas de capital
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netFlow)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Resultado líquido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.pendingCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aguardando aprovação
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.type || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, type: value as any || undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de movimentação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                  <SelectItem value="withdrawal">Saque</SelectItem>
                  <SelectItem value="transfer_in">Transferência Recebida</SelectItem>
                  <SelectItem value="transfer_out">Transferência Enviada</SelectItem>
                  <SelectItem value="dividend">Dividendo</SelectItem>
                  <SelectItem value="fee">Taxa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, status: value as any || undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Mais Filtros</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Movements List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              {movements.length} movimentação{movements.length !== 1 ? 'ões' : ''} encontrada{movements.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                        {getMovementTypeIcon(movement.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {movement.description}
                          </h3>
                          {getMovementTypeBadge(movement.type)}
                          {getStatusBadge(movement.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Cliente:</span> {movement.clientName}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span> {movement.requestedDate.toLocaleDateString('pt-BR')}
                          </div>
                          {movement.paymentMethod && (
                            <div>
                              <span className="font-medium">Método:</span> {paymentMethodLabels[movement.paymentMethod]}
                            </div>
                          )}
                        </div>

                        {movement.reference && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Referência:</span> {movement.reference}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getAmountColor(movement.type)}`}>
                          {getAmountPrefix(movement.type)}{formatCurrency(movement.amount)}
                        </div>
                        {movement.fees && (movement.fees.transferFee || movement.fees.otherFees) && (
                          <div className="text-xs text-gray-500">
                            Taxa: {formatCurrency((movement.fees.transferFee || 0) + (movement.fees.otherFees || 0))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {movement.requiresApproval && movement.status === 'pending' && (
                          <Button size="sm">
                            Aprovar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {movements.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma movimentação encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando uma nova movimentação financeira.
                </p>
                <div className="mt-6">
                  <Link href="/movements/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Movimentação
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}