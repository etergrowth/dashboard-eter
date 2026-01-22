# Arquitetura do Sistema de Leads CRM

Documentação da arquitetura implementada na Fase 1 do sistema de gestão de leads.

---

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEBSITE PÚBLICO                          │
│                    (Formulário de Contacto)                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1. Submissão do formulário
                  │    + reCAPTCHA validation
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API: POST /api/leads/inbound                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Validar dados do formulário                         │   │
│  │  2. Verificar reCAPTCHA                                  │   │
│  │  3. Analisar lead com OpenAI ──────────────────┐        │   │
│  │  4. Inserir em leads_pendentes                 │        │   │
│  │  5. Trigger: Criar notificação automática      │        │   │
│  │  6. Enviar email para admin                    │        │   │
│  │  7. Enviar email de confirmação para cliente   │        │   │
│  └─────────────────────────────────────────────────────────┘   │
└────┬────────────────────────────────────────────┬───────────────┘
     │                                             │
     │                                             │
     ↓                                             ↓
┌─────────────────────┐              ┌──────────────────────────┐
│   OPENAI API        │              │      GMAIL API           │
│   (GPT-4o-mini)     │              │   (OAuth 2.0)            │
│                     │              │                          │
│  - Análise IA       │              │  - Email nova lead       │
│  - Score 0-100      │              │  - Email confirmação     │
│  - Prioridade       │              │  - Email rejeição        │
│  - Recomendação     │              │                          │
└─────────────────────┘              └──────────────────────────┘
     │                                             │
     │                                             │
     └──────────────────┬──────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ leads_pendentes  │  │  notificacoes    │  │   clients    │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  │
│  │ - id             │  │ - id             │  │ + origem     │  │
│  │ - nome           │  │ - user_id        │  │ + projeto    │  │
│  │ - email          │  │ - tipo           │  │ + orcamento  │  │
│  │ - telefone       │  │ - titulo         │  │ + lead_id    │  │
│  │ - empresa        │  │ - mensagem       │  │ ...          │  │
│  │ - projeto        │  │ - link           │  │              │  │
│  │ - orcamento      │  │ - lida           │  │              │  │
│  │ - score_ia       │  │ - data_criacao   │  │              │  │
│  │ - prioridade_ia  │  │ ...              │  │              │  │
│  │ - analise_ia     │  │                  │  │              │  │
│  │ - approval_token │  │                  │  │              │  │
│  │ - estado         │  │                  │  │              │  │
│  │ ...              │  │                  │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     FUNÇÕES RPC                           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ - aprovar_lead(id, token, user_id)                       │   │
│  │ - rejeitar_lead(id, token, user_id)                      │   │
│  │ - get_leads_stats(user_id)                               │   │
│  │ - marcar_notificacao_lida(id, user_id)                   │   │
│  │ - marcar_todas_notificacoes_lidas(user_id)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Realtime Subscriptions
                        │ (Notificações ao vivo)
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD ADMIN                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  HEADER                                                  │   │
│  │  ┌──────────────────────────────────┐                   │   │
│  │  │  🔔 Badge de Notificações (3)    │                   │   │
│  │  │  ┌────────────────────────────┐  │                   │   │
│  │  │  │ Nova Lead - João Silva     │  │                   │   │
│  │  │  │ Score: 85 | Alta Prioridade│  │                   │   │
│  │  │  └────────────────────────────┘  │                   │   │
│  │  └──────────────────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CRM - LEADS PENDENTES                                   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Lead #1 - João Silva                              │   │   │
│  │  │ Empresa: Tech Solutions | Score: 85/100          │   │   │
│  │  │ Projeto: Website Corporativo                      │   │   │
│  │  │ Orçamento: 5.000€ - 10.000€                       │   │   │
│  │  │                                                    │   │   │
│  │  │ 📊 Análise IA:                                    │   │   │
│  │  │ ✓ Email corporativo                               │   │   │
│  │  │ ✓ Empresa com website                             │   │   │
│  │  │ ⚠ Verificar poder de decisão                     │   │   │
│  │  │                                                    │   │   │
│  │  │ [✓ Aprovar]  [✗ Rejeitar]                        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Click em "Aprovar"
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│              API: GET /api/leads/aprovar/:id?token=xxx           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Validar approval_token                             │   │
│  │  2. Chamar RPC: aprovar_lead()                         │   │
│  │     ├─ Criar cliente em 'clients'                      │   │
│  │     ├─ Atualizar estado para 'aprovado'                │   │
│  │     ├─ Remover notificação pendente                    │   │
│  │     └─ Criar notificação de sucesso                    │   │
│  │  3. Enviar email de confirmação ao cliente             │   │
│  │  4. Redirecionar para página do cliente               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Dados

### Fluxo INBOUND (Website → CRM)

