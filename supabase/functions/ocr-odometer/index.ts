// @ts-nocheck - Deno runtime types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OCR_PROMPT = `You are an expert at reading odometer displays from car dashboards.

Your task is to extract the exact kilometer reading shown in the odometer/speedometer of the car dashboard image.

IMPORTANT RULES:
1. Look for the odometer display (usually shows total kilometers/miles driven)
2. The odometer is typically a digital or analog display showing a number like "123456 km" or just "123456"
3. Focus on the TOTAL DISTANCE reading, NOT the trip meter (partial distance)
4. If the image is unclear or doesn't show an odometer, indicate that
5. Return ONLY the numeric value, without units

Respond ONLY with valid JSON in this exact format:
{
  "success": true,
  "km_reading": <number or null if unclear>,
  "confidence": <number from 0 to 1>,
  "notes": "<brief explanation if needed>"
}

If you cannot read the odometer clearly, respond with:
{
  "success": false,
  "km_reading": null,
  "confidence": 0,
  "notes": "Cannot read odometer - <reason>"
}`

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

    // 2. Obter dados da requisição
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Preparar imagem para OpenAI
    const imageMime = mimeType || 'image/jpeg'
    const base64Data = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${imageMime};base64,${imageBase64}`

    // 4. Chamar OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured')
      throw new Error('OPENAI_API_KEY not set')
    }

    console.log('Calling OpenAI Vision API for odometer OCR...')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: OCR_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Data,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: 'Read the odometer/kilometer reading from this car dashboard image.'
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('OpenAI API Error:', response.status, errorBody)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiData = await response.json()
    const aiResponseText = aiData.choices[0]?.message?.content || ''
    console.log('OpenAI response:', aiResponseText)

    // 5. Parse JSON da resposta
    let result: any = {}
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      result = {
        success: false,
        km_reading: null,
        confidence: 0,
        notes: 'Failed to parse AI response',
      }
    }

    // 6. Validar e normalizar resultado
    if (result.km_reading !== null) {
      // Remove any non-numeric characters and convert to integer
      const cleanValue = String(result.km_reading).replace(/[^\d]/g, '')
      result.km_reading = parseInt(cleanValue, 10) || null
    }

    // Ensure confidence is between 0 and 1
    result.confidence = Math.min(1, Math.max(0, result.confidence || 0))

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Error in ocr-odometer function:', error)
    return new Response(JSON.stringify({
      success: false,
      km_reading: null,
      confidence: 0,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
