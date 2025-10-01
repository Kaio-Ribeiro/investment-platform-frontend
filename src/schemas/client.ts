import { z } from 'zod';

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Phone validation
const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?[\s-]?)[\s9]?\d{4}[\s-]?\d{4}$/;

// CEP validation
const cepRegex = /^\d{5}-?\d{3}$/;

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Logradouro é obrigatório').max(100),
  number: z.string().min(1, 'Número é obrigatório').max(10),
  complement: z.string().max(50).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(50),
  city: z.string().min(1, 'Cidade é obrigatória').max(50),
  state: z.string().min(2, 'Estado deve ter 2 caracteres').max(2),
  zipCode: z.string().regex(cepRegex, 'CEP inválido'),
  country: z.string().default('Brasil'),
});

// Contact schema
export const contactSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().regex(phoneRegex, 'Telefone inválido'),
  mobile: z.string().regex(phoneRegex, 'Celular inválido').optional(),
  whatsapp: z.string().regex(phoneRegex, 'WhatsApp inválido').optional(),
});

// Main client schema
export const clientSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .refine(validateCPF, 'CPF inválido'),
  
  rg: z.string()
    .min(7, 'RG deve ter pelo menos 7 caracteres')
    .max(12, 'RG muito longo')
    .optional(),
  
  birthDate: z.date()
    .max(new Date(), 'Data de nascimento não pode ser no futuro')
    .refine((date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18 && age <= 120;
    }, 'Cliente deve ter entre 18 e 120 anos'),
  
  gender: z.enum(['male', 'female', 'other']).optional(),
  
  contact: contactSchema,
  address: addressSchema,
  
  investmentProfile: z.enum(['conservative', 'moderate', 'aggressive', 'not_defined']),
  
  riskTolerance: z.number()
    .min(1, 'Tolerância ao risco deve ser entre 1 e 10')
    .max(10, 'Tolerância ao risco deve ser entre 1 e 10')
    .optional(),
  
  investmentExperience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  
  monthlyIncome: z.number()
    .min(0, 'Renda mensal deve ser positiva')
    .max(100000000, 'Valor muito alto')
    .optional(),
  
  netWorth: z.number()
    .min(0, 'Patrimônio líquido deve ser positivo')
    .max(1000000000, 'Valor muito alto')
    .optional(),
  
  investmentGoals: z.array(z.string()).optional(),
  
  notes: z.string().max(1000, 'Observações muito longas').optional(),
  
  tags: z.array(z.string().max(30, 'Tag muito longa')).optional(),
  
  referralSource: z.string().max(100, 'Fonte de indicação muito longa').optional(),
});

// Simplified schema for quick client creation
export const quickClientSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().refine(validateCPF, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(phoneRegex, 'Telefone inválido'),
  investmentProfile: z.enum(['conservative', 'moderate', 'aggressive', 'not_defined']),
});

// Search and filter schemas
export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'suspended']).optional(),
  investmentProfile: z.enum(['conservative', 'moderate', 'aggressive', 'not_defined']).optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Types inferred from schemas
export type ClientFormData = z.infer<typeof clientSchema>;
export type QuickClientFormData = z.infer<typeof quickClientSchema>;
export type ClientFiltersData = z.infer<typeof clientFiltersSchema>;

// Utility functions
export const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatCEP = (cep: string): string => {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
};