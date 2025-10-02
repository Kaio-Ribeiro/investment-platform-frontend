'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  DollarSign, 
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { mockAssetService, mockClientService } from '../../../services/assetService';
import { assetTypeLabels, formatCurrency } from '../../../schemas/investment';
import type { Asset, Client } from '../../../types/investment';

function NewInvestmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useRequireAuth();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchAssetTerm, setSearchAssetTerm] = useState('');
  const [formData, setFormData] = useState({
    quantity: '',
    unitPrice: '',
    totalAmount: '',
    transactionType: 'buy' as 'buy' | 'sell',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [assetsData, clientsData] = await Promise.all([
          mockAssetService.getAssets(),
          mockClientService.getClients()
        ]);
        
        setAssets(assetsData.assets);
        setClients(clientsData.clients);

        // Pre-select asset if assetId is provided in URL
        const assetId = searchParams.get('assetId');
        if (assetId) {
          const asset = assetsData.assets.find((a: Asset) => a.id === assetId);
          if (asset) {
            setSelectedAsset(asset);
            setFormData(prev => ({
              ...prev,
              unitPrice: asset.currentPrice?.toString() || ''
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, searchParams]);

  const filteredAssets = assets.filter((asset: Asset) =>
    asset.name.toLowerCase().includes(searchAssetTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchAssetTerm.toLowerCase())
  );

  const calculateTotalAmount = () => {
    const quantity = parseFloat(formData.quantity || '0');
    const unitPrice = parseFloat(formData.unitPrice || '0');
    return quantity * unitPrice;
  };

  const handleQuantityChange = (value: string) => {
    setFormData(prev => ({ ...prev, quantity: value }));
    if (formData.unitPrice) {
      const total = parseFloat(value || '0') * parseFloat(formData.unitPrice);
      setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
    }
  };

  const handleUnitPriceChange = (value: string) => {
    setFormData(prev => ({ ...prev, unitPrice: value }));
    if (formData.quantity) {
      const total = parseFloat(formData.quantity) * parseFloat(value || '0');
      setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
    }
  };

  const handleTotalAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, totalAmount: value }));
    if (formData.quantity) {
      const unitPrice = parseFloat(value || '0') / parseFloat(formData.quantity);
      setFormData(prev => ({ ...prev, unitPrice: unitPrice.toString() }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClient) {
      newErrors.client = 'Selecione um cliente';
    }

    if (!selectedAsset) {
      newErrors.asset = 'Selecione um ativo';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Preço unitário deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const investmentData = {
        clientId: selectedClient,
        assetId: selectedAsset!.id,
        assetSymbol: selectedAsset!.symbol,
        assetName: selectedAsset!.name,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        totalAmount: parseFloat(formData.totalAmount),
        transactionType: formData.transactionType,
        notes: formData.notes,
        transactionDate: new Date()
      };

      await mockAssetService.createInvestment(investmentData);

      // Redirect to assets page with success message
      router.push('/assets?success=investment-created');
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/assets">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Novo Investimento
              </h1>
              <p className="text-gray-600 mt-2">
                Registre um novo investimento para um cliente
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>
                Selecione o cliente para este investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.client}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Asset Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Ativo</CardTitle>
              <CardDescription>
                Selecione o ativo para investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-search">Buscar Ativo</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="asset-search"
                      placeholder="Buscar por nome ou símbolo..."
                      value={searchAssetTerm}
                      onChange={(e) => setSearchAssetTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {selectedAsset ? (
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-green-900">
                            {selectedAsset.symbol} - {selectedAsset.name}
                          </h3>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Tipo: {assetTypeLabels[selectedAsset.type]} | 
                          Preço atual: {selectedAsset.currentPrice ? formatCurrency(selectedAsset.currentPrice) : 'N/A'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAsset(null)}
                      >
                        Alterar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {filteredAssets.length > 0 ? (
                      <div className="divide-y">
                        {filteredAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setFormData(prev => ({
                                ...prev,
                                unitPrice: asset.currentPrice?.toString() || ''
                              }));
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {asset.symbol}
                                </h4>
                                <p className="text-sm text-gray-600">{asset.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {assetTypeLabels[asset.type]}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {asset.currentPrice ? formatCurrency(asset.currentPrice) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum ativo encontrado
                      </div>
                    )}
                  </div>
                )}

                {errors.asset && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.asset}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Investment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Investimento</CardTitle>
              <CardDescription>
                Informe os dados da transação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="transaction-type">Tipo de Transação</Label>
                  <Select 
                    value={formData.transactionType} 
                    onValueChange={(value: 'buy' | 'sell') => 
                      setFormData(prev => ({ ...prev, transactionType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Compra</SelectItem>
                      <SelectItem value="sell">Venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit-price">Preço Unitário</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="unit-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.unitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.unitPrice && (
                    <p className="text-sm text-red-600">{errors.unitPrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total-amount">Valor Total</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="total-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalAmount}
                      onChange={(e) => handleTotalAmountChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {formData.quantity && formData.unitPrice && (
                    <p className="text-sm text-gray-500">
                      Calculado: {formatCurrency(calculateTotalAmount())}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre a transação..."
                    value={formData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/assets">
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Investimento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewInvestmentPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen text="Carregando..." />}>
      <NewInvestmentForm />
    </Suspense>
  );
}