'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { mockMovementService } from '../../../services/movementService';
import { formatCurrency } from '../../../schemas/movement';
import type { MovementSummary, CashFlowAnalysis } from '../../../types/movement';

export default function MovementAnalyticsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [summary, setSummary] = useState<MovementSummary | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [selectedClient, setSelectedClient] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range based on selected period
        const endDate = new Date();
        const startDate = new Date();
        
        switch (selectedPeriod) {
          case '1month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6months':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        const [summaryData] = await Promise.all([
          mockMovementService.getMovementSummary({}),
          // mockMovementService.getCashFlowAnalysis(
          //   selectedClient === 'all' ? undefined : selectedClient,
          //   startDate.toISOString().split('T')[0],
          //   endDate.toISOString().split('T')[0]
          // )
        ]);
        
        setSummary(summaryData);
        
        // Mock cash flow data for now
        setCashFlow({
          clientId: selectedClient === 'all' ? undefined : selectedClient,
          period: { start: startDate, end: endDate },
          totalInflow: 15000,
          totalOutflow: 3500,
          netCashFlow: 11500,
          averageMonthlyInflow: 5000,
          averageMonthlyOutflow: 1167,
          monthlyData: [
            { month: 'Outubro', year: 2024, inflow: 5000, outflow: 1200, netFlow: 3800, balance: 3800 },
            { month: 'Novembro', year: 2024, inflow: 5000, outflow: 800, netFlow: 4200, balance: 8000 },
            { month: 'Dezembro', year: 2024, inflow: 5000, outflow: 1500, netFlow: 3500, balance: 11500 },
          ],
          inflowByType: [
            { type: 'deposit', amount: 12000, percentage: 80.0 },
            { type: 'dividend', amount: 2000, percentage: 13.3 },
            { type: 'interest', amount: 1000, percentage: 6.7 },
          ],
          outflowByType: [
            { type: 'withdrawal', amount: 2500, percentage: 71.4 },
            { type: 'fee', amount: 1000, percentage: 28.6 },
          ],
          trend: 'increasing',
        });
        
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, selectedPeriod, selectedClient]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Crescente';
      case 'decreasing':
        return 'Decrescente';
      default:
        return 'Estável';
    }
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando analytics..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics de Movimentações
              </h1>
              <p className="text-gray-600 mt-2">
                Análise de fluxo de caixa e relatórios financeiros
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar Relatório</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Último mês</SelectItem>
                    <SelectItem value="3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="1year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    <SelectItem value="1">João Silva</SelectItem>
                    <SelectItem value="2">Maria Santos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Summary */}
        {cashFlow && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(cashFlow.totalInflow)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Média mensal: {formatCurrency(cashFlow.averageMonthlyInflow)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(cashFlow.totalOutflow)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Média mensal: {formatCurrency(cashFlow.averageMonthlyOutflow)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashFlow.netCashFlow)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Resultado do período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tendência</CardTitle>
                {getTrendIcon(cashFlow.trend)}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getTrendColor(cashFlow.trend)}`}>
                  {getTrendLabel(cashFlow.trend)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Análise de comportamento
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Cash Flow */}
          {cashFlow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Fluxo de Caixa Mensal</span>
                </CardTitle>
                <CardDescription>
                  Evolução das entradas e saídas por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cashFlow.monthlyData.map((month, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{month.month} {month.year}</h4>
                        <span className={`font-bold ${month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.netFlow)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600">Entradas:</span> {formatCurrency(month.inflow)}
                        </div>
                        <div>
                          <span className="text-red-600">Saídas:</span> {formatCurrency(month.outflow)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Saldo acumulado:</span> {formatCurrency(month.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movement Types Breakdown */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Distribuição por Tipo</span>
                </CardTitle>
                <CardDescription>
                  Análise das movimentações por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">Entradas</h4>
                    <div className="space-y-2">
                      {cashFlow?.inflowByType.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{item.type}</span>
                          <div className="text-right">
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                            <span className="text-xs text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-600 mb-3">Saídas</h4>
                    <div className="space-y-2">
                      {cashFlow?.outflowByType.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{item.type}</span>
                          <div className="text-right">
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                            <span className="text-xs text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Movements Summary */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Resumo de Movimentações Recentes</span>
              </CardTitle>
              <CardDescription>
                Últimas {summary.recentMovements.length} movimentações registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.recentMovements.map((movement) => (
                  <div key={movement.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{movement.description}</p>
                      <p className="text-sm text-gray-600">{movement.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${['deposit', 'dividend', 'interest'].includes(movement.type) ? 'text-green-600' : 'text-red-600'}`}>
                        {['deposit', 'dividend', 'interest'].includes(movement.type) ? '+' : '-'}{formatCurrency(movement.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {movement.requestedDate.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}