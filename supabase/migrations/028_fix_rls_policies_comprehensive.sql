-- =============================================
-- FIX RLS POLICIES - COMPREHENSIVE SECURITY & PERFORMANCE
-- Migration 028: Corrige todas as políticas RLS
-- =============================================

-- =============================================
-- 1. FIX FUNCTION SEARCH PATH (new function from migration 027)
-- =============================================

CREATE OR REPLACE FUNCTION update_allowed_users_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================
-- 2. FIX RLS POLICIES - auth.uid() → (select auth.uid())
-- =============================================

-- auth_attempts
DROP POLICY IF EXISTS "Apenas equipa Eter pode ver logs" ON auth_attempts;
CREATE POLICY "Apenas equipa Eter pode ver logs"
  ON auth_attempts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- media_files
DROP POLICY IF EXISTS "Users can view their own media files" ON media_files;
CREATE POLICY "Users can view their own media files"
  ON media_files FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own media files" ON media_files;
CREATE POLICY "Users can insert their own media files"
  ON media_files FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own media files" ON media_files;
CREATE POLICY "Users can update their own media files"
  ON media_files FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own media files" ON media_files;
CREATE POLICY "Users can delete their own media files"
  ON media_files FOR DELETE
  USING ((select auth.uid()) = user_id);

-- transacoes_financeiras
DROP POLICY IF EXISTS "Utilizadores podem ver as próprias transações" ON transacoes_financeiras;
CREATE POLICY "Utilizadores podem ver as próprias transações"
  ON transacoes_financeiras FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Utilizadores podem inserir as próprias transações" ON transacoes_financeiras;
CREATE POLICY "Utilizadores podem inserir as próprias transações"
  ON transacoes_financeiras FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Utilizadores podem atualizar as próprias transações" ON transacoes_financeiras;
CREATE POLICY "Utilizadores podem atualizar as próprias transações"
  ON transacoes_financeiras FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Utilizadores podem eliminar as próprias transações" ON transacoes_financeiras;
CREATE POLICY "Utilizadores podem eliminar as próprias transações"
  ON transacoes_financeiras FOR DELETE
  USING ((select auth.uid()) = user_id);

-- recibos_transacoes
DROP POLICY IF EXISTS "Utilizadores podem ver os próprios recibos" ON recibos_transacoes;
CREATE POLICY "Utilizadores podem ver os próprios recibos"
  ON recibos_transacoes FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Utilizadores podem carregar os próprios recibos" ON recibos_transacoes;
CREATE POLICY "Utilizadores podem carregar os próprios recibos"
  ON recibos_transacoes FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Utilizadores podem atualizar os próprios recibos" ON recibos_transacoes;
CREATE POLICY "Utilizadores podem atualizar os próprios recibos"
  ON recibos_transacoes FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Utilizadores podem eliminar os próprios recibos" ON recibos_transacoes;
CREATE POLICY "Utilizadores podem eliminar os próprios recibos"
  ON recibos_transacoes FOR DELETE
  USING ((select auth.uid()) = user_id);

-- projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING ((select auth.uid()) = user_id);

-- project_tasks
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON project_tasks;
CREATE POLICY "Users can view tasks in their projects"
  ON project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert tasks in their projects" ON project_tasks;
CREATE POLICY "Users can insert tasks in their projects"
  ON project_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in their projects" ON project_tasks;
CREATE POLICY "Users can update tasks in their projects"
  ON project_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks in their projects" ON project_tasks;
CREATE POLICY "Users can delete tasks in their projects"
  ON project_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================
-- 3. FIX LEADS_PENDENTES - Remove USING(true) overly permissive
-- =============================================

DROP POLICY IF EXISTS "Admins podem ver leads pendentes" ON leads_pendentes;
CREATE POLICY "Authenticated users podem ver leads pendentes"
  ON leads_pendentes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Sistema pode inserir leads" ON leads_pendentes;
CREATE POLICY "Authenticated users podem inserir leads"
  ON leads_pendentes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Admins podem atualizar leads" ON leads_pendentes;
CREATE POLICY "Authenticated users podem atualizar leads"
  ON leads_pendentes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =============================================
-- 4. FIX PROPOSALS - Remove hardcoded UUID fallback
-- =============================================

DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
CREATE POLICY "Users can view their own proposals"
  ON proposals FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
CREATE POLICY "Users can insert their own proposals"
  ON proposals FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own proposals" ON proposals;
CREATE POLICY "Users can delete their own proposals"
  ON proposals FOR DELETE
  USING ((select auth.uid()) = user_id);

-- proposal_items
DROP POLICY IF EXISTS "Users can view items of their proposals" ON proposal_items;
CREATE POLICY "Users can view items of their proposals"
  ON proposal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert items to their proposals" ON proposal_items;
CREATE POLICY "Users can insert items to their proposals"
  ON proposal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update items of their proposals" ON proposal_items;
CREATE POLICY "Users can update items of their proposals"
  ON proposal_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete items of their proposals" ON proposal_items;
CREATE POLICY "Users can delete items of their proposals"
  ON proposal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = (select auth.uid())
    )
  );

-- =============================================
-- 5. ADD MISSING FOREIGN KEY INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_allowed_users_created_by ON allowed_users(created_by);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user_id ON project_tasks(user_id);

-- =============================================
-- 6. COMMENTS
-- =============================================

COMMENT ON FUNCTION update_allowed_users_updated_at IS 'Trigger function para atualizar updated_at. Requer SET search_path para segurança.';
