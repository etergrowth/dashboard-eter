# Dashboard Sections - Componentes Modulares

Esta pasta contém componentes modulares reutilizáveis para construir páginas do dashboard de forma consistente.

## Estrutura

```
sections/
├── PageHeader.tsx      # Cabeçalho de página com título, descrição e ação
├── StatCard.tsx        # Card individual de estatística
├── StatsGrid.tsx       # Grid de cards de estatísticas
├── SearchBar.tsx       # Barra de pesquisa
├── LoadingState.tsx    # Estado de carregamento
├── EmptyState.tsx      # Estado vazio
├── ActionButton.tsx    # Botão de ação padronizado
├── DataTable.tsx       # Tabela de dados genérica
├── CardList.tsx        # Lista de cards
└── index.ts           # Exports centralizados
```

## Componentes

### PageHeader
Cabeçalho padrão para todas as páginas.

```tsx
<PageHeader
  title="Título da Página"
  description="Descrição opcional"
  action={<ActionButton ... />}
/>
```

### StatsGrid
Grid de estatísticas com cards interativos.

```tsx
<StatsGrid
  stats={[
    { name: 'Total', value: 100, subtext: 'Descrição' }
  ]}
  columns={4} // 2, 3 ou 4
/>
```

### StatCard
Card individual de estatística com hover effect.

```tsx
<StatCard
  name="Nome"
  value={100}
  subtext="Descrição opcional"
  onClick={() => {}}
/>
```

### SearchBar
Barra de pesquisa padronizada.

```tsx
<SearchBar
  placeholder="Pesquisar..."
  value={searchTerm}
  onChange={setSearchTerm}
/>
```

### LoadingState
Estado de carregamento padronizado.

```tsx
<LoadingState message="A carregar..." />
```

### EmptyState
Estado vazio com ícone, título e ação opcional.

```tsx
<EmptyState
  icon={Users}
  title="Nenhum item encontrado"
  description="Descrição opcional"
  action={<ActionButton ... />}
/>
```

### ActionButton
Botão de ação padronizado.

```tsx
<ActionButton
  label="Novo Item"
  onClick={() => {}}
  icon={Plus}
  variant="primary" // ou "secondary"
/>
```

### DataTable
Tabela genérica de dados.

```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email', render: (item) => item.email }
  ]}
  data={items}
  keyExtractor={(item) => item.id}
  onRowClick={(item) => {}}
/>
```

### CardList
Lista de cards em grid.

```tsx
<CardList
  items={items}
  renderItem={(item) => <CardComponent item={item} />}
  keyExtractor={(item) => item.id}
  columns={3}
  emptyState={<EmptyState ... />}
/>
```

## Uso

Todas as páginas devem usar estes componentes para manter consistência:

```tsx
import { PageHeader, StatsGrid, SearchBar, ActionButton } from '../../components/sections';

export function MyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha Página"
        description="Descrição"
        action={<ActionButton label="Novo" onClick={handleNew} icon={Plus} />}
      />
      
      <StatsGrid stats={stats} />
      
      <SearchBar value={search} onChange={setSearch} />
      
      {/* Conteúdo específico da página */}
    </div>
  );
}
```

## Benefícios

- **Consistência**: Todas as páginas têm o mesmo look & feel
- **Manutenibilidade**: Mudanças em um componente afetam todas as páginas
- **Reutilização**: Componentes podem ser usados em qualquer página
- **Type Safety**: TypeScript garante uso correto dos componentes