# Investment Platform Frontend

Frontend da plataforma de gestão de investimentos desenvolvida com Next.js 14.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN/UI**
- **TanStack Query**
- **React Hook Form + Zod**
- **Integração com Backend FastAPI**

## 🐳 Execução com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Projeto backend (`investment-platform-backend`)

### Execução Rápida
```bash
# Windows (PowerShell)
.\docker-helper.ps1 start

# Linux/Mac
./docker-helper.sh start
```

### Comandos Disponíveis
```bash
# Iniciar todos os serviços
.\docker-helper.ps1 start

# Parar todos os serviços
.\docker-helper.ps1 stop

# Ver status dos serviços
.\docker-helper.ps1 status

# Ver logs (todos ou de um serviço específico)
.\docker-helper.ps1 logs
.\docker-helper.ps1 logs frontend

# Reconstruir serviços
.\docker-helper.ps1 rebuild
```

### URLs dos Serviços
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 💻 Execução em Desenvolvimento

### Sem Docker

## 📋 Funcionalidades Planejadas

### 1. Autenticação
- Login com email e senha
- Cadastro de usuários
- Autenticação JWT
- Proteção de rotas

### 2. Gestão de Clientes
- CRUD completo de clientes
- Busca e filtros
- Paginação
- Status ativo/inativo

### 3. Ativos Financeiros
- Integração com Yahoo Finance API
- Cadastro de alocações por cliente
- Histórico de compras
- Listagem de alocações

### 4. Movimentações
- Registro de entradas e saídas
- Filtros por período
- Relatórios de captação
- Exportação Excel/CSV

## 🛠️ Como executar

### Desenvolvimento

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t investment-frontend .
docker run -p 3000:3000 investment-frontend
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── not-found.tsx      # Página 404
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes ShadCN/UI
│   └── providers/        # Providers (React Query, etc.)
└── lib/                  # Utilitários
    └── utils.ts          # Funções auxiliares
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📝 Status do Desenvolvimento

- [x] Estrutura inicial do projeto
- [x] Configuração do Next.js 14
- [x] Setup do ShadCN/UI
- [x] Configuração do Docker
- [ ] Tela de login
- [ ] Tela de cadastro
- [ ] Dashboard
- [ ] Gestão de clientes
- [ ] Gestão de ativos
- [ ] Movimentações
- [ ] Relatórios

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter

---

**Desenvolvido como parte do case técnico para desenvolvedor Full-Stack**
