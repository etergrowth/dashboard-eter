# Configuração Vercel - Dashboard Eter

## ✅ Informações do Projeto

- **Nome do Projeto:** dashboard--eter
- **Project ID:** prj_XmmEBDGuMxgSTDYKqlAEAo3rFxgu
- **Team:** etergrowth's projects
- **URL de Produção:** https://dashboard-eter.vercel.app

## 🔧 Configurações Necessárias

### 1. Variáveis de Ambiente no Vercel

Certifica-te de que estas variáveis estão configuradas no Vercel:

1. Ir para: https://vercel.com/dashboard
2. Selecionar projeto: **dashboard--eter**
3. Ir em **Settings** → **Environment Variables**
4. Adicionar/Verificar:
   - `VITE_SUPABASE_URL` = `https://ozjafmkfabewxoyibirq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (chave anon do Supabase)

### 2. Configuração do Supabase (CRÍTICO)

**IMPORTANTE:** O Supabase precisa estar configurado com a URL de produção do Vercel.

1. Aceder a: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration

2. **Site URL:** `https://dashboard-eter.vercel.app`

3. **Redirect URLs:**
   ```
   https://dashboard-eter.vercel.app/reset-password
   https://dashboard-eter.vercel.app/dashboard
   http://localhost:3000/reset-password
   http://localhost:3000/dashboard
   ```

4. Clicar em **"Save"**

**Porquê isto é crítico?** O Supabase usa a "Site URL" para gerar links de verificação de email. Se estiver configurada como localhost, todos os emails vão redirecionar para localhost mesmo em produção.

## 📋 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Site URL no Supabase atualizada para `https://dashboard-eter.vercel.app`
- [ ] Redirect URLs adicionadas no Supabase
- [ ] Deploy realizado no Vercel
- [ ] Testado reset de password em produção
- [ ] Verificado que emails redirecionam para URL de produção

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase URL Configuration:** https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration
- **Projeto Vercel:** https://vercel.com/dashboard/etergrowths-projects/dashboard--eter

---

**Última atualização:** 2026-01-25
