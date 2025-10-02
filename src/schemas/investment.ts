import { z } from 'zod';

// Asset Type enum validation
export const assetTypeSchema = z.enum([
  'stocks',
  'bonds', 
  'real_estate_funds',
  'investment_funds',
  'fixed_income',
  'savings',
  'crypto',
  'commodities',
  'international',
  'other'
]);

// Transaction Type enum validation
export const transactionTypeSchema = z.enum([
  'buy',
  'sell', 
  'dividend',
  'interest',
  'split',
  'bonus'
]);

// Investment Status enum validation
export const investmentStatusSchema = z.enum([
  'active',
  'sold',
  'matured',
  'suspended'
]);

// Asset validation schema
export const assetSchema = z.object({
  symbol: z.string()
    .min(1, 'Símbolo é obrigatório')
    .max(10, 'Símbolo muito longo')
    .regex(/^[A-Z0-9]+$/, 'Símbolo deve conter apenas letras maiúsculas e números'),
  
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  
  type: assetTypeSchema,
  
  sector: z.string()
    .max(50, 'Setor muito longo')
    .optional(),
  
  description: z.string()
    .max(500, 'Descrição muito longa')
    .optional(),
  
  currentPrice: z.number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(1000000, 'Preço muito alto')
    .optional(),
  
  currency: z.string()
    .length(3, 'Moeda deve ter 3 caracteres')
    .default('BRL'),
  
  isin: z.string()
    .length(12, 'ISIN deve ter 12 caracteres')
    .regex(/^[A-Z]{2}[A-Z0-9]{10}$/, 'ISIN inválido')
    .optional(),
  
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
    .optional(),
  
  manager: z.string()
    .max(100, 'Gestor muito longo')
    .optional(),
  
  benchmark: z.string()
    .max(50, 'Benchmark muito longo')
    .optional(),
});

// Investment creation schema
export const createInvestmentSchema = z.object({
  clientId: z.string()
    .min(1, 'Cliente é obrigatório'),
  
  assetId: z.string()
    .min(1, 'Ativo é obrigatório'),
  
  quantity: z.number()
    .min(0.000001, 'Quantidade deve ser maior que zero')
    .max(1000000000, 'Quantidade muito alta'),
  
  price: z.number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(1000000, 'Preço muito alto'),
  
  date: z.date()
    .max(new Date(), 'Data não pode ser no futuro'),
  
  fees: z.number()
    .min(0, 'Taxa deve ser positiva')
    .max(100000, 'Taxa muito alta')
    .default(0),
  
  taxes: z.number()
    .min(0, 'Imposto deve ser positivo')
    .max(100000, 'Imposto muito alto')
    .default(0),
  
  brokerage: z.string()
    .max(50, 'Corretora muito longa')
    .optional(),
  
  notes: z.string()
    .max(500, 'Observações muito longas')
    .optional(),
});

// Transaction creation schema
export const createTransactionSchema = z.object({
  investmentId: z.string()
    .min(1, 'Investimento é obrigatório'),
  
  type: transactionTypeSchema,
  
  quantity: z.number()
    .min(0.000001, 'Quantidade deve ser maior que zero')
    .max(1000000000, 'Quantidade muito alta'),
  
  price: z.number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(1000000, 'Preço muito alto'),
  
  date: z.date()
    .max(new Date(), 'Data não pode ser no futuro'),
  
  fees: z.number()
    .min(0, 'Taxa deve ser positiva')
    .max(100000, 'Taxa muito alta')
    .default(0),
  
  taxes: z.number()
    .min(0, 'Imposto deve ser positivo')
    .max(100000, 'Imposto muito alto')
    .default(0),
  
  description: z.string()
    .max(200, 'Descrição muito longa')
    .optional(),
  
  brokerage: z.string()
    .max(50, 'Corretora muito longa')
    .optional(),
  
  orderNumber: z.string()
    .max(50, 'Número da ordem muito longo')
    .optional(),
});

// Quick investment schema (simplified for quick entry)
export const quickInvestmentSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  assetSymbol: z.string().min(1, 'Símbolo do ativo é obrigatório'),
  quantity: z.number().min(0.000001, 'Quantidade deve ser maior que zero'),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  date: z.date().max(new Date(), 'Data não pode ser no futuro'),
  type: z.enum(['buy', 'sell']).default('buy'),
});

// Filter schemas
export const assetFiltersSchema = z.object({
  search: z.string().optional(),
  type: assetTypeSchema.optional(),
  sector: z.string().optional(),
  currency: z.string().length(3).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

export const investmentFiltersSchema = z.object({
  clientId: z.string().optional(),
  assetType: assetTypeSchema.optional(),
  status: investmentStatusSchema.optional(),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const transactionFiltersSchema = z.object({
  clientId: z.string().optional(),
  investmentId: z.string().optional(),
  type: transactionTypeSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

// Types inferred from schemas
export type AssetFormData = z.infer<typeof assetSchema>;
export type CreateInvestmentFormData = z.infer<typeof createInvestmentSchema>;
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type QuickInvestmentFormData = z.infer<typeof quickInvestmentSchema>;
export type AssetFiltersData = z.infer<typeof assetFiltersSchema>;
export type InvestmentFiltersData = z.infer<typeof investmentFiltersSchema>;
export type TransactionFiltersData = z.infer<typeof transactionFiltersSchema>;

// Utility functions
export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatQuantity = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const calculateProfitLoss = (currentValue: number, totalInvested: number) => {
  const profitLoss = currentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
  
  return {
    profitLoss,
    profitLossPercentage,
  };
};

export const calculateTotalAmount = (quantity: number, price: number, fees: number = 0, taxes: number = 0): number => {
  return (quantity * price) + fees + taxes;
};

// Asset type translations
export const assetTypeLabels: Record<string, string> = {
  stocks: 'Ações',
  bonds: 'Títulos de Renda Fixa',
  real_estate_funds: 'Fundos Imobiliários',
  investment_funds: 'Fundos de Investimento',
  fixed_income: 'Renda Fixa',
  savings: 'Poupança',
  crypto: 'Criptomoedas',
  commodities: 'Commodities',
  international: 'Internacional',
  other: 'Outros',
};

// Transaction type translations
export const transactionTypeLabels: Record<string, string> = {
  buy: 'Compra',
  sell: 'Venda',
  dividend: 'Dividendo',
  interest: 'Juros',
  split: 'Desdobramento',
  bonus: 'Bonificação',
};

// Investment status translations
export const investmentStatusLabels: Record<string, string> = {
  active: 'Ativo',
  sold: 'Vendido',
  matured: 'Vencido',
  suspended: 'Suspenso',
};