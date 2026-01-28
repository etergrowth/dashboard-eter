# Troubleshooting Guide - Dashboard Eter

## 🚨 Session Fetch Timeout

### Sintomas

- Login demora 5+ segundos
- Mensagem "Session fetch timeout" nos logs do console
- `ProtectedRoute` mostra loading infinito
- Página fica em branco após login

### Diagnóstico Rápido

1. **Abrir DevTools → Console**
   ```bash
   # No Chrome/Firefox: F12 ou Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
   ```

2. **Filtrar logs de autenticação**
   ```javascript
   // No console, executar:
   window.__APP_METRICS__.getLogs('auth')
   ```

3. **Verificar timing das operações**
   ```javascript
   // Ver estatísticas de performance:
   window.__APP_METRICS__.getStats()
   ```

4. **Procurar por eventos críticos:**
   - `session_fetch_start` - Início da busca de sessão
   - `session_fetch_success` - Sucesso (deve aparecer < 2s após start)
   - `session_fetch_timeout` - Timeout atingido (5s)
   - `session_fetch_error` - Erro na busca

### Causas Comuns e Soluções

#### 1. Timeout de 5s Atingido

**Sintoma**: Logs mostram `session_fetch_timeout` após 5000ms

**Causa**: Supabase auth não respondeu a tempo

**Soluções**:

```typescript
// Opção A: Aumentar timeout temporariamente (useAuth.ts)
const timeoutPromise = new Promise<never>((_, reject) => 
  setTimeout(() => reject(new Error('Session fetch timeout')), 10000) // 5s → 10s
);

// Opção B: Verificar rede
// No DevTools → Network, verificar:
// - Latência dos requests ao supabase.co
// - Se há requests bloqueados ou falhando
// - Se o request de auth/session está pendente

// Opção C: Verificar status do Supabase
// https://status.supabase.com/
```

#### 2. RLS (Row Level Security) Bloqueado

**Sintoma**: `email_validation_start` aparece mas nunca `email_validation_success`

**Causa**: Políticas RLS na tabela `allowed_users` estão bloqueando a query

**Soluções**:

```sql
-- Verificar políticas na tabela allowed_users
-- No Supabase Dashboard → Authentication → Policies

-- Política correta para leitura:
CREATE POLICY "Anyone can check if email is allowed"
ON allowed_users
FOR SELECT
USING (true);

-- Se a política requer autenticação:
CREATE POLICY "Authenticated users can check allowed emails"
ON allowed_users
FOR SELECT
TO authenticated
USING (true);
```

#### 3. Network Lento / Offline

**Sintoma**: Todas as requests demoram muito tempo

**Causa**: Conexão de internet lenta ou intermitente

**Soluções**:

```javascript
// Verificar velocidade da conexão
navigator.connection?.effectiveType // '4g', '3g', '2g', 'slow-2g'

// Se estiver offline:
navigator.onLine // false

// Workaround: Aumentar timeout ou implementar retry com backoff
```

#### 4. Cache Corrompido do React Query

**Sintoma**: Login funciona uma vez mas depois falha

**Causa**: Query cache do React Query está em estado inválido

**Soluções**:

```javascript
// No console do browser:
window.location.reload(true) // Force refresh

// Ou limpar cache programaticamente:
queryClient.clear()

// Ou limpar localStorage:
localStorage.clear()
sessionStorage.clear()
```

#### 5. Token Expirado Durante a Query

**Sintoma**: Session fetch retorna null mas usuário estava autenticado

**Causa**: Token de autenticação expirou durante a operação

**Soluções**:

```typescript
// Verificar configuração de autoRefreshToken (lib/supabase.ts)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // ✅ Deve estar true
    persistSession: true,    // ✅ Deve estar true
  },
});

// Se problema persistir, forçar refresh manual:
await supabase.auth.refreshSession()
```

### Comandos Úteis para Debug

