-- =============================================
-- RLS POLICIES FOR SERVICES TABLE
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone authenticated can view active services" ON services;
DROP POLICY IF EXISTS "Users can view all services" ON services;
DROP POLICY IF EXISTS "Users can manage services" ON services;
DROP POLICY IF EXISTS "Permitir inserção via função RPC" ON services;
DROP POLICY IF EXISTS "Bloquear leitura de submissões" ON services;
DROP POLICY IF EXISTS "Bloquear atualização de submissões" ON services;
DROP POLICY IF EXISTS "Bloquear eliminação de submissões" ON services;

-- Enable RLS (if not already enabled)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Block SELECT for anon and authenticated
CREATE POLICY "Bloquear leitura de submissões"
  ON services FOR SELECT
  TO anon, authenticated
  USING (false);

-- Block UPDATE for anon and authenticated
CREATE POLICY "Bloquear atualização de submissões"
  ON services FOR UPDATE
  TO anon, authenticated
  USING (false);

-- Block DELETE for anon and authenticated
CREATE POLICY "Bloquear eliminação de submissões"
  ON services FOR DELETE
  TO anon, authenticated
  USING (false);

-- =============================================
-- RPC FUNCTIONS FOR SERVICES
-- =============================================

-- Function to read services (bypasses RLS)
CREATE OR REPLACE FUNCTION get_services(
  p_include_inactive BOOLEAN DEFAULT false
)
RETURNS SETOF public.services
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_include_inactive THEN
    RETURN QUERY SELECT * FROM public.services ORDER BY name;
  ELSE
    RETURN QUERY SELECT * FROM public.services WHERE is_active = true ORDER BY name;
  END IF;
END;
$$;

-- Function to insert services (with security validations)
CREATE OR REPLACE FUNCTION insert_service(
  p_name TEXT,
  p_base_cost_per_hour DECIMAL(10, 2),
  p_markup_percentage DECIMAL(5, 2),
  p_final_hourly_rate DECIMAL(10, 2),
  p_description TEXT DEFAULT NULL
)
RETURNS public.services
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_service public.services;
  v_name_clean TEXT;
  v_description_clean TEXT;
BEGIN
  -- ============================================
  -- VALIDAÇÕES DE SEGURANÇA E ANTI-SQL INJECTION
  -- ============================================
  
  -- 1. Validar nome (mínimo 2 caracteres, máximo 200)
  v_name_clean := trim(p_name);
  IF v_name_clean IS NULL OR length(v_name_clean) < 2 OR length(v_name_clean) > 200 THEN
    RAISE EXCEPTION 'Nome inválido. Deve ter entre 2 e 200 caracteres.';
  END IF;
  
  -- Validar que nome não contém caracteres perigosos
  IF v_name_clean ~ '[<>''";\\]' THEN
    RAISE EXCEPTION 'Nome contém caracteres inválidos.';
  END IF;
  
  -- 2. Validar base_cost_per_hour (deve ser positivo)
  IF p_base_cost_per_hour IS NULL OR p_base_cost_per_hour < 0 THEN
    RAISE EXCEPTION 'Custo base por hora inválido. Deve ser um valor positivo.';
  END IF;
  
  IF p_base_cost_per_hour > 999999.99 THEN
    RAISE EXCEPTION 'Custo base por hora inválido. Valor muito alto.';
  END IF;
  
  -- 3. Validar markup_percentage (deve ser entre 0 e 100)
  IF p_markup_percentage IS NULL OR p_markup_percentage < 0 OR p_markup_percentage > 100 THEN
    RAISE EXCEPTION 'Markup inválido. Deve ser um valor entre 0 e 100.';
  END IF;
  
  -- 4. Validar final_hourly_rate (deve ser positivo e calculado corretamente)
  IF p_final_hourly_rate IS NULL OR p_final_hourly_rate < 0 THEN
    RAISE EXCEPTION 'Preço final por hora inválido. Deve ser um valor positivo.';
  END IF;
  
  IF p_final_hourly_rate > 999999.99 THEN
    RAISE EXCEPTION 'Preço final por hora inválido. Valor muito alto.';
  END IF;
  
  -- Validar que o cálculo está correto (com tolerância de 0.01 para arredondamentos)
  IF abs(p_final_hourly_rate - (p_base_cost_per_hour * (1 + p_markup_percentage / 100))) > 0.01 THEN
    RAISE EXCEPTION 'Preço final por hora não corresponde ao cálculo esperado.';
  END IF;
  
  -- 5. Validar descrição (se fornecida, máximo 1000 caracteres)
  IF p_description IS NOT NULL THEN
    v_description_clean := trim(p_description);
    IF length(v_description_clean) > 1000 THEN
      RAISE EXCEPTION 'Descrição inválida. Máximo 1000 caracteres.';
    END IF;
    
    -- Validar que descrição não contém caracteres perigosos
    IF v_description_clean ~ '[<>''";\\]' THEN
      RAISE EXCEPTION 'Descrição contém caracteres inválidos.';
    END IF;
  END IF;
  
  -- ============================================
  -- INSERÇÃO SEGURA (PROTEGIDA CONTRA SQL INJECTION)
  -- ============================================
  -- Todos os valores são passados como parâmetros, não como concatenação de strings
  -- Isso previne completamente SQL injection
  
  INSERT INTO public.services (
    name,
    base_cost_per_hour,
    markup_percentage,
    final_hourly_rate,
    description,
    is_active
  ) VALUES (
    v_name_clean,
    p_base_cost_per_hour,
    p_markup_percentage,
    p_final_hourly_rate,
    NULLIF(v_description_clean, ''),
    true
  )
  RETURNING * INTO v_service;
  
  RETURN v_service;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Já existe um serviço com este nome.';
  WHEN OTHERS THEN
    -- Não expor detalhes do erro para evitar information disclosure
    RAISE EXCEPTION 'Erro ao processar serviço. Por favor, tente novamente.';
