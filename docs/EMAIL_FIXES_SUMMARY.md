# Correções no Email de Apresentação

## Problemas Identificados e Resolvidos

### 1. ✅ Assunto com Erro de Codificação

**Problema:** O assunto aparecia como "ApresentaÃƒÂ§ÃƒÂ£o Eter Growth" em vez de "Apresentação Eter Growth"

**Causa:** O assunto não estava sendo codificado corretamente usando RFC 2047 para caracteres UTF-8

**Solução:** Implementada função `encodeSubject()` que:
- Verifica se o assunto contém caracteres não-ASCII
- Codifica em Base64 com charset UTF-8 usando RFC 2047
- Formato: `=?UTF-8?B?{base64}?=`

**Código:**
```typescript
const encodeSubject = (subject: string): string => {
  if (/^[\x00-\x7F]*$/.test(subject)) {
    return subject; // Apenas ASCII
  }
  const utf8Bytes = new TextEncoder().encode(subject);
  const base64 = btoa(String.fromCharCode(...utf8Bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `=?UTF-8?B?${base64}?=`;
};
```

### 2. ✅ Logo Não Aparece Corretamente

**Problema:** O logo aparecia como imagem quebrada ou não carregava

**Causas Possíveis:**
- Muitos clientes de email não suportam SVG
- Imagens externas podem ser bloqueadas
- Formatação HTML não otimizada para emails

**Solução:** 
- Usado formato de tabela HTML (mais compatível com clientes de email)
- Adicionados atributos `width` e `height` explícitos
- Adicionados estilos inline para melhor compatibilidade
- Mantido SVG (se não funcionar, pode ser necessário criar versão PNG)

**Código:**
```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="padding: 0;">
<img src="https://ozjafmkfabewxoyibirq.supabase.co/storage/v1/object/public/etergrowthweb/etergrowth.com.svg" 
     alt="Eter Growth" 
     width="120"
     height="40"
     style="width: 120px; height: auto; max-width: 120px; display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
</td>
</tr>
</table>
```

### 3. ✅ Codificação da Mensagem MIME

**Melhoria:** Corrigida a codificação da mensagem MIME completa para garantir UTF-8 correto

**Antes:**
```typescript
const encodedMessage = btoa(unescape(encodeURIComponent(message)))
```

**Depois:**
```typescript
const messageBytes = new TextEncoder().encode(message);
const encodedMessage = btoa(String.fromCharCode(...messageBytes))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
```

## Próximos Passos (Opcional)

Se o logo ainda não aparecer em alguns clientes de email:

1. **Criar versão PNG do logo:**
   - Converter `etergrowth.com.svg` para PNG
   - Upload para Supabase Storage: `etergrowthweb/etergrowth-logo.png`
   - Atualizar URL no template

2. **Usar imagem inline (base64):**
   - Converter logo para base64
   - Inserir diretamente no HTML como data URI
   - Mais compatível, mas aumenta tamanho do email

3. **Usar texto estilizado como fallback:**
   - Se imagem não carregar, mostrar "Eter Growth" estilizado
   - Sempre funciona, mas menos visual

## Teste

Após fazer deploy da Edge Function:

1. Enviar email de teste
2. Verificar assunto: deve aparecer "Apresentação Eter Growth" (sem caracteres estranhos)
3. Verificar logo: deve aparecer corretamente
4. Testar em diferentes clientes de email (Gmail, Outlook, Apple Mail)

## Deploy

```bash
cd dashboard-eter
supabase functions deploy send-email-apresentacao
```
