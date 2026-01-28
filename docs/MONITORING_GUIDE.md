# Guia de Monitorização de Performance

## 🎯 Objetivo

Este guia explica como usar o sistema de monitorização implementado para diagnosticar e resolver problemas de performance, especialmente timeouts de sessão.

---

## 🔍 API de Monitorização

### Acesso Global

O sistema de monitorização está disponível globalmente através de `window.__APP_METRICS__`:

```javascript
// Disponível no console do browser em qualquer página
window.__APP_METRICS__
```

---

## 📊 Comandos Principais

### 1. Ver Logs

#### Todos os logs
```javascript
window.__APP_METRICS__.getLogs()
```

#### Logs de autenticação apenas
```javascript
window.__APP_METRICS__.getLogs('auth')
```

#### Apenas erros
```javascript
window.__APP_METRICS__.getLogs(undefined, 'error')
```

#### Apenas warnings (operações lentas)
```javascript
window.__APP_METRICS__.getLogs(undefined, 'warn')
```

#### Filtrar por categoria e nível
```javascript
// Erros de autenticação
window.__APP_METRICS__.getLogs('auth', 'error')

// Warnings de performance
window.__APP_METRICS__.getLogs('performance', 'warn')
```

### 2. Ver Métricas de Performance

#### Todas as métricas
```javascript
window.__APP_METRICS__.getMetrics()
```

#### Estatísticas agregadas
```javascript
window.__APP_METRICS__.getStats()

// Exemplo de output:
{
  auth: {
    count: 2,           // 2 operações de auth
    avgDuration: 850,   // média de 850ms
    maxDuration: 1200   // máximo de 1.2s
  },
  query: {
    count: 5,
    avgDuration: 450,
    maxDuration: 800
  }
}
```

### 3. Exportar Tudo

```javascript
// Exporta logs, métricas e estatísticas
const data = window.__APP_METRICS__.export()

// Para copiar e enviar em bug report:
console.log(JSON.stringify(data, null, 2))
// Ou:
copy(JSON.stringify(data, null, 2)) // Copia para clipboard
```

### 4. Limpar Dados

```javascript
// Limpa todos os logs e métricas
window.__APP_METRICS__.clear()
```

---

## 🔬 Cenários de Uso

### Cenário 1: Diagnóstico de Login Lento

```javascript
// 1. Abrir DevTools → Console
// 2. Fazer login
// 3. Verificar métricas de auth

window.__APP_METRICS__.getLogs('auth')

// Procurar por:
// - session_fetch_start
// - session_fetch_success (deve ser <1s depois)
// - email_validation_start
// - email_validation_success (deve ser <500ms depois)

// Se houver timeout:
// - session_fetch_timeout (indica problema com Supabase)

// Ver duração:
window.__APP_METRICS__.getStats()
// auth.avgDuration deve ser <1000ms
```

### Cenário 2: Identificar Operações Lentas

```javascript
// Warnings automáticos são logados para operações lentas

// Ver todos os warnings:
window.__APP_METRICS__.getLogs(undefined, 'warn')

// Thresholds configurados:
// - auth: >2000ms → warning
// - query: >3000ms → warning
// - network: >5000ms → warning
```

### Cenário 3: Monitorização Contínua

```javascript
// Dashboard simples no console (atualiza a cada 30s)
const monitor = setInterval(() => {
  console.clear()
  console.log('📊 Performance Dashboard')
  console.log('========================')
  console.table(window.__APP_METRICS__.getStats())
  
  const warnings = window.__APP_METRICS__.getLogs(undefined, 'warn')
  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} warnings nos últimos 30s`)
  }
}, 30000)

// Para parar:
clearInterval(monitor)
```

### Cenário 4: Debug de Erro Específico

```javascript
// Quando há um erro, verificar sequência de eventos:

const logs = window.__APP_METRICS__.getLogs('auth')
logs.forEach(log => {
  console.log(
    `[${new Date(log.timestamp).toISOString()}]`,
    log.event,
    log.data?.duration ? `${log.data.duration}ms` : ''
  )
})

// Exemplo de output esperado:
// [2026-01-28T10:30:00.123Z] session_fetch_start
// [2026-01-28T10:30:00.850Z] session_fetch_success 727ms
// [2026-01-28T10:30:00.851Z] email_validation_start
// [2026-01-28T10:30:01.234Z] email_validation_success 383ms
```

---

## 🎨 Eventos de Log

### Categoria: Auth

| Evento | Descrição | Data |
|--------|-----------|------|
| `session_fetch_start` | Início da busca de sessão | `{ timeout: 5000 }` |
| `session_fetch_success` | Sessão obtida com sucesso | `{ duration, hasSession, email }` |
| `session_fetch_timeout` | Timeout de 5s atingido | `{ duration: 5000 }` |
| `session_fetch_error` | Erro ao buscar sessão | `{ duration, error }` |
| `session_fetch_failed` | Falha geral | `{ duration, error }` |
| `email_validation_start` | Início de validação de email | `{ email }` |
| `email_validation_success` | Email validado | `{ email, duration }` |
| `email_not_authorized` | Email não autorizado | `{ email, duration }` |

### Categoria: Performance

| Evento | Descrição | Data |
|--------|-----------|------|
| `{name}_start` | Início de métrica | `{ ...metadata }` |
| `{name}_end` | Fim de métrica | `{ duration, ...metadata }` |
| `{name}_slow` | Operação lenta (>threshold) | `{ duration, threshold }` |
| `timeout` | Timeout genérico | `{ name, timeout }` |

---

## ⚙️ Configuração de Thresholds

Os thresholds são configurados em `src/lib/monitoring.ts`:

```typescript
private readonly thresholds = {
  auth: 2000,      // 2s para queries de autenticação
  query: 3000,     // 3s para queries gerais
  network: 5000,   // 5s para requests de rede
};
```

Para ajustar:

1. Editar `src/lib/monitoring.ts`
2. Modificar valores em `thresholds`
3. Rebuild da aplicação

---

## 📈 Interpretação de Métricas

### Auth Duration (avgDuration)

| Valor | Status | Ação |
|-------|--------|------|
| <500ms | ✅ Excelente | Nenhuma |
| 500-1000ms | ✅ Bom | Nenhuma |
| 1000-2000ms | ⚠️ Aceitável | Monitorar |
| 2000-5000ms | ⚠️ Lento | Investigar |
| >5000ms | ❌ Crítico | Ação imediata |

### Query Duration (avgDuration)

| Valor | Status | Ação |
|-------|--------|------|
| <300ms | ✅ Excelente | Nenhuma |
| 300-1000ms | ✅ Bom | Nenhuma |
| 1000-3000ms | ⚠️ Aceitável | Monitorar |
| >3000ms | ❌ Crítico | Otimizar query |

### Warnings Count

| Valor | Status | Ação |
|-------|--------|------|
| 0-2 | ✅ Normal | Nenhuma |
| 3-5 | ⚠️ Atenção | Revisar logs |
| >5 | ❌ Problema | Investigar causa raiz |

---

## 🔧 Integração com Código

### Logger API

```typescript
import { logger } from '@/lib/monitoring'