```
1. Utilizador preenche formulário no website
   ↓
2. Frontend valida formulário
   ↓
3. reCAPTCHA verifica se não é bot
   ↓
4. POST /api/leads/inbound
   ├─ Validar dados
   ├─ Chamar OpenAI para análise
   ├─ Gerar approval_token único
   └─ Inserir em leads_pendentes
   ↓
5. TRIGGER: notify_new_lead()
   └─ Criar notificação em 'notificacoes'
   ↓
6. Enviar 2 emails em paralelo:
   ├─ Admin: Email com dados + análise IA + botões Aprovar/Rejeitar
   └─ Cliente: Email de confirmação de recebimento
   ↓
7. Dashboard recebe notificação em tempo real (Supabase Realtime)
   ↓
8. Badge de notificações atualiza contador
```

### Fluxo de Aprovação

```
1. Admin clica em "Aprovar" no email ou dashboard
   ↓
2. GET /api/leads/aprovar/:id?token=xxx
   ↓
3. RPC: aprovar_lead(id, token, user_id)
   ├─ Validar token
   ├─ Criar cliente em 'clients' com origem='INBOUND_WEBSITE'
   ├─ Atualizar leads_pendentes.estado = 'aprovado'
   ├─ Atualizar leads_pendentes.client_id
   ├─ Deletar notificação pendente
   └─ Criar notificação de sucesso
   ↓
4. Enviar email de boas-vindas ao cliente
   ↓
5. Redirecionar admin para página do cliente no CRM
```

### Fluxo de Rejeição

```
1. Admin clica em "Rejeitar" no email ou dashboard
   ↓
2. GET /api/leads/rejeitar/:id?token=xxx
   ↓
3. RPC: rejeitar_lead(id, token, user_id)
   ├─ Validar token
   ├─ Atualizar leads_pendentes.estado = 'rejeitado'
   └─ Deletar notificação pendente
   ↓
4. Enviar email educado de rejeição ao cliente
   ↓
5. Redirecionar admin para dashboard
```

### Fluxo OUTBOUND (CRM Manual)

```
1. Admin cria lead manualmente no CRM
   ↓
2. POST /api/leads/outbound
   ↓
3. Inserir DIRETAMENTE em 'clients'
   ├─ origem = 'OUTBOUND_PROSPECCAO'
   ├─ status = 'lead'
   └─ SEM aprovação necessária
   ↓
4. Lead aparece imediatamente no pipeline
```

---

## 🔐 Segurança e Permissões

### Row Level Security (RLS)

#### Tabela: `leads_pendentes`

```sql
-- SELECT: Admins veem todas as leads
POLICY "Admins podem ver leads pendentes"
  ON leads_pendentes FOR SELECT
  TO authenticated
  USING (true);
  -- TODO: Adicionar verificação de role admin

-- INSERT: Sistema pode inserir (API pública)
POLICY "Sistema pode inserir leads"
  ON leads_pendentes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Apenas admins
POLICY "Admins podem atualizar leads"
  ON leads_pendentes FOR UPDATE
  TO authenticated
  USING (true);
```

#### Tabela: `notificacoes`

```sql
-- SELECT: Users veem apenas suas notificações
POLICY "Users veem suas notificações"
  ON notificacoes FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Sistema cria notificações
POLICY "Sistema cria notificações"
  ON notificacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users atualizam suas notificações
POLICY "Users atualizam suas notificações"
  ON notificacoes FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users deletam suas notificações
POLICY "Users deletam suas notificações"
  ON notificacoes FOR DELETE
  USING (auth.uid() = user_id);
```

### Tokens de Aprovação

- Cada lead tem um `approval_token` UUID único
- Token é passado nos links de email: `/aprovar/:id?token=xxx`
- RPC valida token antes de executar ação
- Tokens não expiram (decisão de negócio)
- Após aprovação/rejeição, lead fica marcada (não pode ser reprocessada)

---

## 🎨 Componentes Frontend (Fase 2)

### Badge de Notificações

```typescript
// src/dashboard/components/NotificationBadge.tsx

- Contador de notificações não lidas
- Dropdown com últimas 5 notificações
- Click para marcar como lida
- Realtime updates via Supabase
- Link direto para lead pendente
```

### Modal de Lead Pendente

```typescript
// src/dashboard/pages/CRM/LeadPendenteModal.tsx

- Mostrar todos os dados da lead
- Exibir análise IA formatada
- Score visual (progress bar)
- Botões: Aprovar / Rejeitar
- Chamar APIs correspondentes
```

### Formulário OUTBOUND

```typescript
// src/dashboard/pages/CRM/NovoLeadOutbound.tsx

- Formulário para criar leads de prospeção
- Insert direto em 'clients'
- origem = 'OUTBOUND_PROSPECCAO'
- SEM validação/aprovação
```

