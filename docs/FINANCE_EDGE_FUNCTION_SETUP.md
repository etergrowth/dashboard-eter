# Configuração da Edge Function process-receipt-ocr

## ✅ Status

- ✅ Edge Function `process-receipt-ocr` deployada e ativa
- ✅ Trigger `on_recibo_inserted` configurado na base de dados
- ⚠️ Requer configuração da service_role_key para funcionar completamente

## Configuração Necessária

Para que o trigger automático funcione, é necessário configurar a `service_role_key` na base de dados:

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Aceda ao Supabase Dashboard
2. Vá para **Settings > API**
3. Copie a **Service Role Key** (secret)
4. Execute no SQL Editor:

```sql
ALTER DATABASE postgres SET app.settings.service_role_key = 'sua-service-role-key-aqui';
```

### Opção 2: Via Migration

Crie uma migration com:

```sql
ALTER DATABASE postgres SET app.settings.service_role_key = 'sua-service-role-key-aqui';
```

**⚠️ IMPORTANTE:** Nunca commite a service_role_key no código. Use variáveis de ambiente ou configure diretamente no Supabase.

## Como Funciona

1. **Upload de Fatura no CMS:**
   - Utilizador faz upload de ficheiro com categoria "invoice"
   - Ficheiro é guardado no bucket `faturas-recibos`
   - Registo é criado em `recibos_transacoes` com `ocr_processed = false`

2. **Trigger Automático:**
   - O trigger `on_recibo_inserted` detecta a inserção
   - Chama automaticamente a Edge Function `process-receipt-ocr`
   - Passa `recibo_id`, `file_path` e `user_id`

3. **Processamento na Edge Function:**
   - Lê o ficheiro do Storage
   - Converte para base64
   - Chama OpenAI Vision API para extrair dados
   - Cria transação automaticamente em `transacoes_financeiras`
   - Atualiza `recibos_transacoes` com `ocr_processed = true` e `transacao_id`

4. **Realtime:**
   - A transação criada é notificada via Realtime
   - Todos os browsers conectados recebem a atualização
   - UI atualiza automaticamente

## Variáveis de Ambiente Necessárias

A Edge Function requer:

- `OPENAI_API_KEY` - Chave da API da OpenAI (já configurada no Supabase Dashboard > Edge Functions > Secrets)

## Teste

Para testar se está a funcionar:

1. Faça upload de uma fatura no CMS (categoria "invoice")
2. Verifique os logs da Edge Function no Supabase Dashboard
3. Verifique se uma transação foi criada automaticamente na secção Financeira

## Troubleshooting

### O trigger não está a chamar a Edge Function

1. Verifique se a `service_role_key` está configurada:
```sql
SELECT current_setting('app.settings.service_role_key', true);
```

2. Verifique os logs do trigger:
```sql
SELECT * FROM pg_stat_statements WHERE query LIKE '%trigger_process_receipt%';
```

3. Verifique se a extensão `pg_net` está instalada:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

### A Edge Function retorna erro 401

- Verifique se a `service_role_key` está correta
- Verifique se a Edge Function está ativa no Dashboard

### A Edge Function não processa o recibo

- Verifique os logs da Edge Function no Dashboard
- Verifique se `OPENAI_API_KEY` está configurada
- Verifique se o bucket `faturas-recibos` existe e tem as políticas corretas
