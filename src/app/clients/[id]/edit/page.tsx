'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '../../../../hooks/useAuth';
import { AuthLoadingScreen } from '@/components/ui/loading';
import { clientService } from '../../../../services/adaptedClientService';
import { Client, InvestmentProfile } from '../../../../types/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { quickClientSchema, type QuickClientFormData, formatCPF, formatPhone } from '../../../../schemas/client';

interface ClientEditPageProps {
  params: {
    id: string;
  };
}



export default function ClientEditPage({ params }: ClientEditPageProps) {
  const { isLoading: authLoading } = useRequireAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<QuickClientFormData>({
    resolver: zodResolver(quickClientSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      phone: '',
      investmentProfile: 'not_defined',
    },
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const clientData = await clientService.getClient(params.id);
        setClient(clientData);
        
        // Populate form with client data (same fields as registration)
        form.setValue('name', clientData.name);
        form.setValue('cpf', clientData.cpf);
        form.setValue('email', clientData.contact.email);
        form.setValue('phone', clientData.contact.phone);
        form.setValue('investmentProfile', clientData.investmentProfile);
        
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
  }, [params.id, authLoading, form]);

  const onSubmit = async (data: QuickClientFormData) => {
    try {
      setIsSubmitting(true);

      // Update only the basic fields (same as registration form)
      const updatedClient: Partial<Client> = {
        name: data.name,
        cpf: data.cpf,
        contact: {
          ...client?.contact, // Keep existing contact info
          email: data.email,
          phone: data.phone,
        },
        investmentProfile: data.investmentProfile,
      };

      await clientService.updateClient(params.id, updatedClient);
      
      toast.success('Cliente atualizado com sucesso!');
      router.push(`/clients/${params.id}`);
      
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return <AuthLoadingScreen text="Carregando dados do cliente..." />;
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
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/clients/${params.id}`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Cliente
          </h1>
          <p className="text-gray-600 mt-2">
            {client.name}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Edite as informações essenciais do cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CPF */}
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          maxLength={14}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 11) {
                              const formatted = formatCPF(value);
                              field.onChange(formatted);
                            }
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Telefone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          maxLength={15}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 11) {
                              const formatted = formatPhone(value);
                              field.onChange(formatted);
                            }
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Perfil de Investimento */}
                <FormField
                  control={form.control}
                  name="investmentProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil de Investimento *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <option value="not_defined">Não definido</option>
                          <option value="conservative">Conservador</option>
                          <option value="moderate">Moderado</option>
                          <option value="aggressive">Arrojado</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Link href={`/clients/${params.id}`}>
                    <Button variant="outline" disabled={isSubmitting}>
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Esta é a edição dos campos básicos do cliente</p>
              <p>• Campos adicionais podem ser adicionados futuramente</p>
              <p>• Todos os campos marcados com * são obrigatórios</p>
              <p>• As alterações serão salvas imediatamente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}