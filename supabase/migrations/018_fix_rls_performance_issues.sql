-- =============================================
-- FIX RLS PERFORMANCE ISSUES
-- Migration 018: Corrige problemas de performance em políticas RLS
-- Substitui auth.uid() por (select auth.uid()) para evitar reavaliação por linha
-- =============================================

-- =============================================
-- 1. INTERACTIONS
-- =============================================

DROP POLICY IF EXISTS "Users can manage their own interactions" ON interactions;
CREATE POLICY "Users can manage their own interactions"
  ON interactions FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =============================================
-- 2. NOTIFICAÇÕES
-- =============================================

DROP POLICY IF EXISTS "Users veem suas notificações" ON notificacoes;
CREATE POLICY "Users veem suas notificações"
  ON notificacoes FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Sistema cria notificações" ON notificacoes;
CREATE POLICY "Sistema cria notificações"
  ON notificacoes FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users atualizam suas notificações" ON notificacoes;
CREATE POLICY "Users atualizam suas notificações"
  ON notificacoes FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users deletam suas notificações" ON notificacoes;
CREATE POLICY "Users deletam suas notificações"
  ON notificacoes FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================
-- 3. PROFILES
-- =============================================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

-- =============================================
-- 4. PROPOSALS
-- =============================================

DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
CREATE POLICY "Users can view their own proposals"
  ON proposals FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR ((select auth.uid()) IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
CREATE POLICY "Users can insert their own proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    OR ((select auth.uid()) IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING (
    (select auth.uid()) = user_id
    OR ((select auth.uid()) IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

DROP POLICY IF EXISTS "Users can delete their own proposals" ON proposals;
CREATE POLICY "Users can delete their own proposals"
  ON proposals FOR DELETE
  USING (
    (select auth.uid()) = user_id
    OR ((select auth.uid()) IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

-- =============================================
-- 5. PROPOSAL_ITEMS
-- =============================================

DROP POLICY IF EXISTS "Users can view items of their proposals" ON proposal_items;
CREATE POLICY "Users can view items of their proposals"
  ON proposal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = (select auth.uid())
        OR ((select auth.uid()) IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert items to their proposals" ON proposal_items;
CREATE POLICY "Users can insert items to their proposals"
  ON proposal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = (select auth.uid())
        OR ((select auth.uid()) IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

DROP POLICY IF EXISTS "Users can update items of their proposals" ON proposal_items;
CREATE POLICY "Users can update items of their proposals"
  ON proposal_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = (select auth.uid())
        OR ((select auth.uid()) IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete items of their proposals" ON proposal_items;
CREATE POLICY "Users can delete items of their proposals"
  ON proposal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND (
        proposals.user_id = (select auth.uid())
        OR ((select auth.uid()) IS NULL AND proposals.user_id = '00000000-0000-0000-0000-000000000001'::UUID)
      )
    )
  );

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON POLICY "Users can manage their own interactions" ON interactions IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users veem suas notificações" ON notificacoes IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Sistema cria notificações" ON notificacoes IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users atualizam suas notificações" ON notificacoes IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users deletam suas notificações" ON notificacoes IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can update own profile" ON profiles IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can view their own proposals" ON proposals IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can insert their own proposals" ON proposals IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can update their own proposals" ON proposals IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can delete their own proposals" ON proposals IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can view items of their proposals" ON proposal_items IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can insert items to their proposals" ON proposal_items IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can update items of their proposals" ON proposal_items IS 
  'Política otimizada com (select auth.uid()) para melhor performance';

COMMENT ON POLICY "Users can delete items of their proposals" ON proposal_items IS 
  'Política otimizada com (select auth.uid()) para melhor performance';
