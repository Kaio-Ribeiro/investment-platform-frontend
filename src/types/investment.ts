// Asset and investment management types and interfaces

export type AssetType = 
  | 'stocks' 
  | 'bonds' 
  | 'real_estate_funds' 
  | 'investment_funds' 
  | 'fixed_income' 
  | 'savings' 
  | 'crypto' 
  | 'commodities' 
  | 'international' 
  | 'other';

export type InvestmentStatus = 'active' | 'sold' | 'matured' | 'suspended';

export type TransactionType = 'buy' | 'sell' | 'dividend' | 'interest' | 'split' | 'bonus';

// Base Asset Information
export interface Asset {
  id: string;
  symbol: string; // Ticker symbol or identifier
  name: string;
  type: AssetType;
  sector?: string;
  description?: string;
  currentPrice?: number;
  currency: string;
  
  // Market data
  marketCap?: number;
  dividendYield?: number;
  lastUpdate: Date;
  
  // Additional info
  isin?: string; // International Securities Identification Number
  cnpj?: string; // For Brazilian funds
  manager?: string; // Fund manager or company
  benchmark?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Client Investment Position
export interface Investment {
  id: string;
  clientId: string;
  assetId: string;
  
  // Position details
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  
  // Investment details
  status: InvestmentStatus;
  firstPurchaseDate: Date;
  lastTransactionDate: Date;
  
  // Strategy and goals
  targetAllocation?: number; // Percentage of total portfolio
  stopLoss?: number;
  targetPrice?: number;
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Transaction History
export interface Transaction {
  id: string;
  investmentId: string;
  clientId: string;
  assetId: string;
  
  // Transaction details
  type: TransactionType;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  taxes: number;
  netAmount: number;
  
  // Transaction info
  date: Date;
  description?: string;
  brokerage?: string;
  orderNumber?: string;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
}

// Portfolio Summary
export interface Portfolio {
  id: string;
  clientId: string;
  
  // Portfolio metrics
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  
  // Allocation by asset type
  allocation: {
    [key in AssetType]?: {
      value: number;
      percentage: number;
      count: number;
    };
  };
  
  // Performance metrics
  monthlyReturn?: number;
  yearlyReturn?: number;
  volatility?: number;
  sharpeRatio?: number;
  
  // Dates
  lastUpdate: Date;
  createdAt: Date;
}

// API Request/Response Types
export interface CreateAssetRequest {
  symbol: string;
  name: string;
  type: AssetType;
  sector?: string;
  description?: string;
  currentPrice?: number;
  currency: string;
  isin?: string;
  cnpj?: string;
  manager?: string;
  benchmark?: string;
}

export interface CreateInvestmentRequest {
  clientId: string;
  assetId: string;
  quantity: number;
  price: number;
  date: string; // ISO date string
  fees?: number;
  taxes?: number;
  brokerage?: string;
  notes?: string;
}

export interface CreateTransactionRequest {
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  date: string;
  fees?: number;
  taxes?: number;
  description?: string;
  brokerage?: string;
  orderNumber?: string;
}

export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvestmentListResponse {
  investments: Investment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and Search Types
export interface AssetFilters {
  search?: string;
  type?: AssetType;
  sector?: string;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface InvestmentFilters {
  clientId?: string;
  assetType?: AssetType;
  status?: InvestmentStatus;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionFilters {
  clientId?: string;
  investmentId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Analytics and Reporting Types
export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  monthlyReturn: number;
  yearlyReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestMonth: number;
  worstMonth: number;
}

export interface AssetAllocation {
  [key: string]: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  };
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  topPerformers: Array<{
    assetName: string;
    symbol: string;
    profitLossPercentage: number;
    currentValue: number;
  }>;
  assetAllocation: AssetAllocation;
  recentTransactions: Transaction[];
}

// Utility Types
export interface PriceHistory {
  date: Date;
  price: number;
  volume?: number;
}

export interface MarketData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercentage: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  marketCap?: number;
  lastUpdate: Date;
}

// Client type for investment forms
export interface Client {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'prospect' | 'suspended';
  investmentProfile: 'conservative' | 'moderate' | 'aggressive';
  totalInvested: number;
  portfolioValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  registrationDate: Date;
  lastActivity?: Date;
  tags: string[];
  isActive: boolean;
}