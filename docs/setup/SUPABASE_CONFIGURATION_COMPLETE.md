# Configuração Completa do Supabase - Eter Growth

## ✅ Configurações Aplicadas via MCP

### Migrations Aplicadas:

1. **Migration 020** - Restrição de Emails Autorizados
   - ✅ Função `is_authorized_email()` criada
   - ✅ Tabela `auth_attempts` criada para logs
   - ✅ Função `log_auth_attempt()` criada
   - ✅ RLS policies configuradas

2. **Migration 021** - Gestão de Passwords
   - ✅ Função `change_user_password()` criada
   - ✅ Função `request_password_reset()` criada

3. **Migration 022** - Correção de Segurança
   - ✅ Todas as funções corrigidas com `SET search_path = public`
   - ✅ Avisos de segurança resolvidos

### Verificações Realizadas:

- ✅ Todas as 4 funções RPC existem e estão funcionais
- ✅ Tabela `auth_attempts` existe com RLS ativo
- ✅ Função `is_authorized_email()` valida corretamente os 3 emails

## ⚠️ Configurações que Precisam ser Feitas Manualmente

### 1. Template de Email - Reset Password (CRÍTICO)

**O MCP não permite atualizar templates de email.** Esta configuração precisa ser feita manualmente.

#### Passos:

1. **Aceder ao Dashboard:**
   - URL: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/templates

2. **Editar Template "Reset Password":**
   - Procurar "Reset Password" ou "Recovery" na lista
   - Clicar em "Edit" ou "Customize"

3. **Copiar Template:**
   - Abrir: `emails_html/reset_password_inline.html`
   - Copiar TODO o conteúdo HTML
   - Colar no editor do Supabase
   - **Subject:** "Redefinir Password - Eter Growth"
   - Clicar em "Save"

4. **Verificar:**
   - Certificar que `{{ .ConfirmationURL }}` está no template
   - Testar enviando um reset de password

### 2. Configurar Redirect URLs

1. Ir em: **Authentication** > **URL Configuration**
2. Adicionar às **Redirect URLs** (uma por linha):
   ```
   https://dashboard-eter.vercel.app/reset-password
   https://dashboard-eter.vercel.app/dashboard
   http://localhost:3000/reset-password
   http://localhost:3000/dashboard
   ```

### 3. Configurar Site URL

1. Ir em: **Authentication** > **URL Configuration**
2. **Site URL:**
   - **Produção:** `https://dashboard-eter.vercel.app` (IMPORTANTE: usar esta para produção)
   - **Desenvolvimento:** `http://localhost:3000` (apenas para testes locais)
   
   **⚠️ CRÍTICO:** A "Site URL" é usada pelo Supabase para gerar links de email. Se estiver configurada como localhost, todos os emails vão redirecionar para localhost mesmo em produção!

### 4. Configurar Signup Settings

1. Ir em: **Authentication** > **Settings**
2. Configurar:
   - ✅ **Allow new users to sign up**: **DESATIVAR**
   - ✅ **Allow manual linking**: **ATIVAR**
   - ❌ **Allow anonymous sign-ins**: **DESATIVAR**
   - ⚠️ **Confirm email**: **DESATIVAR** (para Google OAuth)

### 5. Ativar Leaked Password Protection (Recomendado)

1. Ir em: **Authentication** > **Settings** > **Password Protection**
2. Ativar: **"Leaked password protection"**
3. Isto previne uso de passwords comprometidas (HaveIBeenPwned)

## 📋 Checklist de Configuração

### ✅ Feito via MCP:
- [x] Migration 020 aplicada (validação de emails)
- [x] Migration 021 aplicada (gestão de passwords)
- [x] Migration 022 aplicada (correção de segurança)
- [x] Funções RPC criadas e funcionais
- [x] Tabela de logs criada com RLS
- [x] Avisos de segurança corrigidos

### ⚠️ Precisa fazer manualmente:
- [ ] Configurar template de email "Reset Password"
- [ ] Adicionar Redirect URLs
- [ ] Configurar Site URL
- [ ] Desativar signup público
- [ ] Ativar manual linking
- [ ] (Opcional) Ativar leaked password protection

## 🧪 Testar Após Configuração

### Teste 1: Reset de Password

1. Executar: `npm run dev`
2. Ir para: `http://localhost:3000/login`
3. Clicar em "Forgot your password?"
4. Introduzir: `geral@etergrowth.com`
5. Verificar email recebido (deve ter design personalizado)
6. Clicar no link do email
7. Deve redirecionar para `/reset-password`
8. Introduzir nova password
9. Deve redirecionar para `/login` após sucesso

### Teste 2: Login com Nova Password

1. Fazer login com email e nova password
2. Deve funcionar corretamente

### Teste 3: Login com Google

1. Clicar em "Login with Google"
2. Fazer login com um dos 3 emails autorizados
3. Deve redirecionar para `/dashboard`

## 📝 Notas Importantes

1. **Templates de Email:** Não podem ser configurados via MCP - apenas via Dashboard
2. **Redirect URLs:** Devem incluir `/reset-password` para funcionar
3. **Site URL:** Deve estar configurado corretamente
4. **Signup:** Desativado para prevenir criação de contas não autorizadas

## 🔗 Links Úteis

- **Templates de Email:** https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/templates
- **URL Configuration:** https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration
- **Auth Settings:** https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/providers

---

**Última atualização:** 2026-01-22