// Log de autenticação
logger.auth('user_login', { email: 'user@example.com' })

// Log de query
logger.query('fetch_clients', { count: 150 })

// Log de erro
logger.error('api_error', error, { endpoint: '/api/clients' })

// Log de warning
logger.warn('slow_query', { duration: 3500, query: 'clients' })

// Debug (apenas em dev)
logger.debug('cache_hit', { key: 'clients', ttl: 300 })
```

### Metrics API

```typescript
import { metrics } from '@/lib/monitoring'

// Tracking manual
metrics.start('custom_operation', { userId: '123' })
// ... operação ...
metrics.end('custom_operation', { success: true })

// Tracking automático
const result = await metrics.track(
  'fetch_user_data',
  async () => {
    return await fetchUserData()
  },
  { userId: '123' }
)
```

### Helper de Timeout

```typescript
import { withTimeout } from '@/lib/monitoring'

// Adiciona timeout com logging automático
const data = await withTimeout(
  fetchData(),
  5000,
  'fetch_data'
)
// Se timeout, loga automaticamente: 'fetch_data timeout after 5000ms'
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Monitorar Performance de uma Feature Nova

```typescript
// No componente:
import { useEffect } from 'react'
import { metrics, logger } from '@/lib/monitoring'

function NewFeature() {
  useEffect(() => {
    logger.debug('new_feature_mounted')
    
    const loadData = async () => {
      metrics.start('new_feature_data_load')
      try {
        // ... carregar dados ...
        metrics.end('new_feature_data_load', { success: true })
      } catch (error) {
        metrics.end('new_feature_data_load', { success: false })
        logger.error('new_feature_load_failed', error)
      }
    }
    
    loadData()
  }, [])
  
  // ...
}
```

### Exemplo 2: Debug de Bug Intermitente

```javascript
// 1. Adicionar logs extras temporariamente
logger.debug('before_problematic_operation', { state: currentState })
// ... operação problemática ...
logger.debug('after_problematic_operation', { result })

// 2. Reproduzir o bug
// 3. Verificar logs
window.__APP_METRICS__.getLogs()

// 4. Identificar padrão
const debugLogs = window.__APP_METRICS__.getLogs().filter(l => 
  l.event.includes('problematic_operation')
)
console.table(debugLogs)
```

### Exemplo 3: Auditoria de Performance

```javascript
// Executar por 5 minutos em produção
setTimeout(() => {
  const report = window.__APP_METRICS__.export()
  
  console.log('📊 Performance Report')
  console.log('====================')
  console.log('Period: 5 minutes')
  console.log('\nStatistics:')
  console.table(report.stats)
  
  console.log('\nSlow Operations (>2s):')
  const slowOps = report.metrics
    .filter(m => m.duration && m.duration > 2000)
    .sort((a, b) => b.duration - a.duration)
  console.table(slowOps)
  
  console.log('\nErrors:')
  const errors = report.logs.filter(l => l.level === 'error')
  console.table(errors)
  
  // Copiar para enviar ao time
  copy(JSON.stringify(report, null, 2))
}, 5 * 60 * 1000)
```

---

## 🚨 Troubleshooting

### Problema: `window.__APP_METRICS__` é undefined

**Causa**: Aplicação ainda não carregou ou está em modo SSR

**Solução**:
```javascript
if (typeof window !== 'undefined' && window.__APP_METRICS__) {
  window.__APP_METRICS__.getStats()
}
```

### Problema: Muitos logs acumulados

**Causa**: Limite de 1000 logs atingido

**Solução**:
```javascript
// Limpar periodicamente
window.__APP_METRICS__.clear()

// Ou exportar antes de limpar
const backup = window.__APP_METRICS__.export()
window.__APP_METRICS__.clear()
```

### Problema: Métricas não aparecem

**Causa**: Operação terminou antes de `metrics.end()` ser chamado

**Solução**:
```typescript
// Usar try/finally para garantir que end() é chamado
metrics.start('operation')
try {
  await doSomething()
} finally {
  metrics.end('operation')
}
```

---

## 📞 Suporte

**Documentação relacionada**:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guia de troubleshooting
- [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md) - Relatório de otimizações

**Código fonte**:
- `src/lib/monitoring.ts` - Implementação do sistema

**Contatos**:
- Performance: tech@eter.com
- Bugs: bugs@eter.com

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026
