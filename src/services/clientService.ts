import { api } from './api';
import type { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest,
  ClientListResponse,
  ClientFilters,
  ClientSortOptions,
  ClientStats,
  ClientWithAssets
} from '../types/client';

export const clientService = {
  // Get all clients with filtering and pagination
  async getClients(
    filters?: ClientFilters,
    sort?: ClientSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<ClientListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.investmentProfile) params.append('investmentProfile', filters.investmentProfile);
      if (filters.createdFrom) params.append('createdFrom', filters.createdFrom);
      if (filters.createdTo) params.append('createdTo', filters.createdTo);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    const response = await api.get<ClientListResponse>(`/clients?${params}`);
    return response.data;
  },

  // Get client by ID
  async getClient(id: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Create new client
  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await api.post<Client>('/clients', clientData);
    return response.data;
  },

  // Update existing client
  async updateClient(clientData: UpdateClientRequest): Promise<Client> {
    const { id, ...updateData } = clientData;
    const response = await api.put<Client>(`/clients/${id}`, updateData);
    return response.data;
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  // Update client status
  async updateClientStatus(id: string, status: 'active' | 'inactive' | 'prospect' | 'suspended'): Promise<Client> {
    const response = await api.patch<Client>(`/clients/${id}/status`, { status });
    return response.data;
  },

  // Get client statistics
  async getClientStats(): Promise<ClientStats> {
    const response = await api.get<ClientStats>('/clients/stats');
    return response.data;
  },

  // Search clients by name or CPF
  async searchClients(query: string): Promise<Client[]> {
    const response = await api.get<Client[]>(`/clients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Upload client documents
  async uploadDocument(clientId: string, file: File, documentType: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await api.post<{ url: string }>(
      `/clients/${clientId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get client documents
  async getClientDocuments(clientId: string): Promise<Array<{ id: string; name: string; url: string; type: string; uploadedAt: string }>> {
    const response = await api.get(`/clients/${clientId}/documents`);
    return response.data;
  },

  // Add note to client
  async addClientNote(clientId: string, note: string): Promise<void> {
    await api.post(`/clients/${clientId}/notes`, { note });
  },

  // Update last contact date
  async updateLastContact(clientId: string, date?: string): Promise<Client> {
    const contactDate = date || new Date().toISOString();
    const response = await api.patch<Client>(`/clients/${clientId}/contact`, { 
      lastContactDate: contactDate 
    });
    return response.data;
  },

  // Bulk operations
  async bulkUpdateStatus(clientIds: string[], status: 'active' | 'inactive' | 'prospect' | 'suspended'): Promise<void> {
    await api.patch('/clients/bulk/status', { clientIds, status });
  },

  async bulkDelete(clientIds: string[]): Promise<void> {
    await api.delete('/clients/bulk', { data: { clientIds } });
  },

  // Export clients
  async exportClients(filters?: ClientFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.investmentProfile) params.append('investmentProfile', filters.investmentProfile);
      if (filters.createdFrom) params.append('createdFrom', filters.createdFrom);
      if (filters.createdTo) params.append('createdTo', filters.createdTo);
    }

    const response = await api.get(`/clients/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Mock data for development (remove when backend is ready)
export const mockClientService = {
  async getClients(
    filters?: ClientFilters,
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<ClientListResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'João Silva Santos',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        birthDate: new Date('1985-03-15'),
        gender: 'male',
        contact: {
          email: 'joao.silva@email.com',
          phone: '(11) 99999-9999',
          mobile: '(11) 88888-8888',
        },
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil',
        },
        investmentProfile: 'moderate',
        riskTolerance: 5,
        investmentExperience: 'intermediate',
        monthlyIncome: 8000,
        netWorth: 150000,
        investmentGoals: ['Aposentadoria', 'Casa própria'],
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-20'),
        createdBy: 'user1',
        lastContactDate: new Date('2024-09-15'),
        notes: 'Cliente muito interessado em fundos imobiliários',
        tags: ['VIP', 'Potencial Alto'],
        referralSource: 'Indicação de Maria',
      },
      {
        id: '2',
        name: 'Maria Oliveira Costa',
        cpf: '987.654.321-00',
        birthDate: new Date('1990-07-22'),
        gender: 'female',
        contact: {
          email: 'maria.oliveira@email.com',
          phone: '(11) 77777-7777',
        },
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'Brasil',
        },
        investmentProfile: 'conservative',
        riskTolerance: 3,
        investmentExperience: 'beginner',
        monthlyIncome: 5000,
        netWorth: 50000,
        investmentGoals: ['Reserva de emergência'],
        status: 'active',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-09-18'),
        createdBy: 'user1',
        lastContactDate: new Date('2024-09-10'),
        notes: 'Primeira vez investindo, precisa de acompanhamento próximo',
        tags: ['Iniciante'],
        referralSource: 'Site',
      },
    ];

    return {
      items: mockClients,
      total: mockClients.length,
      page: page,
      totalPages: Math.ceil(mockClients.length / limit),
    };
  },

  async getClient(id: string): Promise<Client> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const clientsResponse = await this.getClients();
    const client = clientsResponse.items.find(c => c.id === id);
    
    if (!client) {
      throw new Error('Cliente não encontrado');
    }
    
    return client;
  },

  async getClientStats(): Promise<ClientStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      total: 2,
      active: 2,
      prospects: 0,
      totalInvestments: 12,
      averagePortfolioValue: 100000,
    };
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return newClient;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const existingClient = await this.getClient(id);
    const updatedClient: Client = {
      ...existingClient,
      ...updates,
      updatedAt: new Date(),
    };
    
    return updatedClient;
  },

  async deleteClient(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    // In a real implementation, this would delete the client
    console.log(`Mock: Deleted client ${id}`);
  },

  async getClientWithAssets(id: string): Promise<ClientWithAssets> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const client = await this.getClient(id);
    
    // Mock asset allocations
    const clientWithAssets: ClientWithAssets = {
      ...client,
      totalInvested: 50000,
      currentValue: 55000,
      totalReturn: 5000,
      returnPercentage: 10.0,
      allocations: [
        {
          assetId: 'ITUB4',
          assetName: 'Itaú Unibanco PN',
          assetType: 'Ação',
          quantity: 100,
          averagePrice: 25.50,
          currentPrice: 28.00,
          totalInvested: 2550,
          currentValue: 2800,
          returnAmount: 250,
          returnPercentage: 9.8,
        },
        {
          assetId: 'HGLG11',
          assetName: 'CSHG Logística FII',
          assetType: 'FII',
          quantity: 200,
          averagePrice: 125.00,
          currentPrice: 135.00,
          totalInvested: 25000,
          currentValue: 27000,
          returnAmount: 2000,
          returnPercentage: 8.0,
        },
      ],
    };
    
    return clientWithAssets;
  },
};