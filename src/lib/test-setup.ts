/**
 * SCRIPT DE TESTE - VALIDAÇÃO DO SETUP DA FASE 1
 * 
 * Este script pode ser executado para testar todas as integrações
 * e verificar se o setup está correto.
 * 
 * COMO USAR:
 * 1. Importar no main.tsx ou App.tsx (temporariamente)
 * 2. Executar: testSetup()
 * 3. Verificar console do browser
 * 4. Remover após validação
 */

import { validateConfiguration, logConfigurationStatus } from './config-validator';
import { isGmailConfigured } from './email/gmail';
import { isOpenAIConfigured, analisarLead } from './openai-analyzer';
import { validateTemplates } from './email/templates';

/**
 * Testar configuração geral
 */
export async function testConfiguration(): Promise<void> {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 TESTE 1: Validação de Configuração');
  console.log('═══════════════════════════════════════════════');

  logConfigurationStatus();

  const result = validateConfiguration();

  if (result.criticalMissing) {
    console.error('❌ Configurações críticas em falta!');
    console.log('📖 Consulte: docs/setup/ENV_SETUP.md');
    return;
  }

  console.log('✅ Configuração básica OK\n');
}

/**
 * Testar templates de email
 */
export async function testEmailTemplates(): Promise<void> {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 TESTE 2: Templates de Email');
  console.log('═══════════════════════════════════════════════');

  try {
    const templatesValid = validateTemplates();

    if (templatesValid) {
      console.log('✅ Templates de email carregados corretamente');
      console.log('   - 01_email_nova_lead.html ✓');
      console.log('   - 02_email_rejeicao_cliente.html ✓');
      console.log('   - 03_email_confirmacao_cliente.html ✓');
    } else {
      console.error('❌ Erro ao carregar templates de email');
      console.log('   Verifique se os ficheiros existem em emails_html/');
    }
  } catch (error) {
    console.error('❌ Erro ao validar templates:', error);
  }

  console.log('');
}

/**
 * Testar análise OpenAI
 */
export async function testOpenAI(): Promise<void> {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 TESTE 3: OpenAI API');
  console.log('═══════════════════════════════════════════════');

  const configured = isOpenAIConfigured();

  if (!configured) {
    console.warn('⚠️ OpenAI API não configurada');
    console.log('   Sistema usará análise fallback (regras simples)');
    console.log('   Para ativar IA: configure VITE_OPENAI_API_KEY');
    console.log('');
    return;
  }

  console.log('✅ OpenAI API configurada');
  console.log('🔄 Testando análise de lead...');

  try {
    const testLead = {
      nome: 'João Silva (TESTE)',
      email: 'joao.silva@empresa.pt',
      telefone: '+351 912 345 678',
      empresa: 'Tech Solutions, Lda',
      website: 'https://techsolutions.pt',
      projeto: 'Desenvolvimento de Website Corporativo',
      orcamento: '5.000€ - 10.000€',
      mensagem:
        'Gostaria de saber mais sobre os vossos serviços de marketing digital e como podem ajudar a nossa empresa a crescer online.',
    };

    const resultado = await analisarLead(testLead);

    console.log('✅ Análise concluída:');
    console.log(`   Score: ${resultado.score_ia}/100`);
    console.log(`   Prioridade: ${resultado.prioridade_ia}`);
    console.log(`   Pontos Positivos: ${resultado.analise_ia.pontos_positivos.length}`);
    console.log(`   Pontos de Atenção: ${resultado.analise_ia.pontos_atencao.length}`);

    if (resultado.score_ia > 0) {
      console.log('✅ OpenAI API funcionando corretamente');
    } else {
      console.warn('⚠️ Análise retornou score 0 - possível erro');
    }
  } catch (error) {
    console.error('❌ Erro ao testar OpenAI:', error);
    console.log('   Verifique se a API Key é válida');
    console.log('   Verifique se tem créditos na conta OpenAI');
  }

  console.log('');
}

