# Estatísticas de Viagens - MapaKms

## 📊 Visão Geral

Nova página de estatísticas completa para análise detalhada das viagens registadas no Mapa de Kms.

**URL**: `/dashboard/mapa-kms/estatisticas`

---

## ✨ Funcionalidades

### 1. **Filtros de Período**
- Últimos 3 meses
- Últimos 6 meses  
- Último ano
- Todo o período

**UI**: Botões toggle estilo iOS para seleção rápida

### 2. **Cards de Estatísticas**

| Card | Métrica | Descrição |
|------|---------|-----------|
| **Total Km** | Soma total | Quilómetros percorridos no período |
| **Total Viagens** | Contagem | Número de viagens completadas |
| **Média p/ Viagem** | Média | Km médios por viagem |
| **Viagem Maior** | Máximo | Maior distância numa única viagem |

### 3. **Gráficos Interativos**

#### **Quilómetros por Mês** (BarChart)
- Visualização mensal dos kms percorridos
- Cores: Azul (#3b82f6)
- Hover: Mostra valor exato

#### **Top Motivos de Viagem** (PieChart)
- Top 6 motivos mais frequentes
- Mostra percentagem de cada motivo
- Cores dinâmicas (6 cores diferentes)

#### **Média por Dia da Semana** (LineChart)
- Média de km por cada dia da semana
- Identifica padrões semanais
- Cor: Roxo (#8b5cf6)

#### **Top Localizações** (Lista)
- Top 5 localizações mais visitadas
- Mostra número de viagens e km total
- Ordenado por número de viagens

### 4. **Exportação de Dados**
- Formato: JSON
- Inclui todas as estatísticas e gráficos
- Nome: `estatisticas_kms_YYYY-MM-DD.json`

### 5. **Resumo do Período**
- Período analisado
- Km por dia (média)
- Total de dados disponíveis

---

## 🎨 Design

### Tema
- **Dark mode**: Adapta-se automaticamente
- **Responsive**: Mobile-first design
- **Glassmorphism**: Cards com backdrop blur

### Cores
| Elemento | Cor |
|----------|-----|
| Card background | `hsl(var(--card))` |
| Border | `hsl(var(--border))` |
| Text | `hsl(var(--foreground))` |
| Muted text | `hsl(var(--muted-foreground))` |

### Gráficos
- **Background**: `#1f2937` (dark gray)
- **Border**: `#374151` (medium gray)
- **Grid**: `#374151` stroke
- **Axes**: `#9ca3af` (light gray)

---

## 📱 Navegação

### Desktop
- **Sidebar**: "Estatísticas Kms" com ícone `BarChart3`
- **Ordem**: Após "Mapa Kms"

### Mobile
- **Bottom Navigation**: Substitui "CMS"
- **Posição**: 5º botão (direita)
- **Label**: "Kms"
- **Ícone**: `BarChart3`

### Página MapaKms
- **Botão**: "Estatísticas" no header
- **Posição**: Entre título e botões de ação

---

## 🔧 Implementação Técnica

### Componente
```tsx
/dashboard-eter/src/dashboard/pages/MapaKms/Statistics.tsx
```

### Hooks Utilizados
- `useTrips()` - Todas as viagens
- `useTripStats()` - Estatísticas globais

### Dependências
- `recharts` - Gráficos (já no projeto)
- `date-fns` - Manipulação de datas
- `lucide-react` - Ícones

### Performance
- **Lazy loading**: ✅ Sim
- **StaleTime**: 5 minutos (via `useTrips`)
- **Bundle size**: ~10.61 KB (gzipped: 3.16 KB)

---

## 🧮 Cálculos

### Quilómetros por Mês
```typescript
// Agrupa viagens por mês
// Soma distâncias de cada mês
// Conta viagens por mês
```

### Top Motivos
```typescript
// Agrupa por motivo (reason)
// Soma km de cada motivo
// Top 6 ordenados por km
```

### Média por Dia da Semana
```typescript
// Agrupa por dia da semana (0-6)
// Calcula média de km por dia
// Retorna array ordenado Dom-Sáb
```

### Top Localizações
```typescript
// Agrupa start_location e end_location
// Conta ocorrências e soma km
// Top 5 ordenados por contagem
```

---

## 📊 Estrutura de Dados Exportados

```json
{
  "periodo": "6months",
  "estatisticas": {
    "totalKm": 12500,
    "totalTrips": 48,
    "avgDistance": 260,
    "maxDistance": 650
  },
  "kmPorMes": [
    { "month": "Jan", "km": 2100, "viagens": 8 },
    ...
  ],
  "topMotivos": [
    { "name": "Trabalho", "value": 5600 },
    ...
  ],
  "topLocalizacoes": [
    { "name": "Lisboa", "count": 24, "km": 4800 },
    ...
  ],
  "mediaPorDiaSemana": [
    { "day": "Dom", "km": 120, "viagens": 2 },
    ...
  ]
}
```

---

## 🎯 Casos de Uso

### 1. Análise Mensal
**Objetivo**: Ver evolução de km ao longo dos meses

**Passos**:
1. Selecionar período (ex: 6 meses)
2. Analisar gráfico de barras
3. Identificar meses com mais viagens

### 2. Identificar Padrões
**Objetivo**: Descobrir padrões de deslocação

**Passos**:
1. Ver gráfico "Média por Dia da Semana"
2. Identificar dias com mais viagens
3. Ver "Top Localizações" para destinos frequentes

### 3. Relatórios
**Objetivo**: Exportar dados para relatórios externos

**Passos**:
1. Selecionar período desejado
2. Clicar "Exportar"
3. Usar JSON em ferramentas externas (Excel, BI, etc)

### 4. Análise de Custos
**Objetivo**: Calcular custos baseados em km

**Passos**:
1. Ver "Total Km" do período
2. Multiplicar por custo/km (ex: €0.36/km)
3. Comparar com meses anteriores

---

## 🔄 Atualizações Automáticas

### Cache
- **StaleTime**: 5 minutos
- **Invalidação**: Após create/update/delete de viagem
- **Refetch**: Manual ou após invalidação

### Realtime
- Não implementado (usar refresh manual)
- Possível melhoria futura: Supabase Realtime

---

## 🐛 Troubleshooting

### Gráficos não aparecem
**Causa**: Sem dados no período selecionado

**Solução**: 
- Mudar período para "Todo o período"
- Verificar se há viagens completadas

### Valores incorretos
**Causa**: Viagens com status "draft" não são contabilizadas

**Solução**:
- Apenas viagens com `status: 'completed'` são incluídas
- Completar viagens em rascunho

### Performance lenta
**Causa**: Muitas viagens (>1000)

**Solução**:
- Usar períodos menores (3 ou 6 meses)
- Cache ajuda após primeiro carregamento

---

## 📈 Métricas de Sucesso

### Performance
- Carregamento inicial: <2s
- Mudança de período: <500ms (cache)
- Bundle size: 3.16 KB gzipped ✅

### UX
- Gráficos interativos: ✅
- Responsive: ✅
- Dark mode: ✅
- Exportação: ✅

---

## 🚀 Melhorias Futuras

### Curto Prazo
1. Adicionar gráfico de evolução temporal (linha)
2. Filtro por motivo específico
3. Comparação entre períodos

### Médio Prazo
1. Exportação em PDF
2. Realtime updates
3. Previsões baseadas em histórico
4. Alertas de km mensais

### Longo Prazo
1. Machine learning para padrões
2. Integração com Google Maps
3. Cálculo automático de custos
4. Partilha de relatórios

---

## 📞 Contatos

**Funcionalidade criada em**: Janeiro 2026  
**Versão**: 1.0.0  
**Status**: ✅ Produção

**Suporte**:
- Technical: tech@eter.com
- Bugs: bugs@eter.com
