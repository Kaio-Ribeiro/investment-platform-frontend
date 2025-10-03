'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../hooks/useAuth';
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
  ArrowLeft, 
  DollarSign, 
  User,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { adaptedAllocationService } from '../../../../services/adaptedAllocationService';
import { clientService } from '../../../../services/adaptedClientService';
import { assetService } from '../../../../services/adaptedAssetService';
import type { Client } from '../../../../types/client';
import type { Asset } from '../../../../types/investment';
import type { AllocationCreate } from '../../../../types/allocation';

export default function NewAllocationPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    assetId: '',
    quantity: '',
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0], // Today's date
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [clientsData, assetsData] = await Promise.all([
          clientService.getClients(),
          assetService.getAssets()
        ]);
        setClients(clientsData.items);
        setAssets(assetsData);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Selecione um cliente';
    }

    if (!formData.assetId) {
      newErrors.assetId = 'Selecione um ativo';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    if (!formData.buyPrice || parseFloat(formData.buyPrice) <= 0) {
      newErrors.buyPrice = 'Preço deve ser maior que zero';
    }

    if (!formData.buyDate) {
      newErrors.buyDate = 'Data é obrigatória';
    }

    // Check if buy date is not in the future
    if (formData.buyDate && new Date(formData.buyDate) > new Date()) {
      newErrors.buyDate = 'Data não pode ser no futuro';
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
      const allocationData: AllocationCreate = {
        client_id: parseInt(formData.clientId),
        asset_id: parseInt(formData.assetId),
        quantity: parseFloat(formData.quantity),
        buy_price: parseFloat(formData.buyPrice),
        buy_date: formData.buyDate,
      };

      await adaptedAllocationService.createAllocation(allocationData);

      // Redirect to allocations page with success message
      router.push('/assets/allocations?success=allocation-created');
    } catch (error) {
      console.error('Erro ao criar alocação:', error);
      setErrors({ submit: 'Erro ao criar alocação. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string): string => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const calculateTotalInvestment = (): number => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.buyPrice) || 0;
    return quantity * price;
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const selectedAsset = assets.find(a => a.id === formData.assetId);

  // Function to handle asset selection and auto-fill price
  const handleAssetSelection = (assetId: string) => {
    setFormData(prev => ({ ...prev, assetId }));
    
    // Find selected asset and auto-fill current price if available
    const asset = assets.find(a => a.id === assetId);
    if (asset && asset.currentPrice && !formData.buyPrice) {
      setFormData(prev => ({ 
        ...prev, 
        assetId,
        buyPrice: asset.currentPrice?.toString() || ''
      }));
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
            <Link href="/assets/allocations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nova Alocação de Ativo
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Registre uma nova alocação de ativo para um cliente
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Asset Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Cliente e Ativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id?.toString() || `client-${client.name}`}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId && (
                    <p className="text-sm text-red-600">{errors.clientId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetId">Ativo</Label>
                  <Select 
                    value={formData.assetId} 
                    onValueChange={handleAssetSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ativo" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id?.toString() || `asset-${asset.symbol}`}>
                          {asset.symbol} - {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assetId && (
                    <p className="text-sm text-red-600">{errors.assetId}</p>
                  )}
                </div>
              </div>

              {/* Selected Information */}
              {(selectedClient || selectedAsset) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Seleção Atual:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedClient && (
                      <div>
                        <span className="font-medium text-blue-800">Cliente:</span>
                        <p className="text-blue-700">{selectedClient.name}</p>
                        <p className="text-blue-600">{selectedClient.contact.email}</p>
                      </div>
                    )}
                    {selectedAsset && (
                      <div>
                        <span className="font-medium text-blue-800">Ativo:</span>
                        <p className="text-blue-700">{selectedAsset.symbol} - {selectedAsset.name}</p>
                        <p className="text-blue-600">Tipo: {selectedAsset.type}</p>
                        {selectedAsset.currentPrice && (
                          <p className="text-blue-600">Preço atual: {formatCurrency(selectedAsset.currentPrice.toString())}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allocation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Detalhes da Alocação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.000001"
                    placeholder="Ex: 100"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="buyPrice">Preço de Compra</Label>
                    {selectedAsset?.currentPrice && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          buyPrice: selectedAsset.currentPrice?.toString() || '' 
                        }))}
                        className="text-xs"
                      >
                        Usar preço atual
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="buyPrice"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.buyPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyPrice: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  {formData.buyPrice && (
                    <p className="text-sm text-gray-500">
                      Preço: {formatCurrency(formData.buyPrice)}
                      {selectedAsset?.currentPrice && parseFloat(formData.buyPrice) === selectedAsset.currentPrice && (
                        <span className="text-blue-600 ml-2">(preço atual sugerido)</span>
                      )}
                    </p>
                  )}
                  {selectedAsset?.currentPrice && (
                    <p className="text-xs text-blue-600">
                      💡 Preço atual do mercado: {formatCurrency(selectedAsset.currentPrice.toString())}
                    </p>
                  )}
                  {errors.buyPrice && (
                    <p className="text-sm text-red-600">{errors.buyPrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyDate">Data de Compra</Label>
                  <Input
                    id="buyDate"
                    type="date"
                    value={formData.buyDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyDate: e.target.value }))}
                  />
                  {errors.buyDate && (
                    <p className="text-sm text-red-600">{errors.buyDate}</p>
                  )}
                </div>
              </div>

              {/* Investment Summary */}
              {formData.quantity && formData.buyPrice && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="text-sm font-medium text-green-900">Resumo do Investimento</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Quantidade:</span>
                      <p className="text-green-700">{parseFloat(formData.quantity).toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Preço Unitário:</span>
                      <p className="text-green-700">{formatCurrency(formData.buyPrice)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Total Investido:</span>
                      <p className="text-green-700 font-bold">{formatCurrency(calculateTotalInvestment().toString())}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Errors */}
          {errors.submit && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errors.submit}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/assets/allocations">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Alocação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}