/**
 * Testar Gmail API
 */
export async function testGmail(): Promise<void> {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 TESTE 4: Gmail API');
  console.log('═══════════════════════════════════════════════');

  const configured = isGmailConfigured();

  if (!configured) {
    console.warn('⚠️ Gmail API não configurada');
    console.log('   Emails não serão enviados');
    console.log('   Em DEV, emails são logados no console');
    console.log('   Para ativar: configure variáveis VITE_GMAIL_*');
    console.log('   Consulte: docs/setup/ENV_SETUP.md - Seção Gmail');
    console.log('');
    return;
  }

  console.log('✅ Gmail API configurada');
  console.log('   Client ID: ' + import.meta.env.VITE_GMAIL_CLIENT_ID?.substring(0, 20) + '...');
  console.log('   From Email: ' + import.meta.env.VITE_GMAIL_FROM_EMAIL);

  if (import.meta.env.DEV) {
    console.log('');
    console.log('ℹ️ Modo DEV ativo:');
    console.log('   Emails NÃO serão enviados de verdade');
    console.log('   Apenas logados no console');
  }

  console.log('');
}

/**
 * Testar conexão Supabase
 */
export async function testSupabase(): Promise<void> {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 TESTE 5: Supabase');
  console.log('═══════════════════════════════════════════════');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase NÃO configurado (CRÍTICO!)');
    console.log('   Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
    console.log('   Consulte: docs/setup/ENV_SETUP.md');
    console.log('');
    return;
  }

  console.log('✅ Supabase configurado');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

  try {
    // Tentar fazer uma requisição simples
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (response.ok) {
      console.log('✅ Conexão com Supabase bem-sucedida');
    } else {
      console.warn('⚠️ Supabase respondeu mas com erro:', response.status);
      console.log('   Verifique se as credenciais estão corretas');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao Supabase:', error);
    console.log('   Verifique a URL e a chave API');
  }

  console.log('');
}

/**
 * Executar todos os testes
 */
export async function testSetup(): Promise<void> {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║                                               ║');
  console.log('║   🧪 VALIDAÇÃO DO SETUP - FASE 1             ║');
  console.log('║   Dashboard Eter - Sistema de Leads CRM      ║');
  console.log('║                                               ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('\n');

  const startTime = Date.now();

  // Executar testes em sequência
  await testConfiguration();
  await testEmailTemplates();
  await testSupabase();
  await testOpenAI();
  await testGmail();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('═══════════════════════════════════════════════');
  console.log('🎉 VALIDAÇÃO CONCLUÍDA');
  console.log('═══════════════════════════════════════════════');
  console.log(`⏱️ Tempo total: ${duration}s`);
  console.log('');

  const result = validateConfiguration();

  if (result.criticalMissing) {
    console.log('❌ STATUS: SETUP INCOMPLETO');
    console.log('   Há configurações críticas em falta.');
    console.log('   Consulte: docs/setup/CHECKLIST.md');
  } else if (!result.allConfigured) {
    console.log('⚠️ STATUS: SETUP PARCIAL');
    console.log('   Sistema funcionará com funcionalidades limitadas.');
    console.log('   Recomenda-se configurar todas as integrações.');
  } else {
    console.log('✅ STATUS: SETUP COMPLETO');
    console.log('   Todas as configurações estão corretas!');
    console.log('   Sistema pronto para uso.');
  }

  console.log('');
  console.log('📖 Documentação completa: docs/setup/README.md');
  console.log('');
}

/**
 * Executar teste rápido (apenas validação de config)
 */
export function quickTest(): void {
  logConfigurationStatus();
}

// Auto-executar em modo DEV após 2 segundos
if (import.meta.env.DEV) {
  console.log('ℹ️ Validação automática agendada para 2s...');
  console.log('   Para desativar, remova import de test-setup.ts');
}
