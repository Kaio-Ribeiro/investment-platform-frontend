import { apiClient, checkBackendHealth } from '../lib/api';
import { mockClientService } from './clientService';
import type { Client, ClientWithAssets, ClientFilters, InvestmentProfile, ClientStatus } from '../types/client';
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
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });

    // Only add non-empty filters
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.investmentProfile) params.append('investment_profile', filters.investmentProfile);
    if (sortBy) {
      params.append('sort_by', sortBy.field);
      params.append('sort_direction', sortBy.direction);
    }

    // Backend agora retorna dados completos
    const backendClients = await apiClient.get<any[]>(`/clients?${params}`);
    
    // Otimized conversion with minimal processing
    const frontendClients: Client[] = backendClients.map(bc => {
      // Parse dates only once
      const createdAt = new Date(bc.created_at);
      const updatedAt = new Date(bc.updated_at);
      const birthDate = bc.birth_date ? new Date(bc.birth_date) : new Date();
      
      return {
        id: bc.id.toString(),
        name: bc.name || '',
        cpf: bc.cpf || '',
        rg: bc.rg,
        birthDate,
        gender: bc.gender as 'male' | 'female' | 'other',
        contact: {
          email: bc.email || '',
          phone: bc.phone || '',
          mobile: bc.mobile,
          whatsapp: bc.whatsapp,
        },
        address: {
          street: bc.street || '',
          number: bc.number || '',
          complement: bc.complement,
          neighborhood: bc.neighborhood || '',
          city: bc.city || '',
          state: bc.state || '',
          zipCode: bc.zip_code || '',
          country: bc.country || 'Brasil',
        },
        investmentProfile: (bc.investment_profile || 'not_defined') as InvestmentProfile,
        riskTolerance: bc.risk_tolerance ?? 5,
        investmentExperience: (bc.investment_experience || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        monthlyIncome: bc.monthly_income ?? 0,
        netWorth: bc.net_worth ?? 0,
        investmentGoals: bc.investment_goals ?? [],
        status: (bc.status || 'active') as ClientStatus,
        createdAt,
        updatedAt,
        createdBy: bc.created_by || 'system',
        lastContactDate: bc.last_contact_date ? new Date(bc.last_contact_date) : undefined,
        notes: bc.notes || '',
        tags: bc.tags ?? [],
        referralSource: bc.referral_source,
      };
    });
    
    return {
      items: frontendClients,
      total: frontendClients.length,
      page: page,
      totalPages: Math.ceil(frontendClients.length / limit),
    };
  }

  async getClient(id: string): Promise<Client> {
    return apiClient.get<Client>(`/clients/${id}`);
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    // Convert frontend format to backend format
    const backendData = {
      name: client.name,
      email: client.contact.email,
      cpf: client.cpf,
      rg: client.rg,
      birth_date: client.birthDate?.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      gender: client.gender,
      phone: client.contact.phone,
      mobile: client.contact.mobile,
      whatsapp: client.contact.whatsapp,
      street: client.address.street,
      number: client.address.number,
      complement: client.address.complement,
      neighborhood: client.address.neighborhood,
      city: client.address.city,
      state: client.address.state,
      zip_code: client.address.zipCode,
      country: client.address.country,
      investment_profile: client.investmentProfile,
      risk_tolerance: client.riskTolerance,
      investment_experience: client.investmentExperience,
      monthly_income: client.monthlyIncome,
      net_worth: client.netWorth,
      investment_goals: client.investmentGoals,
      status: client.status,
      notes: client.notes,
      tags: client.tags,
      referral_source: client.referralSource,
    };

    const backendClient = await apiClient.post<any>('/clients', backendData);
    
    // Convert response back to frontend format
    const result = {
      id: backendClient.id.toString(),
      name: backendClient.name,
      cpf: backendClient.cpf,
      rg: backendClient.rg,
      birthDate: new Date(backendClient.birth_date),
      gender: backendClient.gender,
      contact: {
        email: backendClient.email,
        phone: backendClient.phone,
        mobile: backendClient.mobile,
        whatsapp: backendClient.whatsapp,
      },
      address: {
        street: backendClient.street,
        number: backendClient.number,
        complement: backendClient.complement,
        neighborhood: backendClient.neighborhood,
        city: backendClient.city,
        state: backendClient.state,
        zipCode: backendClient.zip_code,
        country: backendClient.country,
      },
      investmentProfile: backendClient.investment_profile,
      riskTolerance: backendClient.risk_tolerance,
      investmentExperience: backendClient.investment_experience,
      monthlyIncome: backendClient.monthly_income,
      netWorth: backendClient.net_worth,
      investmentGoals: backendClient.investment_goals,
      status: backendClient.status,
      createdAt: new Date(backendClient.created_at),
      updatedAt: new Date(backendClient.updated_at),
      createdBy: backendClient.created_by,
      lastContactDate: backendClient.last_contact_date ? new Date(backendClient.last_contact_date) : undefined,
      notes: backendClient.notes,
      tags: backendClient.tags,
      referralSource: backendClient.referral_source,
    };
    
    return result;
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    return apiClient.put<Client>(`/clients/${id}`, client);
  }

  async deleteClient(id: string): Promise<void> {
    return apiClient.delete<void>(`/clients/${id}`);
  }

  async getClientWithAssets(id: string): Promise<ClientWithAssets> {
    return apiClient.get<ClientWithAssets>(`/clients/${id}/assets`);
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