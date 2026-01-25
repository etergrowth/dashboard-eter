# ✅ Correção Aplicada: Redirecionamento para Localhost no Vercel

## 🎯 Problema Resolvido

O sistema estava a redirecionar para `localhost` quando fazias verificação por email no Vercel, mesmo tendo a aplicação em produção.

## ✅ O que foi feito (Código)

1. **Criada função helper** (`src/lib/url-helper.ts`):
   - Detecta automaticamente a URL correta (Vercel ou localhost)
   - Função `getAppUrl()` para obter URL base
   - Função `getRedirectUrl()` para URLs de redirecionamento

2. **Código atualizado**:
   - `src/pages/Login.tsx` - Usa `getRedirectUrl()` para reset de password
   - `src/hooks/useAuth.ts` - Usa `getRedirectUrl()` para OAuth Google

3. **Documentação criada**:
   - `docs/setup/VERCEL_REDIRECT_FIX.md` - Guia completo do problema e solução
   - `docs/setup/VERCEL_SETUP_COMPLETE.md` - Configuração completa do Vercel
   - `docs/setup/SUPABASE_CONFIGURATION_COMPLETE.md` - Atualizado com URL correta

## ⚠️ Ação Necessária (Manual)

**IMPORTANTE:** O Supabase não permite atualizar configurações de URL via API/MCP. Precisas fazer manualmente:

### Passo 1: Atualizar Site URL no Supabase

1. Aceder a: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration

2. **Site URL:** Mudar para `https://dashboard-eter.vercel.app`

3. **Redirect URLs:** Adicionar (uma por linha):
   ```
   https://dashboard-eter.vercel.app/reset-password
   https://dashboard-eter.vercel.app/dashboard
   http://localhost:3000/reset-password
   http://localhost:3000/dashboard
   ```

4. Clicar em **"Save"**

### Passo 2: Verificar Variáveis de Ambiente no Vercel

1. Ir para: https://vercel.com/dashboard
2. Selecionar projeto: **dashboard--eter**
3. Ir em **Settings** → **Environment Variables**
4. Verificar que estão configuradas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🧪 Como Testar

Após atualizar a configuração no Supabase:

1. Fazer deploy no Vercel (se necessário)
2. Aceder a: https://dashboard-eter.vercel.app/login
3. Clicar em "Forgot your password?"
4. Introduzir um email autorizado
5. Verificar o email recebido
6. Clicar no link do email
7. **Deve redirecionar para:** `https://dashboard-eter.vercel.app/reset-password`
8. **NÃO deve redirecionar para:** `http://localhost:3000/reset-password`

## 📝 Notas

- O código agora detecta automaticamente a URL correta
- Mas o Supabase usa sempre a "Site URL" configurada no dashboard para gerar links de email
- Por isso, é **essencial** atualizar a configuração no Supabase Dashboard

## 🔗 Links Rápidos

- **Supabase URL Config:** https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration
- **Vercel Dashboard:** https://vercel.com/dashboard
- **URL de Produção:** https://dashboard-eter.vercel.app

---

**Status:** ✅ Código atualizado | ⚠️ Configuração Supabase pendente (manual)
