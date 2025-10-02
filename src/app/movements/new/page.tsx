'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  User,
  CreditCard,
  AlertCircle,
  Info
} from 'lucide-react';
import { mockMovementService } from '../../../services/movementService';
import { mockClientService } from '../../../services/assetService';
import { 
  formatCurrency,
  movementTypeConfig,
  validateCPF,
  parseCurrency
} from '../../../schemas/movement';
import type { Client } from '../../../types/investment';
import type { MovementType, PaymentMethod } from '../../../types/movement';

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
    description: '',
    paymentMethod: 'pix' as PaymentMethod,
    notes: '',
    requiresApproval: false,
    // Bank details
    bankCode: '',
    bankName: '',
    agency: '',
    account: '',
    accountType: 'checking' as 'checking' | 'savings',
    pixKey: '',
    pixKeyType: 'cpf' as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const clientsData = await mockClientService.getClients();
        setClients(clientsData.clients);
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

  const selectedTypeConfig = movementTypeConfig[formData.type];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Selecione um cliente';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    }

    // Validate bank details for types that require them
    if (selectedTypeConfig?.requiresBankDetails) {
      if (formData.paymentMethod === 'pix') {
        if (!formData.pixKey) {
          newErrors.pixKey = 'Chave PIX é obrigatória';
        } else {
          // Validate PIX key based on type
          if (formData.pixKeyType === 'cpf' && !validateCPF(formData.pixKey)) {
            newErrors.pixKey = 'CPF inválido';
          }
        }
      } else if (['bank_transfer', 'ted', 'doc'].includes(formData.paymentMethod)) {
        if (!formData.bankCode) newErrors.bankCode = 'Código do banco é obrigatório';
        if (!formData.agency) newErrors.agency = 'Agência é obrigatória';
        if (!formData.account) newErrors.account = 'Conta é obrigatória';
      }
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
      const movementData = {
        clientId: formData.clientId,
        type: formData.type,
        amount: parseCurrency(formData.amount),
        description: formData.description,
        paymentMethod: selectedTypeConfig?.requiresBankDetails ? formData.paymentMethod : undefined,
        notes: formData.notes || undefined,
        requiresApproval: formData.requiresApproval,
        bankDetails: selectedTypeConfig?.requiresBankDetails ? {
          ...(formData.paymentMethod === 'pix' && {
            pixKey: formData.pixKey,
            pixKeyType: formData.pixKeyType,
          }),
          ...(['bank_transfer', 'ted', 'doc'].includes(formData.paymentMethod) && {
            bankCode: formData.bankCode,
            bankName: formData.bankName,
            agency: formData.agency,
            account: formData.account,
            accountType: formData.accountType,
          }),
        } : undefined,
      };

      await mockMovementService.createMovement(movementData);

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
              <p className="text-gray-600 mt-2">
                Registre uma nova movimentação financeira
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Movement Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Cliente e Tipo</span>
              </CardTitle>
              <CardDescription>
                Selecione o cliente e o tipo de movimentação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={formData.clientId} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, clientId: value }))
                  }>
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
                  {errors.clientId && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.clientId}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Movimentação</Label>
                  <Select value={formData.type} onValueChange={(value) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      type: value as MovementType,
                      requiresApproval: movementTypeConfig[value as MovementType]?.defaultRequiresApproval || false
                    }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Depósito</SelectItem>
                      <SelectItem value="withdrawal">Saque</SelectItem>
                      <SelectItem value="transfer_in">Transferência Recebida</SelectItem>
                      <SelectItem value="transfer_out">Transferência Enviada</SelectItem>
                      <SelectItem value="fee">Taxa</SelectItem>
                      <SelectItem value="dividend">Dividendo</SelectItem>
                      <SelectItem value="interest">Juros</SelectItem>
                      <SelectItem value="bonus">Bonificação</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedTypeConfig && (
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p><strong>{selectedTypeConfig.label}</strong></p>
                        <p>
                          {selectedTypeConfig.requiresBankDetails 
                            ? 'Requer informações bancárias' 
                            : 'Não requer informações bancárias'
                          }
                        </p>
                        {selectedTypeConfig.defaultRequiresApproval && (
                          <p>Requer aprovação por padrão</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount and Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Valor e Descrição</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição da movimentação"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {selectedTypeConfig?.requiresBankDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Informações de Pagamento</span>
                </CardTitle>
                <CardDescription>
                  Dados bancários para processamento da movimentação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, paymentMethod: value as PaymentMethod }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                        <SelectItem value="ted">TED</SelectItem>
                        <SelectItem value="doc">DOC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.paymentMethod === 'pix' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
                        <Select value={formData.pixKeyType} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, pixKeyType: value as any }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="cnpj">CNPJ</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="phone">Telefone</SelectItem>
                            <SelectItem value="random">Chave Aleatória</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pixKey">Chave PIX</Label>
                        <Input
                          id="pixKey"
                          placeholder={`Digite a chave ${formData.pixKeyType.toUpperCase()}`}
                          value={formData.pixKey}
                          onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                        />
                        {errors.pixKey && (
                          <p className="text-sm text-red-600">{errors.pixKey}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {['bank_transfer', 'ted', 'doc'].includes(formData.paymentMethod) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankCode">Código do Banco</Label>
                        <Input
                          id="bankCode"
                          placeholder="Ex: 341"
                          value={formData.bankCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankCode: e.target.value }))}
                        />
                        {errors.bankCode && (
                          <p className="text-sm text-red-600">{errors.bankCode}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankName">Nome do Banco</Label>
                        <Input
                          id="bankName"
                          placeholder="Ex: Itaú Unibanco"
                          value={formData.bankName}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agency">Agência</Label>
                        <Input
                          id="agency"
                          placeholder="Ex: 1234"
                          value={formData.agency}
                          onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                        />
                        {errors.agency && (
                          <p className="text-sm text-red-600">{errors.agency}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="account">Conta</Label>
                        <Input
                          id="account"
                          placeholder="Ex: 12345-6"
                          value={formData.account}
                          onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                        />
                        {errors.account && (
                          <p className="text-sm text-red-600">{errors.account}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountType">Tipo de Conta</Label>
                        <Select value={formData.accountType} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, accountType: value as any }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Conta Corrente</SelectItem>
                            <SelectItem value="savings">Poupança</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre a movimentação..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="requiresApproval" className="text-sm font-normal">
                    Requer aprovação manual
                  </Label>
                </div>
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
              <Button variant="outline" disabled={isSubmitting}>
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