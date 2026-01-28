# Atualização: Submenu de Prospecção com Leads Website

## ✅ Implementação Concluída

Implementada a funcionalidade de submenu hover para "Prospecção" (Sandbox), permitindo acesso à página "Leads Website" através de:
1. **Hover no desktop** (igual ao Mapa de Viagens)
2. **Botão na página principal** (mobile-friendly)

---

## 🎯 Alterações Realizadas

### 1. **Navegação Principal** (`src/dashboard/components/navigation/constants.ts`)

#### Antes:
- "Leads Website" era um item separado na navegação principal
- Ocupava uma posição própria no menu (order: 1)

#### Depois:
- "Leads Website" removido da navegação principal
- Adicionado como **subitem de "Prospecção"**
- "Prospecção" movido para order: 1 (primeira posição após Dashboard)
- Outros itens reordenados automaticamente

```typescript
{
  id: 'prospeccao', 
  name: 'Prospecção', 
  to: '/dashboard/sandbox', 
  iconKey: 'Target', 
  visible: true, 
  order: 1,
  subItems: [
    { 
      id: 'leads-website', 
      name: 'Leads Website', 
      to: '/dashboard/sandbox/pendentes', 
      iconKey: 'Inbox', 
      visible: true 
    }
  ]
}
```

---

### 2. **Sidebar** (`src/dashboard/components/Sidebar.tsx`)

- Atualizada lista de IDs a remover na migração
- "leads-website" agora é tratado como subitem (não aparece na navegação principal)
- Sistema de migração automática mantém configurações personalizadas do utilizador

```typescript
const idsToRemove = new Set(['estatisticas-kms', 'leads-website']);
```

---

### 3. **Página de Prospecção** (`src/dashboard/pages/Sandbox/LeadsQueue.tsx`)

Adicionado botão "Leads Website" junto aos botões de ação:

#### Desktop:
- Botão com texto completo "Leads Website"
- Ícone: `Inbox`
- Variante: `secondary` (visual diferenciado)

#### Mobile:
- Botão com texto curto "Leads"
- Mesmo ícone e funcionalidade
- Otimizado para telas pequenas

```typescript
<ActionButton
  label={isMobile ? "Leads" : "Leads Website"}
  onClick={() => navigate('/dashboard/sandbox/pendentes')}
  icon={Inbox}
  variant="secondary"
/>
```

---

## 🎨 Comportamento Visual

### Desktop (Sidebar Aberta)

1. **Item "Prospecção"** mostra ícone de seta (`ChevronRight`) indicando submenu
2. **Hover sobre "Prospecção"**:
   - Aparece menu flutuante à direita
   - Menu contém "Leads Website" com ícone `Inbox`
   - Clique leva para `/dashboard/sandbox/pendentes`
3. **Clique direto em "Prospecção"**:
   - Leva para `/dashboard/sandbox` (página principal da fila de leads)

### Desktop (Sidebar Fechada)

- Apenas ícones visíveis
- Hover ainda funciona (submenu aparece quando hover no ícone)

### Mobile

- Sidebar em drawer
- **Não há submenu hover** (impossível em touch)
- **Solução**: Botão "Leads" na página principal de Prospecção
- Clique no botão leva para Leads Website

---

## 📱 Fluxo de Navegação

### Desktop - Via Hover:
```
Sidebar → Hover "Prospecção" → Clique "Leads Website" → Página Leads Website
```

### Desktop - Via Botão:
```
Sidebar → Clique "Prospecção" → Página Fila de Leads → Botão "Leads Website" → Página Leads Website
```

### Mobile:
```
Menu → Clique "Prospecção" → Página Fila de Leads → Botão "Leads" → Página Leads Website
```

---

## 🔄 Migração Automática

O sistema de migração já implementado:

1. **Detecta** que "leads-website" existia como item principal
2. **Remove** da navegação principal
3. **Adiciona** como subitem de "Prospecção"
4. **Mantém** todas as outras configurações (ordem, visibilidade)
5. **Preserva** personalizações do utilizador

