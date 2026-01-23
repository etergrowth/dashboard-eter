-- =============================================
-- ADD MISSING FOREIGN KEY INDEXES
-- Migration 019: Adiciona índices para foreign keys que estão faltando
-- =============================================

-- =============================================
-- 1. INTERACTIONS
-- =============================================

-- Foreign key: interactions_client_id_fkey
CREATE INDEX IF NOT EXISTS idx_interactions_client_id ON interactions(client_id);

-- Foreign key: interactions_user_id_fkey
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);

-- =============================================
-- 2. LEADS_PENDENTES
-- =============================================

-- Foreign key: leads_pendentes_client_id_fkey
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_client_id ON leads_pendentes(client_id);

-- Foreign key: leads_pendentes_decidido_por_fkey
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_decidido_por ON leads_pendentes(decidido_por);

-- =============================================
-- 3. NOTIFICAÇÕES
-- =============================================

-- Foreign key: notificacoes_client_id_fkey
CREATE INDEX IF NOT EXISTS idx_notificacoes_client_id ON notificacoes(client_id);

-- =============================================
-- 4. PROPOSAL_ITEMS
-- =============================================

-- Foreign key: fk_proposal_items_proposal
CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal_id ON proposal_items(proposal_id);

-- =============================================
-- 5. PROPOSALS
-- =============================================

-- Foreign key: proposals_user_id_fkey
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON INDEX idx_interactions_client_id IS 'Índice para foreign key interactions_client_id_fkey - melhora performance de joins e verificações de FK';
COMMENT ON INDEX idx_interactions_user_id IS 'Índice para foreign key interactions_user_id_fkey - melhora performance de joins e verificações de FK';
COMMENT ON INDEX idx_leads_pendentes_client_id IS 'Índice para foreign key leads_pendentes_client_id_fkey - melhora performance de joins e verificações de FK';
COMMENT ON INDEX idx_leads_pendentes_decidido_por IS 'Índice para foreign key leads_pendentes_decidido_por_fkey - melhora performance de joins e verificações de FK';
COMMENT ON INDEX idx_notificacoes_client_id IS 'Índice para foreign key notificacoes_client_id_fkey - melhora performance de joins e verificações de FK';
COMMENT ON INDEX idx_proposal_items_proposal_id IS 'Índice para foreign key fk_proposal_items_proposal - melhora performance de joins e verificações de FK';
COMMENT ON INDEX idx_proposals_user_id IS 'Índice para foreign key proposals_user_id_fkey - melhora performance de joins e verificações de FK';
