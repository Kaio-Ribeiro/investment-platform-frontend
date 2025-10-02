import { apiClient, checkBackendHealth } from '../lib/api';
import { mockClientService } from './clientService';
import type { Client, ClientWithAssets, ClientFilters } from '../types/client';
import type { PaginatedResponse } from '../lib/api';

export interface ClientService {
  getClients: (
    filters?: ClientFilters,
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    page?: number,
    limit?: number
  ) => Promise<PaginatedResponse<Client>>;
  getClient: (id: string) => Promise<Client>;
  createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  getClientWithAssets: (id: string) => Promise<ClientWithAssets>;
}

class RealClientService implements ClientService {
  async getClients(
    filters?: ClientFilters,
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.investmentProfile) params.append('investment_profile', filters.investmentProfile);
    if (sortBy) {
      params.append('sort_by', sortBy.field);
      params.append('sort_direction', sortBy.direction);
    }

    return apiClient.get<PaginatedResponse<Client>>(`/api/clients?${params}`);
  }

  async getClient(id: string): Promise<Client> {
    return apiClient.get<Client>(`/api/clients/${id}`);
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    return apiClient.post<Client>('/api/clients', client);
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    return apiClient.put<Client>(`/api/clients/${id}`, client);
  }

  async deleteClient(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/clients/${id}`);
  }

  async getClientWithAssets(id: string): Promise<ClientWithAssets> {
    return apiClient.get<ClientWithAssets>(`/api/clients/${id}/assets`);
  }
}

class ClientServiceAdapter {
  private realService = new RealClientService();
  private backendAvailable: boolean | null = null;

  private async checkBackend(): Promise<boolean> {
    if (this.backendAvailable === null) {
      this.backendAvailable = await checkBackendHealth();
    }
    return this.backendAvailable;
  }

  async getClients(
    filters?: ClientFilters,
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Client>> {
    const isBackendAvailable = await this.checkBackend();
    
    if (isBackendAvailable) {
      try {
        return await this.realService.getClients(filters, sortBy, page, limit);
      } catch (error) {
        console.warn('Real API failed, falling back to mock');
        this.backendAvailable = false;
      }
    }
    
    return mockClientService.getClients(filters, sortBy, page, limit);
  }

  async getClient(id: string): Promise<Client> {
    const isBackendAvailable = await this.checkBackend();
    
    if (isBackendAvailable) {
      try {
        return await this.realService.getClient(id);
      } catch (error) {
        console.warn('Real API failed, falling back to mock');
        this.backendAvailable = false;
      }
    }
    
    return mockClientService.getClient(id);
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const isBackendAvailable = await this.checkBackend();
    
    if (isBackendAvailable) {
      try {
        return await this.realService.createClient(client);
      } catch (error) {
        console.warn('Real API failed, falling back to mock');
        this.backendAvailable = false;
      }
    }
    
    return mockClientService.createClient(client);
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const isBackendAvailable = await this.checkBackend();
    
    if (isBackendAvailable) {
      try {
        return await this.realService.updateClient(id, client);
      } catch (error) {
        console.warn('Real API failed, falling back to mock');
        this.backendAvailable = false;
      }
    }
    
    return mockClientService.updateClient(id, client);
  }

  async deleteClient(id: string): Promise<void> {
    const isBackendAvailable = await this.checkBackend();
    
    if (isBackendAvailable) {
      try {
        return await this.realService.deleteClient(id);
      } catch (error) {
        console.warn('Real API failed, falling back to mock');
        this.backendAvailable = false;
      }
    }
    
    return mockClientService.deleteClient(id);
  }

  async getClientWithAssets(id: string): Promise<ClientWithAssets> {
    const isBackendAvailable = await this.checkBackend();
    
    if (isBackendAvailable) {
      try {
        return await this.realService.getClientWithAssets(id);
      } catch (error) {
        console.warn('Real API failed, falling back to mock');
        this.backendAvailable = false;
      }
    }
    
    return mockClientService.getClientWithAssets(id);
  }
}

export const clientService = new ClientServiceAdapter();