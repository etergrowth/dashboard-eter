# ✅ Checklist de Setup - FASE 1

Use este checklist para verificar se completou todos os passos do setup.

---

## 📦 Pré-Setup

- [ ] Node.js instalado (v18+)
- [ ] npm ou yarn instalado
- [ ] Git instalado
- [ ] Acesso ao repositório do projeto
- [ ] Acesso ao Supabase Dashboard

---

## 🗄️ Base de Dados

### Migration

- [ ] Abri o Supabase Dashboard
- [ ] Executei a migration `010_crm_leads_system.sql`
- [ ] Não houve erros na execução
- [ ] Verifiquei que as tabelas foram criadas:
  - [ ] `leads_pendentes`
  - [ ] `notificacoes`
- [ ] Verifiquei que os campos foram adicionados a `clients`:
  - [ ] `origem`
  - [ ] `lead_pendente_id`
  - [ ] `projeto`
  - [ ] `orcamento`
  - [ ] `mensagem_inicial`

### Validação SQL

Executar e verificar resultados:

- [ ] Testei query: `SELECT * FROM leads_pendentes LIMIT 1;` (não deve dar erro)
- [ ] Testei query: `SELECT * FROM notificacoes LIMIT 1;` (não deve dar erro)
- [ ] Testei query: `SELECT get_leads_stats(auth.uid());` (deve retornar JSON)

---

## 🔐 Variáveis de Ambiente

### Ficheiro .env.local

- [ ] Criei ficheiro `.env.local` na raiz do projeto
- [ ] Ficheiro `.env.local` está no `.gitignore`

### Supabase (OBRIGATÓRIO)

- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado
- [ ] Testei conexão (executar `npm run dev` e verificar console)

### OpenAI (Recomendado)

- [ ] Criei conta na OpenAI Platform
- [ ] Criei API Key
- [ ] `VITE_OPENAI_API_KEY` configurado
- [ ] Adicionei créditos à conta OpenAI (€5-€10)
- [ ] ✅ ou ⚠️ Decidir não usar (sistema usará fallback)

### Gmail API (Recomendado)

- [ ] Criei projeto no Google Cloud Console
- [ ] Ativei Gmail API
- [ ] Criei credenciais OAuth 2.0
- [ ] `VITE_GMAIL_CLIENT_ID` configurado
- [ ] `VITE_GMAIL_CLIENT_SECRET` configurado
- [ ] Obtive Refresh Token (usando `get-gmail-token.html`)
- [ ] `VITE_GMAIL_REFRESH_TOKEN` configurado
- [ ] `VITE_GMAIL_FROM_EMAIL` configurado
- [ ] `VITE_GMAIL_FROM_NAME` configurado
- [ ] ✅ ou ⚠️ Decidir não usar (emails não serão enviados)

### Admin

- [ ] `VITE_ADMIN_EMAIL` configurado (email para receber notificações)

### reCAPTCHA (Recomendado para Produção)

- [ ] Registei site no Google reCAPTCHA
- [ ] `VITE_RECAPTCHA_SITE_KEY` configurado
- [ ] `VITE_RECAPTCHA_SECRET_KEY` configurado
- [ ] ✅ ou ⚠️ Decidir não usar (formulário sem proteção anti-spam)

### App URLs

- [ ] `VITE_APP_URL` configurado (ex: `http://localhost:5173`)
- [ ] `VITE_API_URL` configurado (ex: `http://localhost:5173/api`)

---

## 🧪 Testes de Validação

### Servidor de Desenvolvimento

- [ ] Executei `npm install` (se necessário)
- [ ] Executei `npm run dev`
- [ ] Servidor iniciou sem erros
- [ ] Abri `http://localhost:3000` (ou porta configurada)
- [ ] Página carregou corretamente

### Console do Browser

Abrir DevTools (F12) e verificar console:

- [ ] Vi mensagem: `🔧 Status de Configuração - Sistema de Leads`
- [ ] Não há erros críticos (linhas vermelhas)
- [ ] Todas as configurações aparecem como ✅ ou ⚠️ (não ❌)

