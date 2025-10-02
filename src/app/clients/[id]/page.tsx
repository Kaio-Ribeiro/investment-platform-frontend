'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { clientService } from '../../../services/adaptedClientService';
import { Client } from '../../../types/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Target,
  Shield,
  Wallet
} from 'lucide-react';
import Link from 'next/link';

interface ClientDetailPageProps {
  params: {
    id: string;
  };
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { isLoading: authLoading } = useRequireAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const clientData = await clientService.getClient(params.id);
        setClient(clientData);
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setError('Erro ao carregar dados do cliente');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchClient();
    }
  }, [params.id, authLoading]);

  const formatCurrency = (value?: number) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

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
      prospect: 'Prospecto',
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

  const getExperienceLabel = (experience?: string) => {
    const labels = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    };
    return labels[experience as keyof typeof labels] || 'Não informado';
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando cliente..." />;
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/clients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-red-600 mb-4">
                <User className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'Cliente não encontrado'}
              </h3>
              <p className="text-gray-500">
                Verifique se o ID do cliente está correto ou tente novamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-600 mt-1">
                Cliente desde {formatDate(client.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusBadge(client.status)}
            <Link href={`/clients/${client.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dados Pessoais */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                  <p className="text-gray-900">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CPF</label>
                  <p className="text-gray-900">{client.cpf}</p>
                </div>
                {client.rg && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">RG</label>
                    <p className="text-gray-900">{client.rg}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                  <p className="text-gray-900">{formatDate(client.birthDate)}</p>
                </div>
                {client.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gênero</label>
                    <p className="text-gray-900">
                      {client.gender === 'male' ? 'Masculino' : 
                       client.gender === 'female' ? 'Feminino' : 'Outro'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status e Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Status e Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {getStatusBadge(client.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Perfil de Investimento</label>
                <div className="mt-1">
                  {getInvestmentProfileBadge(client.investmentProfile)}
                </div>
              </div>
              {client.riskTolerance && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tolerância ao Risco</label>
                  <p className="text-gray-900">{client.riskTolerance}/10</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Experiência</label>
                <p className="text-gray-900">{getExperienceLabel(client.investmentExperience)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {client.contact.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {client.contact.phone}
                </p>
              </div>
              {client.contact.mobile && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Celular</label>
                  <p className="text-gray-900">{client.contact.mobile}</p>
                </div>
              )}
              {client.contact.whatsapp && (
                <div>
                  <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                  <p className="text-gray-900">{client.contact.whatsapp}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-900">
                {client.address.street}, {client.address.number}
              </p>
              {client.address.complement && (
                <p className="text-gray-600">{client.address.complement}</p>
              )}
              <p className="text-gray-900">
                {client.address.neighborhood}
              </p>
              <p className="text-gray-900">
                {client.address.city}, {client.address.state}
              </p>
              <p className="text-gray-600">
                CEP: {client.address.zipCode}
              </p>
              <p className="text-gray-600">
                {client.address.country}
              </p>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Renda Mensal</label>
                <p className="text-gray-900">{formatCurrency(client.monthlyIncome)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Patrimônio Líquido</label>
                <p className="text-gray-900">{formatCurrency(client.netWorth)}</p>
              </div>
              {client.investmentGoals && client.investmentGoals.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Objetivos de Investimento</label>
                  <div className="mt-2 space-y-1">
                    {client.investmentGoals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-blue-600" />
                        <span className="text-sm text-gray-900">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações e Tags */}
          {(client.notes || (client.tags && client.tags.length > 0)) && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Observações e Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Observações</label>
                    <p className="text-gray-900 mt-1">{client.notes}</p>
                  </div>
                )}
                {client.tags && client.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {client.referralSource && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fonte de Indicação</label>
                    <p className="text-gray-900 mt-1">{client.referralSource}</p>
                  </div>
                )}
                {client.lastContactDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Último Contato</label>
                    <p className="text-gray-900 mt-1">{formatDate(client.lastContactDate)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}