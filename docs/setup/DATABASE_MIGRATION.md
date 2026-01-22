# Migração da Base de Dados - Sistema de Leads

Este guia explica como aplicar a migration `010_crm_leads_system.sql` à base de dados Supabase.

---

## 📋 O Que Esta Migration Faz

### ✅ Cria 2 Novas Tabelas

**1. `leads_pendentes`**
- Armazena leads INBOUND do website aguardando aprovação
- Inclui análise IA (score, prioridade, pontos positivos/atenção)
- Sistema de aprovação por token único
- Metadados de origem (IP, user agent, UTM params)

**2. `notificacoes`**
- Sistema de notificações em tempo real
- Suporta vários tipos: lead_pendente, lead_aprovado, tarefa, etc.
- Estado lida/não lida
- Links para ações

### ✅ Modifica Tabela Existente

**`clients`**
- Adiciona campo `origem` (INBOUND_WEBSITE, OUTBOUND_PROSPECCAO, etc.)
- Adiciona campo `lead_pendente_id` (ligação à lead que originou o cliente)
- Adiciona campo `projeto` (descrição do projeto da lead)
- Adiciona campo `orcamento` (orçamento indicado)
- Adiciona campo `mensagem_inicial` (mensagem original da lead)

### ✅ Cria Funções RPC

1. `aprovar_lead()` - Aprovar lead e criar cliente
2. `rejeitar_lead()` - Rejeitar lead
3. `get_leads_stats()` - Estatísticas de leads
4. `marcar_notificacao_lida()` - Marcar notificação como lida
5. `marcar_todas_notificacoes_lidas()` - Marcar todas como lidas

### ✅ Configura Políticas RLS

- Users autenticados veem apenas suas notificações
- Admins veem todas as leads pendentes
- Sistema pode inserir leads via API pública

---

## 🚀 Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Ir para o projeto Supabase: https://supabase.com/dashboard
2. Selecionar o projeto `dashboard-eter`
3. No menu lateral, clicar em **SQL Editor**
4. Clicar em **"New query"**
5. Copiar todo o conteúdo de `supabase/migrations/010_crm_leads_system.sql`
6. Colar no editor SQL
7. Clicar em **"Run"** (▶️)
8. Verificar se não há erros

**Tempo estimado:** 5-10 segundos

### Opção 2: Via Supabase CLI

```bash
# 1. Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Link ao projeto
supabase link --project-ref SEU_PROJECT_REF

# 4. Aplicar migration
supabase db push

# 5. Verificar status
supabase db diff
```

### Opção 3: Via Script Node.js

Criar ficheiro `scripts/run-migration.js`:

```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Aplicando migration 010_crm_leads_system.sql...')
  
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/010_crm_leads_system.sql'
  )
  
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  
  if (error) {
    console.error('❌ Erro ao aplicar migration:', error)
    process.exit(1)
  }
  
  console.log('✅ Migration aplicada com sucesso!')
}

runMigration()
```

Executar:
```bash
node scripts/run-migration.js
```

---

## 🧪 Validar Migration

Após aplicar a migration, execute estes comandos SQL para validar:

```sql
-- 1. Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leads_pendentes', 'notificacoes');

-- Resultado esperado: 2 linhas

-- 2. Verificar novos campos na tabela clients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND column_name IN ('origem', 'lead_pendente_id', 'projeto', 'orcamento', 'mensagem_inicial');

-- Resultado esperado: 5 linhas

-- 3. Verificar funções RPC
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'aprovar_lead',
    'rejeitar_lead',
    'get_leads_stats',
    'marcar_notificacao_lida',
    'marcar_todas_notificacoes_lidas'
  );

-- Resultado esperado: 5 linhas

-- 4. Testar estatísticas (deve retornar JSON)
SELECT get_leads_stats(auth.uid());

-- 5. Contar índices criados
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('leads_pendentes', 'notificacoes')
ORDER BY tablename, indexname;

-- Resultado esperado: múltiplas linhas com índices
```

---

## 🧹 Rollback (Se Necessário)

Se precisar desfazer a migration, execute:

