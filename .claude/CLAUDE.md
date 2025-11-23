# Dashboard Eter Growth - Documentação Completa

## 📋 Visão Geral do Projeto

Dashboard empresarial completo para gestão de clientes, projetos e conteúdo, desenvolvido para a Eter Growth. O sistema integra CRM, gestão de projetos, visualização de mapas em tempo real e CMS para media.

**Stack Tecnológica:**
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Maps:** Google Maps JavaScript API
- **Routing:** React Router DOM
- **State:** React Query + Zustand
- **Icons:** Lucide React

---

## 🏗️ Arquitetura do Sistema

```
Dashboard Eter/
├── src/
│   ├── components/           # Componentes da landing page
│   ├── dashboard/            # 🆕 Módulos do dashboard
│   │   ├── layouts/          # Layouts (DashboardLayout, AuthLayout)
│   │   ├── pages/            # Páginas do dashboard
│   │   │   ├── Overview.tsx        # Dashboard principal
│   │   │   ├── CRM/               # Módulo CRM
│   │   │   │   ├── ClientList.tsx
│   │   │   │   ├── ClientDetail.tsx
│   │   │   │   ├── ClientForm.tsx
│   │   │   │   └── SalesPipeline.tsx
│   │   │   ├── Projects/          # Gestão de Projetos
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   └── ProjectDetail.tsx
│   │   │   ├── Map/               # Mapa de Clientes
│   │   │   │   ├── ClientMap.tsx
│   │   │   │   └── RouteOptimizer.tsx
│   │   │   ├── CMS/               # Media Manager
│   │   │   │   ├── MediaLibrary.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   └── Auth/              # Autenticação
│   │   │       ├── Login.tsx
│   │   │       └── Register.tsx
│   │   ├── components/       # Componentes reutilizáveis do dashboard
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── hooks/            # Custom hooks
│   │       ├── useAuth.ts
│   │       ├── useClients.ts
│   │       ├── useProjects.ts
│   │       └── useMediaUpload.ts
│   ├── lib/                  # 🆕 Configurações e utilitários
│   │   ├── supabase.ts       # Supabase client
│   │   ├── queryClient.ts    # React Query config
│   │   └── store.ts          # Zustand store
│   ├── types/                # 🆕 TypeScript types
│   │   ├── database.ts       # Tipos do Supabase
│   │   ├── client.ts
│   │   ├── project.ts
│   │   └── ...
│   └── utils/
├── .env.local                # 🆕 Variáveis de ambiente
└── supabase/                 # 🆕 Migrations e seeds
    └── migrations/
```

---

## 🗄️ Schema da Base de Dados (Supabase)

### Tabelas Principais

#### 1. **profiles**
Informação dos utilizadores (estende auth.users)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **clients**
Gestão de clientes (CRM)

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,

  -- Dados Básicos
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,

  -- Endereço (para mapa)
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Portugal',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Pipeline de Vendas
  status TEXT DEFAULT 'lead', -- lead | proposal | negotiation | closed | lost
  value DECIMAL(10, 2),
  probability INTEGER DEFAULT 0, -- 0-100%

  -- Prioridade
  priority TEXT DEFAULT 'medium', -- low | medium | high

  -- Metadata
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **interactions**
Histórico de interações com clientes

```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),

  type TEXT NOT NULL, -- call | email | meeting | note
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **tasks**
Tarefas e follow-ups

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending | in_progress | completed | cancelled
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### 5. **projects**
Gestão de projetos

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- planning | active | on_hold | completed | cancelled

  start_date DATE,
  end_date DATE,
  deadline DATE,

  budget DECIMAL(10, 2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. **project_tasks**
Tarefas dentro de projetos (Kanban)

```sql
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),

  title TEXT NOT NULL,
  description TEXT,
  column TEXT DEFAULT 'todo', -- todo | doing | done
  position INTEGER DEFAULT 0,

  assignee_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. **media_files**
CMS - Gestão de ficheiros

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),

  name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- path no Supabase Storage
  file_type TEXT, -- image/jpeg, application/pdf, etc.
  file_size INTEGER, -- bytes

  category TEXT, -- images | documents | videos | other
  tags TEXT[],

  -- URL público (se bucket for público)
  public_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage Buckets

```sql
-- Bucket para media (imagens, documentos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);
```

### Row Level Security (RLS) Policies

```sql
-- Exemplo: Clients (cada utilizador vê apenas os seus clientes)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Aplicar políticas similares para todas as tabelas
```

