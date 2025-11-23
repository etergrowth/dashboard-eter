# Dashboard Eter Growth

Dashboard empresarial completo para gestão de clientes (CRM), projetos, mapa de clientes em tempo real e CMS para media.

## 🚀 Funcionalidades

- **Landing Page** - Página inicial com informações da empresa
- **Autenticação** - Sistema de login/registo com Supabase Auth
- **Dashboard Overview** - Visão geral com métricas e KPIs
- **CRM** - Gestão completa de clientes e pipeline de vendas
- **Projetos** - Kanban board para gestão de tarefas
- **Mapa** - Visualização de clientes com Google Maps e otimização de rotas
- **CMS** - Upload e gestão de ficheiros com Supabase Storage

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Google Maps API key (gratuita para desenvolvimento)

## 🛠️ Instalação

1. **Clone ou navegue para o projeto:**
   ```bash
   cd "Dashboard Eter"
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Renomeie `.env.example` para `.env.local` e preencha com as suas credenciais:

   ```env
   # Supabase
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima

   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=sua-api-key
   ```

## 🔐 Configuração do Supabase

### 1. Criar Projeto Supabase

1. Aceda a [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a URL e a anon key para o `.env.local`

### 2. Executar Migrations SQL

1. No dashboard do Supabase, aceda a **SQL Editor**
2. Copie o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Cole no editor e execute (Run)
4. Isto criará todas as tabelas, policies RLS e storage buckets necessários

### 3. Configurar Autenticação

1. Vá a **Authentication** → **URL Configuration**
2. Defina:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/dashboard`

## 🗺️ Configuração Google Maps API

### 1. Obter API Key

1. Aceda a [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative as seguintes APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
4. Crie credenciais (API Key)
5. Copie a API key para o `.env.local`

### 2. Configurar Restrições (Opcional para produção)

1. No Google Cloud Console, vá às suas credenciais
2. Adicione restrições de domínio para proteger a key

## 🚀 Iniciar Aplicação

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 📂 Estrutura do Projeto

```
Dashboard Eter/
├── src/
│   ├── components/          # Componentes da landing page
│   ├── dashboard/           # Módulos do dashboard
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── layouts/         # Layouts (DashboardLayout)
│   │   ├── pages/           # Páginas (CRM, Projects, Map, CMS)
│   │   └── hooks/           # Custom hooks
│   ├── lib/                 # Configurações (Supabase, React Query, Store)
│   ├── types/               # TypeScript types
│   └── App.tsx              # Configuração de rotas
├── supabase/
│   └── migrations/          # SQL migrations
├── .env.local               # Variáveis de ambiente
└── CLAUDE.md                # Documentação técnica completa
```

## 🔑 Rotas

- `/` - Landing page
- `/login` - Página de login
- `/register` - Página de registo
- `/dashboard` - Dashboard overview (protegido)
- `/dashboard/crm` - CRM (protegido)
- `/dashboard/projects` - Projetos (protegido)
- `/dashboard/map` - Mapa (protegido)
- `/dashboard/cms` - CMS (protegido)

## 👤 Criar Primeira Conta

1. Inicie a aplicação (`npm run dev`)
2. Aceda a `http://localhost:3000/register`
3. Crie uma conta com email e password
4. Será redirecionado para o dashboard

## 📚 Próximos Passos

Após configurar o Supabase e Google Maps:

1. **CRM** - Adicione o seu primeiro cliente
2. **Mapa** - Visualize clientes no mapa (precisa de endereços válidos)
3. **Projetos** - Crie projetos e associe-os a clientes
4. **CMS** - Faça upload de imagens e ficheiros

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Verifica código com ESLint
- `npm run typecheck` - Verifica tipos TypeScript

## 📖 Documentação Completa

Para documentação técnica detalhada, consulte o ficheiro **CLAUDE.md**:

- Arquitetura do sistema
- Schema completo da base de dados
- Guias de integração
- Troubleshooting
- Exemplos de código

## 🛡️ Segurança

- ✅ Row Level Security (RLS) ativo em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Variáveis de ambiente protegidas (.env.local no .gitignore)
- ✅ Rotas do dashboard protegidas (PrivateRoute)

## 📝 Notas

- O servidor está configurado para correr na **porta 3000**
- As credenciais do `.env.local` **nunca** devem ser commitadas
- Execute as migrations SQL antes de usar a aplicação
- Para produção, configure domínios permitidos no Supabase e Google Cloud

---

**Versão:** 1.0.0
**Desenvolvido para:** Eter Growth
**Stack:** React + TypeScript + Vite + Tailwind + Supabase + Google Maps API
