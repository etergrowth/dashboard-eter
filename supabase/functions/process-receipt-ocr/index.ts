import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System prompt para extração de dados de recibos
const RECEIPT_EXTRACTION_PROMPT = `Você é um assistente financeiro especializado em extrair informações de faturas e recibos em português de Portugal.

Extraia APENAS um JSON válido com:
{
  "tipo": "despesa" | "receita",
  "valor": number,
  "moeda": "EUR",
  "data": "YYYY-MM-DD",
  "comerciante": string,
  "descricao": string,
  "categoria": string,
  "confianca": number (0-1)
}

Categorias válidas: software_saas, viagens, refeicoes, material_escritorio, receitas, subscricoes, servicos_publicos, marketing, servicos_profissionais, outro.

Retorne APENAS o JSON, sem texto adicional.`

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

    // 2. Obter dados da requisição
    const { recibo_id, file_path, user_id } = await req.json()

    if (!recibo_id || !file_path || !user_id) {
      return new Response(JSON.stringify({ error: 'recibo_id, file_path e user_id são obrigatórios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Verificar se o recibo pertence ao utilizador
    const { data: recibo, error: reciboError } = await supabaseClient
      .from('recibos_transacoes')
      .select('*')
      .eq('id', recibo_id)
      .eq('user_id', user_id)
      .single()

    if (reciboError || !recibo) {
      return new Response(JSON.stringify({ error: 'Recibo não encontrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // 3. Ler ficheiro do Storage
    const { data: fileData, error: storageError } = await supabaseClient.storage
      .from('faturas-recibos')
      .download(file_path)

    if (storageError || !fileData) {
      return new Response(JSON.stringify({ error: 'Erro ao ler ficheiro do Storage' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 4. Converter para base64
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64 = btoa(String.fromCharCode(...uint8Array))
    
    // Determinar mime type
    const mimeType = recibo.mime_type || 'image/jpeg'
    const base64Data = `data:${mimeType};base64,${base64}`

    // 5. Chamar OpenAI Vision API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set')
    }

    const today = new Date().toISOString().split('T')[0]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RECEIPT_EXTRACTION_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Data
                }
              },
              {
                type: 'text',
                text: `Extraia os detalhes desta fatura/recibo. Data atual: ${today}`
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao chamar OpenAI API')
    }

    const aiData = await response.json()
    const aiResponseText = aiData.choices[0]?.message?.content || ''

    // 6. Parse JSON da resposta
    let extractedData: any = {}
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback: estrutura básica
      extractedData = {
        tipo: 'despesa',
        valor: 0,
        moeda: 'EUR',
        data: today,
        comerciante: '',
        descricao: 'Recibo processado',
        categoria: 'outro',
        confianca: 0.5,
      }
    }

    // 7. Validações e normalizações
    if (typeof extractedData.valor === 'string') {
      extractedData.valor = parseFloat(extractedData.valor.replace(',', '.').replace(/[^\d.-]/g, ''))
    }
    
    if (extractedData.confianca) {
      extractedData.confianca = Math.min(1, Math.max(0, parseFloat(extractedData.confianca)))
    } else {
      extractedData.confianca = 0.8
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

    // 8. Criar transação automaticamente
    const { data: transacao, error: transacaoError } = await supabaseClient
      .from('transacoes_financeiras')
      .insert({
        user_id: user_id,
        tipo: extractedData.tipo,
        valor: extractedData.valor,
        moeda: extractedData.moeda || 'EUR',
        data_transacao: extractedData.data,
        comerciante: extractedData.comerciante || null,
        descricao: extractedData.descricao,
        categoria: extractedData.categoria,
        recibo_url: file_path,
        recibo_filename: recibo.filename,
        estado: 'pendente',
        confianca_ai: extractedData.confianca,
        extraido_via: 'ocr',
        metadata: extractedData.metadata || null,
      })
      .select()
      .single()

    if (transacaoError) {
      console.error('Error creating transaction:', transacaoError)
      throw transacaoError
    }

    // 9. Atualizar recibo com ocr_processed e ocr_text
    await supabaseClient
      .from('recibos_transacoes')
      .update({
        ocr_processed: true,
        ocr_processed_at: new Date().toISOString(),
        ocr_text: aiResponseText,
        transacao_id: transacao.id,
      })
      .eq('id', recibo_id)

    // 10. Retornar resposta
    return new Response(JSON.stringify({
      success: true,
      data: {
        transacao_id: transacao.id,
        extracted_data: extractedData,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Error in process-receipt-ocr function:', error)
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Erro ao processar recibo automaticamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
