-- =============================================
-- RPC FUNCTIONS FOR CLIENTS
-- =============================================
-- Following the pattern from FORM_SUBMISSION_GUIDE.md
-- Using RPC functions for security and validation

-- Function to create a client
CREATE OR REPLACE FUNCTION public.submit_client(
  p_name TEXT,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT 'Portugal',
  p_status TEXT DEFAULT 'lead',
  p_priority TEXT DEFAULT 'medium',
  p_probability INTEGER DEFAULT 0,
  p_value DECIMAL(10, 2) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_id UUID;
    v_name_clean TEXT;
    v_email_clean TEXT;
    v_status_clean TEXT;
    v_priority_clean TEXT;
    v_user_id UUID;
BEGIN
    -- ============================================
    -- VALIDAÇÕES DE SEGURANÇA E ANTI-SQL INJECTION
    -- ============================================
    
    -- 1. Determinar user_id (usar auth.uid() se disponível, senão usar p_user_id)
    v_user_id := COALESCE(auth.uid(), p_user_id);
    
    -- 2. Validar user_id (obrigatório)
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID é obrigatório. É necessário estar autenticado ou fornecer um user_id válido.';
    END IF;
    
    -- 3. Validar nome (mínimo 2 caracteres, máximo 200)
    v_name_clean := trim(p_name);
    IF length(v_name_clean) < 2 OR length(v_name_clean) > 200 THEN
        RAISE EXCEPTION 'Nome inválido. Deve ter entre 2 e 200 caracteres.';
    END IF;
    
    -- 4. Validar email (se fornecido, formato básico e tamanho)
    IF p_email IS NOT NULL AND p_email != '' THEN
        v_email_clean := lower(trim(p_email));
        IF length(v_email_clean) < 5 OR length(v_email_clean) > 255 THEN
            RAISE EXCEPTION 'Email inválido.';
        END IF;
        
        IF position('@' in v_email_clean) = 0 OR position('.' in v_email_clean) = 0 THEN
            RAISE EXCEPTION 'Email inválido. Formato incorreto.';
        END IF;
        
        -- Validar que email não contém caracteres perigosos
        IF v_email_clean ~ '[<>''";\\]' THEN
            RAISE EXCEPTION 'Email contém caracteres inválidos.';
        END IF;
    END IF;
    
    -- 5. Validar telefone (se fornecido, máximo 50 caracteres)
    IF p_phone IS NOT NULL AND length(trim(p_phone)) > 50 THEN
        RAISE EXCEPTION 'Telefone inválido. Máximo 50 caracteres.';
    END IF;
    
    -- 6. Validar company (se fornecido, máximo 200 caracteres)
    IF p_company IS NOT NULL AND length(trim(p_company)) > 200 THEN
        RAISE EXCEPTION 'Empresa inválida. Máximo 200 caracteres.';
    END IF;
    
    -- 7. Validar address (se fornecido, máximo 500 caracteres)
    IF p_address IS NOT NULL AND length(trim(p_address)) > 500 THEN
        RAISE EXCEPTION 'Morada inválida. Máximo 500 caracteres.';
    END IF;
    
    -- 8. Validar city (se fornecido, máximo 200 caracteres)
    IF p_city IS NOT NULL AND length(trim(p_city)) > 200 THEN
        RAISE EXCEPTION 'Cidade inválida. Máximo 200 caracteres.';
    END IF;
    
    -- 9. Validar postal_code (se fornecido, máximo 20 caracteres)
    IF p_postal_code IS NOT NULL AND length(trim(p_postal_code)) > 20 THEN
        RAISE EXCEPTION 'Código postal inválido. Máximo 20 caracteres.';
    END IF;
    
    -- 10. Validar country (se fornecido, máximo 100 caracteres)
    IF p_country IS NOT NULL AND length(trim(p_country)) > 100 THEN
        RAISE EXCEPTION 'País inválido. Máximo 100 caracteres.';
    END IF;
    
    -- 11. Validar status (deve ser um dos valores permitidos)
    v_status_clean := lower(trim(COALESCE(p_status, 'lead')));
    IF v_status_clean NOT IN ('lead', 'proposal', 'negotiation', 'closed', 'lost') THEN
        RAISE EXCEPTION 'Status inválido. Deve ser: lead, proposal, negotiation, closed ou lost.';
    END IF;
    
    -- 12. Validar priority (deve ser um dos valores permitidos)
    v_priority_clean := lower(trim(COALESCE(p_priority, 'medium')));
    IF v_priority_clean NOT IN ('low', 'medium', 'high') THEN
        RAISE EXCEPTION 'Prioridade inválida. Deve ser: low, medium ou high.';
    END IF;
    
    -- 13. Validar probability (deve estar entre 0 e 100)
    IF p_probability < 0 OR p_probability > 100 THEN
        RAISE EXCEPTION 'Probabilidade inválida. Deve estar entre 0 e 100.';
    END IF;
    
    -- 14. Validar value (se fornecido, deve ser positivo e razoável)
    IF p_value IS NOT NULL AND (p_value < 0 OR p_value > 999999999.99) THEN
        RAISE EXCEPTION 'Valor inválido. Deve ser entre 0 e 999999999.99.';
    END IF;
    
    -- 15. Validar notes (se fornecido, máximo 2000 caracteres)
    IF p_notes IS NOT NULL AND length(trim(p_notes)) > 2000 THEN
        RAISE EXCEPTION 'Notas inválidas. Máximo 2000 caracteres.';
    END IF;
    
    -- ============================================
    -- INSERÇÃO SEGURA (PROTEGIDA CONTRA SQL INJECTION)
    -- ============================================
    
    INSERT INTO public.clients (
        user_id,
        name,
        email,
        phone,
        company,
        address,
        city,
        postal_code,
        country,
        latitude,
        longitude,
        status,
        priority,
        probability,
        value,
        notes,
        tags
    ) VALUES (
        v_user_id,
        v_name_clean,
        NULLIF(v_email_clean, ''),
        NULLIF(trim(COALESCE(p_phone, '')), ''),
        NULLIF(trim(COALESCE(p_company, '')), ''),
        NULLIF(trim(COALESCE(p_address, '')), ''),
        NULLIF(trim(COALESCE(p_city, '')), ''),
        NULLIF(trim(COALESCE(p_postal_code, '')), ''),
        COALESCE(NULLIF(trim(COALESCE(p_country, '')), ''), 'Portugal'),
        NULL,
        NULL,
        v_status_clean,
        v_priority_clean,
        COALESCE(p_probability, 0),
        p_value,
        NULLIF(trim(COALESCE(p_notes, '')), ''),
        NULL
    )
    RETURNING id INTO v_id;

    -- Retornar sucesso com o ID criado
    RETURN json_build_object(
        'success', true,
        'id', v_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Não expor detalhes do erro para evitar information disclosure
        RAISE EXCEPTION 'Erro ao criar cliente. Por favor, tente novamente.';
END;
$$;

-- Function to update a client
CREATE OR REPLACE FUNCTION public.update_client(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_probability INTEGER DEFAULT NULL,
  p_value DECIMAL(10, 2) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_name_clean TEXT;
    v_email_clean TEXT;
    v_status_clean TEXT;
    v_priority_clean TEXT;
    v_updated_id UUID;
BEGIN
    -- ============================================
    -- VALIDAÇÕES DE SEGURANÇA E ANTI-SQL INJECTION
    -- ============================================
    
    -- 1. Validar ID (obrigatório)
    IF p_id IS NULL THEN
        RAISE EXCEPTION 'ID do cliente é obrigatório.';
    END IF;
    
    -- 2. Verificar se o cliente existe
    SELECT id INTO v_updated_id FROM public.clients WHERE id = p_id;
    IF v_updated_id IS NULL THEN
        RAISE EXCEPTION 'Cliente não encontrado.';
    END IF;
    
    -- 3. Validar nome (se fornecido, mínimo 2 caracteres, máximo 200)
    IF p_name IS NOT NULL THEN
        v_name_clean := trim(p_name);
        IF length(v_name_clean) < 2 OR length(v_name_clean) > 200 THEN
            RAISE EXCEPTION 'Nome inválido. Deve ter entre 2 e 200 caracteres.';
        END IF;
    END IF;
    
    -- 4. Validar email (se fornecido, formato básico e tamanho)
    IF p_email IS NOT NULL AND p_email != '' THEN
        v_email_clean := lower(trim(p_email));
        IF length(v_email_clean) < 5 OR length(v_email_clean) > 255 THEN
            RAISE EXCEPTION 'Email inválido.';
        END IF;
        
        IF position('@' in v_email_clean) = 0 OR position('.' in v_email_clean) = 0 THEN
            RAISE EXCEPTION 'Email inválido. Formato incorreto.';
        END IF;
        
        -- Validar que email não contém caracteres perigosos
        IF v_email_clean ~ '[<>''";\\]' THEN
            RAISE EXCEPTION 'Email contém caracteres inválidos.';
        END IF;
    END IF;
    
    -- 5. Validar telefone (se fornecido, máximo 50 caracteres)
    IF p_phone IS NOT NULL AND length(trim(p_phone)) > 50 THEN
        RAISE EXCEPTION 'Telefone inválido. Máximo 50 caracteres.';
    END IF;
    
    -- 6. Validar company (se fornecido, máximo 200 caracteres)
    IF p_company IS NOT NULL AND length(trim(p_company)) > 200 THEN
        RAISE EXCEPTION 'Empresa inválida. Máximo 200 caracteres.';
    END IF;
    
    -- 7. Validar address (se fornecido, máximo 500 caracteres)
    IF p_address IS NOT NULL AND length(trim(p_address)) > 500 THEN
        RAISE EXCEPTION 'Morada inválida. Máximo 500 caracteres.';
    END IF;
    
    -- 8. Validar city (se fornecido, máximo 200 caracteres)
    IF p_city IS NOT NULL AND length(trim(p_city)) > 200 THEN
        RAISE EXCEPTION 'Cidade inválida. Máximo 200 caracteres.';
    END IF;
    
    -- 9. Validar postal_code (se fornecido, máximo 20 caracteres)
    IF p_postal_code IS NOT NULL AND length(trim(p_postal_code)) > 20 THEN
        RAISE EXCEPTION 'Código postal inválido. Máximo 20 caracteres.';
    END IF;
    
    -- 10. Validar country (se fornecido, máximo 100 caracteres)
    IF p_country IS NOT NULL AND length(trim(p_country)) > 100 THEN
        RAISE EXCEPTION 'País inválido. Máximo 100 caracteres.';
    END IF;
    
    -- 11. Validar status (se fornecido, deve ser um dos valores permitidos)
    IF p_status IS NOT NULL THEN
        v_status_clean := lower(trim(p_status));
        IF v_status_clean NOT IN ('lead', 'proposal', 'negotiation', 'closed', 'lost') THEN
            RAISE EXCEPTION 'Status inválido. Deve ser: lead, proposal, negotiation, closed ou lost.';
        END IF;
    END IF;
    
    -- 12. Validar priority (se fornecido, deve ser um dos valores permitidos)
    IF p_priority IS NOT NULL THEN
        v_priority_clean := lower(trim(p_priority));
        IF v_priority_clean NOT IN ('low', 'medium', 'high') THEN
            RAISE EXCEPTION 'Prioridade inválida. Deve ser: low, medium ou high.';
        END IF;
    END IF;
    
    -- 13. Validar probability (se fornecido, deve estar entre 0 e 100)
    IF p_probability IS NOT NULL AND (p_probability < 0 OR p_probability > 100) THEN
        RAISE EXCEPTION 'Probabilidade inválida. Deve estar entre 0 e 100.';
    END IF;
    
    -- 14. Validar value (se fornecido, deve ser positivo e razoável)
    IF p_value IS NOT NULL AND (p_value < 0 OR p_value > 999999999.99) THEN
        RAISE EXCEPTION 'Valor inválido. Deve ser entre 0 e 999999999.99.';
    END IF;
    
    -- 15. Validar notes (se fornecido, máximo 2000 caracteres)
    IF p_notes IS NOT NULL AND length(trim(p_notes)) > 2000 THEN
        RAISE EXCEPTION 'Notas inválidas. Máximo 2000 caracteres.';
    END IF;
    
    -- ============================================
    -- ATUALIZAÇÃO SEGURA (PROTEGIDA CONTRA SQL INJECTION)
    -- ============================================
    
    UPDATE public.clients
    SET 
        name = COALESCE(v_name_clean, name),
        email = CASE 
            WHEN p_email IS NOT NULL THEN NULLIF(v_email_clean, '')
            ELSE email
        END,
        phone = CASE 
            WHEN p_phone IS NOT NULL THEN NULLIF(trim(p_phone), '')
            ELSE phone
        END,
        company = CASE 
            WHEN p_company IS NOT NULL THEN NULLIF(trim(p_company), '')
            ELSE company
        END,
        address = CASE 
            WHEN p_address IS NOT NULL THEN NULLIF(trim(p_address), '')
            ELSE address
        END,
        city = CASE 
            WHEN p_city IS NOT NULL THEN NULLIF(trim(p_city), '')
            ELSE city
        END,
        postal_code = CASE 
            WHEN p_postal_code IS NOT NULL THEN NULLIF(trim(p_postal_code), '')
            ELSE postal_code
        END,
        country = COALESCE(NULLIF(trim(COALESCE(p_country, '')), ''), country),
        status = COALESCE(v_status_clean, status),
        priority = COALESCE(v_priority_clean, priority),
        probability = COALESCE(p_probability, probability),
        value = COALESCE(p_value, value),
        notes = CASE 
            WHEN p_notes IS NOT NULL THEN NULLIF(trim(p_notes), '')
            ELSE notes
        END,
        updated_at = NOW()
    WHERE id = p_id;

    -- Retornar sucesso
    RETURN json_build_object(
        'success', true,
        'id', p_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Não expor detalhes do erro para evitar information disclosure
        RAISE EXCEPTION 'Erro ao atualizar cliente. Por favor, tente novamente.';
END;
$$;

-- ============================================
-- PERMISSÕES DAS FUNÇÕES
-- ============================================
-- Permitir que usuários autenticados executem as funções
GRANT EXECUTE ON FUNCTION public.submit_client TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_client TO authenticated;

-- Permitir para anon também (se necessário para formulários públicos)
GRANT EXECUTE ON FUNCTION public.submit_client TO anon;
GRANT EXECUTE ON FUNCTION public.update_client TO anon;
