/**
 * OPENAI API - Análise de Leads
 * 
 * Este módulo utiliza a OpenAI API para analisar leads e atribuir scores de qualidade.
 * A análise considera vários fatores como clareza da mensagem, tipo de empresa, orçamento, etc.
 */

export interface LeadData {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  projeto: string;
  orcamento: string;
  mensagem?: string;
}

export interface AnaliseIA {
  pontos_positivos: string[];
  pontos_atencao: string[];
  recomendacao: string;
}

export interface LeadAnalysisResult {
  prioridade_ia: 'baixa' | 'media' | 'alta' | 'muito_alta';
  score_ia: number;
  analise_ia: AnaliseIA;
}

/**
 * System Prompt para análise de leads
 */
const SYSTEM_PROMPT = `Você é um assistente especializado em análise de leads para uma agência de marketing digital portuguesa chamada Eter Growth.

Sua tarefa é analisar leads recebidas através do formulário de contacto do website e fornecer:
1. Um score de qualidade (0-100)
2. Classificação de prioridade (baixa, media, alta, muito_alta)
3. Pontos positivos identificados
4. Pontos de atenção/alertas
5. Recomendação de ação

CRITÉRIOS DE AVALIAÇÃO (0-100):

Email Corporativo vs Pessoal (+20 pontos):
- Email corporativo (domínio próprio): +20
- Email corporativo com domínio relevante: +5 extra
- Email pessoal (gmail, hotmail, etc): +5

Qualidade da Empresa (+25 pontos):
- Empresa com website profissional: +15
- Empresa em setor de tecnologia/inovação: +10
- Empresa conhecida/grande: +10
- Startup/pequena empresa: +5

Mensagem (+20 pontos):
- Mensagem clara e objetiva: +15
- Menciona objetivos específicos: +10
- Detalhes sobre desafios: +10
- Mensagem genérica/curta: +5
- Mensagem vaga: 0

Orçamento (+20 pontos):
- > 10.000€: +20
- 5.000€ - 10.000€: +15
- 2.500€ - 5.000€: +10
- 1.000€ - 2.500€: +5
- < 1.000€ ou "Não sei": 0

Urgência/Timing (+10 pontos):
- Menciona deadline ou urgência: +10
- Projeto com timeline claro: +5

Informações de Contacto (+5 pontos):
- Telefone fornecido: +3
- Nome completo: +2

PRIORIDADES:
- 0-30: baixa
- 31-60: media  
- 61-80: alta
- 81-100: muito_alta

PONTOS DE ATENÇÃO (sempre verificar):
- Orçamento insuficiente para serviços premium
- Email pessoal (validar se tem poder de decisão)
- Falta de detalhes sobre o projeto
- Mensagem muito genérica
- Concorrentes disfarçados
- Solicitações irrealistas

FORMATO DE RESPOSTA:
Responda APENAS em formato JSON válido, sem markdown, sem explicações extras:

{
  "score": 85,
  "prioridade": "alta",
  "pontos_positivos": [
    "Email corporativo válido",
    "Empresa com website profissional",
    "Mensagem clara com objetivos definidos",
    "Orçamento adequado (5.000-10.000€)"
  ],
  "pontos_atencao": [
    "Verificar poder de decisão",
    "Confirmar timeline do projeto"
  ],
  "recomendacao": "Lead de alta qualidade. Contacto prioritário nas próximas 24h. Preparar proposta personalizada."
}`;

/**
 * Criar prompt do user com dados da lead
 */
function createUserPrompt(lead: LeadData): string {
  return `Analise esta lead:

Nome: ${lead.nome}
Email: ${lead.email}
Telefone: ${lead.telefone || 'Não fornecido'}
Empresa: ${lead.empresa || 'Não fornecida'}
Website: ${lead.website || 'Não fornecido'}
Projeto: ${lead.projeto}
Orçamento: ${lead.orcamento}
Mensagem: ${lead.mensagem || 'Não fornecida'}

Forneça a análise em JSON.`;
}

/**
 * Analisar lead usando OpenAI API
 */
