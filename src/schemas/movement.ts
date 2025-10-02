import { z } from 'zod';

// Movement Type Schema
export const movementTypeSchema = z.enum([
  'deposit',
  'withdrawal', 
  'transfer_in',
  'transfer_out',
  'fee',
  'dividend',
  'interest',
  'bonus'
]);

export const movementStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'cancelled',
  'failed'
]);

export const paymentMethodSchema = z.enum([
  'bank_transfer',
  'ted',
  'doc',
  'pix',
  'cash',
  'check',
  'credit_card',
  'debit_card'
]);

// Bank Details Schema
export const bankDetailsSchema = z.object({
  bankCode: z.string().optional(),
  bankName: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  accountType: z.enum(['checking', 'savings']).optional(),
  pixKey: z.string().optional(),
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']).optional(),
}).optional();

// Fees Schema
export const feesSchema = z.object({
  transferFee: z.number().min(0).optional(),
  taxWithholding: z.number().min(0).optional(),
  otherFees: z.number().min(0).optional(),
}).optional();

// Create Movement Schema
export const createMovementSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  type: movementTypeSchema,
  amount: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .refine(val => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais'),
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  paymentMethod: paymentMethodSchema.optional(),
  bankDetails: bankDetailsSchema,
  notes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
  requiresApproval: z.boolean().optional().default(false),
}).refine((data) => {
  // PIX validation
  if (data.paymentMethod === 'pix' && data.bankDetails?.pixKey) {
    const pixKey = data.bankDetails.pixKey;
    const pixKeyType = data.bankDetails.pixKeyType;
    
    switch (pixKeyType) {
      case 'cpf':
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(pixKey) || /^\d{11}$/.test(pixKey);
      case 'cnpj':
        return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(pixKey) || /^\d{14}$/.test(pixKey);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
      case 'phone':
        return /^\+?\d{10,15}$/.test(pixKey.replace(/\D/g, ''));
      case 'random':
        return pixKey.length >= 32;
      default:
        return true;
    }
  }
  return true;
}, {
  message: 'Chave PIX inválida para o tipo selecionado',
  path: ['bankDetails', 'pixKey']
});

// Update Movement Schema
export const updateMovementSchema = z.object({
  id: z.string().min(1),
  status: movementStatusSchema.optional(),
  processedDate: z.date().optional(),
  completedDate: z.date().optional(),
  bankDetails: bankDetailsSchema,
  notes: z.string().max(1000).optional(),
  fees: feesSchema,
});

// Movement Filters Schema
export const movementFiltersSchema = z.object({
  clientId: z.string().optional(),
  type: movementTypeSchema.optional(),
  status: movementStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  requiresApproval: z.boolean().optional(),
  createdBy: z.string().optional(),
});

// Batch Movement Schema
export const batchMovementSchema = z.object({
  movements: z.array(createMovementSchema).min(1, 'Pelo menos uma movimentação é necessária'),
  batchDescription: z.string().max(200).optional(),
  requiresBatchApproval: z.boolean().optional().default(false),
});

// Movement Template Schema
export const movementTemplateSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(300, 'Descrição deve ter no máximo 300 caracteres'),
  type: movementTypeSchema,
  defaultAmount: z.number().min(0).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  bankDetails: bankDetailsSchema,
  isRecurring: z.boolean().default(false),
  recurringConfig: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    interval: z.number().min(1).max(365),
    endDate: z.date().optional(),
    maxOccurrences: z.number().min(1).optional(),
  }).optional(),
});

// Brazilian validation helpers
export const validateCPF = (cpf: string): boolean => {
  // Remove formatting
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // All same digits
  
  // Calculate verification digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit1 === parseInt(cleaned[9]) && digit2 === parseInt(cleaned[10]);
};

export const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Calculate verification digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit1 === parseInt(cleaned[12]) && digit2 === parseInt(cleaned[13]);
};

// Format helpers
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPixKey = (key: string, type: string): string => {
  switch (type) {
    case 'cpf':
      return formatCPF(key);
    case 'cnpj':
      return formatCNPJ(key);
    case 'phone':
      const cleaned = key.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return key;
    default:
      return key;
  }
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and convert to number
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// Movement type configurations
export const movementTypeConfig = {
  deposit: {
    label: 'Depósito',
    color: 'green',
    icon: 'ArrowDownCircle',
    requiresBankDetails: true,
    defaultRequiresApproval: false,
  },
  withdrawal: {
    label: 'Saque',
    color: 'red', 
    icon: 'ArrowUpCircle',
    requiresBankDetails: true,
    defaultRequiresApproval: true,
  },
  transfer_in: {
    label: 'Transferência Recebida',
    color: 'blue',
    icon: 'ArrowRightCircle',
    requiresBankDetails: false,
    defaultRequiresApproval: false,
  },
  transfer_out: {
    label: 'Transferência Enviada',
    color: 'orange',
    icon: 'ArrowLeftCircle',
    requiresBankDetails: true,
    defaultRequiresApproval: true,
  },
  fee: {
    label: 'Taxa',
    color: 'purple',
    icon: 'CreditCard',
    requiresBankDetails: false,
    defaultRequiresApproval: false,
  },
  dividend: {
    label: 'Dividendo',
    color: 'emerald',
    icon: 'TrendingUp',
    requiresBankDetails: false,
    defaultRequiresApproval: false,
  },
  interest: {
    label: 'Juros',
    color: 'cyan',
    icon: 'Percent',
    requiresBankDetails: false,
    defaultRequiresApproval: false,
  },
  bonus: {
    label: 'Bonificação',
    color: 'yellow',
    icon: 'Gift',
    requiresBankDetails: false,
    defaultRequiresApproval: false,
  },
} as const;

// Export schema types
export type CreateMovementFormData = z.infer<typeof createMovementSchema>;
export type UpdateMovementFormData = z.infer<typeof updateMovementSchema>;
export type MovementFiltersFormData = z.infer<typeof movementFiltersSchema>;
export type BatchMovementFormData = z.infer<typeof batchMovementSchema>;
export type MovementTemplateFormData = z.infer<typeof movementTemplateSchema>;