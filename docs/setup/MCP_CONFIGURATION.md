# Configuração via MCP - Supabase

## ⚠️ Limitação do MCP

O MCP (Model Context Protocol) do Supabase **não permite** atualizar templates de email diretamente. Os templates de email precisam ser configurados manualmente no Dashboard do Supabase.

## ✅ O que foi configurado via MCP

### 1. Migration 020 - Restrição de Emails
- ✅ Função `is_authorized_email()` criada
- ✅ Tabela `auth_attempts` criada para logs
- ✅ Função `log_auth_attempt()` criada
- ✅ RLS policies configuradas

### 2. Migration 021 - Gestão de Passwords
- ✅ Função `change_user_password()` criada
- ✅ Função `request_password_reset()` criada

## 📧 Configuração Manual Necessária

### Template de Email - Reset Password

**IMPORTANTE:** Esta configuração precisa ser feita manualmente no Dashboard do Supabase.

#### Passo 1: Aceder ao Dashboard
1. Ir para: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/templates

#### Passo 2: Editar Template "Reset Password"
1. Procurar o template **"Reset Password"** (ou "Recovery")
2. Clicar em **"Edit"** ou **"Customize"**

#### Passo 3: Copiar Template
1. Abrir o ficheiro: `emails_html/reset_password_inline.html`
2. Copiar TODO o conteúdo HTML
3. Colar no editor do Supabase
4. **Subject:** "Redefinir Password - Eter Growth"
5. Clicar em **"Save"**

#### Template HTML (já pronto para copiar):

O template está em `emails_html/reset_password_inline.html` com todos os estilos inline (compatível com clientes de email).

**Variáveis do Supabase:**
- `{{ .ConfirmationURL }}` - Link para redefinir password (já está no template)
- `{{ .Email }}` - Email do utilizador (opcional, pode adicionar se quiser)

## 🔧 Outras Configurações Recomendadas

### 1. Configurar Redirect URLs

No Supabase Dashboard:
1. Ir em: **Authentication** > **URL Configuration**
2. Adicionar às **Redirect URLs**:
   - `http://localhost:3000/reset-password` (desenvolvimento)
   - `https://etergrowth.com/reset-password` (produção, quando aplicável)

### 2. Configurar Site URL

1. Ir em: **Authentication** > **URL Configuration**
2. **Site URL**: `http://localhost:3000` (desenvolvimento)
   - Ou `https://etergrowth.com` (produção)

### 3. Configurar Signup Settings

1. Ir em: **Authentication** > **Settings**
2. Configurar:
   - ✅ **Allow new users to sign up**: **DESATIVAR** (não queremos signup público)
   - ✅ **Allow manual linking**: **ATIVAR**
   - ❌ **Allow anonymous sign-ins**: **DESATIVAR**
   - ⚠️ **Confirm email**: **DESATIVAR** (para Google OAuth não é necessário)

## 📝 Resumo

### ✅ Feito via MCP:
- Migrations aplicadas
- Funções RPC criadas
- Tabelas e RLS configuradas

### ⚠️ Precisa fazer manualmente:
- Configurar template de email no Dashboard
- Configurar Redirect URLs
- Configurar Site URL
- Configurar Signup Settings

## 🧪 Testar Após Configuração

1. Ir para: `http://localhost:3000/login`
2. Clicar em "Forgot your password?"
3. Introduzir: `geral@etergrowth.com`
4. Verificar email recebido (deve ter o design personalizado)
5. Clicar no link
6. Deve redirecionar para `/reset-password`
7. Definir nova password
8. Deve redirecionar para `/login`

---

**Última atualização:** 2026-01-22
