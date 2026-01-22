/**
 * TEMPLATES DE EMAIL
 * 
 * Este ficheiro contém os templates HTML dos emails utilizados no sistema de leads.
 * Os templates são carregados a partir dos ficheiros HTML na pasta emails_html/
 */

import emailNovaLeadHTML from '../../../emails_html/01_email_nova_lead.html?raw';
import emailRejeicaoHTML from '../../../emails_html/02_email_rejeicao_cliente.html?raw';
import emailConfirmacaoHTML from '../../../emails_html/03_email_confirmacao_cliente.html?raw';

export interface EmailTemplateData {
  // Template Nova Lead (para admin)
  NOME?: string;
  EMAIL?: string;
  TELEFONE?: string;
  EMPRESA?: string;
  WEBSITE?: string;
  PROJETO?: string;
  ORCAMENTO?: string;
  MENSAGEM?: string;
  SCORE_IA?: number;
  PRIORIDADE_IA?: string;
  PONTOS_POSITIVOS?: string[];
  PONTOS_ATENCAO?: string[];
  APROVAR_URL?: string;
  REJEITAR_URL?: string;
  
  // Template Rejeição/Confirmação (para cliente)
  NOME_CLIENTE?: string;
}

/**
 * Template: Email de Nova Lead (para o admin)
 * Notifica sobre uma nova lead do website com análise IA
 */
