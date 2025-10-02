import { api } from './api';
import type {
  Movement,
  MovementWithClient,
  MovementSummary,
  CashFlowAnalysis,
  ClientBalance,
  CreateMovementRequest,
  UpdateMovementRequest,
  MovementFilters,
  MovementSortOptions,
  MovementListResponse,
  BatchMovementRequest,
  BatchMovementResponse,
  MovementTemplate,
  MovementReport
} from '../types/movement';

export const movementService = {
  // Movement CRUD operations
  async getMovements(
    filters?: MovementFilters,
    sort?: MovementSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<MovementListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      if (filters.requiresApproval !== undefined) params.append('requiresApproval', filters.requiresApproval.toString());
      if (filters.createdBy) params.append('createdBy', filters.createdBy);
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    const response = await api.get<MovementListResponse>(`/movements?${params}`);
    return response.data;
  },

  async getMovement(id: string): Promise<MovementWithClient> {
    const response = await api.get<MovementWithClient>(`/movements/${id}`);
    return response.data;
  },

  async createMovement(movementData: CreateMovementRequest): Promise<Movement> {
    const response = await api.post<Movement>('/movements', movementData);
    return response.data;
  },

  async updateMovement(movementData: UpdateMovementRequest): Promise<Movement> {
    const { id, ...updateData } = movementData;
    const response = await api.put<Movement>(`/movements/${id}`, updateData);
    return response.data;
  },

  async deleteMovement(id: string): Promise<void> {
    await api.delete(`/movements/${id}`);
  },

  // Batch operations
  async createBatchMovements(batchData: BatchMovementRequest): Promise<BatchMovementResponse> {
    const response = await api.post<BatchMovementResponse>('/movements/batch', batchData);
    return response.data;
  },

  // Approval workflow
  async approveMovement(id: string): Promise<Movement> {
    const response = await api.patch<Movement>(`/movements/${id}/approve`);
    return response.data;
  },

  async rejectMovement(id: string, reason?: string): Promise<Movement> {
    const response = await api.patch<Movement>(`/movements/${id}/reject`, { reason });
    return response.data;
  },

  // Client-specific operations
  async getClientMovements(clientId: string, page: number = 1, limit: number = 10): Promise<MovementListResponse> {
    const response = await api.get<MovementListResponse>(`/clients/${clientId}/movements?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getClientBalance(clientId: string): Promise<ClientBalance> {
    const response = await api.get<ClientBalance>(`/clients/${clientId}/balance`);
    return response.data;
  },

  // Analytics and reporting
  async getMovementSummary(filters?: MovementFilters): Promise<MovementSummary> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await api.get<MovementSummary>(`/movements/summary?${params}`);
    return response.data;
  },

  async getCashFlowAnalysis(
    clientId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<CashFlowAnalysis> {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<CashFlowAnalysis>(`/movements/cash-flow?${params}`);
    return response.data;
  },

  async generateReport(filters: MovementFilters, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<MovementReport> {
    const response = await api.post<MovementReport>('/movements/reports', { filters, format });
    return response.data;
  },

  // Templates
  async getMovementTemplates(): Promise<MovementTemplate[]> {
    const response = await api.get<MovementTemplate[]>('/movement-templates');
    return response.data;
  },

  async createMovementTemplate(templateData: Omit<MovementTemplate, 'id' | 'usageCount' | 'lastUsed' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<MovementTemplate> {
    const response = await api.post<MovementTemplate>('/movement-templates', templateData);
    return response.data;
  },

  async updateMovementTemplate(id: string, templateData: Partial<MovementTemplate>): Promise<MovementTemplate> {
    const response = await api.put<MovementTemplate>(`/movement-templates/${id}`, templateData);
    return response.data;
  },

  async deleteMovementTemplate(id: string): Promise<void> {
    await api.delete(`/movement-templates/${id}`);
  },

  async createMovementFromTemplate(templateId: string, overrides?: Partial<CreateMovementRequest>): Promise<Movement> {
    const response = await api.post<Movement>(`/movement-templates/${templateId}/create`, overrides);
    return response.data;
  },
};

// Mock service for development
export const mockMovementService = {
  async getMovements(
    filters?: MovementFilters,
    sort?: MovementSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<MovementListResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockMovements: MovementWithClient[] = [
      {
        id: '1',
        clientId: '1',
        clientName: 'João Silva',
        clientEmail: 'joao@email.com',
        clientCpf: '123.456.789-00',
        type: 'deposit',
        amount: 5000,
        currency: 'BRL',
        description: 'Depósito inicial para investimentos',
        paymentMethod: 'pix',
        status: 'completed',
        requestedDate: new Date('2024-12-01'),
        processedDate: new Date('2024-12-01'),
        completedDate: new Date('2024-12-01'),
        bankDetails: {
          pixKey: '123.456.789-00',
          pixKeyType: 'cpf',
        },
        requiresApproval: false,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01'),
        createdBy: 'admin',
      },
      {
        id: '2',
        clientId: '2',
        clientName: 'Maria Santos',
        clientEmail: 'maria@email.com',
        clientCpf: '987.654.321-00',
        type: 'withdrawal',
        amount: 1500,
        currency: 'BRL',
        description: 'Saque para despesas pessoais',
        paymentMethod: 'ted',
        status: 'pending',
        requestedDate: new Date('2024-12-02'),
        bankDetails: {
          bankCode: '341',
          bankName: 'Itaú Unibanco',
          agency: '1234',
          account: '56789-0',
          accountType: 'checking',
        },
        requiresApproval: true,
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-02'),
        createdBy: 'user',
      },
      {
        id: '3',
        clientId: '1',
        clientName: 'João Silva',
        clientEmail: 'joao@email.com',
        clientCpf: '123.456.789-00',
        type: 'dividend',
        amount: 87.50,
        currency: 'BRL',
        description: 'Dividendos PETR4 - Novembro 2024',
        status: 'completed',
        requestedDate: new Date('2024-11-30'),
        completedDate: new Date('2024-11-30'),
        relatedAssetId: 'PETR4',
        requiresApproval: false,
        createdAt: new Date('2024-11-30'),
        updatedAt: new Date('2024-11-30'),
        createdBy: 'system',
      },
      {
        id: '4',
        clientId: '2',
        clientName: 'Maria Santos',
        clientEmail: 'maria@email.com',
        clientCpf: '987.654.321-00',
        type: 'fee',
        amount: 12.50,
        currency: 'BRL',
        description: 'Taxa de custódia - Novembro 2024',
        status: 'completed',
        requestedDate: new Date('2024-11-30'),
        completedDate: new Date('2024-11-30'),
        requiresApproval: false,
        createdAt: new Date('2024-11-30'),
        updatedAt: new Date('2024-11-30'),
        createdBy: 'system',
      },
      {
        id: '5',
        clientId: '1',
        clientName: 'João Silva',
        clientEmail: 'joao@email.com',
        clientCpf: '123.456.789-00',
        type: 'deposit',
        amount: 2000,
        currency: 'BRL',
        description: 'Aporte mensal programado',
        paymentMethod: 'bank_transfer',
        status: 'processing',
        requestedDate: new Date('2024-12-03'),
        processedDate: new Date('2024-12-03'),
        bankDetails: {
          bankCode: '001',
          bankName: 'Banco do Brasil',
          agency: '5678',
          account: '12345-6',
          accountType: 'checking',
        },
        requiresApproval: false,
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date('2024-12-03'),
        createdBy: 'user',
      },
    ];

    // Apply filters
    let filteredMovements = mockMovements;

    if (filters?.clientId) {
      filteredMovements = filteredMovements.filter(m => m.clientId === filters.clientId);
    }

    if (filters?.type) {
      filteredMovements = filteredMovements.filter(m => m.type === filters.type);
    }

    if (filters?.status) {
      filteredMovements = filteredMovements.filter(m => m.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredMovements = filteredMovements.filter(m => 
        m.description.toLowerCase().includes(searchLower) ||
        m.clientName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sort) {
      filteredMovements.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sort.field) {
          case 'requestedDate':
            aValue = new Date(a.requestedDate);
            bValue = new Date(b.requestedDate);
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'clientName':
            aValue = a.clientName;
            bValue = b.clientName;
            break;
          default:
            aValue = a[sort.field];
            bValue = b[sort.field];
        }

        if (sort.direction === 'desc') {
          [aValue, bValue] = [bValue, aValue];
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex);

    // Summary calculations
    const totalAmount = filteredMovements.reduce((sum, m) => sum + m.amount, 0);
    const depositAmount = filteredMovements
      .filter(m => ['deposit', 'transfer_in', 'dividend', 'interest', 'bonus'].includes(m.type))
      .reduce((sum, m) => sum + m.amount, 0);
    const withdrawalAmount = filteredMovements
      .filter(m => ['withdrawal', 'transfer_out', 'fee'].includes(m.type))
      .reduce((sum, m) => sum + m.amount, 0);
    const pendingCount = filteredMovements.filter(m => m.status === 'pending').length;

    return {
      movements: paginatedMovements,
      total: filteredMovements.length,
      page,
      limit,
      totalPages: Math.ceil(filteredMovements.length / limit),
      summary: {
        totalAmount,
        depositAmount,
        withdrawalAmount,
        pendingCount,
      },
    };
  },

  async getMovement(id: string): Promise<MovementWithClient> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const movements = await this.getMovements();
    const movement = movements.movements.find(m => m.id === id);
    
    if (!movement) {
      throw new Error('Movimentação não encontrada');
    }
    
    return movement;
  },

  async createMovement(movementData: CreateMovementRequest): Promise<Movement> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      ...movementData,
      currency: 'BRL',
      status: movementData.requiresApproval ? 'pending' : 'processing',
      requestedDate: new Date(),
      requiresApproval: movementData.requiresApproval || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
    };

    return newMovement;
  },

  async getClientBalance(clientId: string): Promise<ClientBalance> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock balance data based on clientId
    const mockBalances: Record<string, ClientBalance> = {
      '1': {
        clientId: '1',
        availableBalance: 15432.50,
        pendingDeposits: 2000,
        pendingWithdrawals: 0,
        totalBalance: 17432.50,
        lastMovementDate: new Date('2024-12-03'),
        accountStatus: 'active',
        balanceHistory: [
          { date: new Date('2024-12-01'), balance: 5000 },
          { date: new Date('2024-12-02'), balance: 5087.50 },
          { date: new Date('2024-12-03'), balance: 15432.50 },
        ],
      },
      '2': {
        clientId: '2',
        availableBalance: 2987.50,
        pendingDeposits: 0,
        pendingWithdrawals: 1500,
        totalBalance: 1487.50,
        lastMovementDate: new Date('2024-12-02'),
        accountStatus: 'active',
        balanceHistory: [
          { date: new Date('2024-11-30'), balance: 3000 },
          { date: new Date('2024-12-01'), balance: 2987.50 },
        ],
      },
    };

    return mockBalances[clientId] || {
      clientId,
      availableBalance: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      totalBalance: 0,
      accountStatus: 'active',
      balanceHistory: [],
    };
  },

  async getMovementSummary(_filters?: MovementFilters): Promise<MovementSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const movements = await this.getMovements();
    
    return {
      totalDeposits: 12000,
      totalWithdrawals: 2012.50,
      netFlow: 9987.50,
      pendingAmount: 3500,
      completedCount: 4,
      pendingCount: 1,
      
      periodSummary: [
        { period: '2024-11', deposits: 5000, withdrawals: 12.50, netFlow: 4987.50 },
        { period: '2024-12', deposits: 7000, withdrawals: 2000, netFlow: 5000 },
      ],
      
      byType: [
        { type: 'deposit', label: 'Depósitos', amount: 12000, count: 3, percentage: 80.5 },
        { type: 'withdrawal', label: 'Saques', amount: 1500, count: 1, percentage: 10.1 },
        { type: 'dividend', label: 'Dividendos', amount: 87.50, count: 1, percentage: 0.6 },
        { type: 'fee', label: 'Taxas', amount: 12.50, count: 1, percentage: 0.1 },
      ],
      
      recentMovements: movements.movements.slice(0, 3),
    };
  },

  async approveMovement(id: string): Promise<Movement> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const movement = await this.getMovement(id);
    return {
      ...movement,
      status: 'processing',
      processedDate: new Date(),
      approvedBy: 'admin',
      approvedDate: new Date(),
      updatedAt: new Date(),
    };
  },
};

export default movementService;