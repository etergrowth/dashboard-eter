/**
 * VALIDADOR DE CONFIGURAÇÃO
 * 
 * Este módulo verifica se todas as variáveis de ambiente e integrações
 * estão configuradas corretamente antes de usar o sistema de leads.
 */

import { isGmailConfigured } from './email/gmail';
import { isOpenAIConfigured } from './openai-analyzer';

export interface ConfigStatus {
  service: string;
  configured: boolean;
  required: boolean;
  message: string;
  vars: string[];
}

export interface ValidationResult {
  allConfigured: boolean;
  criticalMissing: boolean;
  statuses: ConfigStatus[];
  summary: string;
}

/**
 * Validar todas as configurações necessárias
 */
export function validateConfiguration(): ValidationResult {
  const statuses: ConfigStatus[] = [];

  // 1. Supabase (CRÍTICO)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabaseConfigured = !!(supabaseUrl && supabaseKey);

  statuses.push({
    service: 'Supabase',
    configured: supabaseConfigured,
    required: true,
    message: supabaseConfigured
      ? '✅ Supabase configurado corretamente'
      : '❌ Supabase NÃO configurado (CRÍTICO)',
    vars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
  });

  // 2. OpenAI (IMPORTANTE, mas tem fallback)
  const openAIConfigured = isOpenAIConfigured();

  statuses.push({
    service: 'OpenAI API',
    configured: openAIConfigured,
    required: false,
    message: openAIConfigured
      ? '✅ OpenAI API configurada (análise IA ativa)'
      : '⚠️ OpenAI API NÃO configurada (usando análise fallback)',
    vars: ['VITE_OPENAI_API_KEY'],
  });

  // 3. Gmail (IMPORTANTE, mas pode funcionar sem)
  const gmailConfigured = isGmailConfigured();

  statuses.push({
    service: 'Gmail API',
    configured: gmailConfigured,
    required: false,
    message: gmailConfigured
      ? '✅ Gmail API configurada (emails ativos)'
      : '⚠️ Gmail API NÃO configurada (emails desativados)',
    vars: [
      'VITE_GMAIL_CLIENT_ID',
      'VITE_GMAIL_CLIENT_SECRET',
      'VITE_GMAIL_REFRESH_TOKEN',
      'VITE_GMAIL_FROM_EMAIL',
    ],
  });

  // 4. reCAPTCHA (RECOMENDADO)
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const recaptchaSecretKey = import.meta.env.VITE_RECAPTCHA_SECRET_KEY;
  const recaptchaConfigured = !!(recaptchaSiteKey && recaptchaSecretKey);

  statuses.push({
    service: 'reCAPTCHA',
    configured: recaptchaConfigured,
    required: false,
    message: recaptchaConfigured
      ? '✅ reCAPTCHA configurado (proteção anti-spam ativa)'
      : '⚠️ reCAPTCHA NÃO configurado (recomendado para produção)',
    vars: ['VITE_RECAPTCHA_SITE_KEY', 'VITE_RECAPTCHA_SECRET_KEY'],
  });

  // 5. Admin Email (RECOMENDADO)
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminEmailConfigured = !!adminEmail;

  statuses.push({
    service: 'Admin Email',
    configured: adminEmailConfigured,
    required: false,
    message: adminEmailConfigured
      ? `✅ Email do admin configurado (${adminEmail})`
      : '⚠️ Email do admin NÃO configurado (usar fallback)',
    vars: ['VITE_ADMIN_EMAIL'],
  });

  // 6. App URLs (RECOMENDADO)
  const appUrl = import.meta.env.VITE_APP_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  const urlsConfigured = !!(appUrl && apiUrl);

  statuses.push({
    service: 'App URLs',
    configured: urlsConfigured,
    required: false,
    message: urlsConfigured
      ? '✅ URLs da aplicação configuradas'
      : '⚠️ URLs da aplicação NÃO configuradas (usando defaults)',
    vars: ['VITE_APP_URL', 'VITE_API_URL'],
  });

  // Análise geral
  const allConfigured = statuses.every((s) => s.configured);
  const criticalMissing = statuses.some((s) => s.required && !s.configured);

  // Gerar sumário
  let summary = '';
  const configuredCount = statuses.filter((s) => s.configured).length;
  const totalCount = statuses.length;

  if (allConfigured) {
    summary = `🎉 Todas as configurações estão corretas! (${configuredCount}/${totalCount})`;
  } else if (criticalMissing) {
    summary = `❌ Configuração CRÍTICA em falta! Sistema não funcionará corretamente.`;
  } else {
    summary = `⚠️ Sistema funcional, mas algumas integrações estão desativadas (${configuredCount}/${totalCount} configuradas).`;
  }

  return {
    allConfigured,
    criticalMissing,
    statuses,
    summary,
  };
}

