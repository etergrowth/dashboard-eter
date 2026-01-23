# Configuração de Template de Email - Reset Password

## 📧 Template de Email Personalizado

Foi criado um template HTML personalizado para o email de reset de password em:
- `emails_html/reset_password.html`

## ⚙️ Como Configurar no Supabase Dashboard

### Passo 1: Aceder às Configurações de Email

1. Aceder a: https://supabase.com/dashboard/project/ozjafmkfabewxoyibirq/auth/templates
2. Ou ir em: **Authentication** > **Email Templates**

### Passo 2: Editar Template "Reset Password"

1. Procurar o template **"Reset Password"** na lista
2. Clicar em **"Edit"** ou **"Customize"**

### Passo 3: Copiar Template Personalizado

**Opção A: Usar HTML Completo**

1. Abrir o ficheiro `emails_html/reset_password.html`
2. Copiar todo o conteúdo HTML
3. Colar no editor do Supabase
4. Substituir `{{ .ConfirmationURL }}` pela variável do Supabase: `{{ .ConfirmationURL }}`

**Opção B: Usar Versão Simplificada (se o Supabase não suportar HTML completo)**

Se o Supabase usar um editor de templates mais simples, usar esta versão:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">E</div>
      <div style="font-size: 24px; font-weight: bold; color: #1f2937;">Eter Growth</div>
    </div>
    <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 10px 0;">Redefinir Password</h1>
    <p style="color: #6b7280; font-size: 16px; margin: 0;">Solicitou a redefinição da sua password</p>
  </div>

  <div style="margin: 30px 0;">
    <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
      Olá,<br><br>
      Recebemos um pedido para redefinir a password da sua conta no Dashboard Eter Growth.
      Se foi você que fez este pedido, clique no botão abaixo para criar uma nova password.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
        Redefinir Password
      </a>
    </div>

    <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #2563eb;">
      <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 14px;">
        Se o botão não funcionar, copie e cole este link no seu navegador:
      </div>
      <div style="color: #6b7280; font-size: 12px; word-break: break-all; font-family: monospace;">
        {{ .ConfirmationURL }}
      </div>
    </div>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px;">
      <div style="font-weight: 600; color: #92400e; margin-bottom: 8px; font-size: 14px;">
        ⚠️ Segurança
      </div>
      <p style="color: #78350f; font-size: 13px; margin: 0;">
        Este link expira em 1 hora por motivos de segurança. Se não solicitou esta alteração, 
        ignore este email e a sua password permanecerá inalterada.
      </p>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      Se tiver alguma dúvida ou não solicitou esta alteração, contacte-nos imediatamente.
    </p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
    <p>
      <strong>Eter Growth</strong><br>
      Dashboard Interno<br>
      <a href="mailto:geral@etergrowth.com" style="color: #2563eb; text-decoration: none;">geral@etergrowth.com</a>
    </p>
    <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
      Este é um email automático, por favor não responda.
    </p>
  </div>
</div>
```

### Passo 4: Variáveis Disponíveis no Supabase

O Supabase fornece estas variáveis no template:
- `{{ .ConfirmationURL }}` - Link para redefinir password
- `{{ .Email }}` - Email do utilizador
- `{{ .Token }}` - Token de reset (geralmente não necessário)
- `{{ .TokenHash }}` - Hash do token

### Passo 5: Salvar e Testar

1. Clicar em **"Save"** ou **"Update"**
2. Testar enviando um reset de password:
   - Ir para `/login`
   - Clicar em "Forgot your password?"
   - Introduzir um email autorizado
   - Verificar o email recebido

## 🎨 Características do Template

- ✅ Design moderno e profissional
- ✅ Branding da Eter Growth (logo e cores)
- ✅ Responsivo (funciona em mobile e desktop)
- ✅ Botão destacado para ação
- ✅ Link de fallback caso o botão não funcione
- ✅ Aviso de segurança sobre expiração
- ✅ Footer com informações de contacto

## 🔧 Personalização

Para personalizar ainda mais:

1. **Cores**: Alterar os gradientes `#2563eb` (azul) e `#9333ea` (roxo) para as cores da marca
2. **Logo**: Substituir o "E" por uma imagem do logo (usar URL absoluta)
3. **Texto**: Ajustar as mensagens conforme necessário
4. **Estilo**: Modificar os estilos CSS inline

## 📝 Notas Importantes

1. **Variáveis do Supabase**: Certificar que `{{ .ConfirmationURL }}` está correto
2. **HTML Inline**: O Supabase pode não suportar CSS externo, usar estilos inline
3. **Testes**: Sempre testar o email em diferentes clientes (Gmail, Outlook, etc.)
4. **Link de Redirecionamento**: Verificar que `/reset-password` está configurado nas rotas

## 🧪 Testar o Template

1. Configurar o template no Supabase Dashboard
2. Ir para: `http://localhost:3000/login`
3. Clicar em "Forgot your password?"
4. Introduzir: `geral@etergrowth.com` (ou outro email autorizado)
5. Verificar a caixa de entrada
6. Clicar no link do email
7. Verificar que redireciona para `/reset-password`
8. Testar definir nova password

---

**Última atualização:** 2026-01-22
