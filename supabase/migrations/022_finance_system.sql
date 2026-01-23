-- Migration: Criar sistema de Finanças (Finance AI Agent)
-- Esta migration cria as tabelas, funções e triggers necessários para o sistema de gestão financeira

-- ============================================================================
-- 1. TABELA: categorias_transacoes
-- ============================================================================
CREATE TABLE categorias_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) UNIQUE NOT NULL,
  nome_display VARCHAR(100) NOT NULL,
  cor VARCHAR(7), -- Código hex de cor
  icone VARCHAR(50), -- Nome do ícone ou emoji
  tipo VARCHAR(10) CHECK (tipo IN ('receita', 'despesa', 'ambos')),
  ativa BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categorias_transacoes IS 'Categorias pré-definidas para classificação de transações financeiras';
COMMENT ON COLUMN categorias_transacoes.nome IS 'Nome interno da categoria (ex: software_saas)';
COMMENT ON COLUMN categorias_transacoes.nome_display IS 'Nome para exibição (ex: Software & SaaS)';
COMMENT ON COLUMN categorias_transacoes.tipo IS 'Tipo de transação: receita, despesa ou ambos';

-- Inserir categorias padrão (EM PORTUGUÊS)
INSERT INTO categorias_transacoes (nome, nome_display, cor, icone, tipo, ordem) VALUES
  ('software_saas', 'Software & SaaS', '#3B82F6', '💻', 'despesa', 1),
  ('viagens', 'Viagens', '#8B5CF6', '✈️', 'despesa', 2),
  ('refeicoes', 'Refeições', '#EF4444', '🍽️', 'despesa', 3),
  ('material_escritorio', 'Material de Escritório', '#10B981', '📦', 'despesa', 4),
  ('receitas', 'Receitas', '#22C55E', '💰', 'receita', 5),
  ('subscricoes', 'Subscrições', '#F59E0B', '🔄', 'despesa', 6),
  ('servicos_publicos', 'Serviços Públicos', '#6366F1', '⚡', 'despesa', 7),
  ('marketing', 'Marketing', '#EC4899', '📢', 'despesa', 8),
  ('servicos_profissionais', 'Serviços Profissionais', '#14B8A6', '🤝', 'despesa', 9),
  ('outro', 'Outro', '#6B7280', '📋', 'ambos', 99);

-- RLS Policy (leitura para todos os autenticados)
ALTER TABLE categorias_transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias visíveis para utilizadores autenticados"
  ON categorias_transacoes FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 2. TABELA: transacoes_financeiras
-- ============================================================================
CREATE TABLE transacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados core da transação
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  moeda VARCHAR(3) DEFAULT 'EUR',
  data_transacao DATE NOT NULL,
  
  -- Campos de descrição
  comerciante VARCHAR(255),
  descricao TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  
  -- Recibo/Fatura
  recibo_url TEXT,
  recibo_filename VARCHAR(255),
  
  -- Tracking de estado
  estado VARCHAR(20) DEFAULT 'pendente' CHECK (estado IN ('pendente', 'verificado', 'rejeitado')),
  
  -- Metadata de processamento AI
  confianca_ai DECIMAL(3, 2), -- 0.00 a 1.00
  extraido_via VARCHAR(20) CHECK (extraido_via IN ('texto', 'ocr', 'manual')),
  
  -- Campos de auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  verificado_em TIMESTAMPTZ,
  
  -- Metadata adicional (JSON para campos extras como NIF, nº fatura)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Comentários para documentação
COMMENT ON TABLE transacoes_financeiras IS 'Tabela principal de transações financeiras (entradas e saídas)';
COMMENT ON COLUMN transacoes_financeiras.tipo IS 'Tipo de transação: receita (entrada) ou despesa (saída)';
COMMENT ON COLUMN transacoes_financeiras.valor IS 'Valor da transação em formato decimal';
COMMENT ON COLUMN transacoes_financeiras.categoria IS 'Categoria da transação (ex: software_saas, refeicoes, viagens)';
COMMENT ON COLUMN transacoes_financeiras.metadata IS 'Dados adicionais em JSON (NIF, nº fatura, notas, etc.)';
COMMENT ON COLUMN transacoes_financeiras.confianca_ai IS 'Nível de confiança da extração AI (0.00 a 1.00)';
COMMENT ON COLUMN transacoes_financeiras.extraido_via IS 'Método de extração: texto (input natural), ocr (imagem), manual';

-- Índices para performance
CREATE INDEX idx_transacoes_user_data ON transacoes_financeiras(user_id, data_transacao DESC);
CREATE INDEX idx_transacoes_categoria ON transacoes_financeiras(categoria);
CREATE INDEX idx_transacoes_estado ON transacoes_financeiras(estado);
CREATE INDEX idx_transacoes_tipo ON transacoes_financeiras(tipo);
CREATE INDEX idx_transacoes_criado_em ON transacoes_financeiras(criado_em DESC);

-- Trigger para atualizar 'atualizado_em'
CREATE OR REPLACE FUNCTION atualizar_timestamp_transacoes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_timestamp_transacoes
BEFORE UPDATE ON transacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp_transacoes();

-- RLS Policies
ALTER TABLE transacoes_financeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem ver as próprias transações"
  ON transacoes_financeiras FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem inserir as próprias transações"
  ON transacoes_financeiras FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem atualizar as próprias transações"
  ON transacoes_financeiras FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem eliminar as próprias transações"
  ON transacoes_financeiras FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TABELA: recibos_transacoes
-- ============================================================================
CREATE TABLE recibos_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transacao_id UUID REFERENCES transacoes_financeiras(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informação do ficheiro
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Caminho no Supabase Storage
  file_size INTEGER, -- bytes
  mime_type VARCHAR(50),
  
  -- Dados de OCR/Processamento
  ocr_text TEXT, -- Texto extraído completo da imagem
  ocr_processed BOOLEAN DEFAULT false,
  ocr_processed_at TIMESTAMPTZ,
  
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE recibos_transacoes IS 'Armazenamento de referências a recibos/faturas carregados';
COMMENT ON COLUMN recibos_transacoes.file_path IS 'Caminho no bucket Supabase Storage (faturas-recibos)';
COMMENT ON COLUMN recibos_transacoes.ocr_text IS 'Texto completo extraído via OCR/Claude Vision';

-- Índices
CREATE INDEX idx_recibos_transacao ON recibos_transacoes(transacao_id);
CREATE INDEX idx_recibos_user ON recibos_transacoes(user_id);
CREATE INDEX idx_recibos_criado_em ON recibos_transacoes(criado_em DESC);

-- RLS Policies
ALTER TABLE recibos_transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem ver os próprios recibos"
  ON recibos_transacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem carregar os próprios recibos"
  ON recibos_transacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem atualizar os próprios recibos"
  ON recibos_transacoes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem eliminar os próprios recibos"
  ON recibos_transacoes FOR DELETE
  USING (auth.uid() = user_id);
