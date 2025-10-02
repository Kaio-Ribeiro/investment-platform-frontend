'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '../../hooks/useAuth';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLoadingScreen } from '@/components/ui/loading';

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return <AuthLoadingScreen text="Carregando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Investment Platform
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Bem-vindo à sua plataforma de investimentos, {user?.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Gerencie seus clientes e suas informações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/clients">
                <Button className="w-full">
                  Gerenciar Clientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ativos</CardTitle>
              <CardDescription>
                Visualize e gerencie ativos financeiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assets">
                <Button className="w-full">
                  Gerenciar Ativos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movimentações</CardTitle>
              <CardDescription>
                Acompanhe entradas e saídas de capital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/movements">
                <Button className="w-full">
                  Gerenciar Movimentações
                </Button>
              </Link>
              <Link href="/movements/analytics">
                <Button variant="outline" className="w-full">
                  Analytics de Cash Flow
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ✅ Sistema de autenticação implementado!
          </h3>
          <p className="text-blue-700">
            Você está autenticado e pode navegar pelo sistema. O sistema agora conta com 
            autenticação robusta, gerenciamento de estado global e proteção de rotas.
          </p>
        </div>
      </main>
    </div>
  );
}