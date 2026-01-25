# Correção: Redirecionamento para Localhost no Vercel

## 🔴 Problema

Quando fazes verificação por email no Vercel, o sistema está a redirecionar para `localhost` em vez da URL de produção do Vercel.

## 🔍 Causa

O Supabase usa a **"Site URL"** configurada no Dashboard do Supabase para gerar os links de verificação de email. Se essa URL estiver configurada como `http://localhost:3000`, todos os emails vão redirecionar para localhost, mesmo quando a aplicação está em produção no Vercel.

## ✅ Solução

### 1. Atualizar Site URL no Supabase Dashboard (CRÍTICO)

**Este é o passo mais importante!**

1. Aceder ao Supabase Dashboard:
   - URL: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration

2. Configurar **Site URL**:
   - **Produção:** `https://dashboard-eter.vercel.app`
   - **Nota:** Para desenvolvimento local, podes manter `http://localhost:3000` mas deves mudar para a URL de produção quando fizeres deploy

3. Adicionar **Redirect URLs** (uma por linha):
   ```
   https://dashboard-eter.vercel.app/reset-password
   https://dashboard-eter.vercel.app/dashboard
   http://localhost:3000/reset-password
   http://localhost:3000/dashboard
   ```

4. Clicar em **"Save"**

### 2. Código Atualizado

O código já foi atualizado para usar uma função helper (`getAppUrl()`) que detecta automaticamente a URL correta. No entanto, **o Supabase ignora isso** e usa sempre a "Site URL" configurada no dashboard.

### 3. Verificar Variáveis de Ambiente no Vercel

Certifica-te de que as variáveis de ambiente estão configuradas no Vercel:

1. Ir para: https://vercel.com/dashboard
2. Selecionar o projeto
3. Ir em **Settings** → **Environment Variables**
4. Verificar que estas variáveis estão configuradas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🧪 Testar

Após atualizar a configuração:

1. Fazer deploy no Vercel
2. Solicitar reset de password na aplicação em produção
3. Verificar o email recebido
4. Clicar no link do email
5. Deve redirecionar para a URL de produção do Vercel, não para localhost

## 📝 Notas Importantes

1. **A "Site URL" no Supabase é o que importa** - O código pode detectar a URL correta, mas o Supabase usa sempre a configuração do dashboard para gerar links de email.

2. **Para desenvolvimento local:** Podes manter `http://localhost:3000` na "Site URL" quando estiveres a desenvolver localmente, mas **deves mudar para a URL de produção** quando fizeres deploy.

3. **Múltiplos ambientes:** Se tiveres múltiplos ambientes (staging, produção), podes precisar de:
   - Criar projetos Supabase separados para cada ambiente, OU
   - Usar a mesma "Site URL" e ajustar conforme necessário

## 🔗 Links Úteis

- **Supabase URL Configuration:** https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/url-configuration
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Última atualização:** 2026-01-25
