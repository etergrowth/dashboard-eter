# Configuração da Edge Function send-email-apresentacao

## ✅ Status

- ✅ Edge Function `send-email-apresentacao` deployada e ativa
- ✅ Integrada no frontend (`LeadDetail.tsx`)
- ⚠️ Requer configuração das variáveis de ambiente Gmail

## Configuração Necessária

### 1. Configurar Variáveis de Ambiente no Supabase

A Edge Function requer as seguintes variáveis de ambiente configuradas no Supabase Dashboard:

**⚠️ IMPORTANTE:** As variáveis devem estar configuradas no Supabase Dashboard, não apenas no `.env.local` do frontend.

#### Opção A: Via Script Automático (Recomendado)

1. Certifique-se de que as variáveis estão no `.env.local`:
```bash
GMAIL_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=seu-client-secret
GMAIL_REFRESH_TOKEN=seu-refresh-token
GMAIL_FROM_EMAIL=hello@etergrowth.com (opcional)
GMAIL_FROM_NAME=Eter Growth (opcional)
```

2. Execute o script:
```bash
./scripts/setup-edge-function-secrets.sh
```

#### Opção B: Via Supabase Dashboard (Manual)

1. Aceda ao Supabase Dashboard
2. Vá para **Edge Functions** > **Secrets**
3. Adicione as seguintes variáveis:

```
GMAIL_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=seu-client-secret
GMAIL_REFRESH_TOKEN=seu-refresh-token
GMAIL_FROM_EMAIL=hello@etergrowth.com (opcional, padrão: hello@etergrowth.com)
GMAIL_FROM_NAME=Eter Growth (opcional, padrão: Eter Growth)
```

#### Opção C: Via Supabase CLI (Manual)

```bash
supabase secrets set GMAIL_CLIENT_ID="seu-client-id" --project-ref ozjafmkfabewxoyibirq
supabase secrets set GMAIL_CLIENT_SECRET="seu-client-secret" --project-ref ozjafmkfabewxoyibirq
supabase secrets set GMAIL_REFRESH_TOKEN="seu-refresh-token" --project-ref ozjafmkfabewxoyibirq
```

### 2. Como Obter as Credenciais Gmail

#### Passo 1: Criar Projeto no Google Cloud Console

1. Aceda a: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a **Gmail API**

#### Passo 2: Criar Credenciais OAuth 2.0

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000` (para desenvolvimento)
4. Copie o **Client ID** e **Client Secret**

#### Passo 3: Obter Refresh Token

1. Use a ferramenta em `docs/setup/get-gmail-token.html`
2. Ou siga o processo OAuth manual:
   - Autorize a aplicação
   - Obtenha o código de autorização
   - Troque por access token e refresh token

## Como Funciona

1. **Utilizador clica em "Enviar E-mail de Apresentação"**
   - Frontend chama a Edge Function `send-email-apresentacao`
   - Passa `lead_id`, `lead_name` e `lead_email`

2. **Edge Function processa:**
   - Verifica autenticação do utilizador
   - Valida que a lead pertence ao utilizador
   - Obtém credenciais Gmail das variáveis de ambiente
   - Obtém access token via refresh token
   - Prepara HTML do email (personalizado com nome)
   - Envia email via Gmail API
   - Cria atividade na timeline automaticamente
   - Atualiza status da lead para 'engaged' se estiver em 'prospecting'

3. **Frontend recebe resposta:**
   - Mostra toast de sucesso/erro
   - Fecha modal de pré-visualização
   - UI atualiza automaticamente (via invalidation de queries)

## Vantagens da Edge Function

✅ **Segurança**: Credenciais Gmail não expostas no frontend
✅ **Confiabilidade**: Processamento no servidor garante envio
✅ **Rastreabilidade**: Logs centralizados no Supabase
✅ **Automação**: Cria atividade e atualiza status automaticamente
✅ **Validação**: Verifica permissões antes de enviar

## Teste

Para testar se está a funcionar:

1. Certifique-se de que as variáveis de ambiente estão configuradas
2. Aceda a `/dashboard/sandbox/:id` (detalhes de uma lead)
3. Clique em "Enviar E-mail de Apresentação"
4. Verifique:
   - Email enviado na caixa de entrada
   - Atividade criada na timeline
   - Status atualizado (se estava em 'prospecting')

## Troubleshooting

### Erro: "Edge Function returned a non-2xx status code"

Este erro geralmente indica que as variáveis de ambiente não estão configuradas no Supabase. Siga estes passos:

1. **Verificar se os secrets estão configurados:**
   ```bash
   # Via CLI
   supabase secrets list --project-ref ozjafmkfabewxoyibirq
   
   # Ou verifique no Dashboard: Edge Functions > Secrets
   ```

2. **Configurar os secrets:**
   ```bash
   # Use o script automático
   ./scripts/setup-edge-function-secrets.sh
   
   # Ou configure manualmente via Dashboard ou CLI
   ```

3. **Verificar os logs da Edge Function:**
   - Aceda ao Supabase Dashboard
   - Vá para **Edge Functions** > **send-email-apresentacao** > **Logs**
   - Procure por mensagens de erro específicas

### Erro: "Gmail não configurado"
- ✅ **Solução:** Configure as variáveis de ambiente no Supabase Dashboard (Edge Functions > Secrets)
- Verifique se todas as variáveis estão configuradas: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
- Verifique se os nomes das variáveis estão corretos (case-sensitive)
- **Importante:** As variáveis no `.env.local` do frontend NÃO são suficientes. Elas precisam estar no Supabase.

### Erro: "Erro ao autenticar com Gmail" ou "Erro ao obter access token"
- Verifique se o refresh token ainda é válido
- Pode precisar gerar um novo refresh token
- Verifique se o Client ID e Client Secret estão corretos
- Verifique se a Gmail API está ativada no Google Cloud Console

### Erro: "Lead não encontrada ou sem permissão"
- Verifique se a lead pertence ao utilizador autenticado
- Verifique se o `lead_id` está correto
- Verifique se o utilizador está autenticado (token JWT válido)

### Erro: "Missing authorization header"
- O utilizador não está autenticado
- Faça login novamente no dashboard

### Email não aparece na timeline
- A Edge Function cria a atividade automaticamente
- Se não aparecer, verifique os logs da Edge Function no Supabase Dashboard
- Verifique se a tabela `sandbox_activities` tem as políticas RLS corretas

### Como verificar se os secrets estão configurados

**Via Dashboard:**
1. Aceda ao Supabase Dashboard
2. Vá para **Edge Functions** > **Secrets**
3. Verifique se todas as variáveis Gmail estão listadas

**Via CLI:**
```bash
supabase secrets list --project-ref ozjafmkfabewxoyibirq
```

## Logs

Para ver os logs da Edge Function:

1. Aceda ao Supabase Dashboard
2. Vá para **Edge Functions** > **send-email-apresentacao** > **Logs**
3. Verifique mensagens de erro ou sucesso

## Segurança

- ✅ JWT verification habilitado (`verify_jwt: true`)
- ✅ Verificação de ownership da lead
- ✅ Credenciais Gmail armazenadas como secrets (não expostas)
- ✅ Validação de formato de email
- ✅ Service role key usado apenas para operações internas