**Resultado**: Utilizadores existentes veem as mudanças automaticamente no próximo refresh.

---

## ✅ Validação

### Testes a Realizar:

1. ✅ **Desktop - Hover funciona**
   - Hover sobre "Prospecção" mostra submenu
   - Clique em "Leads Website" no submenu funciona
   
2. ✅ **Desktop - Botão funciona**
   - Navegar para `/dashboard/sandbox`
   - Clicar em "Leads Website" (botão secondary)
   - Redireciona para `/dashboard/sandbox/pendentes`

3. ✅ **Mobile - Botão visível e funcional**
   - Abrir menu mobile
   - Navegar para "Prospecção"
   - Botão "Leads" visível
   - Clique funciona

4. ✅ **Indicador visual**
   - "Prospecção" mostra seta (`ChevronRight`) quando sidebar aberta
   - Submenu aparece apenas quando sidebar aberta

5. ✅ **Rota direta funciona**
   - Acessar `/dashboard/sandbox/pendentes` diretamente na URL
   - Página carrega normalmente
   - "Prospecção" fica destacado na sidebar (parent ativo)

---

## 📊 Comparação com Mapa de Viagens

| Aspecto | Mapa de Viagens | Prospecção |
|---------|----------------|------------|
| **Item Principal** | Mapa de Viagens | Prospecção |
| **Subitem** | Estatísticas Kms | Leads Website |
| **Ícone Principal** | `Car` | `Target` |
| **Ícone Subitem** | `BarChart3` | `Inbox` |
| **Hover Desktop** | ✅ Sim | ✅ Sim |
| **Botão na Página** | ❌ Não | ✅ Sim (mobile-friendly) |

**Diferença chave**: Prospecção tem botão adicional na página principal para melhor UX em mobile.

---

## 🎯 Vantagens da Solução

### ✅ Desktop:
- Menu mais limpo (menos itens na navegação principal)
- Hover intuitivo (mesmo padrão do Mapa de Viagens)
- Acesso rápido sem sair da página

### ✅ Mobile:
- Botão sempre visível na página principal
- Não depende de hover (impossível em touch)
- Texto otimizado para telas pequenas

### ✅ Consistência:
- Padrão visual igual ao Mapa de Viagens
- Comportamento previsível
- Fácil de expandir no futuro (adicionar mais subitens)

---

## 🔮 Futuras Expansões

Se necessário adicionar mais subitens à Prospecção:

```typescript
subItems: [
  { 
    id: 'leads-website', 
    name: 'Leads Website', 
    to: '/dashboard/sandbox/pendentes', 
    iconKey: 'Inbox', 
    visible: true 
  },
  { 
    id: 'metricas-prospeccao', 
    name: 'Métricas', 
    to: '/dashboard/sandbox/metrics', 
    iconKey: 'BarChart3', 
    visible: true 
  }
  // ... mais subitens conforme necessário
]
```

Basta adicionar ao array `subItems` em `constants.ts` e o sistema cuida do resto automaticamente.

---

## 📝 Notas Técnicas

### Componentes Afetados:
1. ✅ `constants.ts` - Configuração de navegação
2. ✅ `Sidebar.tsx` - Migração automática
3. ✅ `SortableNavItem.tsx` - Renderização de subitens (já existente)
4. ✅ `LeadsQueue.tsx` - Botão adicional

### Sem Alterações:
- ❌ `LeadsPendentes.tsx` - Página funciona normalmente
- ❌ Rotas no `App.tsx` - Já existentes
- ❌ Hooks e lógica de negócio - Sem mudanças

### Compatibilidade:
- ✅ Desktop (sidebar aberta/fechada)
- ✅ Mobile (drawer)
- ✅ Tablets (híbrido)
- ✅ Dark/Light mode
- ✅ Drag & drop (não afeta subitens)
- ✅ Context menu (funciona no item pai)

---

**Status**: 🟢 A correr em `http://localhost:3001/`

**Teste agora**: Faz hover sobre "Prospecção" no sidebar ou navega para a página de Prospecção e clica no botão "Leads Website"! 🎉
