import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN");
const ADMIN_EMAIL = "geral@etergrowth.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const payload = await req.json();
        const record = payload.record; // Webhook payload

        if (!record || !record.email) {
            throw new Error("Invalid payload");
        }

        if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
            throw new Error("Missing Gmail credentials");
        }

        // 1. Refresh Access Token
        const tokens = await refreshAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);
        const accessToken = tokens.access_token;
        if (!accessToken) throw new Error("Failed to get access token");

        // 2. Prepare Email
        const approvalLink = `${SUPABASE_URL}/functions/v1/approve-submission?id=${record.id}&action=approve`;
        const rejectLink = `${SUPABASE_URL}/functions/v1/approve-submission?id=${record.id}&action=reject`;

        // Simple HTML Template with Inline CSS for email compatibility
        const emailBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ea580c;">Nova Lead do Website</h2>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Nome:</strong> ${record.nome}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${record.email}">${record.email}</a></p>
          <p style="margin: 5px 0;"><strong>Telefone:</strong> ${record.telefone || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Projeto:</strong> ${record.tipo_projeto || 'N/A'}</p>
           <p style="margin: 5px 0;"><strong>Orçamento:</strong> ${record.orcamento || 'N/A'}</p>
        </div>
        
        <p style="margin-bottom: 20px;">Deseja adicionar esta lead ao CRM?</p>
        
        <div style="text-align: center;">
          <a href="${approvalLink}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Aprovar Lead</a>
          <a href="${rejectLink}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Rejeitar</a>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
          Dashboard Eter Automation
        </p>
      </div>
    `;

        // 3. Send Email
        await sendGmail(accessToken, ADMIN_EMAIL, "🎯 Nova Lead - Aprovação Necessária", emailBody);

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});

async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to refresh token: ${txt}`);
    }
    return response.json();
}

async function sendGmail(accessToken: string, to: string, subject: string, htmlBody: string) {
    const emailLines = [
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        htmlBody
    ];

    // Base64Url encode
    const email = emailLines.join("\n");
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            raw: encodedEmail
        })
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to send email: ${txt}`);
    }
    return response.json();
}
