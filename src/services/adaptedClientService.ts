import { apiClient, checkBackendHealth } from '../lib/api';
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
    const backendClient = await apiClient.get<any>(`/clients/${id}`);
    
    // Convert backend format to frontend format (same as in getClients)
    const createdAt = backendClient.created_at ? new Date(backendClient.created_at) : new Date();
    const updatedAt = backendClient.updated_at ? new Date(backendClient.updated_at) : new Date();

    return {
      id: backendClient.id.toString(),
      name: backendClient.name,
      cpf: backendClient.cpf,
      rg: backendClient.rg,
      birthDate: new Date(backendClient.birth_date),
      gender: backendClient.gender,
      contact: {
        email: backendClient.email,
        phone: backendClient.phone || '',
        mobile: backendClient.mobile,
        whatsapp: backendClient.whatsapp,
      },
      address: {
        street: backendClient.street || '',
        number: backendClient.number || '',
        complement: backendClient.complement,
        neighborhood: backendClient.neighborhood || '',
        city: backendClient.city || '',
        state: backendClient.state || '',
        zipCode: backendClient.zip_code || '',
        country: backendClient.country || 'Brasil',
      },
      investmentProfile: (backendClient.investment_profile || 'not_defined') as InvestmentProfile,
      riskTolerance: backendClient.risk_tolerance ?? 5,
      investmentExperience: (backendClient.investment_experience || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      monthlyIncome: backendClient.monthly_income ?? 0,
      netWorth: backendClient.net_worth ?? 0,
      investmentGoals: backendClient.investment_goals ?? [],
      status: (backendClient.status || 'active') as ClientStatus,
      createdAt,
      updatedAt,
      createdBy: backendClient.created_by || 'system',
      lastContactDate: backendClient.last_contact_date ? new Date(backendClient.last_contact_date) : undefined,
      notes: backendClient.notes || '',
      tags: backendClient.tags ?? [],
      referralSource: backendClient.referral_source,
    };
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
    // Convert frontend format to backend format
    const backendData: any = {};
    
    if (client.name !== undefined) backendData.name = client.name;
    if (client.cpf !== undefined) backendData.cpf = client.cpf;
    if (client.rg !== undefined) backendData.rg = client.rg;
    if (client.birthDate !== undefined) backendData.birth_date = client.birthDate.toISOString().split('T')[0];
    if (client.gender !== undefined) backendData.gender = client.gender;
    
    if (client.contact) {
      if (client.contact.email !== undefined) backendData.email = client.contact.email;
      if (client.contact.phone !== undefined) backendData.phone = client.contact.phone;
      if (client.contact.mobile !== undefined) backendData.mobile = client.contact.mobile;
      if (client.contact.whatsapp !== undefined) backendData.whatsapp = client.contact.whatsapp;
    }
    
    if (client.address) {
      if (client.address.street !== undefined) backendData.street = client.address.street;
      if (client.address.number !== undefined) backendData.number = client.address.number;
      if (client.address.complement !== undefined) backendData.complement = client.address.complement;
      if (client.address.neighborhood !== undefined) backendData.neighborhood = client.address.neighborhood;
      if (client.address.city !== undefined) backendData.city = client.address.city;
      if (client.address.state !== undefined) backendData.state = client.address.state;
      if (client.address.zipCode !== undefined) backendData.zip_code = client.address.zipCode;
      if (client.address.country !== undefined) backendData.country = client.address.country;
    }
    
    if (client.investmentProfile !== undefined) backendData.investment_profile = client.investmentProfile;
    if (client.riskTolerance !== undefined) backendData.risk_tolerance = client.riskTolerance;
    if (client.investmentExperience !== undefined) backendData.investment_experience = client.investmentExperience;
    if (client.monthlyIncome !== undefined) backendData.monthly_income = client.monthlyIncome;
    if (client.netWorth !== undefined) backendData.net_worth = client.netWorth;
    if (client.investmentGoals !== undefined) backendData.investment_goals = client.investmentGoals;
    if (client.status !== undefined) backendData.status = client.status;
    if (client.notes !== undefined) backendData.notes = client.notes;
    if (client.tags !== undefined) backendData.tags = client.tags;
    if (client.referralSource !== undefined) backendData.referral_source = client.referralSource;

    const backendClient = await apiClient.put<any>(`/clients/${id}`, backendData);
    
    // Convert response back to frontend format
    const createdAt = backendClient.created_at ? new Date(backendClient.created_at) : new Date();
    const updatedAt = backendClient.updated_at ? new Date(backendClient.updated_at) : new Date();

    return {
      id: backendClient.id.toString(),
      name: backendClient.name,
      cpf: backendClient.cpf,
      rg: backendClient.rg,
      birthDate: new Date(backendClient.birth_date),
      gender: backendClient.gender,
      contact: {
        email: backendClient.email,
        phone: backendClient.phone || '',
        mobile: backendClient.mobile,
        whatsapp: backendClient.whatsapp,
      },
      address: {
        street: backendClient.street || '',
        number: backendClient.number || '',
        complement: backendClient.complement,
        neighborhood: backendClient.neighborhood || '',
        city: backendClient.city || '',
        state: backendClient.state || '',
        zipCode: backendClient.zip_code || '',
        country: backendClient.country || 'Brasil',
      },
      investmentProfile: (backendClient.investment_profile || 'not_defined') as InvestmentProfile,
      riskTolerance: backendClient.risk_tolerance ?? 5,
      investmentExperience: (backendClient.investment_experience || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      monthlyIncome: backendClient.monthly_income ?? 0,
      netWorth: backendClient.net_worth ?? 0,
      investmentGoals: backendClient.investment_goals ?? [],
      status: (backendClient.status || 'active') as ClientStatus,
      createdAt,
      updatedAt,
      createdBy: backendClient.created_by || 'system',
      lastContactDate: backendClient.last_contact_date ? new Date(backendClient.last_contact_date) : undefined,
      notes: backendClient.notes || '',
      tags: backendClient.tags ?? [],
      referralSource: backendClient.referral_source,
    };
  }

  async deleteClient(id: string): Promise<void> {
    return apiClient.delete<void>(`/clients/${id}`);
  }

  async getClientWithAssets(id: string): Promise<ClientWithAssets> {
    return apiClient.get<ClientWithAssets>(`/clients/${id}/assets`);
  }
}

// Export the real service directly since backend is working
export const clientService = new RealClientService();