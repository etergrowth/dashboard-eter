# Gestão de Passwords - Eter Growth

## 🔐 Como Trocar a Password

### Opção 1: Via Supabase Dashboard (Recomendado para Administradores)

1. Aceder a: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/users
2. Procurar o utilizador pelo email
3. Clicar no utilizador para abrir detalhes
4. Na secção **"Password"**, clicar em **"Reset Password"**
5. Será enviado um email de reset para o utilizador
6. O utilizador clica no link do email e define nova password

### Opção 2: Via Aplicação (Reset de Password)

**Para utilizadores que esqueceram a password:**

1. Na página de login, clicar em **"Forgot your password?"**
2. Introduzir o email (`geral@etergrowth.com`, `rivdrgc@gmail.com` ou `luisvaldorio@gmail.com`)
3. Será enviado um email de reset
4. Clicar no link do email
5. Definir nova password

**NOTA:** Esta funcionalidade já está implementada na página de login.

### Opção 3: Via Supabase Auth API (Para Desenvolvedores)

Se quiseres implementar uma página de alteração de password na aplicação:

```typescript
// Para reset de password (quando esquecida)
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

// Para alterar password (quando autenticado)
const { error } = await supabase.auth.updateUser({
  password: 'nova_password_segura'
});
```

---

## ⚙️ Configurações no Supabase Dashboard

### Verificar Configurações de Password:

1. Ir em: **Authentication** > **Settings**
2. Verificar:
   - **Password minimum length**: Recomendado 8 caracteres
   - **Password strength**: Pode ativar validação de força
   - **Leaked password protection**: Recomendado ativar

### Configurar Email Templates:

1. Ir em: **Authentication** > **Email Templates**
2. Personalizar o template **"Reset Password"** se necessário
3. O email será enviado quando utilizador solicitar reset

---

## 🔒 Segurança

### Boas Práticas:

1. **Password forte**: Mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos
2. **Não partilhar**: Cada utilizador deve ter a sua própria password
3. **Alterar regularmente**: Recomendado alterar a cada 3-6 meses
4. **Não reutilizar**: Não usar passwords antigas

### Para Utilizadores Google OAuth:

- Se fizeres login apenas com Google, não precisas de password
- A password só é necessária se quiseres fazer login com email/password também
- Podes ter ambos: Google OAuth + password local

---

## 🛠️ Funções RPC Criadas

Foram criadas funções auxiliares no banco de dados:

1. **`public.change_user_password(p_current_password, p_new_password)`**
   - Valida pedido de alteração de password
   - Requer autenticação
   - A alteração real deve ser feita via Supabase Auth API

2. **`public.request_password_reset(p_email)`**
   - Valida pedido de reset de password
   - Verifica se email está autorizado
   - O reset real deve ser feito via Supabase Auth API

---

## 📝 Notas Importantes

1. **Google OAuth**: Se fizeres login apenas com Google, não precisas de password
2. **Email/Password**: Se quiseres usar email/password, precisas definir uma password primeiro
3. **Reset via Email**: O Supabase envia automaticamente emails de reset quando solicitado
4. **Segurança**: As passwords são armazenadas de forma encriptada no Supabase

---

## 🧪 Testar Reset de Password

1. Ir para: `http://localhost:3000/login`
2. Clicar em **"Forgot your password?"**
3. Introduzir um dos emails autorizados
4. Verificar email recebido
5. Clicar no link e definir nova password
6. Fazer login com nova password

---

**Última atualização:** 2026-01-22
