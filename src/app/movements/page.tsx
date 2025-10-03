'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  Table,
  FileText
} from 'lucide-react';
import { adaptedMovementService } from '../../services/adaptedMovementService';
import { exportMovementsData } from '../../utils/exportUtils';
import type { MovementWithClient, MovementSummary, MovementFilters } from '../../services/adaptedMovementService';

export default function MovementsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [movements, setMovements] = useState<MovementWithClient[]>([]);
  const [summary, setSummary] = useState<MovementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MovementFilters>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Prepare filters with date range
        const dateFilters = { ...filters };
        if (startDate) dateFilters.start_date = startDate;
        if (endDate) dateFilters.end_date = endDate;
        
        const [movementsData, summaryData] = await Promise.all([
          adaptedMovementService.getMovements(dateFilters),
          adaptedMovementService.getMovementsSummary()
        ]);
        
        setMovements(movementsData);
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
  }, [authLoading, filters, startDate, endDate]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMovementTypeIcon = (type: string) => {
    return type === 'deposit' ? <ArrowDownCircle className="w-5 h-5 text-green-600" /> : <ArrowUpCircle className="w-5 h-5 text-red-600" />;
  };

  const getMovementTypeBadge = (type: string) => {
    const isDeposit = type === 'deposit';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isDeposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isDeposit ? 'Depósito' : 'Saque'}
      </span>
    );
  };

  const filteredMovements = movements.filter(movement =>
    movement.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDateFilterApply = () => {
    // Force reload with new date filters
    const dateFilters = { ...filters };
    if (startDate) dateFilters.start_date = startDate;
    if (endDate) dateFilters.end_date = endDate;
    setFilters(dateFilters);
  };

  const handleExportExcel = () => {
    try {
      exportMovementsData(filteredMovements, 'excel');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar dados para Excel. Tente novamente.');
    }
  };

  const handleExportCSV = () => {
    try {
      exportMovementsData(filteredMovements, 'csv');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar dados para CSV. Tente novamente.');
    }
  };

  const handleDateFilterClear = () => {
    setStartDate('');
    setEndDate('');
    setFilters({});
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
            <h1 className="text-3xl font-bold text-gray-900">Movimentações</h1>
            <Link href="/movements/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Movimentação
              </Button>
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Controle todos os depósitos e saques da plataforma
          </p>
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
                  {formatCurrency(summary.total_deposits)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total depositado
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
                  {formatCurrency(summary.total_withdrawals)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total sacado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.net_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Diferença entre depósitos e saques
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movimentações</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {summary.total_movements}
                </div>
                <p className="text-xs text-muted-foreground">
                  Número de operações
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <div className="flex gap-2">
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
          
          {/* Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Por cliente ou observação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1 block">
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1 block">
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Filter Actions */}
          <div className="flex space-x-2">
            <Button onClick={handleDateFilterApply} size="sm">
              Aplicar Filtros
            </Button>
            <Button onClick={handleDateFilterClear} variant="outline" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Movements List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Lista de Movimentações
            </h3>
            
            {filteredMovements.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma movimentação encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca.' : 'Adicione novas movimentações para começar.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMovements.map((movement) => (
                  <div key={movement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getMovementTypeIcon(movement.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              {formatCurrency(movement.amount)}
                            </h4>
                            {getMovementTypeBadge(movement.type)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Cliente:</span> {movement.client_name}
                            </div>
                            <div>
                              <span className="font-medium">Data:</span> {new Date(movement.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          {movement.note && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Observação:</span> {movement.note}
                            </div>
                          )}
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