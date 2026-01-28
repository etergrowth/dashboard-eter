#!/bin/bash

# Script para configurar os secrets da Edge Function send-email-apresentacao
# Uso: ./scripts/setup-edge-function-secrets.sh

set -e

echo "🔐 Configurando secrets da Edge Function send-email-apresentacao..."
echo ""

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado."
    echo "   Instale com: npm install -g supabase"
    echo "   Ou: brew install supabase/tap/supabase"
    exit 1
fi

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script a partir da raiz do projeto (dashboard-eter/)"
    exit 1
fi

# Carregar variáveis do .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Ficheiro .env.local não encontrado"
    echo "   Crie o ficheiro .env.local com as variáveis Gmail necessárias:"
    echo "   GMAIL_CLIENT_ID=..."
    echo "   GMAIL_CLIENT_SECRET=..."
    echo "   GMAIL_REFRESH_TOKEN=..."
    exit 1
fi

# Ler variáveis do .env.local (ignorar linhas comentadas e vazias)
GMAIL_CLIENT_ID=$(grep "^GMAIL_CLIENT_ID=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
GMAIL_CLIENT_SECRET=$(grep "^GMAIL_CLIENT_SECRET=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
GMAIL_REFRESH_TOKEN=$(grep "^GMAIL_REFRESH_TOKEN=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
GMAIL_FROM_EMAIL=$(grep "^GMAIL_FROM_EMAIL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
GMAIL_FROM_NAME=$(grep "^GMAIL_FROM_NAME=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")

# Verificar se as variáveis necessárias existem
if [ -z "$GMAIL_CLIENT_ID" ] || [ -z "$GMAIL_CLIENT_SECRET" ] || [ -z "$GMAIL_REFRESH_TOKEN" ]; then
    echo "❌ Variáveis Gmail não encontradas no .env.local"
    echo "   Necessário: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN"
    exit 1
fi

echo "✅ Variáveis encontradas no .env.local"
echo ""

# Obter project-ref do .env.local ou usar padrão
PROJECT_REF=$(grep "^VITE_SUPABASE_URL=" .env.local | cut -d '/' -f3 | cut -d '.' -f1 || echo "ozjafmkfabewxoyibirq")

echo "📝 Configurando secrets no Supabase (project: $PROJECT_REF)..."
echo ""

# Configurar secrets obrigatórios
supabase secrets set GMAIL_CLIENT_ID="$GMAIL_CLIENT_ID" --project-ref "$PROJECT_REF"
echo "✅ GMAIL_CLIENT_ID configurado"

supabase secrets set GMAIL_CLIENT_SECRET="$GMAIL_CLIENT_SECRET" --project-ref "$PROJECT_REF"
echo "✅ GMAIL_CLIENT_SECRET configurado"

supabase secrets set GMAIL_REFRESH_TOKEN="$GMAIL_REFRESH_TOKEN" --project-ref "$PROJECT_REF"
echo "✅ GMAIL_REFRESH_TOKEN configurado"

# Configurar variáveis opcionais se existirem
if [ ! -z "$GMAIL_FROM_EMAIL" ]; then
    supabase secrets set GMAIL_FROM_EMAIL="$GMAIL_FROM_EMAIL" --project-ref "$PROJECT_REF"
    echo "✅ GMAIL_FROM_EMAIL configurado"
fi

if [ ! -z "$GMAIL_FROM_NAME" ]; then
    supabase secrets set GMAIL_FROM_NAME="$GMAIL_FROM_NAME" --project-ref "$PROJECT_REF"
    echo "✅ GMAIL_FROM_NAME configurado"
fi

echo ""
echo "✅ Secrets configurados com sucesso!"
echo ""
echo "📋 Secrets configurados:"
echo "   - GMAIL_CLIENT_ID"
echo "   - GMAIL_CLIENT_SECRET"
echo "   - GMAIL_REFRESH_TOKEN"
[ ! -z "$GMAIL_FROM_EMAIL" ] && echo "   - GMAIL_FROM_EMAIL"
[ ! -z "$GMAIL_FROM_NAME" ] && echo "   - GMAIL_FROM_NAME"
echo ""
echo "💡 Próximos passos:"
echo "   1. Teste o envio de email no dashboard"
echo "   2. Verifique os logs em: Supabase Dashboard > Edge Functions > send-email-apresentacao > Logs"
echo ""
