// @ts-nocheck - Deno runtime types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { extractText } from "npm:unpdf"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System prompt para extração de dados de recibos (imagem)
const RECEIPT_EXTRACTION_PROMPT = `Você é um assistente financeiro especializado em extrair informações de faturas e recibos em português de Portugal.

PRIMEIRO, verifique se a imagem é uma fatura, recibo, nota fiscal ou documento financeiro similar.

Se NÃO for um documento financeiro, retorne APENAS:
{
  "is_receipt": false,
  "error": "Este documento não parece ser uma fatura ou recibo. Por favor, carregue uma imagem de um documento financeiro válido."
}

Se FOR um documento financeiro válido, extraia e retorne APENAS:
{
  "is_receipt": true,
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

// System prompt para extração de dados de recibos (texto de PDF)
const PDF_TEXT_EXTRACTION_PROMPT = `Você é um assistente financeiro especializado em extrair informações de faturas e recibos em português de Portugal.

Abaixo está o texto extraído de um PDF. Analise se é uma fatura, recibo, nota fiscal ou documento financeiro similar.

Se NÃO for um documento financeiro, retorne APENAS:
{
  "is_receipt": false,
  "error": "Este documento não parece ser uma fatura ou recibo. Por favor, carregue um documento financeiro válido."
}

Se FOR um documento financeiro válido, extraia e retorne APENAS:
{
  "is_receipt": true,
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

    // Usar service_role key para operações internas (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Criar cliente com auth do utilizador para verificação
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Tentar obter utilizador (pode falhar se for service_role)
    let authenticatedUserId: string | null = null
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (!authError && user) {
      authenticatedUserId = user.id
    } else {
      // Se não conseguir obter user, verificar se é service_role pelo JWT
      const token = authHeader.replace('Bearer ', '')
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role === 'service_role') {
          console.log('Using service_role authentication')
          // Service role pode continuar - user_id virá do body
        } else {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          })
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      }
    }

    // 2. Obter dados da requisição
    const { recibo_id, file_path, user_id } = await req.json()
    console.log('Processing receipt:', { recibo_id, file_path, user_id })

    if (!recibo_id || !file_path || !user_id) {
      console.error('Missing required fields:', { recibo_id, file_path, user_id })
      return new Response(JSON.stringify({ error: 'recibo_id, file_path e user_id são obrigatórios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Verificar user_id - usar do JWT se disponível, senão do body
    const effectiveUserId = authenticatedUserId || user_id
    if (!effectiveUserId) {
      return new Response(JSON.stringify({ error: 'user_id é obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Verificar se o recibo pertence ao utilizador (usando admin para bypass RLS)
    const { data: recibo, error: reciboError } = await supabaseAdmin
      .from('recibos_transacoes')
      .select('*')
      .eq('id', recibo_id)
      .eq('user_id', effectiveUserId)
      .single()

    if (reciboError || !recibo) {
      return new Response(JSON.stringify({ error: 'Recibo não encontrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // 3. Ler ficheiro do Storage (usando admin para bypass RLS)
    const { data: fileData, error: storageError } = await supabaseAdmin.storage
      .from('faturas-recibos')
      .download(file_path)

    if (storageError || !fileData) {
      console.error('Storage download error:', storageError)
      return new Response(JSON.stringify({ error: 'Erro ao ler ficheiro do Storage', details: storageError?.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    console.log('File downloaded, size:', fileData.size, 'bytes')

    // 4. Converter para base64 (método seguro para ficheiros grandes)
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Converter em chunks para evitar stack overflow com ficheiros grandes
    let base64 = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      base64 += String.fromCharCode(...chunk)
    }
    base64 = btoa(base64)

    // Determinar mime type
    const mimeType = recibo.mime_type || 'image/jpeg'
    const isPdf = mimeType === 'application/pdf'

    // 5. Chamar OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured')
      throw new Error('OPENAI_API_KEY not set')
    }

    const today = new Date().toISOString().split('T')[0]
    let response: Response

    if (isPdf) {
      // Extrair texto do PDF usando unpdf
      console.log('Processing PDF file, extracting text...')

      let pdfText = ''
      try {
        const { text } = await extractText(uint8Array)
        pdfText = text
        console.log('PDF text extracted, length:', pdfText.length)
      } catch (pdfError: any) {
        console.error('Error extracting PDF text:', pdfError)

        // Atualizar recibo com erro
        await supabaseAdmin
          .from('recibos_transacoes')
          .update({
            ocr_processed: true,
            ocr_processed_at: new Date().toISOString(),
            ocr_text: `Erro ao processar PDF: ${pdfError.message}`,
          })
          .eq('id', recibo_id)

        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao extrair texto do PDF. O ficheiro pode estar corrompido ou protegido.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      if (!pdfText || pdfText.trim().length < 10) {
        // PDF sem texto seleccionável (provavelmente imagem escaneada)
        await supabaseAdmin
          .from('recibos_transacoes')
          .update({
            ocr_processed: true,
            ocr_processed_at: new Date().toISOString(),
            ocr_text: 'PDF sem texto extraível. Por favor, carregue uma imagem (JPEG, PNG) ou um PDF com texto seleccionável.',
          })
          .eq('id', recibo_id)

        return new Response(JSON.stringify({
          success: false,
          error: 'Este PDF não contém texto seleccionável (pode ser uma imagem escaneada). Por favor, carregue uma imagem JPEG/PNG ou um PDF com texto.',
          is_scanned_pdf: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Chamar GPT com texto do PDF
      console.log('Calling OpenAI API with PDF text...')
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: PDF_TEXT_EXTRACTION_PROMPT },
            {
              role: 'user',
              content: `Extraia os detalhes desta fatura/recibo. Data atual: ${today}\n\nTexto do documento:\n\n${pdfText}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })
    } else {
      // Processar imagem com Vision API
      const base64Data = `data:${mimeType};base64,${base64}`
      console.log('Calling OpenAI Vision API...')

      response = await fetch('https://api.openai.com/v1/chat/completions', {
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
    }

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('OpenAI API Error:', response.status, errorBody)
      throw new Error(`Erro ao chamar OpenAI API: ${response.status} - ${errorBody}`)
    }

    const aiData = await response.json()
    const aiResponseText = aiData.choices[0]?.message?.content || ''
    console.log('OpenAI response received, length:', aiResponseText.length)

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
      console.error('Error parsing AI response:', parseError, 'Response:', aiResponseText)
      // Fallback: estrutura básica
      extractedData = {
        is_receipt: true,
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

    // 6.1 Verificar se é um documento válido
    if (extractedData.is_receipt === false) {
      // Atualizar recibo como processado mas sem transação
      await supabaseAdmin
        .from('recibos_transacoes')
        .update({
          ocr_processed: true,
          ocr_processed_at: new Date().toISOString(),
          ocr_text: extractedData.error || 'Documento não reconhecido como fatura/recibo',
        })
        .eq('id', recibo_id)

      return new Response(JSON.stringify({
        success: false,
        error: extractedData.error || 'Este documento não parece ser uma fatura ou recibo válido.',
        is_receipt: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
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
    const { data: transacao, error: transacaoError } = await supabaseAdmin
      .from('transacoes_financeiras')
      .insert({
        user_id: effectiveUserId,
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
    console.log('Transaction created:', transacao.id)

    // 9. Atualizar recibo com ocr_processed e ocr_text
    await supabaseAdmin
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