export function getEmailNovaLead(data: EmailTemplateData): string {
  let html = emailNovaLeadHTML;
  
  // Substituir dados da lead
  html = html.replace(/João Silva/g, data.NOME || 'N/A');
  html = html.replace(/joao\.silva@empresa\.pt/g, data.EMAIL || 'N/A');
  html = html.replace(/\+351 912 345 678/g, data.TELEFONE || 'N/A');
  html = html.replace(/Tech Solutions, Lda/g, data.EMPRESA || 'N/A');
  
  // Website
  if (data.WEBSITE) {
    const websiteDomain = data.WEBSITE.replace(/^https?:\/\//, '').replace(/\/$/, '');
    html = html.replace(/techsolutions\.pt/g, websiteDomain);
    html = html.replace(/https:\/\/techsolutions\.pt/g, data.WEBSITE);
  }
  
  // Projeto e Orçamento (adicionar à tabela)
  if (data.PROJETO || data.ORCAMENTO) {
    const projetoRow = data.PROJETO ? `
                        <tr style="background-color:#ffffff">
                            <td style="padding:12px 15px;font-family:Verdana, Geneva, sans-serif;font-size:13px;color:#666;font-weight:bold;border-bottom:1px solid #e0e0e0">Projeto</td>
                            <td style="padding:12px 15px;font-family:Verdana, Geneva, sans-serif;font-size:14px;color:#171d2b;border-bottom:1px solid #e0e0e0">${data.PROJETO}</td>
                        </tr>` : '';
    
    const orcamentoRow = data.ORCAMENTO ? `
                        <tr style="background-color:#f9f9f9">
                            <td style="padding:12px 15px;font-family:Verdana, Geneva, sans-serif;font-size:13px;color:#666;font-weight:bold;border-bottom:1px solid #e0e0e0">Orçamento</td>
                            <td style="padding:12px 15px;font-family:Verdana, Geneva, sans-serif;font-size:14px;color:#171d2b;border-bottom:1px solid #e0e0e0">${data.ORCAMENTO}</td>
                        </tr>` : '';
    
    // Inserir antes da linha de Website
    html = html.replace(
      /<tr style="background-color:#f9f9f9">\s*<td[^>]*>Website<\/td>/,
      projetoRow + orcamentoRow + '<tr style="background-color:#f9f9f9"><td style="padding:12px 15px;font-family:Verdana, Geneva, sans-serif;font-size:13px;color:#666;font-weight:bold;border-bottom:1px solid #e0e0e0">Website</td>'
    );
  }
  
  // Mensagem
  if (data.MENSAGEM) {
    html = html.replace(
      /Gostaria de saber mais sobre os vossos serviços de marketing digital e como podem ajudar a nossa empresa a crescer online\./g,
      data.MENSAGEM
    );
  }
  
  // Score IA
  if (data.SCORE_IA !== undefined) {
    html = html.replace(/85\/100/g, `${data.SCORE_IA}/100`);
    
    // Alterar cor do badge baseado no score
    let bgColor = '#4caf50'; // Verde (alta qualidade)
    let label = 'Lead de Alta Qualidade ⭐';
    
    if (data.SCORE_IA < 30) {
      bgColor = '#f44336'; // Vermelho
      label = 'Lead de Baixa Qualidade ⚠️';
    } else if (data.SCORE_IA < 60) {
      bgColor = '#ff9800'; // Laranja
      label = 'Lead de Qualidade Média 📊';
    } else if (data.SCORE_IA < 80) {
      bgColor = '#2196f3'; // Azul
      label = 'Lead de Boa Qualidade ✓';
    }
    
    html = html.replace(
      /background:linear-gradient\(135deg, #4caf50 0%, #66bb6a 100%\)/,
      `background:linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`
    );
    html = html.replace(/Lead de Alta Qualidade ⭐/g, label);
  }
  
  // Pontos Positivos
  if (data.PONTOS_POSITIVOS && data.PONTOS_POSITIVOS.length > 0) {
    const pontosHTML = data.PONTOS_POSITIVOS
      .map(ponto => `<li style="margin-bottom:8px">${ponto}</li>`)
      .join('\n                                                    ');
    
    html = html.replace(
      /<ul style="margin:0 0 15px;padding-left:20px">[\s\S]*?<\/ul>/,
      `<ul style="margin:0 0 15px;padding-left:20px">\n                                                    ${pontosHTML}\n                                                </ul>`
    );
  }
  
  // Pontos de Atenção
  if (data.PONTOS_ATENCAO && data.PONTOS_ATENCAO.length > 0) {
    const atencaoHTML = data.PONTOS_ATENCAO
      .map(ponto => `<li style="margin-bottom:8px">${ponto}</li>`)
      .join('\n                                                    ');
    
    html = html.replace(
      /<p[^>]*>⚠ Pontos de Atenção:<\/strong><\/p>\s*<ul style="margin:0;padding-left:20px">[\s\S]*?<\/ul>/,
      `<p style="margin:0 0 12px"><strong style="color:#ff7300">⚠ Pontos de Atenção:</strong></p>\n                                                <ul style="margin:0;padding-left:20px">\n                                                    ${atencaoHTML}\n                                                </ul>`
    );
  }
  
  // URLs de Ação
  if (data.APROVAR_URL) {
    html = html.replace(/\{\{APROVAR_URL\}\}/g, data.APROVAR_URL);
  }
  if (data.REJEITAR_URL) {
    html = html.replace(/\{\{REJEITAR_URL\}\}/g, data.REJEITAR_URL);
  }
  
  return html;
}

/**
 * Template: Email de Rejeição (para o cliente)
 * Informa ao cliente que a lead não foi aceite
 */
export function getEmailRejeicao(data: EmailTemplateData): string {
  let html = emailRejeicaoHTML;
  
  // Substituir nome do cliente
  if (data.NOME_CLIENTE) {
    html = html.replace(/\{\{NOME_CLIENTE\}\}/g, data.NOME_CLIENTE);
  }
  
  return html;
}

/**
 * Template: Email de Confirmação (para o cliente)
 * Confirma recebimento da lead e próximos passos
 */
export function getEmailConfirmacao(data: EmailTemplateData): string {
  let html = emailConfirmacaoHTML;
  
  // Substituir nome do cliente
  if (data.NOME_CLIENTE) {
    html = html.replace(/\{\{NOME_CLIENTE\}\}/g, data.NOME_CLIENTE);
  }
  
  return html;
}

/**
 * Validar se os templates foram carregados corretamente
 */
export function validateTemplates(): boolean {
  return !!(emailNovaLeadHTML && emailRejeicaoHTML && emailConfirmacaoHTML);
}
