/**
 * GMAIL API - Envio de Emails
 * 
 * Este módulo gerencia o envio de emails através da Gmail API.
 * Utiliza OAuth 2.0 para autenticação.
 * 
 * Setup necessário:
 * 1. Criar projeto no Google Cloud Console
 * 2. Ativar Gmail API
 * 3. Criar credenciais OAuth 2.0
 * 4. Executar autenticação inicial para obter refresh token
 * 5. Guardar credenciais em variáveis de ambiente
 */

import { getEmailNovaLead, getEmailRejeicao, getEmailConfirmacao, type EmailTemplateData } from './templates';
import emailApresentacaoHtml from '../../../emails_html/email_potencial_cliente.html?raw';

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Obter configuração da Gmail API a partir das variáveis de ambiente
 */
function getGmailConfig(): GmailConfig {
  const config: GmailConfig = {
    clientId: import.meta.env.VITE_GMAIL_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET || '',
    refreshToken: import.meta.env.VITE_GMAIL_REFRESH_TOKEN || '',
    fromEmail: import.meta.env.VITE_GMAIL_FROM_EMAIL || 'hello@etergrowth.com',
    fromName: import.meta.env.VITE_GMAIL_FROM_NAME || 'Eter Growth',
  };

  // Validar configuração
  const missingVars: string[] = [];
  if (!config.clientId) missingVars.push('VITE_GMAIL_CLIENT_ID');
  if (!config.clientSecret) missingVars.push('VITE_GMAIL_CLIENT_SECRET');
  if (!config.refreshToken) missingVars.push('VITE_GMAIL_REFRESH_TOKEN');

  if (missingVars.length > 0) {
    console.warn(
      `[Gmail] Variáveis de ambiente não configuradas: ${missingVars.join(', ')}\n` +
      'O envio de emails não funcionará até configurar estas variáveis.'
    );
  }

  return config;
}

/**
 * Obter Access Token usando o Refresh Token
 */
async function getAccessToken(config: GmailConfig): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao obter access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Criar mensagem MIME para envio via Gmail API
 */
function createMimeMessage(options: EmailOptions, config: GmailConfig): string {
  const boundary = '----=_Part_' + Date.now();
  
  const message = [
    `From: ${config.fromName} <${config.fromEmail}>`,
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    options.replyTo ? `Reply-To: ${options.replyTo}` : '',
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    options.html,
    '',
    `--${boundary}--`,
  ]
    .filter(line => line !== null && line !== undefined)
    .join('\r\n');

  // Codificar em Base64 URL-safe
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Enviar email através da Gmail API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const config = getGmailConfig();

    // Verificar se está configurado
    if (!config.clientId || !config.clientSecret || !config.refreshToken) {
      const errorMsg = '[Gmail] Configuração incompleta. Email NÃO será enviado.';
      console.error(errorMsg);
      
      // Em desenvolvimento, logar o email em vez de enviar
      if (import.meta.env.DEV) {
        console.warn('📧 [DEV MODE] Email que seria enviado:', {
          to: options.to,
          subject: options.subject,
          htmlLength: options.html.length,
        });
        console.warn('⚠️ [DEV MODE] Em produção, este email seria enviado. Em DEV, simula sucesso.');
        // Em DEV, retornar false para forçar configuração correta
        // Mas pode mudar para true se quiser simular sucesso em desenvolvimento
        return false; // Forçar configuração correta mesmo em DEV
      }
      
      throw new Error('Configuração do Gmail incompleta. Verifique as variáveis de ambiente.');
    }

    // Obter access token
    let accessToken: string;
    try {
      accessToken = await getAccessToken(config);
    } catch (tokenError) {
      console.error('❌ Erro ao obter access token:', tokenError);
      throw new Error(`Falha na autenticação Gmail: ${tokenError instanceof Error ? tokenError.message : 'Erro desconhecido'}`);
    }

    // Criar mensagem MIME
    const encodedMessage = createMimeMessage(options, config);

    // Enviar via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erro ao enviar email (${response.status})`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      console.error('❌ Erro da Gmail API:', errorMessage);
      throw new Error(errorMessage);
    }

    // Verificar resposta
    const responseData = await response.json();
    if (responseData.id) {
      console.log('✅ Email enviado com sucesso para:', options.to);
      console.log('📧 ID da mensagem:', responseData.id);
      return true;
    } else {
      throw new Error('Resposta inesperada da Gmail API');
    }

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    // Re-lançar o erro para que o chamador possa tratá-lo
    throw error;
  }
}

/**
 * Enviar email de Nova Lead para o admin
 */
export async function sendEmailNovaLead(
  leadData: EmailTemplateData,
  adminEmail: string
): Promise<boolean> {
  const html = getEmailNovaLead(leadData);
  
  return sendEmail({
    to: adminEmail,
    subject: `🌟 Nova Lead do Website - ${leadData.NOME || 'Sem Nome'}`,
    html,
    replyTo: leadData.EMAIL,
  });
}

/**
 * Enviar email de Rejeição para o cliente
 */
export async function sendEmailRejeicao(
  clientName: string,
  clientEmail: string
): Promise<boolean> {
  const html = getEmailRejeicao({ NOME_CLIENTE: clientName });
  
  return sendEmail({
    to: clientEmail,
    subject: 'Obrigado pelo seu contacto - Eter Growth',
    html,
  });
}

/**
 * Enviar email de Confirmação para o cliente
 */
export async function sendEmailConfirmacao(
  clientName: string,
  clientEmail: string
): Promise<boolean> {
  const html = getEmailConfirmacao({ NOME_CLIENTE: clientName });
  
  return sendEmail({
    to: clientEmail,
    subject: '🎉 Recebemos o seu contacto - Eter Growth',
    html,
  });
}

/**
 * Verificar se a configuração do Gmail está completa
 */
export function isGmailConfigured(): boolean {
  const config = getGmailConfig();
  return !!(config.clientId && config.clientSecret && config.refreshToken);
}

/**
 * Obter HTML do email de apresentação com nome personalizado
 */
export function getEmailApresentacaoHtml(leadName: string): string {
  // Substituir "Olá," por "Olá [Nome],"
  return emailApresentacaoHtml.replace(
    '<p class="greeting">Olá,</p>',
    `<p class="greeting">Olá ${leadName},</p>`
  );
}

/**
 * Enviar email de apresentação para um lead
 */
export async function sendEmailApresentacao(
  leadName: string,
  leadEmail: string
): Promise<boolean> {
  // Validar inputs
  if (!leadName || !leadName.trim()) {
    throw new Error('Nome do lead é obrigatório');
  }
  
  if (!leadEmail || !leadEmail.trim()) {
    throw new Error('Email do lead é obrigatório');
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(leadEmail)) {
    throw new Error('Email inválido');
  }

  const html = getEmailApresentacaoHtml(leadName.trim());

  try {
    const result = await sendEmail({
      to: leadEmail.trim(),
      subject: 'Apresentação Eter Growth',
      html,
    });
    return result;
  } catch (error) {
    // Re-lançar o erro para tratamento no componente
    throw error;
  }
}
