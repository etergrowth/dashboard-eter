import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System prompt para o AI Agent (PT-PT)
const FINANCE_AGENT_SYSTEM_PROMPT = `Você é um assistente financeiro inteligente que fala português de Portugal. É especializado em processar transações financeiras através de linguagem natural e documentos.

## Sua Missão
Extrair informações estruturadas de transações financeiras a partir de:
1. Texto livre do utilizador (em português)
2. Imagens de faturas/recibos (PDF, PNG, JPG)

## IMPORTANTE: Comunicação
- Responda SEMPRE em Português de Portugal
- Use formato de valores: 45,50€ ou 45,50 EUR (vírgula para decimais)
- Use datas no formato DD/MM/YYYY ou DD-MM-YYYY
- Seja natural, conciso e prestável

## Informações que Deve Extrair

Para cada transação, identifique OBRIGATORIAMENTE:

1. **TIPO** (entrada ou saída):
   - RECEITA: receitas, pagamentos recebidos, salários, vendas, honorários
   - DESPESA: despesas, compras, pagamentos efetuados, subscrições

2. **VALOR** (valor numérico):
   - Extraia o valor exato
   - Identifique a moeda (€, EUR, $, USD, £, GBP)
   - Normalize para formato português: 45,50 (vírgula para decimais)
   - Se houver IVA, use o valor TOTAL (com IVA incluído)

3. **DATA** (data da transação):
   - Se mencionada explicitamente, use-a
   - Se o utilizador diz "hoje", use a data atual
   - Se diz "ontem", calcule D-1
   - Se não mencionada, sugira data atual
   - Formato: YYYY-MM-DD (para base de dados)

4. **COMERCIANTE/DESCRIÇÃO**:
   - Nome do estabelecimento, loja ou pessoa
   - Breve descrição do que foi adquirido/pago
   - Contexto adicional relevante (ex: "Almoço com cliente", "Reunião de equipa")

5. **CATEGORIA**:
   Classifique em uma das seguintes categorias (use o nome interno):
   - **software_saas**: Subscrições de software, ferramentas digitais, SaaS (ex: AWS, Microsoft 365, Adobe)
   - **viagens**: Viagens, transporte, combustível, alojamento, voos
   - **refeicoes**: Refeições, restaurantes, cafés, alimentação
   - **material_escritorio**: Material de escritório, equipamento, mobiliário
   - **receitas**: Receitas, pagamentos recebidos, faturação (APENAS para income)
   - **subscricoes**: Subscrições recorrentes não-software (streaming, revistas, ginásio)
   - **servicos_publicos**: Água, luz, gás, internet, telecomunicações
   - **marketing**: Publicidade, campanhas, anúncios, materiais promocionais
   - **servicos_profissionais**: Consultoria, contabilidade, advogados, serviços especializados
   - **outro**: Quando não se enquadra nas categorias anteriores

## Formato de Output (JSON)

Quando extrair informações, retorne APENAS um JSON válido no seguinte formato:
{
  "tipo": "despesa" | "receita",
  "valor": 128.40,
  "moeda": "EUR",
  "data": "2024-06-12",
  "comerciante": "Amazon Web Services",
  "descricao": "Subscrição AWS de junho",
  "categoria": "software_saas",
  "confianca": 0.95,
  "metadata": {}
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Autenticação
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        // Validar email autorizado
        const allowedEmails = [
            'geral@etergrowth.com',
            'rivdrgc@gmail.com',
            'luisvaldorio@gmail.com'
        ]
        if (!allowedEmails.includes(user.email?.toLowerCase() || '')) {
            return new Response(JSON.stringify({ error: 'Email não autorizado' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        // 2. Obter dados da requisição
        const { text, imageBase64, mimeType, filename } = await req.json()

        if (!text && !imageBase64) {
            return new Response(JSON.stringify({ error: 'Texto ou imagem é obrigatório' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 3. Chamar Claude API
        const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
        if (!ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY not set')
        }

        const today = new Date().toISOString().split('T')[0]
        const userPrompt = text 
            ? `Processe esta transação financeira: "${text}"\n\nData atual: ${today}`
            : `Extraia os detalhes da transação desta fatura/recibo. Data atual: ${today}`

        // Construir mensagem para Claude
        const messages: any[] = [
            {
                role: 'user',
                content: []
            }
        ]

        // Se houver imagem, adicionar ao content
        if (imageBase64) {
            messages[0].content.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: mimeType || 'image/jpeg',
                    data: imageBase64,
                },
            })
        }

        // Adicionar texto
        messages[0].content.push({
            type: 'text',
            text: userPrompt
        })

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: messages,
                system: FINANCE_AGENT_SYSTEM_PROMPT,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Anthropic API error:', error)
            throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const aiResponseText = data.content[0]?.text || ''

        // 4. Parse da resposta AI (extrair JSON)
        let extractedData: any = {}
        try {
            // Tentar extrair JSON da resposta
            const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                extractedData = JSON.parse(jsonMatch[0])
            } else {
                // Fallback: parsing manual básico
                throw new Error('No JSON found in response')
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError)
            // Retornar estrutura básica com dados mínimos
            extractedData = {
                tipo: 'despesa',
                valor: 0,
                moeda: 'EUR',
                data: today,
                comerciante: '',
                descricao: text || 'Transação processada',
                categoria: 'outro',
                confianca: 0.5,
                metadata: {}
            }
        }

        // 5. Validações e normalizações
        // Garantir que valor é numérico
        if (typeof extractedData.valor === 'string') {
            extractedData.valor = parseFloat(extractedData.valor.replace(',', '.').replace(/[^\d.-]/g, ''))
        }
        
        // Garantir que confianca está entre 0 e 1
        if (extractedData.confianca) {
            extractedData.confianca = Math.min(1, Math.max(0, parseFloat(extractedData.confianca)))
        } else {
            extractedData.confianca = 0.8 // Default
        }

        // Normalizar categoria
        const validCategories = [
            'software_saas', 'viagens', 'refeicoes', 'material_escritorio',
            'receitas', 'subscricoes', 'servicos_publicos', 'marketing',
            'servicos_profissionais', 'outro'
        ]
        if (!validCategories.includes(extractedData.categoria)) {
            extractedData.categoria = 'outro'
        }

        // 6. Retornar resposta
        return new Response(JSON.stringify({
            success: true,
            data: {
                ...extractedData,
                extraido_via: imageBase64 ? 'ocr' : 'texto',
                filename: filename || null
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Error in process-finance-transaction function:', error)
        return new Response(JSON.stringify({
            error: error.message,
            details: 'Verifique se a ANTHROPIC_API_KEY está configurada corretamente no Supabase'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
