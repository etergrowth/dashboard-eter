# Configuração do Finance AI Agent

## Pré-requisitos

1. **Anthropic API Key**: Configure a variável de ambiente `ANTHROPIC_API_KEY` no Supabase Dashboard
   - Vá para: Settings > Edge Functions > Secrets
   - Adicione: `ANTHROPIC_API_KEY` com o valor da sua chave da Anthropic

2. **Storage Bucket**: Crie o bucket `faturas-recibos` no Supabase Dashboard
   - Vá para: Storage > Create a new bucket
   - Nome: `faturas-recibos`
   - Público: `false` (acesso apenas autenticado)
   - File size limit: `10MB`
   - Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`

3. **Storage Policies**: As políticas RLS já estão configuradas na migration, mas verifique se estão ativas:
   - Vá para: Storage > faturas-recibos > Policies
   - Deve ter 4 políticas:
     - Users can upload own receipts (INSERT)
     - Users can view own receipts (SELECT)
     - Users can update own receipts (UPDATE)
     - Users can delete own receipts (DELETE)

## Deploy da Edge Function

```bash
# Deploy da função process-finance-transaction
supabase functions deploy process-finance-transaction
```

## Estrutura de Pastas no Storage

Os ficheiros são organizados automaticamente:
```
faturas-recibos/
  └── {user_id}/
      └── {year}/
          └── {month}/
              └── {timestamp}_{filename}
```

## Uso

1. Aceda a `/dashboard/finance`
2. Digite uma transação em texto natural ou carregue uma fatura
3. Revise os dados extraídos no painel de pré-visualização
4. Confirme para guardar a transação

## Categorias Disponíveis

- Software & SaaS
- Viagens
- Refeições
- Material de Escritório
- Receitas
- Subscrições
- Serviços Públicos
- Marketing
- Serviços Profissionais
- Outro
