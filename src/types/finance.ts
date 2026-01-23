// Tipos auxiliares para o sistema Finance AI Agent

export type TipoTransacao = 'receita' | 'despesa';
export type EstadoTransacao = 'pendente' | 'verificado' | 'rejeitado';
export type ExtraidoVia = 'texto' | 'ocr' | 'manual';

export interface CategoriaTransacao {
  id: string;
  nome: string;
  nome_display: string;
  cor: string | null;
  icone: string | null;
  tipo: 'receita' | 'despesa' | 'ambos' | null;
  ativa: boolean | null;
  ordem: number | null;
}

export interface TransacaoFinanceira {
  id: string;
  user_id: string;
  tipo: TipoTransacao;
  valor: number;
  moeda: string;
  data_transacao: string;
  comerciante: string | null;
  descricao: string;
  categoria: string;
  recibo_url: string | null;
  recibo_filename: string | null;
  estado: EstadoTransacao;
  confianca_ai: number | null;
  extraido_via: ExtraidoVia | null;
  criado_em: string;
  atualizado_em: string;
  verificado_em: string | null;
  metadata: Record<string, any> | null;
}

export interface ReciboTransacao {
  id: string;
  transacao_id: string | null;
  user_id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  ocr_text: string | null;
  ocr_processed: boolean | null;
  ocr_processed_at: string | null;
  criado_em: string;
}

// Dados extraídos pelo AI Agent
export interface DadosExtraidosAI {
  tipo: TipoTransacao;
  valor: number;
  moeda: string;
  data: string; // YYYY-MM-DD
  comerciante: string;
  descricao: string;
  categoria: string;
  confianca: number; // 0-1
  metadata?: Record<string, any>;
}

// Dados do formulário de preview
export interface TransactionDraft {
  tipo: TipoTransacao;
  valor: number;
  moeda: string;
  data_transacao: string;
  comerciante: string;
  descricao: string;
  categoria: string;
  recibo_url?: string;
  recibo_filename?: string;
  extraido_via: ExtraidoVia;
  confianca_ai?: number;
  metadata?: Record<string, any>;
}

// Mensagem do chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// Resposta da Edge Function
export interface ProcessTransactionResponse {
  success: boolean;
  data?: DadosExtraidosAI;
  error?: string;
}

// Upload de ficheiro
export interface UploadedFile {
  url: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  reciboId?: string;
}