---

## 🔐 Autenticação

### Setup Supabase Auth

1. **Configurar URL de redirecionamento:**
   - Dashboard Supabase → Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/dashboard`

2. **Providers habilitados:**
   - Email/Password ✅
   - Google OAuth (opcional)

### Fluxo de Autenticação

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Registo
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Logout
await supabase.auth.signOut();

// Verificar sessão
const { data: { session } } = await supabase.auth.getSession();
```

---

## 🗺️ Google Maps API Integration

### Setup

1. **Obter API Key:**
   - Aceder a: https://console.cloud.google.com/
   - Criar projeto → Ativar APIs → "Maps JavaScript API" + "Directions API" + "Geocoding API"
   - Credenciais → Criar API Key

2. **Adicionar ao .env:**
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Funcionalidades Implementadas

#### Markers de Clientes
```typescript
// Exibir todos os clientes no mapa
clients.forEach(client => {
  if (client.latitude && client.longitude) {
    new google.maps.Marker({
      position: { lat: client.latitude, lng: client.longitude },
      map: map,
      title: client.name
    });
  }
});
```

#### Geocoding (Endereço → Coordenadas)
```typescript
const geocoder = new google.maps.Geocoder();
geocoder.geocode({ address: fullAddress }, (results, status) => {
  if (status === 'OK') {
    const location = results[0].geometry.location;
    // Guardar lat/lng no cliente
  }
});
```

#### Otimização de Rotas
```typescript
const directionsService = new google.maps.DirectionsService();
const request = {
  origin: startLocation,
  destination: endLocation,
  waypoints: intermediateClients.map(c => ({
    location: { lat: c.latitude, lng: c.longitude },
    stopover: true
  })),
  optimizeWaypoints: true,
  travelMode: google.maps.TravelMode.DRIVING
};

directionsService.route(request, (result, status) => {
  if (status === 'OK') {
    directionsRenderer.setDirections(result);
    // Mostrar rota otimizada
  }
});
```

---

## 📦 Funcionalidades por Módulo

### 1. CRM (Customer Relationship Management)

**Funcionalidades:**
- ✅ Lista de clientes (tabela com pesquisa, filtros, paginação)
- ✅ Perfil detalhado de cliente
- ✅ CRUD completo (Criar, Editar, Eliminar)
- ✅ Timeline de interações (histórico cronológico)
- ✅ Pipeline de vendas (Kanban: Lead → Proposta → Negociação → Fechado)
- ✅ Tarefas e follow-ups por cliente
- ✅ Priorização de clientes
- ✅ Tags e categorização

**Componentes Principais:**
- `ClientList.tsx` - Tabela com todos os clientes
- `ClientDetail.tsx` - View detalhada com tabs (Info, Interações, Tarefas, Projetos)
- `ClientForm.tsx` - Formulário create/edit
- `SalesPipeline.tsx` - Kanban board do pipeline de vendas
- `InteractionTimeline.tsx` - Histórico de comunicações

### 2. Mapa de Clientes

**Funcionalidades:**
- ✅ Visualização de clientes no mapa (markers)
- ✅ Filtros (status, prioridade, região)
- ✅ Info window ao clicar em marker
- ✅ Calculador de rotas otimizadas
- ✅ Seleção de múltiplos clientes para rota
- ✅ Direções turn-by-turn
- ✅ Geocoding automático ao adicionar endereço

**Componentes Principais:**
- `ClientMap.tsx` - Mapa principal com markers
- `RouteOptimizer.tsx` - Ferramenta de otimização de rotas
- `MapFilters.tsx` - Filtros para o mapa

### 3. Gestão de Projetos

**Funcionalidades:**
- ✅ Dashboard overview (métricas, KPIs)
- ✅ Lista de projetos
- ✅ Kanban board drag-and-drop (To Do, Doing, Done)
- ✅ Associação projeto ↔ cliente
- ✅ Gestão de tarefas com deadlines
- ✅ Progresso visual de projetos
- ✅ Timeline/calendário de projetos

**Componentes Principais:**
- `ProjectList.tsx` - Lista de todos os projetos
- `KanbanBoard.tsx` - Board com drag-and-drop (react-beautiful-dnd)
- `ProjectDetail.tsx` - Detalhes e tarefas do projeto
- `ProjectForm.tsx` - Criar/editar projeto

### 4. CMS (Content Management System)

