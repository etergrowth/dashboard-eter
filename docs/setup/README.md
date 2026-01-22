# 🚀 Setup do Sistema de Leads CRM

Bem-vindo ao guia de configuração do sistema de leads do Dashboard Eter!

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Passos de Instalação](#passos-de-instalação)
4. [Validação](#validação)
5. [Troubleshooting](#troubleshooting)
6. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

O sistema de leads permite:
- ✅ Receber leads do formulário do website
- ✅ Análise automática com IA (OpenAI)
- ✅ Sistema de aprovação/rejeição via email
- ✅ Notificações em tempo real no dashboard
- ✅ Gestão separada de leads INBOUND e OUTBOUND
- ✅ Templates de email profissionais

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter:

- [x] Node.js instalado (v18+)
- [x] Acesso ao projeto Supabase
- [x] Conta OpenAI (para análise IA)
- [x] Conta Google Cloud (para Gmail API)
- [x] Conta Google reCAPTCHA (opcional, mas recomendado)

---

## 🔧 Passos de Instalação

### Passo 1: Aplicar Migration da Base de Dados

**O que faz:** Cria tabelas `leads_pendentes`, `notificacoes` e adiciona campos à tabela `clients`.

**Como fazer:**

1. Abrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar o projeto
3. Ir em **SQL Editor** > **New query**
4. Copiar conteúdo de `supabase/migrations/010_crm_leads_system.sql`
5. Colar e executar (▶️)

**Documentação detalhada:** [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)

---

### Passo 2: Configurar Variáveis de Ambiente

**O que faz:** Configura chaves API e credenciais de serviços externos.

**Como fazer:**

1. Criar ficheiro `.env.local` na raiz do projeto
2. Copiar template abaixo e preencher valores reais:

```bash
# Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# OpenAI (Recomendado para análise IA)
VITE_OPENAI_API_KEY=sk-proj-xxx...

# Gmail API (Recomendado para envio de emails)
VITE_GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GMAIL_CLIENT_SECRET=GOCSPX-xxx...
VITE_GMAIL_REFRESH_TOKEN=1//xxx...
VITE_GMAIL_FROM_EMAIL=hello@etergrowth.com
VITE_GMAIL_FROM_NAME=Eter Growth

# Admin
VITE_ADMIN_EMAIL=admin@etergrowth.com

# reCAPTCHA (Recomendado para produção)
VITE_RECAPTCHA_SITE_KEY=6Lexxx...
VITE_RECAPTCHA_SECRET_KEY=6Lexxx...

# App
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api
```

**Documentação detalhada:** [ENV_SETUP.md](./ENV_SETUP.md)

---

### Passo 3: Configurar Gmail API (Opcional mas Recomendado)

**O que faz:** Permite enviar emails de notificação e confirmação.

**Como fazer:**

1. Abrir o ficheiro `docs/setup/get-gmail-token.html` no browser
2. Inserir Client ID e Client Secret
3. Clicar em "Autenticar com Google"
4. Copiar Refresh Token
5. Adicionar ao `.env.local`

**Documentação detalhada:** [ENV_SETUP.md](./ENV_SETUP.md) - Seção Gmail API

---

### Passo 4: Configurar OpenAI API (Opcional mas Recomendado)

**O que faz:** Analisa leads automaticamente e atribui score de qualidade.

**Como fazer:**

1. Criar conta em [OpenAI Platform](https://platform.openai.com/)
2. Ir em [API Keys](https://platform.openai.com/api-keys)
3. Criar nova chave
4. Copiar chave (começa com `sk-proj-...`)
5. Adicionar ao `.env.local`

**Custo estimado:** ~€0.002 por análise (modelo gpt-4o-mini)

**Documentação detalhada:** [ENV_SETUP.md](./ENV_SETUP.md) - Seção OpenAI

---

### Passo 5: Configurar reCAPTCHA (Opcional mas Recomendado)

**O que faz:** Protege o formulário contra spam e bots.

**Como fazer:**

1. Ir para [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Registar novo site (v2 - Checkbox)
3. Adicionar domínios (`localhost` + domínio de produção)
4. Copiar Site Key e Secret Key
5. Adicionar ao `.env.local`

**Documentação detalhada:** [ENV_SETUP.md](./ENV_SETUP.md) - Seção reCAPTCHA

---

## ✅ Validação

### Validação Automática

O sistema valida automaticamente a configuração ao iniciar em modo DEV.

```bash
npm run dev
```

Verificar console do browser para ver status:

```
🔧 Status de Configuração - Sistema de Leads
🎉 Todas as configurações estão corretas! (6/6)

✅ Supabase
   ✅ Supabase configurado corretamente

✅ OpenAI API
   ✅ OpenAI API configurada (análise IA ativa)

✅ Gmail API
   ✅ Gmail API configurada (emails ativos)

...
```

### Validação Manual

Executar queries SQL no Supabase:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leads_pendentes', 'notificacoes');

-- Verificar funções RPC
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%lead%';

-- Testar estatísticas
SELECT get_leads_stats(auth.uid());
```

---

## 🔍 Troubleshooting

### Problema: "Migration já foi aplicada"

**Sintoma:** Erro ao executar migration

**Solução:** Verificar se tabelas já existem:

```sql
SELECT * FROM leads_pendentes LIMIT 1;
```

Se retornar resultado, migration já foi aplicada.

---

### Problema: "OpenAI API Key inválida"

**Sintoma:** Análise IA não funciona

**Solução:**
1. Verificar se chave começa com `sk-proj-`
2. Verificar se tem créditos na conta OpenAI
3. Sistema usa fallback automático se API falhar

---

### Problema: "Gmail não envia emails"

**Sintoma:** Emails não são recebidos

**Solução:**
1. Verificar se Refresh Token está correto
2. Verificar se Gmail API está ativada no Google Cloud
3. Em DEV, emails são apenas logados no console

---

### Problema: Variáveis de ambiente não carregam

**Sintoma:** `import.meta.env.VITE_XXX` retorna `undefined`

**Solução:**
1. Verificar se ficheiro é `.env.local` (não `.env`)
2. Reiniciar servidor de desenvolvimento (`npm run dev`)
3. Verificar se variáveis começam com `VITE_`

---

## 📚 Documentação Adicional

### Ficheiros de Referência

| Ficheiro | Descrição |
|----------|-----------|
| [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) | Guia de migração da base de dados |
| [ENV_SETUP.md](./ENV_SETUP.md) | Configuração de variáveis de ambiente |
| [FASE_1_COMPLETA.md](../guides/FASE_1_COMPLETA.md) | Resumo completo da Fase 1 |
| [get-gmail-token.html](./get-gmail-token.html) | Ferramenta para obter Gmail Refresh Token |

### Estrutura de Ficheiros Criados

```
src/lib/
├── email/
│   ├── templates.ts      # Templates de email
│   └── gmail.ts          # Integração Gmail API
├── openai-analyzer.ts    # Análise IA de leads
└── config-validator.ts   # Validação de configuração

supabase/migrations/
└── 010_crm_leads_system.sql

docs/
├── setup/
│   ├── README.md (este ficheiro)
│   ├── ENV_SETUP.md
│   ├── DATABASE_MIGRATION.md
│   └── get-gmail-token.html
└── guides/
    └── FASE_1_COMPLETA.md
```

---

## 🎯 Próximos Passos

Após completar o setup:

1. ✅ **Testar validação automática**
   - Executar `npm run dev`
   - Verificar console

2. ✅ **Aplicar migration em staging**
   - Testar em ambiente de testes primeiro

3. ✅ **Configurar todas as variáveis de ambiente**
   - Supabase (obrigatório)
   - OpenAI (recomendado)
   - Gmail (recomendado)

4. ✅ **Prosseguir para FASE 2**
   - Criar endpoints da API
   - Implementar formulário do website
   - Criar interface do dashboard

---

## 🆘 Precisa de Ajuda?

- 📖 **Documentação completa:** Ver ficheiros em `docs/setup/`
- 🐛 **Encontrou um bug?** Reportar no sistema de issues
- 💬 **Dúvidas?** Consultar documentação da API:
  - [Supabase Docs](https://supabase.com/docs)
  - [OpenAI Docs](https://platform.openai.com/docs)
  - [Gmail API Docs](https://developers.google.com/gmail/api)

---

**Status:** ✅ FASE 1 COMPLETA - Pronto para Fase 2

**Última atualização:** 21 Janeiro 2026
