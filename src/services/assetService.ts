import { api } from './api';
import type {
  Asset,
  Investment,
  Client,
  Transaction,
  Portfolio,
  CreateAssetRequest,
  CreateInvestmentRequest,
  CreateTransactionRequest,
  AssetListResponse,
  InvestmentListResponse,
  TransactionListResponse,
  AssetFilters,
  InvestmentFilters,
  TransactionFilters,
  PortfolioSummary,
  PerformanceMetrics,
  MarketData
} from '../types/investment';

export const assetService = {
  // Asset management
  async getAssets(
    filters?: AssetFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<AssetListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.sector) params.append('sector', filters.sector);
      if (filters.currency) params.append('currency', filters.currency);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    }

    const response = await api.get<AssetListResponse>(`/assets?${params}`);
    return response.data;
  },

  async getAsset(id: string): Promise<Asset> {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  async createAsset(assetData: CreateAssetRequest): Promise<Asset> {
    const response = await api.post<Asset>('/assets', assetData);
    return response.data;
  },

  async updateAsset(id: string, assetData: Partial<CreateAssetRequest>): Promise<Asset> {
    const response = await api.put<Asset>(`/assets/${id}`, assetData);
    return response.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async searchAssets(query: string): Promise<Asset[]> {
    const response = await api.get<Asset[]>(`/assets/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Investment management
  async getInvestments(
    filters?: InvestmentFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<InvestmentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.assetType) params.append('assetType', filters.assetType);
      if (filters.status) params.append('status', filters.status);
      if (filters.minValue) params.append('minValue', filters.minValue.toString());
      if (filters.maxValue) params.append('maxValue', filters.maxValue.toString());
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
    }

    const response = await api.get<InvestmentListResponse>(`/investments?${params}`);
    return response.data;
  },

  async getInvestment(id: string): Promise<Investment> {
    const response = await api.get<Investment>(`/investments/${id}`);
    return response.data;
  },

  async createInvestment(investmentData: {
    clientId: string;
    assetId: string;
    assetSymbol: string;
    assetName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    transactionType: 'buy' | 'sell';
    notes?: string;
    transactionDate: Date;
  }): Promise<Investment> {
    const response = await api.post<Investment>('/investments', investmentData);
    return response.data;
  },

  async updateInvestment(id: string, investmentData: Partial<CreateInvestmentRequest>): Promise<Investment> {
    const response = await api.put<Investment>(`/investments/${id}`, investmentData);
    return response.data;
  },

  async deleteInvestment(id: string): Promise<void> {
    await api.delete(`/investments/${id}`);
  },

  // Transaction management
  async getTransactions(
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<TransactionListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.investmentId) params.append('investmentId', filters.investmentId);
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    }

    const response = await api.get<TransactionListResponse>(`/transactions?${params}`);
    return response.data;
  },

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', transactionData);
    return response.data;
  },

  // Portfolio and analytics
  async getClientPortfolio(clientId: string): Promise<Portfolio> {
    const response = await api.get<Portfolio>(`/clients/${clientId}/portfolio`);
    return response.data;
  },

  async getPortfolioSummary(clientId: string): Promise<PortfolioSummary> {
    const response = await api.get<PortfolioSummary>(`/clients/${clientId}/portfolio/summary`);
    return response.data;
  },

  async getPerformanceMetrics(clientId: string, period?: string): Promise<PerformanceMetrics> {
    const params = period ? `?period=${period}` : '';
    const response = await api.get<PerformanceMetrics>(`/clients/${clientId}/portfolio/performance${params}`);
    return response.data;
  },

  // Market data
  async getMarketData(symbol: string): Promise<MarketData> {
    const response = await api.get<MarketData>(`/market/${symbol}`);
    return response.data;
  },

  async updateAssetPrices(): Promise<void> {
    await api.post('/market/update-prices');
  },
};

// Mock data for development
export const mockAssetService = {
  async getAssets(): Promise<AssetListResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockAssets: Asset[] = [
      {
        id: '1',
        symbol: 'PETR4',
        name: 'Petróleo Brasileiro S.A. - Petrobras',
        type: 'stocks',
        sector: 'Energia',
        description: 'Empresa brasileira de energia',
        currentPrice: 32.45,
        currency: 'BRL',
        marketCap: 422000000000,
        dividendYield: 8.5,
        lastUpdate: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '2',
        symbol: 'HGLG11',
        name: 'CSHG Logística Fundo de Investimento Imobiliário',
        type: 'real_estate_funds',
        sector: 'Logística',
        description: 'Fundo imobiliário focado em logística',
        currentPrice: 151.20,
        currency: 'BRL',
        dividendYield: 0.95,
        lastUpdate: new Date(),
        manager: 'CSHG Asset Management',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '3',
        symbol: 'ITUB4',
        name: 'Itaú Unibanco Holding S.A.',
        type: 'stocks',
        sector: 'Financeiro',
        description: 'Maior banco privado do Brasil',
        currentPrice: 35.80,
        currency: 'BRL',
        marketCap: 340000000000,
        dividendYield: 5.2,
        lastUpdate: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
    ];

    return {
      assets: mockAssets,
      total: mockAssets.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  },

  async getInvestments(): Promise<InvestmentListResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockInvestments: Investment[] = [
      {
        id: '1',
        clientId: '1',
        assetId: '1',
        quantity: 100,
        averagePrice: 30.50,
        currentPrice: 32.45,
        totalInvested: 3050,
        currentValue: 3245,
        profitLoss: 195,
        profitLossPercentage: 6.39,
        status: 'active',
        firstPurchaseDate: new Date('2024-06-15'),
        lastTransactionDate: new Date('2024-08-20'),
        notes: 'Posição estratégica em energia',
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-08-20'),
        createdBy: 'user1',
      },
      {
        id: '2',
        clientId: '1',
        assetId: '2',
        quantity: 20,
        averagePrice: 148.75,
        currentPrice: 151.20,
        totalInvested: 2975,
        currentValue: 3024,
        profitLoss: 49,
        profitLossPercentage: 1.65,
        status: 'active',
        firstPurchaseDate: new Date('2024-07-10'),
        lastTransactionDate: new Date('2024-07-10'),
        targetAllocation: 15,
        notes: 'Diversificação em fundos imobiliários',
        createdAt: new Date('2024-07-10'),
        updatedAt: new Date('2024-07-10'),
        createdBy: 'user1',
      },
    ];

    return {
      investments: mockInvestments,
      total: mockInvestments.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  },

  // Create new investment
  async createInvestment(investmentData: {
    clientId: string;
    assetId: string;
    assetSymbol: string;
    assetName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    transactionType: 'buy' | 'sell';
    notes?: string;
    transactionDate: Date;
  }): Promise<Investment> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newInvestment: Investment = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: investmentData.clientId,
      assetId: investmentData.assetId,
      quantity: investmentData.quantity,
      averagePrice: investmentData.unitPrice,
      currentPrice: investmentData.unitPrice,
      totalInvested: investmentData.totalAmount,
      currentValue: investmentData.totalAmount,
      profitLoss: 0,
      profitLossPercentage: 0,
      status: 'active',
      firstPurchaseDate: investmentData.transactionDate,
      lastTransactionDate: investmentData.transactionDate,
      notes: investmentData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
    };

    return newInvestment;
  },

  async getPortfolioSummary(_clientId: string): Promise<PortfolioSummary> {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      totalPortfolioValue: 6269,
      totalInvested: 6025,
      totalProfitLoss: 244,
      totalProfitLossPercentage: 4.05,
      topPerformers: [
        {
          assetName: 'Petróleo Brasileiro S.A. - Petrobras',
          symbol: 'PETR4',
          profitLossPercentage: 6.39,
          currentValue: 3245,
        },
        {
          assetName: 'CSHG Logística Fundo de Investimento Imobiliário',
          symbol: 'HGLG11',
          profitLossPercentage: 1.65,
          currentValue: 3024,
        },
      ],
      assetAllocation: {
        stocks: {
          name: 'Ações',
          value: 3245,
          percentage: 51.8,
          color: '#3B82F6',
        },
        real_estate_funds: {
          name: 'Fundos Imobiliários',
          value: 3024,
          percentage: 48.2,
          color: '#10B981',
        },
      },
      recentTransactions: [],
    };
  },
};

// Mock client service for development
export const mockClientService = {
  async getClients(): Promise<{ clients: Client[] }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        status: 'active',
        investmentProfile: 'moderate',
        totalInvested: 50000,
        portfolioValue: 52500,
        profitLoss: 2500,
        profitLossPercentage: 5.0,
        registrationDate: new Date('2024-01-15'),
        lastActivity: new Date('2024-12-01'),
        tags: ['premium', 'long-term'],
        isActive: true,
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@email.com',
        cpf: '987.654.321-00',
        phone: '(11) 88888-8888',
        status: 'active',
        investmentProfile: 'conservative',
        totalInvested: 30000,
        portfolioValue: 31200,
        profitLoss: 1200,
        profitLossPercentage: 4.0,
        registrationDate: new Date('2024-03-20'),
        lastActivity: new Date('2024-11-28'),
        tags: ['conservative'],
        isActive: true,
      },
    ];

    return { clients: mockClients };
  },
};