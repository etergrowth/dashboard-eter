# Configuração de Variáveis de Ambiente

Este guia explica como configurar todas as variáveis de ambiente necessárias para o sistema de leads funcionar corretamente.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:
- Conta Supabase (já configurada)
- Conta OpenAI
- Conta Google Cloud (para Gmail API)
- Conta Google reCAPTCHA

---

## 🔧 Setup Passo a Passo

### 1. Criar Ficheiro `.env.local`

Crie um ficheiro `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# =============================================
# SUPABASE
# =============================================
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# =============================================
# OPENAI API (Análise de Leads)
# =============================================
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# =============================================
# GMAIL API (Envio de Emails)
# =============================================
VITE_GMAIL_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
VITE_GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_GMAIL_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GMAIL_FROM_EMAIL=hello@etergrowth.com
VITE_GMAIL_FROM_NAME=Eter Growth
VITE_ADMIN_EMAIL=admin@etergrowth.com

# =============================================
# RECAPTCHA (Proteção contra Spam)
# =============================================
VITE_RECAPTCHA_SITE_KEY=6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_RECAPTCHA_SECRET_KEY=6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# =============================================
# APLICAÇÃO
# =============================================
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api
```

---

## 🤖 Configurar OpenAI API

### Passo 1: Criar Conta OpenAI
1. Aceder a https://platform.openai.com/
2. Criar conta ou fazer login

### Passo 2: Obter API Key
1. Ir para https://platform.openai.com/api-keys
2. Clicar em **"Create new secret key"**
3. Dar um nome à chave (ex: "Dashboard Eter - Lead Analysis")
4. Copiar a chave (começa com `sk-proj-...`)
5. Colar em `.env.local` na variável `VITE_OPENAI_API_KEY`

### Passo 3: Adicionar Créditos
1. Ir para https://platform.openai.com/settings/organization/billing
2. Adicionar método de pagamento
3. Carregar créditos (€5-€10 é suficiente para começar)

**Custo estimado:** ~€0.002 por análise de lead (usando gpt-4o-mini)

---

## 📧 Configurar Gmail API

### Passo 1: Criar Projeto no Google Cloud

1. Aceder a https://console.cloud.google.com/
2. Clicar em **"Select a project"** > **"New Project"**
3. Nome do projeto: `Dashboard Eter`
4. Clicar em **"Create"**

### Passo 2: Ativar Gmail API

1. No menu lateral, ir em **"APIs & Services"** > **"Library"**
2. Procurar por **"Gmail API"**
3. Clicar em **"Enable"**

### Passo 3: Criar Credenciais OAuth 2.0

1. Ir em **"APIs & Services"** > **"Credentials"**
2. Clicar em **"Create Credentials"** > **"OAuth client ID"**
3. Se solicitado, configurar **OAuth consent screen**:
   - User Type: **External**
   - App name: `Dashboard Eter`
   - User support email: seu email
   - Developer contact: seu email
   - Clicar em **"Save and Continue"**
   - Em Scopes, adicionar: `https://www.googleapis.com/auth/gmail.send`
   - Adicionar test users (seu email)
4. Voltar para **Credentials** > **"Create Credentials"** > **"OAuth client ID"**
5. Application type: **Web application**
6. Name: `Dashboard Eter Web Client`
7. Authorized redirect URIs: `http://localhost:5173/auth/callback`
8. Clicar em **"Create"**
9. Copiar **Client ID** e **Client Secret**

### Passo 4: Obter Refresh Token

Criar um ficheiro temporário `get-gmail-token.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Gmail OAuth</title>
</head>
<body>
  <h1>Gmail API - Obter Refresh Token</h1>
  <button onclick="authenticate()">1. Autenticar com Google</button>
  <div id="result"></div>

  <script>
    const CLIENT_ID = 'SEU_CLIENT_ID_AQUI';
    const CLIENT_SECRET = 'SEU_CLIENT_SECRET_AQUI';
    const REDIRECT_URI = 'http://localhost:5173/auth/callback';
    const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

    function authenticate() {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(SCOPE)}&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      window.location.href = authUrl;
    }

    // Após redirect, pegar o código da URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      document.getElementById('result').innerHTML = 
        '<h2>2. Código recebido!</h2>' +
        '<p>Cole este código no script Python abaixo:</p>' +
        '<pre>' + code + '</pre>' +
        '<h3>3. Execute este comando:</h3>' +
        '<pre>curl -X POST https://oauth2.googleapis.com/token \\\n' +
        '  -d "client_id=' + CLIENT_ID + '" \\\n' +
        '  -d "client_secret=' + CLIENT_SECRET + '" \\\n' +
        '  -d "code=' + code + '" \\\n' +
        '  -d "redirect_uri=' + REDIRECT_URI + '" \\\n' +
        '  -d "grant_type=authorization_code"</pre>';
    }
  </script>
</body>
</html>
```

**Passos:**
1. Substituir `CLIENT_ID` e `CLIENT_SECRET` no HTML
2. Abrir o ficheiro no browser
3. Clicar em "Autenticar com Google"
4. Autorizar a aplicação
5. Copiar o comando curl que aparece
6. Executar no terminal
7. Copiar o `refresh_token` do resultado JSON
8. Colar em `.env.local` na variável `VITE_GMAIL_REFRESH_TOKEN`

**Alternativa mais simples:** Usar a biblioteca `google-auth-library` em Node.js (ver documentação oficial)

---

## 🔒 Configurar reCAPTCHA

### Passo 1: Criar Site no reCAPTCHA

1. Ir para https://www.google.com/recaptcha/admin
2. Clicar em **"+"** (adicionar site)
3. Label: `Dashboard Eter Website`
4. reCAPTCHA type: **reCAPTCHA v2** > "I'm not a robot" Checkbox
5. Domains: 
   - `localhost`
   - `etergrowth.com` (ou seu domínio)
6. Aceitar termos e criar

### Passo 2: Copiar Chaves

1. Copiar **Site Key** para `VITE_RECAPTCHA_SITE_KEY`
2. Copiar **Secret Key** para `VITE_RECAPTCHA_SECRET_KEY`

---

## ✅ Validar Configuração

Após configurar tudo, adicione ao `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local
```

Para validar se está tudo OK, execute:

```bash
npm run dev
```

No console do browser, deverá ver:
- ✅ Supabase conectado
- ✅ OpenAI configurado
- ✅ Gmail configurado

Se algum serviço não estiver configurado, verá warnings, mas a aplicação ainda funcionará com funcionalidades reduzidas.

---

## 🚨 Segurança

**IMPORTANTE:**
- ❌ **NUNCA** commit ficheiros `.env` para o Git
- ❌ **NUNCA** partilhe API keys publicamente
- ✅ Use `.env.local` para desenvolvimento local
- ✅ Configure variáveis de ambiente no servidor de produção
- ✅ Rotacione chaves regularmente
- ✅ Limite permissões das API keys ao mínimo necessário

---

## 📚 Recursos Adicionais

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Gmail API Docs](https://developers.google.com/gmail/api/guides)
- [reCAPTCHA Docs](https://developers.google.com/recaptcha/docs/display)
- [Supabase Docs](https://supabase.com/docs)