**Exemplo de output esperado:**
```
🔧 Status de Configuração - Sistema de Leads
🎉 Todas as configurações estão corretas! (6/6)

✅ Supabase
   ✅ Supabase configurado corretamente

✅ OpenAI API
   ✅ OpenAI API configurada (análise IA ativa)

✅ Gmail API
   ✅ Gmail API configurada (emails ativos)
```

### Importação de Módulos

- [ ] Não há erros de import nos ficheiros:
  - [ ] `src/lib/email/templates.ts`
  - [ ] `src/lib/email/gmail.ts`
  - [ ] `src/lib/openai-analyzer.ts`
  - [ ] `src/lib/config-validator.ts`

---

## 📁 Estrutura de Ficheiros

### Verificar que estes ficheiros existem:

#### Base de Dados
- [ ] `supabase/migrations/010_crm_leads_system.sql`

#### Código
- [ ] `src/lib/email/templates.ts`
- [ ] `src/lib/email/gmail.ts`
- [ ] `src/lib/openai-analyzer.ts`
- [ ] `src/lib/config-validator.ts`
- [ ] `src/vite-env.d.ts` (atualizado)
- [ ] `vite.config.ts` (atualizado)

#### Documentação
- [ ] `docs/setup/README.md`
- [ ] `docs/setup/ENV_SETUP.md`
- [ ] `docs/setup/DATABASE_MIGRATION.md`
- [ ] `docs/setup/CHECKLIST.md` (este ficheiro)
- [ ] `docs/setup/get-gmail-token.html`
- [ ] `docs/guides/FASE_1_COMPLETA.md`

#### Templates
- [ ] `emails_html/01_email_nova_lead.html`
- [ ] `emails_html/02_email_rejeicao_cliente.html`
- [ ] `emails_html/03_email_confirmacao_cliente.html`

---

## 🔍 Troubleshooting

### Se houver erros de import:

```
Cannot find module '../../../emails_html/01_email_nova_lead.html?raw'
```

**Solução:**
- [ ] Verificar que `vite.config.ts` tem `assetsInclude: ['**/*.html']`
- [ ] Verificar que `src/vite-env.d.ts` tem declaração de módulos `.html?raw`
- [ ] Reiniciar servidor (`npm run dev`)

### Se Supabase não conecta:

```
❌ Supabase NÃO configurado (CRÍTICO)
```

**Solução:**
- [ ] Verificar se `.env.local` existe
- [ ] Verificar se variáveis começam com `VITE_`
- [ ] Reiniciar servidor
- [ ] Verificar credenciais no Supabase Dashboard

### Se OpenAI falha:

```
⚠️ OpenAI API NÃO configurada (usando análise fallback)
```

**Solução:**
- [ ] Verificar se API key está correta
- [ ] Verificar se tem créditos na conta
- [ ] Sistema funciona normalmente com fallback

### Se Gmail falha:

```
⚠️ Gmail API NÃO configurada (emails desativados)
```

**Solução:**
- [ ] Verificar todas as variáveis `VITE_GMAIL_*`
- [ ] Refazer processo de obtenção do Refresh Token
- [ ] Em DEV, emails são logados no console (comportamento esperado)

---

## ✅ Validação Final

Quando TODOS os itens acima estiverem marcados:

- [ ] **Base de dados:** Migration aplicada com sucesso
- [ ] **Variáveis:** Todas as variáveis obrigatórias configuradas
- [ ] **Servidor:** Iniciou sem erros
- [ ] **Console:** Validação automática passou
- [ ] **Documentação:** Li e entendi os guias

---

## 🎉 Próximos Passos

Se tudo está ✅:

1. **Marcar FASE 1 como completa** ✅
2. **Commit das alterações** (exceto `.env.local`!)
3. **Prosseguir para FASE 2** - Implementação dos endpoints da API

Se algo está ⚠️ ou ❌:

1. Consultar [Troubleshooting](#troubleshooting) acima
2. Ler documentação detalhada em `docs/setup/`
3. Validar passo a passo cada componente
4. Verificar logs do console e do terminal

---

## 📝 Notas Finais

- Este checklist deve ser revisto antes de ir para produção
- Em produção, TODAS as configurações devem estar ✅
- Nunca commit ficheiros `.env*` para o Git
- Manter API keys seguras e rotacioná-las regularmente

---

**Data de criação:** 21 Janeiro 2026

**Status:** FASE 1 - Fundação ✅
