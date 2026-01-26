// Tipos para Leads Pendentes (INBOUND)

export type LeadPendenteEstado = 'pendente' | 'aprovado' | 'rejeitado';
export type PrioridadeIA = 'baixa' | 'media' | 'alta' | 'muito_alta';

export interface AnaliseIA {
  pontos_positivos: string[];
  pontos_atencao: string[];
  recomendacao: string;
}

export interface LeadPendente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  projeto: string;
  orcamento: string;
  mensagem?: string;
  prioridade_ia?: PrioridadeIA;
  analise_ia?: AnaliseIA;
  score_ia?: number;
  approval_token: string;
  estado: LeadPendenteEstado;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  data_criacao: string;
  data_decisao?: string;
  decidido_por?: string;
  client_id?: string;
}

export interface LeadsPendentesStats {
  total_pendentes: number;
  total_aprovadas: number;
  total_rejeitadas: number;
  score_medio: number | null;
  por_prioridade: {
    muito_alta: number;
    alta: number;
    media: number;
    baixa: number;
  };
}

export interface AprovarLeadResponse {
  success: boolean;
  sandbox_id?: string;
  client_id?: string; // Legacy, mantido para compatibilidade
  message?: string;
  error?: string;
}

export interface RejeitarLeadResponse {
  success: boolean;
  message?: string;
  error?: string;
}
