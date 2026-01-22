# ⚡ Quick Start - Sistema de Leads CRM

Guia rápido para começar em 5 minutos.

---

## 📋 Pré-requisitos

- [x] Node.js instalado
- [x] Acesso ao Supabase Dashboard
- [x] Templates de email em `emails_html/`

---

## 🚀 Setup em 3 Passos

### 1️⃣ Aplicar Migration (2 min)

```bash
# Via Supabase Dashboard:
1. Ir para https://supabase.com/dashboard
2. SQL Editor > New query
3. Copiar conteúdo de: supabase/migrations/010_crm_leads_system.sql
4. Colar e executar (▶️)
5. Verificar: sem erros
```

**Validar:**
```sql
-- No SQL Editor, executar:
SELECT * FROM leads_pendentes LIMIT 1;
SELECT * FROM notificacoes LIMIT 1;
```

Se não der erro → ✅ Migration aplicada!

---

### 2️⃣ Configurar Ambiente (2 min)

```bash
# Criar ficheiro .env.local
touch .env.local

# Editar e adicionar (mínimo):
cat > .env.local << 'EOF'
# OBRIGATÓRIO
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# RECOMENDADO (análise IA)
VITE_OPENAI_API_KEY=sk-proj-xxx...

# RECOMENDADO (envio de emails)
VITE_GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GMAIL_CLIENT_SECRET=GOCSPX-xxx...
VITE_GMAIL_REFRESH_TOKEN=1//xxx...
VITE_GMAIL_FROM_EMAIL=hello@etergrowth.com
VITE_GMAIL_FROM_NAME=Eter Growth

# ADMIN
VITE_ADMIN_EMAIL=admin@etergrowth.com

# APP
VITE_APP_URL=http://localhost:5173
EOF
```

**Onde obter as chaves:**
- Supabase: Dashboard > Settings > API
- OpenAI: https://platform.openai.com/api-keys
- Gmail: Ver `docs/setup/get-gmail-token.html`

---

### 3️⃣ Iniciar e Validar (1 min)

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor
npm run dev

# Abrir browser
# http://localhost:3000 (ou porta configurada)

# Abrir DevTools (F12) e verificar console
# Deverá ver:
# 🔧 Status de Configuração - Sistema de Leads
# ✅ Supabase configurado
# ✅ OpenAI API configurada (ou ⚠️)
# ✅ Gmail API configurada (ou ⚠️)
```

**Se tudo estiver ✅ → PRONTO!** 🎉

---

## 🧪 Testes Rápidos

### Teste 1: Validação Automática

Já acontece automaticamente ao iniciar em DEV. Verificar console do browser.

### Teste 2: Manual (Opcional)

```typescript
// No console do browser (F12):
import { testSetup } from './src/lib/test-setup';
testSetup();

// Aguardar 3-5 segundos
// Verificar resultados no console
```

---

## 📊 O Que Foi Criado?

### Base de Dados

- ✅ `leads_pendentes` - Armazena leads do website
- ✅ `notificacoes` - Sistema de notificações
- ✅ `clients` - 5 novos campos adicionados

### Funções RPC

- ✅ `aprovar_lead()` - Aprovar e criar cliente
- ✅ `rejeitar_lead()` - Rejeitar lead
- ✅ `get_leads_stats()` - Estatísticas
- ✅ `marcar_notificacao_lida()` - Marcar notificação
- ✅ `marcar_todas_notificacoes_lidas()` - Marcar todas

### Código TypeScript

- ✅ `src/lib/email/templates.ts` - Templates de email
- ✅ `src/lib/email/gmail.ts` - Envio via Gmail API
- ✅ `src/lib/openai-analyzer.ts` - Análise IA
- ✅ `src/lib/config-validator.ts` - Validação
- ✅ `src/lib/test-setup.ts` - Testes

---

## 🔍 Troubleshooting

### Erro: Supabase não conecta

```bash
# Verificar se .env.local existe
ls -la .env.local

# Verificar se variáveis começam com VITE_
cat .env.local | grep VITE_

# Reiniciar servidor
npm run dev
```

### Erro: Templates não carregam

```bash
# Verificar se ficheiros HTML existem
ls -la emails_html/

# Deverá ver:
# 01_email_nova_lead.html
# 02_email_rejeicao_cliente.html
# 03_email_confirmacao_cliente.html
```

### OpenAI ou Gmail não funcionam

Não é crítico! O sistema funciona com fallbacks:

- **OpenAI:** Usa análise baseada em regras
- **Gmail:** Logs no console (em DEV)

Para ativar, configure as variáveis correspondentes.

---

## 📚 Próximos Passos

### Opção A: Explorar a Documentação

```bash
# Ler documentação completa
cat docs/setup/README.md
cat docs/FASE_1_RESUMO_EXECUTIVO.md
cat docs/architecture/CRM_LEADS_ARCHITECTURE.md
```

### Opção B: Começar a Fase 2

Criar os 4 endpoints da API:

1. `POST /api/leads/inbound` - Receber leads do website
2. `POST /api/leads/outbound` - Criar leads manualmente
3. `GET /api/leads/aprovar/:id` - Aprovar lead
4. `GET /api/leads/rejeitar/:id` - Rejeitar lead

**Arquitetura:** `docs/architecture/CRM_LEADS_ARCHITECTURE.md`

---

## 🎯 Checklist de Validação

- [ ] Migration aplicada sem erros
- [ ] `.env.local` criado com Supabase configurado
- [ ] Servidor iniciou: `npm run dev`
- [ ] Console mostra validação (✅ ou ⚠️, sem ❌)
- [ ] Posso fazer queries na BD

Se tudo ✅ → **FASE 1 COMPLETA!** 🎉

---

## 📞 Ajuda

- **Checklist completa:** `docs/setup/CHECKLIST.md`
- **Configuração detalhada:** `docs/setup/ENV_SETUP.md`
- **Migration:** `docs/setup/DATABASE_MIGRATION.md`
- **Arquitetura:** `docs/architecture/CRM_LEADS_ARCHITECTURE.md`

---

**Tempo total:** ~5 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)  
**Status:** ✅ Pronto para uso

---

Bom trabalho! 🚀