/**
 * Exibir status de configuração no console
 */
export function logConfigurationStatus(): void {
  const result = validateConfiguration();

  console.group('🔧 Status de Configuração - Sistema de Leads');
  console.log(result.summary);
  console.log('');

  result.statuses.forEach((status) => {
    const icon = status.configured ? '✅' : status.required ? '❌' : '⚠️';
    console.log(`${icon} ${status.service}`);
    console.log(`   ${status.message}`);
    
    if (!status.configured) {
      console.log(`   Variáveis necessárias: ${status.vars.join(', ')}`);
    }
    console.log('');
  });

  if (result.criticalMissing) {
    console.error('⚠️ ATENÇÃO: Configure as variáveis críticas antes de usar o sistema!');
    console.log('📖 Consulte docs/setup/ENV_SETUP.md para instruções detalhadas.');
  } else if (!result.allConfigured) {
    console.warn('💡 Dica: Configure as integrações opcionais para funcionalidade completa.');
    console.log('📖 Consulte docs/setup/ENV_SETUP.md para instruções detalhadas.');
  }

  console.groupEnd();
}

/**
 * Obter variáveis de ambiente em falta
 */
export function getMissingEnvVars(): string[] {
  const result = validateConfiguration();
  const missing: string[] = [];

  result.statuses.forEach((status) => {
    if (!status.configured) {
      missing.push(...status.vars);
    }
  });

  return missing;
}

/**
 * Verificar se o sistema pode funcionar (configurações críticas OK)
 */
export function canSystemOperate(): boolean {
  const result = validateConfiguration();
  return !result.criticalMissing;
}

/**
 * Obter link para documentação de setup
 */
export function getSetupDocsLink(): string {
  return '/docs/setup/ENV_SETUP.md';
}

/**
 * Gerar relatório detalhado em formato texto
 */
export function generateTextReport(): string {
  const result = validateConfiguration();
  let report = '═══════════════════════════════════════════════════════\n';
  report += '  RELATÓRIO DE CONFIGURAÇÃO - SISTEMA DE LEADS CRM\n';
  report += '═══════════════════════════════════════════════════════\n\n';

  report += `Status Geral: ${result.summary}\n\n`;

  result.statuses.forEach((status, index) => {
    report += `${index + 1}. ${status.service}\n`;
    report += `   Status: ${status.configured ? 'CONFIGURADO ✓' : 'NÃO CONFIGURADO ✗'}\n`;
    report += `   Obrigatório: ${status.required ? 'Sim' : 'Não'}\n`;
    report += `   ${status.message}\n`;
    
    if (!status.configured) {
      report += `   Variáveis necessárias:\n`;
      status.vars.forEach((v) => {
        report += `      - ${v}\n`;
      });
    }
    report += '\n';
  });

  report += '═══════════════════════════════════════════════════════\n';
  report += `Data: ${new Date().toLocaleString('pt-PT')}\n`;
  report += '═══════════════════════════════════════════════════════\n';

  return report;
}

/**
 * Auto-validar na inicialização (apenas em DEV)
 */
if (import.meta.env.DEV) {
  // Executar validação automaticamente em modo DEV
  setTimeout(() => {
    logConfigurationStatus();
  }, 1000);
}
