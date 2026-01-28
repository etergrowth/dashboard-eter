# Validação da Persistência de Sessão

## ✅ Implementação Concluída

As seguintes alterações foram implementadas para resolver o problema de logout em refresh:

### 1. Dependências Instaladas
- `@tanstack/react-query-persist-client`
- `@tanstack/query-sync-storage-persister`

### 2. Arquivos Modificados

#### `src/lib/queryClient.ts`
- Adicionado `sessionPersister` usando `sessionStorage`
- Configurado `persistOptions` para persistir apenas queries de autenticação (`['auth', ...]`)
- `maxAge: Infinity` - persiste até fechar o browser

#### `src/App.tsx`
- Substituído `QueryClientProvider` por `PersistQueryClientProvider`
- Passados `persistOptions` para o provider

## 🧪 Testes de Validação

Por favor, execute os seguintes testes **pela ordem apresentada**:

### Teste 1: ✅ Refresh mantém sessão
**Objetivo**: Verificar que fazer refresh na página não causa logout

**Passos**:
1. Abrir o browser em `http://localhost:3001/`
2. Fazer login com as tuas credenciais
3. Navegar para qualquer página do dashboard (ex: `/dashboard/crm`)
4. **Fazer refresh da página (F5 ou Cmd+R)**
5. ✅ **Resultado esperado**: Deves continuar na mesma página, sem ser redirecionado para `/login`

---

### Teste 2: ✅ Múltiplos refreshes
**Objetivo**: Verificar que a sessão persiste em múltiplos refreshes

**Passos**:
1. Continuar autenticado do teste anterior
2. Fazer refresh 3-5 vezes seguidas
3. Navegar para outras páginas e fazer refresh em cada uma
4. ✅ **Resultado esperado**: Sessão mantém-se em todos os refreshes

---

### Teste 3: ✅ Nova tab (mesmo browser)
**Objetivo**: Verificar comportamento em múltiplos tabs

**Passos**:
1. Manter o tab do teste anterior aberto e autenticado
2. Abrir um **novo tab** no **mesmo browser**
3. Navegar para `http://localhost:3001/dashboard`
4. ⚠️ **Resultado esperado**: 
   - **Com sessionStorage**: Nova tab NÃO terá sessão (pede login)
   - Isto é esperado - `sessionStorage` é isolado por tab

---

### Teste 4: ✅ Fechar browser e reabrir
**Objetivo**: Verificar que sessão expira ao fechar o browser

**Passos**:
1. Estar autenticado no dashboard
2. **Fechar completamente o browser** (todas as janelas)
3. Reabrir o browser
4. Navegar para `http://localhost:3001/dashboard`
5. ✅ **Resultado esperado**: Deves ser redirecionado para `/login` (sessão expirada)

---

### Teste 5: ✅ Logout manual funciona
**Objetivo**: Verificar que logout continua a funcionar

**Passos**:
1. Fazer login
2. Clicar no botão de logout no dashboard
3. ✅ **Resultado esperado**: Redirecionado para `/login` e sessão limpa
4. Fazer refresh na página de login
5. ✅ **Resultado esperado**: Continuar na página de login (não faz re-login automático)

---

### Teste 6: ✅ Email não autorizado
**Objetivo**: Verificar que validação de email continua a funcionar

**Passos**:
1. Se tiveres acesso, tentar login com email não autorizado (não listado em `allowed_users`)
2. ✅ **Resultado esperado**: Redirecionado para `/unauthorized`
3. Fazer refresh
4. ✅ **Resultado esperado**: Manter na página `/unauthorized` (não faz logout)

---

### Teste 7: ✅ Navegação normal
**Objetivo**: Verificar que funcionalidades existentes não quebraram

**Passos**:
1. Fazer login
2. Navegar entre diferentes páginas do dashboard:
   - `/dashboard` (Overview)
   - `/dashboard/crm`
   - `/dashboard/finance`
   - `/dashboard/mapa-kms`
3. Criar/editar/eliminar alguns registos (leads, projetos, etc.)
4. ✅ **Resultado esperado**: Tudo funciona normalmente

---

## 🔍 Verificação no Browser DevTools

### Verificar sessionStorage
1. Abrir DevTools (F12)
2. Ir para **Application** > **Session Storage**
3. Deves ver uma chave `REACT_QUERY_OFFLINE_CACHE` com dados da sessão

### Verificar Network
1. Ir para **Network** tab
2. Fazer refresh da página
3. Verificar que **não há** chamadas desnecessárias para `/auth/session` (deve usar cache)

### Verificar Console
1. Ir para **Console** tab
2. Fazer refresh
3. **Não deve haver** erros relacionados com autenticação ou React Query

---

## 📊 Resultado Esperado vs Anterior

| Cenário | ❌ Antes (Problema) | ✅ Depois (Esperado) |
|---------|-------------------|---------------------|
| Refresh página | Logout forçado | Mantém sessão |
| Fechar browser | Logout (correto) | Logout (mantém) |
| Nova tab | - | Pede login (normal) |
| Logout manual | Funciona | Funciona |
| Email não autorizado | Funciona | Funciona |
| Performance | Lenta (refetch) | Rápida (cache) |

---

## 🐛 Troubleshooting

### Se ainda acontecer logout em refresh:

1. **Verificar sessionStorage**:
   - DevTools > Application > Session Storage
   - Confirmar que existe `REACT_QUERY_OFFLINE_CACHE`

2. **Verificar localStorage do Supabase**:
   - DevTools > Application > Local Storage
   - Confirmar que existe chave `sb-*-auth-token`

3. **Verificar console**:
   - Procurar por erros de autenticação
   - Verificar logs `[ProtectedRoute]` e `[useAuth]`

4. **Limpar tudo e tentar novamente**:
   ```javascript
   // Na console do browser:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

---

## 📝 Notas Técnicas

### Como funciona:
1. **Primeiro render**: React Query tenta ler do `sessionStorage`
2. Se encontrar cache válido, retorna sessão **instantaneamente** (síncrono)
3. Em background, revalida a sessão com Supabase
4. Se Supabase confirmar, mantém sessão; se não, faz logout

### Porquê sessionStorage e não localStorage:
- `sessionStorage` expira ao fechar o browser (comportamento desejado)
- `localStorage` persiste indefinidamente (seria necessário implementar expiração manual)
- `sessionStorage` é isolado por tab (mais seguro)

### Queries persistidas:
- Apenas queries com chave `['auth', ...]` são persistidas
- Outras queries (CRM, finance, etc.) **não são persistidas** (normal)
- Isto evita problemas com dados desatualizados

---

## ✅ Checklist Final

Após executar todos os testes, confirmar:

- [ ] Refresh mantém sessão ✅
- [ ] Múltiplos refreshes mantêm sessão ✅
- [ ] Fechar browser limpa sessão ✅
- [ ] Logout manual funciona ✅
- [ ] Email não autorizado funciona ✅
- [ ] Navegação normal funciona ✅
- [ ] Sem erros na console ✅
- [ ] Performance melhorou (sem refetch desnecessário) ✅

---

**Status do servidor**: 🟢 A correr em `http://localhost:3001/`

**Próximos passos após validação**:
1. Se tudo funcionar: marcar todos os testes como completos
2. Se houver problemas: reportar qual teste falhou e qual foi o comportamento observado
