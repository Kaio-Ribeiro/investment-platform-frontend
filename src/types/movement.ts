// Financial Movement Types for Investment Platform

export type MovementType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee' | 'dividend' | 'interest' | 'bonus';

export type MovementStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';

export type PaymentMethod = 'bank_transfer' | 'ted' | 'doc' | 'pix' | 'cash' | 'check' | 'credit_card' | 'debit_card';

// Base Movement Information
export interface Movement {
  id: string;
  clientId: string;
  type: MovementType;
  amount: number;
  currency: string;
  
  // Transaction details
  description: string;
  reference?: string; // Bank reference, receipt number, etc.
  paymentMethod?: PaymentMethod;
  
  // Status and timing
  status: MovementStatus;
  requestedDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  
  // Banking information
  bankDetails?: {
    bankCode?: string;
    bankName?: string;
    agency?: string;
    account?: string;
    accountType?: 'checking' | 'savings';
    pixKey?: string;
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  };
  
  // Related entities
  relatedAssetId?: string; // For dividend/interest payments
  relatedInvestmentId?: string;
  transferToClientId?: string; // For transfers between clients
  
  // Fees and taxes
  fees?: {
    transferFee?: number;
    taxWithholding?: number;
    otherFees?: number;
  };
  
  // Additional information
  notes?: string;
  attachments?: string[]; // URLs to receipts, documents
  
  // Approval workflow
  approvedBy?: string;
  approvedDate?: Date;
  requiresApproval: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Movement with Client Information (for lists)
export interface MovementWithClient extends Movement {
  clientName: string;
  clientEmail: string;
  clientCpf?: string;
}

// Movement Summary for Analytics
export interface MovementSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  netFlow: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  
  // By period
  periodSummary: {
    period: string;
    deposits: number;
    withdrawals: number;
    netFlow: number;
  }[];
  
  // By type
  byType: {
    type: MovementType;
    label: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  
  // Recent activity
  recentMovements: MovementWithClient[];
}

// Cash Flow Analysis
export interface CashFlowAnalysis {
  clientId?: string; // If for specific client, otherwise global
  period: {
    start: Date;
    end: Date;
  };
  
  // Summary metrics
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  averageMonthlyInflow: number;
  averageMonthlyOutflow: number;
  
  // Monthly breakdown
  monthlyData: {
    month: string;
    year: number;
    inflow: number;
    outflow: number;
    netFlow: number;
    balance: number;
  }[];
  
  // By category
  inflowByType: {
    type: MovementType;
    amount: number;
    percentage: number;
  }[];
  
  outflowByType: {
    type: MovementType;
    amount: number;
    percentage: number;
  }[];
  
  // Projections
  projectedBalance?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Client Balance Information
export interface ClientBalance {
  clientId: string;
  availableBalance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalBalance: number; // available + pending deposits - pending withdrawals
  lastMovementDate?: Date;
  
  // Account details
  accountStatus: 'active' | 'suspended' | 'blocked';
  overdraftLimit?: number;
  minimumBalance?: number;
  
  // History
  balanceHistory: {
    date: Date;
    balance: number;
    movementId?: string;
  }[];
}

// API Request/Response Types

export interface CreateMovementRequest {
  clientId: string;
  type: MovementType;
  amount: number;
  description: string;
  paymentMethod?: PaymentMethod;
  bankDetails?: Movement['bankDetails'];
  notes?: string;
  requiresApproval?: boolean;
}

export interface UpdateMovementRequest {
  id: string;
  status?: MovementStatus;
  processedDate?: Date;
  completedDate?: Date;
  bankDetails?: Movement['bankDetails'];
  notes?: string;
  fees?: Movement['fees'];
}

export interface MovementFilters {
  clientId?: string;
  type?: MovementType;
  status?: MovementStatus;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string; // Search in description, reference, notes
  requiresApproval?: boolean;
  createdBy?: string;
}

export interface MovementSortOptions {
  field: 'requestedDate' | 'amount' | 'status' | 'type' | 'clientName';
  direction: 'asc' | 'desc';
}

export interface MovementListResponse {
  movements: MovementWithClient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalAmount: number;
    depositAmount: number;
    withdrawalAmount: number;
    pendingCount: number;
  };
}

// Batch Operations
export interface BatchMovementRequest {
  movements: CreateMovementRequest[];
  batchDescription?: string;
  requiresBatchApproval?: boolean;
}

export interface BatchMovementResponse {
  batchId: string;
  successCount: number;
  failureCount: number;
  movements: {
    success: Movement[];
    failed: {
      request: CreateMovementRequest;
      error: string;
    }[];
  };
}

// Movement Templates (for recurring movements)
export interface MovementTemplate {
  id: string;
  name: string;
  description: string;
  type: MovementType;
  defaultAmount?: number;
  paymentMethod?: PaymentMethod;
  bankDetails?: Movement['bankDetails'];
  isRecurring: boolean;
  recurringConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number; // Every X days/weeks/months
    endDate?: Date;
    maxOccurrences?: number;
  };
  
  // Usage tracking
  usageCount: number;
  lastUsed?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Reports
export interface MovementReport {
  reportId: string;
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  filters: MovementFilters;
  
  // Summary data
  summary: MovementSummary;
  cashFlow: CashFlowAnalysis;
  
  // Detailed breakdown
  clientBreakdown: {
    clientId: string;
    clientName: string;
    totalDeposits: number;
    totalWithdrawals: number;
    netFlow: number;
    movementCount: number;
  }[];
  
  // Export options
  exportFormats: ('pdf' | 'excel' | 'csv')[];
  generatedAt: Date;
  generatedBy: string;
}

// Label mappings for UI
export const movementTypeLabels: Record<MovementType, string> = {
  deposit: 'Depósito',
  withdrawal: 'Saque',
  transfer_in: 'Transferência Recebida',
  transfer_out: 'Transferência Enviada',
  fee: 'Taxa',
  dividend: 'Dividendo',
  interest: 'Juros',
  bonus: 'Bonificação',
};

export const movementStatusLabels: Record<MovementStatus, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  failed: 'Falhou',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: 'Transferência Bancária',
  ted: 'TED',
  doc: 'DOC',
  pix: 'PIX',
  cash: 'Dinheiro',
  check: 'Cheque',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
};