-- Migration: Restringir criação de contas apenas a emails autorizados
-- Esta migration cria um trigger que impede a criação de contas não autorizadas
-- na tabela auth.users do Supabase

-- Função para validar emails autorizados
CREATE OR REPLACE FUNCTION public.validate_authorized_email()
RETURNS TRIGGER AS $$
DECLARE
  allowed_emails TEXT[] := ARRAY[
    'geral@etergrowth.com',
    'rivdrgc@gmail.com',
    'luisvaldorio@gmail.com'
  ];
BEGIN
  -- Verificar se o email está na lista de autorizados
  IF NOT (LOWER(NEW.email) = ANY(allowed_emails)) THEN
    RAISE EXCEPTION 'Email % não está autorizado a aceder a este sistema', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa ANTES de inserir novo utilizador
-- Este trigger impede que utilizadores não autorizados sejam criados
DROP TRIGGER IF EXISTS check_authorized_email ON auth.users;
CREATE TRIGGER check_authorized_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_authorized_email();

-- Tabela de log de tentativas de login (opcional mas recomendado)
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT
);

-- RLS na tabela de logs - apenas emails autorizados podem ver
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Remover policy antiga se existir
DROP POLICY IF EXISTS "Apenas equipa Eter pode ver logs" ON public.auth_attempts;

-- Criar policy para permitir apenas emails autorizados verem os logs
CREATE POLICY "Apenas equipa Eter pode ver logs"
  ON public.auth_attempts
  FOR SELECT
  USING (
    auth.email() IN (
      'geral@etergrowth.com',
      'rivdrgc@gmail.com', 
      'luisvaldorio@gmail.com'
    )
  );

-- Função para registar tentativas de login
-- Esta função pode ser chamada por Edge Functions ou triggers para logging
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.auth_attempts (email, success, ip_address, user_agent)
  VALUES (p_email, p_success, p_ip, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON FUNCTION public.validate_authorized_email() IS 
  'Valida se um email está na lista de emails autorizados antes de criar conta';

COMMENT ON TRIGGER check_authorized_email ON auth.users IS 
  'Impede criação de contas com emails não autorizados';

COMMENT ON TABLE public.auth_attempts IS 
  'Regista tentativas de login (autorizadas e não autorizadas)';
