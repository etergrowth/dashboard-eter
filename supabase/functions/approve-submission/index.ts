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

        // Initialize Supabase Admin Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get Submission
        const { data: submission, error: fetchError } = await supabaseClient
            .from('form_submissions')
            .select('*')
            .eq('id', submissionId)
            .single()

        if (fetchError || !submission) {
            return new Response('Submission not found', { status: 404 })
        }

        if (submission.status !== 'pending') {
            return new Response(`This submission has already been ${submission.status}.`, {
                headers: { "Content-Type": "text/html" }
            })
        }

        let message = '';
        let color = '';

        if (action === 'approve') {
            // 2. Insert into Clients (CRM)
            // Combine extra fields into notes
            const notes = `
Origem: Website Form
Projeto: ${submission.tipo_projeto || 'N/A'}
Orçamento: ${submission.orcamento || 'N/A'}
Localização Outros: ${submission.localizacao_outros || 'N/A'}
Tipo Outros: ${submission.tipo_projeto_outros || 'N/A'}
Privacidade: ${submission.consentimento_privacidade ? 'Sim' : 'Não'}
        `.trim();

            const { error: insertError } = await supabaseClient
                .from('clients')
                .insert({
                    name: submission.nome,
                    email: submission.email,
                    phone: submission.telefone,
                    address: submission.localizacao,
                    notes: notes,
                    status: 'lead', // Initial CRM status
                    priority: 'medium',
                    created_at: new Date().toISOString()
                })

            if (insertError) {
                throw insertError
            }

            // 3. Update Submission Status
            await supabaseClient
                .from('form_submissions')
                .update({ status: 'approved', processed_at: new Date().toISOString() })
                .eq('id', submissionId)

            message = 'Lead Aprovada e Adicionada ao CRM!';
            color = '#22c55e'; // Green

        } else if (action === 'reject') {
            // Update Status only
            await supabaseClient
                .from('form_submissions')
                .update({ status: 'rejected', processed_at: new Date().toISOString() })
                .eq('id', submissionId)

            message = 'Lead Rejeitada.';
            color = '#ef4444'; // Red
        } else {
            return new Response('Invalid action', { status: 400 })
        }

        // Return HTML Success Page
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ação Concluída</title>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; }
            .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
            h1 { color: ${color}; margin-bottom: 10px; }
            p { color: #4b5563; }
            a { display: inline-block; margin-top: 20px; text-decoration: none; color: #ea580c; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${message}</h1>
            <p>A ação foi registada com sucesso no sistema.</p>
            <p><small>ID: ${submissionId}</small></p>
          </div>
        </body>
      </html>
    `

        return new Response(html, {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
