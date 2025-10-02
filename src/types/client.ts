// Client management types and interfaces

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  email: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
}

export type InvestmentProfile = 'conservative' | 'moderate' | 'aggressive' | 'not_defined';
export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'suspended';

export interface Client {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Contact information
  contact: Contact;
  
  // Address information
  address: Address;
  
  // Investment profile
  investmentProfile: InvestmentProfile;
  riskTolerance?: number; // 1-10 scale
  investmentExperience?: 'beginner' | 'intermediate' | 'advanced';
  
  // Financial information
  monthlyIncome?: number;
  netWorth?: number;
  investmentGoals?: string[];
  
  // Status and metadata
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID who created the client
  lastContactDate?: Date;
  
  // Additional information
  notes?: string;
  tags?: string[];
  referralSource?: string;
}

// Forms and validation types
export interface CreateClientRequest {
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string; // ISO date string
  gender?: 'male' | 'female' | 'other';
  contact: Contact;
  address: Address;
  investmentProfile: InvestmentProfile;
  riskTolerance?: number;
  investmentExperience?: 'beginner' | 'intermediate' | 'advanced';
  monthlyIncome?: number;
  netWorth?: number;
  investmentGoals?: string[];
  notes?: string;
  tags?: string[];
  referralSource?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string;
}

// API Response types
export interface ClientListResponse {
  items: Client[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  investmentProfile?: InvestmentProfile;
  createdFrom?: string;
  createdTo?: string;
  tags?: string[];
}

export interface ClientSortOptions {
  field: 'name' | 'createdAt' | 'lastContactDate' | 'netWorth';
  direction: 'asc' | 'desc';
}

// Utility types
export type ClientFormData = Omit<CreateClientRequest, 'birthDate'> & {
  birthDate: Date;
};

export interface ClientStats {
  total: number;
  active: number;
  prospects: number;
  totalInvestments: number;
  averagePortfolioValue: number;
}

// Client with assets relationship
export interface ClientWithAssets extends Client {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  allocations: Array<{
    assetId: string;
    assetName: string;
    assetType: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    totalInvested: number;
    currentValue: number;
    returnAmount: number;
    returnPercentage: number;
  }>;
}