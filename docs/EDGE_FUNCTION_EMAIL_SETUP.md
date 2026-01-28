# Configuração da Edge Function send-email-apresentacao

## ✅ Status

- ✅ Edge Function `send-email-apresentacao` deployada e ativa
- ✅ Integrada no frontend (`LeadDetail.tsx`)
- ⚠️ Requer configuração das variáveis de ambiente Gmail

## Configuração Necessária

### 1. Configurar Variáveis de Ambiente no Supabase

A Edge Function requer as seguintes variáveis de ambiente configuradas no Supabase Dashboard:

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

### Erro: "Gmail não configurado"
- Verifique se todas as variáveis de ambiente estão configuradas no Supabase Dashboard
- Verifique se os nomes das variáveis estão corretos (case-sensitive)

### Erro: "Erro ao autenticar com Gmail"
- Verifique se o refresh token ainda é válido
- Pode precisar gerar um novo refresh token

### Erro: "Lead não encontrada ou sem permissão"
- Verifique se a lead pertence ao utilizador autenticado
- Verifique se o `lead_id` está correto

### Email não aparece na timeline
- A Edge Function cria a atividade automaticamente
- Se não aparecer, verifique os logs da Edge Function no Supabase Dashboard

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
