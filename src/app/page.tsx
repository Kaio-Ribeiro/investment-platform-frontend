import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Investment Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma completa para gestão de investimentos, clientes e ativos financeiros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                CRUD completo para cadastro e gerenciamento de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Cadastro completo de clientes</li>
                <li>• Busca e filtros avançados</li>
                <li>• Status ativo/inativo</li>
                <li>• Paginação eficiente</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ativos Financeiros</CardTitle>
              <CardDescription>
                Integração com Yahoo Finance para dados de ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Busca de ativos via API</li>
                <li>• Alocação por cliente</li>
                <li>• Histórico de compras</li>
                <li>• Preços atualizados</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movimentações</CardTitle>
              <CardDescription>
                Controle completo de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Registro de depósitos</li>
                <li>• Controle de retiradas</li>
                <li>• Relatórios por período</li>
                <li>• Exportação Excel/CSV</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">
                Fazer Login
              </Button>
            </Link>
            <Button variant="outline" size="lg" disabled>
              Cadastro (Em breve)
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Teste o sistema de login
          </p>
        </div>
      </div>
    </div>
  );
}
