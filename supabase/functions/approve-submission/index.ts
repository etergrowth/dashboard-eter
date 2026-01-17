import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const submissionId = url.searchParams.get('id')
        const action = url.searchParams.get('action')

        if (!submissionId || !action) {
            return new Response('Missing parameters', { status: 400 })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (action === 'approve') {
            const { error } = await supabaseClient.rpc('approve_lead_from_submission', {
                submission_id: submissionId
            });

            if (error) throw error;

            return simpleHtmlResponse('Lead Aprovada!', '#22c55e');
        } else if (action === 'reject') {
            const { error } = await supabaseClient
                .from('form_submissions')
                .update({ status: 'rejected', processed_at: new Date().toISOString() })
                .eq('id', submissionId)

            if (error) throw error;

            return simpleHtmlResponse('Lead Rejeitada.', '#ef4444');
        } else {
            return new Response('Invalid action', { status: 400 })
        }

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

function simpleHtmlResponse(message: string, color: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>OK</title>
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background-color: white;
            }
            .ok { 
              font-size: 48px; 
              font-weight: bold; 
              color: ${color};
              animation: fadeOut 2s forwards 1s;
            }
            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
          </style>
          <script>
            setTimeout(() => { window.close(); }, 3000);
          </script>
        </head>
        <body>
          <div class="ok">OK</div>
        </body>
      </html>
    `
    return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    })
}
