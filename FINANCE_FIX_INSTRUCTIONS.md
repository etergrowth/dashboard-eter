# Instruções para Corrigir Finance AI Agent

## 1. Configurar OpenAI API Key

Adicione ao seu ficheiro `.env` (ou `.env.local`):

```
VITE_OPENAI_API_KEY=sk-...
```

## 2. Aplicar Migrations do Supabase

As tabelas `tasks`, `projects`, e `media_files` não existem. Execute as migrations:

```bash
# Verificar quais migrations já foram aplicadas
supabase db remote commit

# Aplicar todas as migrations
supabase db push
```

Ou aplique manualmente via Supabase Dashboard:
1. Vá para SQL Editor
2. Execute os ficheiros em `supabase/migrations/` que ainda não foram aplicados
3. Comece por `001_initial_schema.sql`

## 3. Criar Storage Bucket (se ainda não existir)

No Supabase Dashboard:
1. Storage > Create bucket
2. Nome: `faturas-recibos`
3. Público: `false`
4. File size limit: `10MB`

## 4. Reiniciar a Aplicação

```bash
npm run dev
```

## Alterações Feitas

- ✅ Chatbot agora usa OpenAI em vez de Edge Function
- ✅ Suporte para texto e imagens via OpenAI Vision
- ✅ Removida dependência da Edge Function (não precisa deploy)
- ✅ Mantida toda a funcionalidade em português