END;
$$;

-- Function to update services (bypasses RLS with validations)
CREATE OR REPLACE FUNCTION update_service(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_base_cost_per_hour DECIMAL(10, 2) DEFAULT NULL,
  p_markup_percentage DECIMAL(5, 2) DEFAULT NULL,
  p_final_hourly_rate DECIMAL(10, 2) DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS public.services
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_service public.services;
  v_name_clean TEXT;
  v_description_clean TEXT;
BEGIN
  -- Verificar se o serviço existe
  SELECT * INTO v_service FROM public.services WHERE id = p_id;
  
  IF v_service IS NULL THEN
    RAISE EXCEPTION 'Serviço não encontrado.';
  END IF;
  
  -- ============================================
  -- VALIDAÇÕES DE SEGURANÇA
  -- ============================================
  
  -- Validar nome (se fornecido)
  IF p_name IS NOT NULL THEN
    v_name_clean := trim(p_name);
    IF length(v_name_clean) < 2 OR length(v_name_clean) > 200 THEN
      RAISE EXCEPTION 'Nome inválido. Deve ter entre 2 e 200 caracteres.';
    END IF;
    
    IF v_name_clean ~ '[<>''";\\]' THEN
      RAISE EXCEPTION 'Nome contém caracteres inválidos.';
    END IF;
  END IF;
  
  -- Validar base_cost_per_hour (se fornecido)
  IF p_base_cost_per_hour IS NOT NULL THEN
    IF p_base_cost_per_hour < 0 OR p_base_cost_per_hour > 999999.99 THEN
      RAISE EXCEPTION 'Custo base por hora inválido.';
    END IF;
  END IF;
  
  -- Validar markup_percentage (se fornecido)
  IF p_markup_percentage IS NOT NULL THEN
    IF p_markup_percentage < 0 OR p_markup_percentage > 100 THEN
      RAISE EXCEPTION 'Markup inválido. Deve ser um valor entre 0 e 100.';
    END IF;
  END IF;
  
  -- Validar final_hourly_rate (se fornecido)
  IF p_final_hourly_rate IS NOT NULL THEN
    IF p_final_hourly_rate < 0 OR p_final_hourly_rate > 999999.99 THEN
      RAISE EXCEPTION 'Preço final por hora inválido.';
    END IF;
  END IF;
  
  -- Validar descrição (se fornecida)
  IF p_description IS NOT NULL THEN
    v_description_clean := trim(p_description);
    IF length(v_description_clean) > 1000 THEN
      RAISE EXCEPTION 'Descrição inválida. Máximo 1000 caracteres.';
    END IF;
    
    IF v_description_clean ~ '[<>''";\\]' THEN
      RAISE EXCEPTION 'Descrição contém caracteres inválidos.';
    END IF;
  END IF;
  
  -- ============================================
  -- ATUALIZAÇÃO SEGURA
  -- ============================================
  
  UPDATE public.services
  SET
    name = COALESCE(v_name_clean, name),
    base_cost_per_hour = COALESCE(p_base_cost_per_hour, base_cost_per_hour),
    markup_percentage = COALESCE(p_markup_percentage, markup_percentage),
    final_hourly_rate = COALESCE(p_final_hourly_rate, final_hourly_rate),
    description = CASE 
      WHEN p_description IS NULL THEN description
      WHEN trim(p_description) = '' THEN NULL
      ELSE v_description_clean
    END,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_service;
  
  RETURN v_service;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Já existe um serviço com este nome.';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar serviço. Por favor, tente novamente.';
END;
$$;

-- Function to delete services (soft delete by setting is_active = false)
CREATE OR REPLACE FUNCTION delete_service(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_service public.services;
BEGIN
  -- Verificar se o serviço existe
  SELECT * INTO v_service FROM public.services WHERE id = p_id;
  
  IF v_service IS NULL THEN
    RAISE EXCEPTION 'Serviço não encontrado.';
  END IF;
  
  -- Soft delete (marcar como inativo)
  UPDATE public.services
  SET is_active = false, updated_at = NOW()
  WHERE id = p_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao eliminar serviço. Por favor, tente novamente.';
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_services TO anon;
GRANT EXECUTE ON FUNCTION public.get_services TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_service TO anon;
GRANT EXECUTE ON FUNCTION public.insert_service TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_service TO anon;
GRANT EXECUTE ON FUNCTION public.update_service TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_service TO anon;
GRANT EXECUTE ON FUNCTION public.delete_service TO authenticated;

-- Policy to allow INSERT via RPC function
-- Note: This policy allows INSERT operations, but the actual insert
-- will be done through the RPC function which has SECURITY DEFINER
CREATE POLICY "Permitir inserção via função RPC"
  ON services FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
