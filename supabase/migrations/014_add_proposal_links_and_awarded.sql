-- =============================================
-- ADD LINKS AND AWARDED FIELDS TO PROPOSALS
-- =============================================
-- Adiciona campos para links e status de adjudicação

-- Adicionar campo links (JSONB para armazenar array de links)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- Adicionar campo awarded (boolean para indicar se foi adjudicada)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS awarded BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN proposals.links IS 'Array de links relacionados à proposta (ex: documentos, propostas, etc)';
COMMENT ON COLUMN proposals.awarded IS 'Indica se a proposta foi adjudicada/ganha';
