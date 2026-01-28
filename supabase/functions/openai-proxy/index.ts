// @ts-nocheck - Deno runtime types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Verify user with Supabase Auth
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

    // 2. Parse request body
    const { action, messages, model, temperature, max_tokens, image_data } = await req.json()

    // Validate action
    if (!action || !['chat', 'vision', 'chatkit_session'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action. Must be: chat, vision, or chatkit_session' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Get OpenAI API key from environment (secure, server-side)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured in Edge Function secrets')
      return new Response(JSON.stringify({ error: 'OpenAI API not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 4. Handle different actions
    let response: Response

    if (action === 'chatkit_session') {
      // Create ChatKit session
      const workflowId = Deno.env.get('OPENAI_WORKFLOW_ID')
      if (!workflowId) {
        return new Response(JSON.stringify({ error: 'Workflow ID not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'chatkit_beta=v1',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          workflow: { id: workflowId },
          user: user.id, // Use authenticated user's ID
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ChatKit session error:', response.status, errorText)
        return new Response(JSON.stringify({ error: 'Failed to create ChatKit session' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        })
      }

      const sessionData = await response.json()
      return new Response(JSON.stringify(sessionData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'chat' || action === 'vision') {
      // Validate messages
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Messages array is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Build request body for chat/vision
      const requestBody: any = {
        model: model || 'gpt-4o-mini',
        messages: messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 500,
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error:', response.status, errorText)
        return new Response(JSON.stringify({ error: 'OpenAI API request failed', details: errorText }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        })
      }

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Should not reach here
    return new Response(JSON.stringify({ error: 'Unhandled action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })

  } catch (error: any) {
    console.error('Error in openai-proxy function:', error)
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
