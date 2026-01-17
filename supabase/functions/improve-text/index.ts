import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { text } = await req.json()

        if (!text || text.length < 20) {
            return new Response(JSON.stringify({ error: 'Texto muito curto' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not set')
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'system',
                    content: `Você é um assistente de redação comercial especializado em B2B tech. Sua tarefa é melhorar descrições de problemas/desafios de negócio de potenciais clientes.

INSTRUÇÕES:
1. Manter a essência e os factos do texto original
2. Tornar mais claro, estruturado e profissional
3. Adicionar contexto técnico quando relevante
4. Usar linguagem business-friendly (evitar jargão excessivo)
5. Máximo 250 palavras
6. Tom: Profissional mas acessível

OUTPUT: Apenas o texto melhorado em português de Portugal, sem explicações adicionais.`
                }, {
                    role: 'user',
                    content: text
                }],
                max_tokens: 500,
                temperature: 0.7,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('OpenAI API error:', error)
            throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const improvedText = data.choices?.[0]?.message?.content || text

        return new Response(JSON.stringify({ improvedText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Error in improve-text function:', error)
        return new Response(JSON.stringify({
            error: error.message,
            details: 'Verifique se a OPENAI_API_KEY está configurada corretamente no Supabase'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
