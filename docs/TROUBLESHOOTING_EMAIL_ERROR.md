# Troubleshooting: Erro ao Enviar Email

## Erro: "Edge Function returned a non-2xx status code"

### 🔍 Diagnóstico

Este erro ocorre quando a Edge Function retorna um status HTTP diferente de 2xx (200-299). As causas mais comuns são:

1. **Variáveis de ambiente Gmail não configuradas no Supabase** (mais comum)
2. **Credenciais Gmail inválidas ou expiradas**
3. **Erro de autenticação do utilizador**
4. **Lead não encontrada ou sem permissão**

### ✅ Solução Rápida

#### Passo 1: Verificar se os secrets estão configurados

**Opção A - Via Script (Mais Rápido):**
```bash
cd dashboard-eter
./scripts/setup-edge-function-secrets.sh
```

**Opção B - Via Dashboard:**
1. Aceda ao [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o seu projeto
3. Vá para **Edge Functions** > **Secrets**
4. Verifique se existem estas variáveis:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`
   - `GMAIL_FROM_EMAIL` (opcional)
   - `GMAIL_FROM_NAME` (opcional)

**Opção C - Via CLI:**
```bash
supabase secrets list --project-ref ozjafmkfabewxoyibirq
```

#### Passo 2: Configurar os secrets se não existirem

Se os secrets não estiverem configurados, configure-os usando uma das opções:

**Via Script (Recomendado):**
```bash
# Certifique-se de que o .env.local tem as variáveis:
# GMAIL_CLIENT_ID=...
# GMAIL_CLIENT_SECRET=...
# GMAIL_REFRESH_TOKEN=...

./scripts/setup-edge-function-secrets.sh
```

**Via Dashboard:**
1. No Supabase Dashboard, vá para **Edge Functions** > **Secrets**
2. Clique em **Add new secret**
3. Adicione cada variável:
   - Name: `GMAIL_CLIENT_ID`, Value: (do seu .env.local)
   - Name: `GMAIL_CLIENT_SECRET`, Value: (do seu .env.local)
   - Name: `GMAIL_REFRESH_TOKEN`, Value: (do seu .env.local)

**Via CLI:**
```bash
supabase secrets set GMAIL_CLIENT_ID="valor-do-env-local" --project-ref ozjafmkfabewxoyibirq
supabase secrets set GMAIL_CLIENT_SECRET="valor-do-env-local" --project-ref ozjafmkfabewxoyibirq
supabase secrets set GMAIL_REFRESH_TOKEN="valor-do-env-local" --project-ref ozjafmkfabewxoyibirq
```

#### Passo 3: Verificar os logs da Edge Function

1. Aceda ao Supabase Dashboard
2. Vá para **Edge Functions** > **send-email-apresentacao** > **Logs**
3. Procure por mensagens de erro específicas

### 🔧 Erros Específicos e Soluções

#### "Gmail não configurado"
**Causa:** Variáveis de ambiente não configuradas no Supabase  
**Solução:** Configure os secrets usando o script ou manualmente (ver Passo 2)

#### "Erro ao autenticar com Gmail"
**Causa:** Refresh token inválido ou credenciais incorretas  
**Solução:**
1. Verifique se o refresh token ainda é válido
2. Gere um novo refresh token se necessário
3. Atualize o secret `GMAIL_REFRESH_TOKEN` no Supabase

#### "Missing authorization header" ou "Unauthorized"
**Causa:** Utilizador não autenticado  
**Solução:** Faça login novamente no dashboard

#### "Lead não encontrada ou sem permissão"
**Causa:** Lead não pertence ao utilizador ou ID incorreto  
**Solução:** Verifique se está a tentar enviar email para uma lead que pertence ao utilizador autenticado

### 📋 Checklist de Verificação

- [ ] Secrets configurados no Supabase Dashboard (Edge Functions > Secrets)
- [ ] `GMAIL_CLIENT_ID` configurado e correto
- [ ] `GMAIL_CLIENT_SECRET` configurado e correto
- [ ] `GMAIL_REFRESH_TOKEN` configurado e válido
- [ ] Utilizador autenticado no dashboard
- [ ] Lead pertence ao utilizador autenticado
- [ ] Gmail API ativada no Google Cloud Console
- [ ] Logs da Edge Function verificados

### 🧪 Teste

Após configurar os secrets:

1. Aceda ao dashboard
2. Vá para uma lead (Sandbox)
3. Clique em "Enviar E-mail de Apresentação"
4. Verifique se o email é enviado com sucesso
5. Verifique se aparece uma atividade na timeline

### 📞 Ainda com problemas?

Se o problema persistir:

1. **Verifique os logs detalhados:**
   - Supabase Dashboard > Edge Functions > send-email-apresentacao > Logs
   - Console do browser (F12 > Console)

2. **Teste a Edge Function diretamente:**
   ```bash
   # Via Supabase CLI
   supabase functions invoke send-email-apresentacao \
     --body '{"lead_id": "uuid", "lead_name": "Teste", "lead_email": "teste@example.com"}' \
     --project-ref ozjafmkfabewxoyibirq
   ```

3. **Verifique as credenciais Gmail:**
   - Google Cloud Console > APIs & Services > Credentials
   - Verifique se o OAuth client está ativo
   - Verifique se o refresh token foi gerado para o mesmo client

### 💡 Dica Importante

**As variáveis no `.env.local` do frontend NÃO são suficientes!**

A Edge Function roda no servidor do Supabase, não no browser. Por isso, as variáveis de ambiente precisam estar configuradas como **secrets** no Supabase Dashboard, não apenas no `.env.local` do projeto.

O `.env.local` é usado apenas pelo frontend. As Edge Functions precisam das variáveis configuradas no Supabase.
