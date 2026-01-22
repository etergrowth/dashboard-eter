-- =============================================
-- FIX PROPOSAL_ITEMS RLS POLICIES
-- =============================================
-- Ajustar as RLS policies de proposal_items para funcionar sem autenticação

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can view items of their proposals" ON proposal_items;
DROP POLICY IF EXISTS "Users can insert items to their proposals" ON proposal_items;
DROP POLICY IF EXISTS "Users can update items of their proposals" ON proposal_items;
DROP POLICY IF EXISTS "Users can delete items of their proposals" ON proposal_items;

-- Recriar policies permitindo acesso quando:
-- 1. O usuário está autenticado E é dono da proposta (auth.uid() = proposals.user_id)
-- 2. OU quando não há autenticação E a proposta usa o UUID de fallback

CREATE POLICY "Users can view items of their proposals"
  ON proposal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = auth.uid()
        OR (auth.uid() IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

CREATE POLICY "Users can insert items to their proposals"
  ON proposal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = auth.uid()
        OR (auth.uid() IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

CREATE POLICY "Users can update items of their proposals"
  ON proposal_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = auth.uid()
        OR (auth.uid() IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

CREATE POLICY "Users can delete items of their proposals"
  ON proposal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = auth.uid()
        OR (auth.uid() IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );
