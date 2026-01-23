# Configuração Completa de Autenticação - Eter Growth

## ✅ Status Atual

### Configurado:
- ✅ Google OAuth configurado no Supabase
- ✅ Migration 020 aplicada (validação de emails)
- ✅ Frontend com validação de emails
- ✅ Página de login com Google e Email/Password
- ✅ Proteção de rotas implementada

### Pendente:
- ⏳ Criar os 3 utilizadores no Supabase
- ⏳ Configurar permissões de signup

---

## 📋 Passo 1: Configurar Signup no Supabase Dashboard

1. Aceder a: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/providers
2. Ir em **Authentication** > **Settings** (ou **Policies**)
3. Configurar:
   - ✅ **Allow new users to sign up**: **DESATIVAR** (não queremos que outros criem contas)
   - ✅ **Allow manual linking**: **ATIVAR** (para vincular contas Google)
   - ❌ **Allow anonymous sign-ins**: **DESATIVAR**
   - ⚠️ **Confirm email**: **DESATIVAR** (para Google OAuth, não é necessário)

**IMPORTANTE:** Como vamos criar os utilizadores manualmente e usar apenas Google OAuth, não precisamos de signup público.

---

## 👥 Passo 2: Criar Utilizadores Manualmente

### Opção A: Criar via Supabase Dashboard (Recomendado)

1. Aceder a: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/users
2. Clicar em **"Add user"** ou **"Invite user"**
3. Para cada um dos 3 emails:

   **Utilizador 1:**
   - Email: `geral@etergrowth.com`
   - Password: (deixar vazio - será usado apenas Google OAuth)
   - Auto Confirm User: ✅ **SIM**
   - Send invitation email: ❌ **NÃO** (não necessário para OAuth)

   **Utilizador 2:**
   - Email: `rivdrgc@gmail.com`
   - Password: (deixar vazio)
   - Auto Confirm User: ✅ **SIM**
   - Send invitation email: ❌ **NÃO**

   **Utilizador 3:**
   - Email: `luisvaldorio@gmail.com`
   - Password: (deixar vazio)
   - Auto Confirm User: ✅ **SIM**
   - Send invitation email: ❌ **NÃO**

### Opção B: Criar via SQL (Alternativa)

Se preferir criar via SQL, executar no SQL Editor do Supabase:

```sql
-- NOTA: Isto cria utilizadores sem password (apenas para OAuth)
-- Os utilizadores serão criados automaticamente quando fizerem login com Google pela primeira vez
-- Mas podemos pré-criar para garantir que estão na base de dados

-- Verificar se já existem
SELECT email, id, created_at 
FROM auth.users 
WHERE email IN (
  'geral@etergrowth.com',
  'rivdrgc@gmail.com',
  'luisvaldorio@gmail.com'
);
```

**IMPORTANTE:** Com Google OAuth, os utilizadores são criados automaticamente no primeiro login. Mas é melhor pré-criá-los para garantir que estão autorizados.

---

## 🔐 Passo 3: Verificar Configurações de Segurança

### Verificar Google Provider está ativo:

1. Ir em: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/providers
2. Verificar que **Google** está:
   - ✅ **Enabled**: SIM
   - ✅ **Client ID**: Preenchido
   - ✅ **Client Secret**: Preenchido

### Verificar Callback URL:

- Callback URL deve ser: `https://ozjafmkfabewxoyibirq.supabase.co/auth/v1/callback`
- Verificar se está configurado no Google Cloud Console também

---

## 🧪 Passo 4: Testar Autenticação

### Teste 1: Login com Google (Email Autorizado)

1. Executar: `npm run dev`
2. Aceder: `http://localhost:3000/login`
3. Clicar em **"Login with Google"**
4. Fazer login com `geral@etergrowth.com`, `rivdrgc@gmail.com` ou `luisvaldorio@gmail.com`
5. ✅ **Resultado esperado**: Redireciona para `/dashboard` e mostra o dashboard

### Teste 2: Login com Email Não Autorizado

1. Tentar fazer login com outro email Google
2. ✅ **Resultado esperado**: 
   - Se estiver em modo "Testing" no Google Cloud → Google bloqueia
   - Se passar o Google → Frontend valida e redireciona para `/unauthorized`

### Teste 3: Acesso Direto sem Login

1. Aceder diretamente: `http://localhost:3000/dashboard`
2. ✅ **Resultado esperado**: Redireciona para `/login`

### Teste 4: Logout

1. Clicar no botão de logout no Header
2. ✅ **Resultado esperado**: Redireciona para `/login` e sessão é limpa

---

## 📊 Passo 5: Verificar Logs (Opcional)

Para ver tentativas de login:

```sql
SELECT 
  email,
  success,
  attempted_at,
  ip_address
FROM public.auth_attempts
ORDER BY attempted_at DESC
LIMIT 20;
```

---

## 🔧 Troubleshooting

### Problema: "Access blocked: Authorization Error"

**Solução:**
- Verificar se os 3 emails estão adicionados como "Test Users" no Google Cloud Console
- Ir em: Google Cloud Console > APIs & Services > OAuth consent screen > Test users

### Problema: "redirect_uri_mismatch"

**Solução:**
- Verificar se o Callback URL está nas "Authorized redirect URIs" no Google Cloud Console
- URL deve ser: `https://ozjafmkfabewxoyibirq.supabase.co/auth/v1/callback`

### Problema: "Email não autorizado" após login com Google

**Solução:**
- Verificar se o email está exatamente na lista: `geral@etergrowth.com`, `rivdrgc@gmail.com`, `luisvaldorio@gmail.com`
- Verificar se a função `is_authorized_email()` está funcionando

### Problema: Utilizador não consegue fazer login

**Solução:**
- Verificar se o utilizador foi criado no Supabase (ver Passo 2)
- Verificar se o email está confirmado (`email_confirmed_at` não é NULL)
- Verificar se o Google Provider está ativo

---

## ✅ Checklist Final

- [ ] Signup público desativado no Supabase
- [ ] Google Provider ativo e configurado
- [ ] 3 utilizadores criados (ou serão criados no primeiro login)
- [ ] Teste de login com email autorizado funciona
- [ ] Teste de rejeição de email não autorizado funciona
- [ ] Logout funciona corretamente
- [ ] Acesso direto a rotas protegidas redireciona para login

---

## 🎯 Próximos Passos Após Configuração

1. Testar com os 3 emails autorizados
2. Verificar que outros emails são bloqueados
3. Monitorizar logs de tentativas de login
4. Configurar produção (quando necessário)

---

**Última atualização:** 2026-01-22