export async function analisarLead(lead: LeadData): Promise<LeadAnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Validar se API key está configurada
  if (!apiKey) {
    console.warn('[OpenAI] API Key não configurada. Usando análise fallback.');
    return getFallbackAnalysis(lead);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modelo mais econômico e rápido
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: createUserPrompt(lead),
          },
        ],
        temperature: 0.3, // Baixa variabilidade para consistência
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OpenAI] Erro na API:', error);
      return getFallbackAnalysis(lead);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('[OpenAI] Resposta vazia da API');
      return getFallbackAnalysis(lead);
    }

    // Parse JSON response
    const analysisData = JSON.parse(content);

    // Mapear resposta para formato esperado
    return {
      score_ia: analysisData.score,
      prioridade_ia: analysisData.prioridade,
      analise_ia: {
        pontos_positivos: analysisData.pontos_positivos,
        pontos_atencao: analysisData.pontos_atencao,
        recomendacao: analysisData.recomendacao,
      },
    };

  } catch (error) {
    console.error('[OpenAI] Erro ao analisar lead:', error);
    return getFallbackAnalysis(lead);
  }
}

/**
 * Análise fallback quando OpenAI não está disponível
 * Usa regras simples baseadas nos dados da lead
 */
function getFallbackAnalysis(lead: LeadData): LeadAnalysisResult {
  let score = 50; // Score base
  const pontos_positivos: string[] = [];
  const pontos_atencao: string[] = [];

  // Email corporativo
  const emailDomain = lead.email.split('@')[1];
  const isPersonalEmail = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'sapo.pt'].includes(emailDomain);
  
  if (!isPersonalEmail) {
    score += 15;
    pontos_positivos.push('Email corporativo válido');
  } else {
    score += 5;
    pontos_atencao.push('Email pessoal - verificar poder de decisão');
  }

  // Empresa
  if (lead.empresa && lead.empresa.length > 3) {
    score += 10;
    pontos_positivos.push('Empresa identificada');
  } else {
    pontos_atencao.push('Empresa não fornecida');
  }

  // Website
  if (lead.website && lead.website.startsWith('http')) {
    score += 10;
    pontos_positivos.push('Website fornecido');
  }

  // Telefone
  if (lead.telefone) {
    score += 5;
    pontos_positivos.push('Telefone fornecido');
  }

  // Mensagem
  if (lead.mensagem && lead.mensagem.length > 50) {
    score += 10;
    pontos_positivos.push('Mensagem detalhada');
  } else if (lead.mensagem && lead.mensagem.length > 20) {
    score += 5;
  } else {
    pontos_atencao.push('Mensagem muito curta ou ausente');
  }

  // Orçamento
  const orcamentoMap: { [key: string]: number } = {
    '< 1.000€': 0,
    '1.000€ - 2.500€': 5,
    '2.500€ - 5.000€': 10,
    '5.000€ - 10.000€': 15,
    '> 10.000€': 20,
  };
  
  const orcamentoScore = orcamentoMap[lead.orcamento] ?? 0;
  score += orcamentoScore;
  
  if (orcamentoScore >= 10) {
    pontos_positivos.push(`Orçamento adequado (${lead.orcamento})`);
  } else {
    pontos_atencao.push('Orçamento limitado - verificar viabilidade');
  }

  // Projeto
  if (lead.projeto && lead.projeto.length > 10) {
    score += 5;
    pontos_positivos.push('Projeto especificado');
  }

  // Limitar score entre 0-100
  score = Math.max(0, Math.min(100, score));

  // Determinar prioridade
  let prioridade: 'baixa' | 'media' | 'alta' | 'muito_alta';
  if (score >= 81) prioridade = 'muito_alta';
  else if (score >= 61) prioridade = 'alta';
  else if (score >= 31) prioridade = 'media';
  else prioridade = 'baixa';

  return {
    score_ia: score,
    prioridade_ia: prioridade,
    analise_ia: {
      pontos_positivos,
      pontos_atencao,
      recomendacao: score >= 60 
        ? 'Lead com potencial. Recomenda-se contacto em 48h.'
        : 'Lead de qualidade média. Avaliar se está dentro do perfil ideal antes de prosseguir.',
    },
  };
}

/**
 * Verificar se a OpenAI está configurada
 */
export function isOpenAIConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}