```javascript
// ==========================================
// MÉTRICAS DE PERFORMANCE
// ==========================================

// Ver todas as métricas
window.__APP_METRICS__.getMetrics()

// Ver estatísticas agregadas
window.__APP_METRICS__.getStats()

// Exportar tudo (para enviar em bug report)
window.__APP_METRICS__.export()

// ==========================================
// LOGS
// ==========================================

// Ver todos os logs de auth
window.__APP_METRICS__.getLogs('auth')

// Ver apenas erros
window.__APP_METRICS__.getLogs(undefined, 'error')

// Ver warnings (operações lentas)
window.__APP_METRICS__.getLogs(undefined, 'warn')

// ==========================================
// LIMPEZA
// ==========================================

// Limpar todos os logs e métricas
window.__APP_METRICS__.clear()

// Limpar cache do React Query
queryClient.clear()

// Forçar reload da página
window.location.reload(true)

// ==========================================
// SUPABASE DEBUG
// ==========================================

// Ver sessão atual
await supabase.auth.getSession()

// Ver utilizador atual
await supabase.auth.getUser()

// Forçar refresh de token
await supabase.auth.refreshSession()

// Verificar se email está na whitelist
await supabase
  .from('allowed_users')
  .select('id')
  .eq('email', 'seu-email@exemplo.com')
  .eq('is_active', true)
  .single()
```

### Checklist de Verificação

Antes de reportar um bug, verificar:

- [ ] Console não mostra erros de JavaScript
- [ ] Network tab mostra requests ao Supabase completando (não 404/500)
- [ ] `window.__APP_METRICS__.getStats()` mostra tempos razoáveis (<2s para auth)
- [ ] Sessão está presente: `await supabase.auth.getSession()` retorna session
- [ ] Email está na whitelist: query à tabela `allowed_users` retorna resultado
- [ ] RLS policies permitem leitura da tabela `allowed_users`
- [ ] Token não expirou: `session.expires_at` > `Date.now() / 1000`
- [ ] Supabase está online: https://status.supabase.com/

### Exemplo de Bug Report Completo

```markdown
**Sintoma**: Login demora 10+ segundos

**Logs**:
```javascript
window.__APP_METRICS__.export()
// Colar output aqui
```

**Network**:
- Request auth/session: 8.5s
- Status code: 200
- Response size: 2.1KB

**Environment**:
- Browser: Chrome 120
- OS: macOS 14
- Network: 4G (efectiveType)
- Supabase Project: [project-id]

**Steps to Reproduce**:
1. Abrir https://dashboard.eter.com/login
2. Clicar em "Login com Google"
3. Após redirect, página fica em loading
4. Após 10s, aparece conteúdo
```

---

## 🔧 Otimizações Implementadas

### Timeout Reduzido (10s → 5s)

**Arquivo**: `src/hooks/useAuth.ts`

**Motivo**: Feedback mais rápido ao usuário quando há problemas

**Impacto**: Se o Supabase não responder em 5s, falha imediatamente em vez de esperar 10s

### Queries Paralelas vs Sequenciais

**Antes** (sequencial - 3-4s):
```
getSession() → getUser() → checkEmailAllowed()
```

**Depois** (otimizado - 1-1.5s):
```
getSession() ─┐
              ├→ resultado
getUser() ────┘
checkEmailAllowed() (após session)
```

### Retry Eliminado

**Antes**: 
- Retry de validação de email após 1s se falhar
- Total: até 2s extras

**Depois**:
- Verificação única
- Se falhar, será tratado no próximo mount/refresh

### Cache Strategy

**React Query Defaults**:
- `staleTime`: 5 min (dados frescos por 5 min)
- `gcTime`: 10 min (garbage collection após 10 min)
- `retry`: 1 (apenas 1 retry em caso de falha)

**Hooks Específicos**:
- `useClients`: 10 min (dados estáticos)
- `useProjects`: 10 min (dados estáticos)
- `useTasks`: 3 min (dados dinâmicos)

---

## 📊 Monitorização Contínua

### Métricas-Chave a Monitorizar

1. **Tempo de Session Fetch**: deve ser <1s
2. **Tempo de Email Validation**: deve ser <500ms
3. **Taxa de Timeout**: deve ser <1% das tentativas
4. **Cache Hit Rate**: deve ser >80%

### Alertas

Configure alertas para:
- Session fetch >2s → Warning
- Session fetch >5s → Timeout
- Email validation >1s → Warning
- Taxa de timeout >5% → Critical

### Dashboard de Métricas

```javascript
// Criar dashboard simples no console
setInterval(() => {
  const stats = window.__APP_METRICS__.getStats();
  console.table(stats);
}, 30000); // A cada 30s
```

---

## 📞 Suporte

Se o problema persistir após seguir este guia:

1. **Exportar métricas**: `window.__APP_METRICS__.export()`
2. **Screenshot do console** com erros
3. **Network tab** exportado (HAR file)
4. **Enviar para**: suporte@eter.com

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0
