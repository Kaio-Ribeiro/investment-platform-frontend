'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search } from 'lucide-react';
import { assetService } from '../../../services/adaptedAssetService';

export default function NewAssetPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    currency: 'USD',
  });

  const handleSearch = async () => {
    if (!searchSymbol.trim()) return;

    try {
      setIsSearching(true);
      const result = await assetService.searchYahooAsset(searchSymbol);
      setSearchResult(result);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateFromYahoo = async () => {
    if (!searchResult) return;

    try {
      setIsLoading(true);
      await assetService.createAssetFromYahoo(searchResult.ticker);
      router.push('/assets');
    } catch (error) {
      console.error('Erro ao criar ativo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.name) {
      return;
    }

    try {
      setIsLoading(true);
      await assetService.createAsset({
        ...formData,
        type: 'stocks' as const
      });
      router.push('/assets');
    } catch (error) {
      console.error('Erro ao criar ativo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <AuthLoadingScreen text="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Adicionar Novo Ativo
          </h1>
          <p className="text-gray-600 mt-2">
            Busque por ativos no Yahoo Finance ou adicione manualmente
          </p>
        </div>

        <div className="space-y-6">
          {/* Yahoo Finance Search */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar no Yahoo Finance</CardTitle>
              <CardDescription>
                Busque por símbolos de ações e outros ativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o símbolo (ex: AAPL, MSFT, PETR4.SA)"
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchSymbol.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>

              {searchResult && (
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Ativo encontrado:</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p><strong>Símbolo:</strong> {searchResult.ticker}</p>
                    <p><strong>Nome:</strong> {searchResult.name}</p>
                    <p><strong>Exchange:</strong> {searchResult.exchange}</p>
                    <p><strong>Moeda:</strong> {searchResult.currency}</p>
                  </div>
                  <Button
                    className="mt-3"
                    onClick={handleCreateFromYahoo}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adicionando...' : 'Adicionar este Ativo'}
                  </Button>
                </div>
              )}

              {isSearching === false && searchResult === null && searchSymbol && (
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <p className="text-yellow-800">
                    Nenhum ativo encontrado para "{searchSymbol}". Tente outro símbolo ou adicione manualmente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Form */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Manualmente</CardTitle>
              <CardDescription>
                Preencha as informações do ativo manualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Símbolo *</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                      placeholder="Ex: AAPL, PETR4"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Apple Inc"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      placeholder="Ex: USD, BRL"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adicionando...' : 'Adicionar Ativo'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}