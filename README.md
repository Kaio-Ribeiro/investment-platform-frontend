# Investment Platform Frontend

Frontend da plataforma de gestão de investimentos desenvolvida com Next.js 14.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN/UI**
- **React Hook Form + Zod**
- **Integração com Backend FastAPI**
- **XLSX & File-Saver** (Exportação de dados)

## � Execução em Desenvolvimento

### Sem Docker (Recomendado)
```bash
npm install
npm run dev
```

### Com Docker
```bash
docker build -t investment-frontend .
docker run -p 3000:3000 investment-frontend
```

## 🏗️ Backend Dependencies

Para funcionamento completo, execute o backend separadamente:

```bash
cd ../investment-platform-backend
docker compose up --build
```

## 🌐 URLs dos Serviços
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

##  Funcionalidades Implementadas

### ✅ 1. Autenticação
- [x] Login com email e senha
- [x] Autenticação JWT
- [x] Proteção de rotas
- [x] Middleware de autenticação

### ✅ 2. Gestão de Clientes
- [x] CRUD completo de clientes
- [x] Busca e filtros
- [x] Status ativo/inativo
- [x] Estatísticas de investimento
- [x] Exportação Excel/CSV

### ✅ 3. Ativos Financeiros
- [x] Cadastro de ativos
- [x] Listagem com filtros
- [x] Integração com preços sugeridos
- [x] Visualização detalhada

### ✅ 4. Alocações de Investimento
- [x] Sistema completo de alocações
- [x] Associação cliente-ativo
- [x] Controle de quantidade e preços
- [x] Listagem e filtros
- [x] Exportação de dados

### ✅ 5. Movimentações
- [x] Registro de entradas e saídas
- [x] Filtros por período e cliente
- [x] Status de movimentações
- [x] Exportação Excel/CSV

### ✅ 6. Dashboard
- [x] Visão geral do sistema
- [x] Estatísticas de clientes
- [x] Navegação rápida

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── clients/           # Gestão de clientes
│   ├── assets/            # Gestão de ativos e alocações
│   ├── movements/         # Movimentações financeiras
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes ShadCN/UI
│   └── providers/        # Providers (React Query, etc.)
├── services/             # Serviços de API
├── types/                # Definições TypeScript
├── utils/                # Utilitários e helpers
└── hooks/                # Custom hooks
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## � Recursos Especiais

### Exportação de Dados
- Excel (.xlsx) e CSV disponíveis em todas as listagens
- Formatação automática de moedas e datas
- Dados completos com estatísticas calculadas

### Sistema de Autenticação
- JWT tokens com refresh automático
- Proteção de rotas por middleware
- Redirecionamento inteligente pós-login

### Interface Responsiva
- Design mobile-first
- Componentes acessíveis
- Tema consistente com Tailwind CSS

---

**Sistema completo de gestão de investimentos com funcionalidades avançadas**
