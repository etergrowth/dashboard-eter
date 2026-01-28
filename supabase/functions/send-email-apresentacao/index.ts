import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template HTML do email de apresentação
const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apresentação Eter Growth</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background-color: #ffffff;
            padding: 0;
            line-height: 1.6;
            color: #1a1a1a;
        }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { padding: 40px 40px 20px 40px; }
        .logo { width: 28px; height: 28px; margin-bottom: 20px; }
        .logo img { width: 100%; height: 100%; display: block; }
        .content { padding: 0 40px 40px 40px; }
        .greeting { font-size: 16px; color: #1a1a1a; margin-bottom: 24px; font-weight: 600; }
        .main-text { color: #1a1a1a; font-size: 15px; margin-bottom: 20px; line-height: 1.6; font-weight: 400; }
        .screenshot-container { margin: 32px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; transition: transform 0.2s; cursor: pointer; }
        .screenshot-container:hover { border-color: #0066cc; opacity: 0.95; }
        .screenshot-container img { width: 100%; display: block; }
        .footer { padding: 40px; margin-top: 20px; border-top: 1px solid #f0f0f0; }
        .footer p { color: #737373; font-size: 13px; margin-bottom: 8px; line-height: 1.5; }
        @media only screen and (max-width: 600px) {
            .header { padding: 30px 24px 16px 24px; }
            .content { padding: 0 24px 30px 24px; }
            .footer { padding: 30px 24px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <img src="https://ozjafmkfabewxoyibirq.supabase.co/storage/v1/object/public/etergrowthweb/etergrowth.com.svg" alt="Eter Growth">
            </div>
        </div>
        <div class="content">
            <p class="greeting">Olá {{LEAD_NAME}},</p>
            <p class="main-text">
                O contacto através deste email surge na sequência da nossa tentativa de entrar em contacto com o gestor da empresa, onde nos foi pedido o envio de informação por escrito.
            </p>
            <p class="main-text">
                Contudo, em vez de enviarmos um email extenso e aborrecido que muito provalvelmente ninguém vai ler, <strong>achámos melhor optar por esta abordagem diferente.</strong>
            </p>
            <p class="main-text">
                Ao carregar no vídeo abaixo, o link irá redirecionar para a página onde se encontra a nossa apresentação. Desta forma, será possível saber um pouco mais sobre nós: qual é o nosso propósito e o motivo do contacto.
            </p>
            <a href="#" target="_blank" style="text-decoration: none; display: block;">
                <div class="screenshot-container">
                    <img src="https://ozjafmkfabewxoyibirq.supabase.co/storage/v1/object/public/etergrowthweb/YouTube_Thumbnail_apresentacao.png" alt="Ver Apresentação em Vídeo">
                </div>
            </a>
            <p class="main-text">
                Obrigado pela atenção,<br>
                A equipa Eter Growth
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Eter Growth. Todos os direitos reservados.</p>
            <p>Rua dos Fundões, 151 · São João da Madeira, Portugal</p>
        </div>
    </div>
</body>
</html>`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // 2. Obter dados da requisição
    const { lead_id, lead_name, lead_email } = await req.json();

    if (!lead_id || !lead_name || !lead_email) {
      return new Response(
        JSON.stringify({ error: 'lead_id, lead_name e lead_email são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead_email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // 3. Verificar se a lead pertence ao utilizador
    const { data: lead, error: leadError } = await supabase
      .from('leads_sandbox')
      .select('id, user_id, email')
      .eq('id', lead_id)
      .eq('user_id', user.id)
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead não encontrada ou sem permissão' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // 4. Obter credenciais Gmail das variáveis de ambiente
    const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
    const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
    const GMAIL_REFRESH_TOKEN = Deno.env.get('GMAIL_REFRESH_TOKEN');
    const GMAIL_FROM_EMAIL = Deno.env.get('GMAIL_FROM_EMAIL') || 'hello@etergrowth.com';
    const GMAIL_FROM_NAME = Deno.env.get('GMAIL_FROM_NAME') || 'Eter Growth';

    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
      console.error('Gmail credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Gmail não configurado. Verifique as variáveis de ambiente GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET e GMAIL_REFRESH_TOKEN.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // 5. Obter Access Token do Gmail
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        refresh_token: GMAIL_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error getting Gmail access token:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao autenticar com Gmail' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 6. Preparar HTML do email (substituir placeholder)
    const emailHtml = EMAIL_TEMPLATE.replace('{{LEAD_NAME}}', lead_name);

    // 7. Criar mensagem MIME
    const boundary = '----=_Part_' + Date.now();
    const message = [
      `From: ${GMAIL_FROM_NAME} <${GMAIL_FROM_EMAIL}>`,
      `To: ${lead_email}`,
      `Subject: Apresentação Eter Growth`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      '',
      emailHtml,
      '',
      `--${boundary}--`,
    ].join('\r\n');

    // Codificar em Base64 URL-safe
    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 8. Enviar email via Gmail API
    const gmailResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    );

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      console.error('Gmail API Error:', gmailResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao enviar email via Gmail API',
          details: errorText 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const gmailData = await gmailResponse.json();
    console.log('Email sent successfully, message ID:', gmailData.id);

    // 9. Criar atividade na timeline
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseAdmin
      .from('sandbox_activities')
      .insert({
        lead_id: lead_id,
        user_id: user.id,
        type: 'email_sent',
        direction: 'outbound',
        description: 'Email de apresentação enviado',
        metadata: {
          subject: 'Apresentação Eter Growth',
          sent_at: new Date().toISOString(),
          message_id: gmailData.id,
        },
        timestamp: new Date().toISOString(),
      });

    // 10. Atualizar status da lead para 'engaged' se estiver em 'prospecting'
    const { data: currentLead } = await supabaseAdmin
      .from('leads_sandbox')
      .select('status')
      .eq('id', lead_id)
      .single();

    if (currentLead?.status === 'prospecting') {
      await supabaseAdmin
        .from('leads_sandbox')
        .update({ status: 'engaged' })
        .eq('id', lead_id);
    }

    // 11. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message_id: gmailData.id,
        message: 'Email enviado com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-email-apresentacao function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido',
        details: 'Erro ao processar envio de email',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
