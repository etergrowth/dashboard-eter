import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { client } = await req.json()
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

        if (!OPENAI_API_KEY) {
            throw new Error('Missing OpenAI API Key')
        }

        const prompt = `
            Você é um especialista em vendas e análise de leads.
            Analise os seguintes dados de um potencial cliente e forneça um parecer detalhado.
            
            DADOS DO CLIENTE:
            Nome: ${client.name}
            Empresa: ${client.company}
            Setor: ${client.sector}
            Faturamento: ${client.revenue}
            Investimento: ${client.investment}
            Objetivo: ${client.main_objective}
            Notas Adicionais: ${client.notes}
            Interações: ${client.interactions}

            REQUISITOS DA RESPOSTA:
            1. Forneça um resumo/análise detalhada (markdown).
            2. Atribua um score de 0 a 100 baseado na qualidade do lead.
            3. Determine a urgência (baixa, media, alta).

            Sua resposta deve ser um JSON válido no formato:
            {
              "analysis": "conteúdo em markdown...",
              "score": 85,
              "urgency": "alta"
            }
        `

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um assistente útil que analisa leads de vendas.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" }
            }),
        })

        const aiData = await response.json()
        const result = JSON.parse(aiData.choices[0].message.content)

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