```sql
-- ⚠️ ATENÇÃO: Isto irá apagar TODOS os dados das novas tabelas!

-- 1. Remover triggers
DROP TRIGGER IF EXISTS trigger_notify_new_lead ON public.leads_pendentes;

-- 2. Remover funções
DROP FUNCTION IF EXISTS notify_new_lead();
DROP FUNCTION IF EXISTS aprovar_lead(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS rejeitar_lead(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS get_leads_stats(UUID);
DROP FUNCTION IF EXISTS marcar_notificacao_lida(UUID, UUID);
DROP FUNCTION IF EXISTS marcar_todas_notificacoes_lidas(UUID);

-- 3. Remover campos adicionados à tabela clients
ALTER TABLE public.clients 
  DROP COLUMN IF EXISTS origem,
  DROP COLUMN IF EXISTS lead_pendente_id,
  DROP COLUMN IF EXISTS projeto,
  DROP COLUMN IF EXISTS orcamento,
  DROP COLUMN IF EXISTS mensagem_inicial;

-- 4. Remover tabelas
DROP TABLE IF EXISTS public.notificacoes CASCADE;
DROP TABLE IF EXISTS public.leads_pendentes CASCADE;
```

---

## 📊 Estrutura das Novas Tabelas

### `leads_pendentes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `nome` | TEXT | Nome da lead |
| `email` | TEXT | Email da lead |
| `telefone` | TEXT | Telefone (opcional) |
| `empresa` | TEXT | Nome da empresa |
| `website` | TEXT | Website da empresa |
| `projeto` | TEXT | Descrição do projeto |
| `orcamento` | VARCHAR(100) | Faixa de orçamento |
| `mensagem` | TEXT | Mensagem da lead |
| `prioridade_ia` | TEXT | baixa, media, alta, muito_alta |
| `score_ia` | INTEGER | Score 0-100 |
| `analise_ia` | JSONB | Análise detalhada da IA |
| `approval_token` | UUID | Token único para aprovação |
| `estado` | TEXT | pendente, aprovado, rejeitado |
| `ip_address` | TEXT | IP de origem |
| `user_agent` | TEXT | Browser/dispositivo |
| `utm_source` | TEXT | Fonte de tráfego |
| `data_criacao` | TIMESTAMPTZ | Data de criação |
| `data_decisao` | TIMESTAMPTZ | Data de aprovação/rejeição |
| `decidido_por` | UUID | User que decidiu |
| `client_id` | UUID | Cliente criado (se aprovado) |

### `notificacoes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `user_id` | UUID | Dono da notificação |
| `tipo` | TEXT | Tipo de notificação |
| `titulo` | TEXT | Título |
| `mensagem` | TEXT | Mensagem |
| `link` | TEXT | URL para ação |
| `acao_label` | TEXT | Texto do botão |
| `lead_pendente_id` | UUID | Referência a lead |
| `client_id` | UUID | Referência a cliente |
| `lida` | BOOLEAN | Se foi lida |
| `data_criacao` | TIMESTAMPTZ | Data de criação |
| `data_leitura` | TIMESTAMPTZ | Data de leitura |

---

## 🔍 Troubleshooting

### Erro: "relation already exists"

Significa que a tabela já foi criada. Verificar se a migration já foi aplicada antes.

```sql
-- Verificar se tabelas existem
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'leads_pendentes'
);
```

### Erro: "column already exists"

Um campo já existe na tabela `clients`. Isso é normal se estiver a reexecutar a migration.

```sql
-- Verificar campos existentes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'clients';
```

### Erro: Permissões RLS

Verificar se as políticas RLS estão ativas:

```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'leads_pendentes';
```

---

## 📝 Próximos Passos

Após aplicar a migration com sucesso:

1. ✅ **Configurar variáveis de ambiente** (ver `ENV_SETUP.md`)
2. ✅ **Testar inserção de lead** (criar formulário de teste)
3. ✅ **Testar aprovação/rejeição** (criar interface admin)
4. ✅ **Configurar notificações realtime** (Supabase Realtime)
5. ✅ **Implementar APIs** (endpoints CRUD)

---

## 💡 Dicas

- **Backup:** Sempre faça backup antes de aplicar migrations em produção
- **Staging:** Teste primeiro num ambiente de staging/desenvolvimento
- **Monitorização:** Use o Supabase Dashboard para monitorizar queries lentas
- **Índices:** Os índices criados melhoram performance, mas ocupam espaço

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do Supabase Dashboard
2. Consultar documentação: https://supabase.com/docs/guides/database
3. Revisar SQL da migration linha por linha