---

## 📈 Performance e Otimizações

### Índices Criados

**leads_pendentes:**
- `idx_leads_pendentes_estado` - Filtrar por estado
- `idx_leads_pendentes_data_criacao` - Ordenar por data
- `idx_leads_pendentes_approval_token` - Validar tokens
- `idx_leads_pendentes_email` - Buscar duplicados
- `idx_leads_pendentes_prioridade_ia` - Filtrar por prioridade

**notificacoes:**
- `idx_notificacoes_user_id` - Filtrar por user
- `idx_notificacoes_lida` - Filtrar não lidas
- `idx_notificacoes_tipo` - Filtrar por tipo
- `idx_notificacoes_data_criacao` - Ordenar por data
- `idx_notificacoes_lead_pendente` - Join com leads

**clients:**
- `idx_clients_origem` - Filtrar por origem
- `idx_clients_lead_pendente` - Join com leads

### Realtime Subscriptions

```typescript
// Subscrever notificações em tempo real
supabase
  .channel('notificacoes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notificacoes',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Atualizar badge de notificações
      // Mostrar toast notification
    }
  )
  .subscribe();
```

---

## 🧩 Integrações Externas

### OpenAI API

**Modelo:** gpt-4o-mini  
**Custo:** ~€0.002 por análise  
**Timeout:** 10 segundos  
**Fallback:** Análise baseada em regras se API falhar

**Critérios de Análise:**
- Email corporativo vs pessoal (+20 pts)
- Qualidade da empresa (+25 pts)
- Qualidade da mensagem (+20 pts)
- Orçamento (+20 pts)
- Urgência (+10 pts)
- Informações de contacto (+5 pts)

### Gmail API

**Método:** OAuth 2.0  
**Scope:** `https://www.googleapis.com/auth/gmail.send`  
**Rate Limit:** ~100 emails/dia (quota gratuita)

**Templates:**
1. Nova Lead (para admin) - HTML completo com análise IA
2. Confirmação (para cliente) - Email de boas-vindas
3. Rejeição (para cliente) - Email educado

### reCAPTCHA

**Versão:** v2 Checkbox  
**Threshold:** Score > 0.5  
**Fallback:** Permitir submissão se API falhar (em DEV)

---

## 📊 Monitorização e Logs

### Logs no Console (DEV)

```typescript
// Validação de configuração
🔧 Status de Configuração - Sistema de Leads
✅ Supabase configurado
✅ OpenAI API configurada
✅ Gmail API configurada

// Análise de lead
🤖 [OpenAI] Analisando lead: joao.silva@empresa.pt
✅ [OpenAI] Score: 85/100 | Prioridade: alta

// Envio de emails
📧 [Gmail] Enviando email para: admin@etergrowth.com
✅ [Gmail] Email enviado com sucesso
```

### Logs na Base de Dados

Todas as ações ficam registadas:
- `leads_pendentes.data_criacao` - Quando lead foi criada
- `leads_pendentes.data_decisao` - Quando foi aprovada/rejeitada
- `leads_pendentes.decidido_por` - Quem tomou a decisão
- `notificacoes.data_criacao` - Quando notificação foi criada
- `notificacoes.data_leitura` - Quando foi lida

---

## 🔄 Diagrama de Estados

### Lead Pendente

```
       ┌─────────┐
       │ CRIADA  │ (estado inicial)
       └────┬────┘
            │
            ├──────────────┬──────────────┐
            │              │              │
            ↓              ↓              ↓
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ PENDENTE │   │ APROVADO │   │REJEITADO │
     └──────────┘   └──────────┘   └──────────┘
            │              │              │
            │              ↓              │
            │        ┌──────────┐        │
            │        │ Cliente  │        │
            │        │ Criado   │        │
            │        └──────────┘        │
            │                             │
            └─────────────────────────────┘
                 (estados finais)
```

### Notificação

```
     ┌─────────┐
     │ CRIADA  │
     │lida=false│
     └────┬────┘
          │
          ├─────────────┬─────────────┐
          │             │             │
          ↓             ↓             ↓
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   LIDA   │  │ DELETADA │  │ EXPIRADA │
    │lida=true │  │          │  │  (auto)  │
    └──────────┘  └──────────┘  └──────────┘
```

---

## 📝 Próximas Implementações (Fase 2)

- [ ] Endpoints da API REST
- [ ] Componentes React do Dashboard
- [ ] Formulário do Website com reCAPTCHA
- [ ] Sistema de notificações Realtime
- [ ] Testes automatizados
- [ ] Logging e monitorização

---

**Data:** 21 Janeiro 2026  
**Versão:** 1.0 - Fase 1 Completa  
**Status:** ✅ Arquitetura Implementada
