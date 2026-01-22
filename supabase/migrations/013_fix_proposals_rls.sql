-- =============================================
-- FIX PROPOSALS RLS POLICIES
-- =============================================
-- Ajustar as RLS policies de proposals para funcionar sem autenticação

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete their own proposals" ON proposals;

-- Recriar policies permitindo acesso quando:
-- 1. O usuário está autenticado E é dono da proposta (auth.uid() = user_id)
-- 2. OU quando não há autenticação E a proposta usa o UUID de fallback

CREATE POLICY "Users can view their own proposals"
  ON proposals FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.uid() IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

CREATE POLICY "Users can insert their own proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (auth.uid() IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (auth.uid() IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );

CREATE POLICY "Users can delete their own proposals"
  ON proposals FOR DELETE
  USING (
    user_id = auth.uid()
    OR (auth.uid() IS NULL AND user_id = '00000000-0000-0000-0000-000000000001'::UUID)
  );
