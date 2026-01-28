-- =============================================
-- CREATE ALLOWED_USERS TABLE
-- Migration 027: Tabela para controlar emails autorizados
-- =============================================

-- Criar tabela de utilizadores autorizados
CREATE TABLE IF NOT EXISTS public.allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Comentário
COMMENT ON TABLE public.allowed_users IS 'Lista de emails autorizados a aceder ao dashboard. Substitui a whitelist hardcoded.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_allowed_users_email ON public.allowed_users(email);
CREATE INDEX IF NOT EXISTS idx_allowed_users_is_active ON public.allowed_users(is_active);

-- RLS
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Apenas service_role pode gerir utilizadores autorizados
-- Utilizadores autenticados podem verificar se um email está autorizado
CREATE POLICY "Service role can manage allowed_users"
  ON public.allowed_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can only read
CREATE POLICY "Authenticated users can check emails"
  ON public.allowed_users FOR SELECT
  TO authenticated
  USING (true);

-- Inserir utilizadores iniciais (migração da whitelist hardcoded)
INSERT INTO public.allowed_users (email, name, role, is_active)
VALUES
  ('geral@etergrowth.com', 'Eter Growth', 'admin', true),
  ('rivdrgc@gmail.com', 'Ricardo', 'admin', true),
  ('luisvaldorio@gmail.com', 'Luis', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Função RPC para verificar se email está autorizado
CREATE OR REPLACE FUNCTION is_email_allowed(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.allowed_users
    WHERE email = lower(p_email)
    AND is_active = true
  );
END;
$$;

-- Trigger para updated_at
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

CREATE TRIGGER trigger_allowed_users_updated_at
  BEFORE UPDATE ON public.allowed_users
  FOR EACH ROW
  EXECUTE FUNCTION update_allowed_users_updated_at();