**Funcionalidades:**
- ✅ Upload de ficheiros (drag-and-drop)
- ✅ Galeria de imagens (grid view)
- ✅ Preview de ficheiros
- ✅ Organização por categorias
- ✅ Pesquisa e filtros (tipo, data, tamanho)
- ✅ Gestão (renomear, eliminar, copiar URL)
- ✅ Integração com Supabase Storage

**Componentes Principais:**
- `MediaLibrary.tsx` - Galeria principal
- `FileUpload.tsx` - Interface de upload
- `MediaPreview.tsx` - Modal de preview
- `CategoryManager.tsx` - Gestão de categorias

### 5. Dashboard Overview

**Funcionalidades:**
- ✅ KPIs principais (clientes ativos, projetos em curso, tarefas pendentes)
- ✅ Gráficos de performance (recharts)
- ✅ Atividade recente
- ✅ Tarefas próximas do deadline
- ✅ Pipeline de vendas resumido

**Componentes Principais:**
- `Overview.tsx` - Página principal do dashboard
- `StatCard.tsx` - Cards de estatísticas
- `ActivityFeed.tsx` - Feed de atividade recente
- `Charts.tsx` - Componentes de gráficos

---

## 🎨 Design System

### Cores (mantendo consistência com landing page)

```css
/* Cores principais */
--background: #030712;
--primary: #7BA8F9;
--secondary: #9333EA;
--text: #FFFFFF;

/* Cores de status */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Componentes Reutilizáveis

- **Card:** Container com glass effect
- **Button:** Variantes (primary, secondary, ghost, danger)
- **Input:** Formulários consistentes
- **Table:** Tabelas responsivas com sorting/filtering
- **Modal:** Modais para formulários e confirmações
- **Sidebar:** Navegação lateral
- **Header:** Barra superior com user menu

---

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente (.env.local)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### 2. Instalação de Dependências

```bash
npm install react-router-dom @tanstack/react-query zustand
npm install @react-google-maps/api
npm install react-beautiful-dnd
npm install date-fns recharts
npm install react-dropzone
npm install @hookform/resolvers zod react-hook-form
```

### 3. Iniciar Desenvolvimento

```bash
npm run dev
# Aplicação disponível em http://localhost:3000
```

---

## 🚀 Deploy

### Desenvolvimento Local
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm run preview
```

### Deploy (Vercel/Netlify)
1. Conectar repositório
2. Adicionar variáveis de ambiente
3. Build command: `npm run build`
4. Output directory: `dist`

---

## 📝 Guias de Uso

### Como adicionar um novo cliente

1. Navegar para **CRM** no sidebar
2. Clicar em **"+ Novo Cliente"**
3. Preencher formulário (nome, email, telefone, endereço)
4. O sistema faz geocoding automático do endereço
5. Cliente aparece na lista e no mapa

### Como otimizar uma rota

1. Navegar para **Mapa**
2. Selecionar múltiplos clientes (checkbox)
3. Clicar em **"Calcular Rota"**
4. Sistema mostra rota otimizada com direções

### Como fazer upload de ficheiros

1. Navegar para **CMS**
2. Arrastar ficheiros para área de upload
3. Selecionar categoria
4. Ficheiros são enviados para Supabase Storage
5. URLs públicas ficam disponíveis para copiar

### Como criar um projeto Kanban

1. Navegar para **Projetos**
2. Clicar em **"+ Novo Projeto"**
3. Associar a um cliente
4. Adicionar tarefas no board (To Do, Doing, Done)
5. Arrastar cards entre colunas

---

## 🔧 Troubleshooting

### Erro: "Google Maps not loading"
- Verificar se API key está correta no .env
- Confirmar que Maps JavaScript API está ativada
- Verificar billing no Google Cloud Console

### Erro: "Supabase RLS policy violation"
- Verificar se utilizador está autenticado
- Confirmar que policies RLS estão ativas
- Verificar se user_id corresponde ao auth.uid()

### Erro: "File upload failed"
- Verificar se bucket 'media' existe
- Confirmar políticas de storage
- Verificar tamanho do ficheiro (limite: 50MB por default)

---

## 📚 Recursos Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)

---

## 👨‍💻 Desenvolvido para Eter Growth

**Versão:** 1.0.0
**Data:** Novembro 2025
**Tecnologias:** React + TypeScript + Supabase + Google Maps API

---

**Notas:**
- Este ficheiro deve ser atualizado conforme o projeto evolui
- Manter documentação sincronizada com código
- Documentar novas funcionalidades adicionadas
