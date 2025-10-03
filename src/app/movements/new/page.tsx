'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  User,
  AlertCircle
} from 'lucide-react';
import { adaptedMovementService } from '../../../services/adaptedMovementService';
import { clientService } from '../../../services/adaptedClientService';
import { 
  formatCurrency,
  parseCurrency
} from '../../../schemas/movement';
import type { Client } from '../../../types/client';
import type { MovementType } from '../../../types/movement';

export default function NewMovementPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'deposit' as MovementType,
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const clientsData = await clientService.getClients();
        setClients(clientsData.items);
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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
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
      // Convert MovementType to backend-compatible type
      const convertedType = formData.type === 'deposit' || formData.type === 'withdrawal' 
        ? formData.type 
        : formData.type === 'transfer_in' 
          ? 'deposit' as const
          : 'withdrawal' as const;

      const movementData = {
        client_id: parseInt(formData.clientId),
        type: convertedType,
        amount: parseCurrency(formData.amount),
        date: formData.date,
        note: formData.notes,
      };

      await adaptedMovementService.createMovement(movementData);

      // Redirect to movements page with success message
      router.push('/movements?success=movement-created');
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      setErrors({ submit: 'Erro ao criar movimentação. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers, comma and dot
    const cleaned = value.replace(/[^\d,.-]/g, '');
    setFormData(prev => ({ ...prev, amount: cleaned }));
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
            <Link href="/movements">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nova Movimentação
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Registre depósitos e saques dos clientes
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="clientId">Selecionar Cliente</Label>
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
                        {client.name} - {client.contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-sm text-red-600">{errors.clientId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Movement Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Detalhes da Movimentação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as MovementType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Depósito</SelectItem>
                      <SelectItem value="withdrawal">Saque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {formData.amount && (
                    <p className="text-sm text-gray-500">
                      Valor: {formatCurrency(parseCurrency(formData.amount))}
                    </p>
                  )}
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre a movimentação..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
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
            <Link href="/movements">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Movimentação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}