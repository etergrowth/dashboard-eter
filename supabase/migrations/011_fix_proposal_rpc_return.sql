-- =============================================
-- FIX PROPOSAL RPC TO RETURN FULL PROPOSAL
-- =============================================
-- Atualizar a função create_proposal para retornar a proposta completa
-- em vez de apenas o ID, evitando problemas com RLS

-- Dropar a função antiga primeiro
DROP FUNCTION IF EXISTS public.create_proposal(UUID, UUID, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, DATE, TEXT);

CREATE OR REPLACE FUNCTION public.create_proposal(
  p_title TEXT,
  p_user_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_total_amount DECIMAL(10, 2) DEFAULT NULL,
  p_total_margin DECIMAL(10, 2) DEFAULT NULL,
  p_valid_until DATE DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_id UUID;
    v_title_clean TEXT;
    v_status_clean TEXT;
    v_user_id UUID;
    v_proposal_record RECORD;
BEGIN
    -- ============================================
    -- VALIDAÇÕES DE SEGURANÇA E ANTI-SQL INJECTION
    -- ============================================
    
    -- 1. Determinar user_id (usar auth.uid() se disponível, senão usar p_user_id, senão usar UUID fixo)
    v_user_id := COALESCE(auth.uid(), p_user_id, '00000000-0000-0000-0000-000000000001'::UUID);
    
    -- 2. Validar título (mínimo 2 caracteres, máximo 500)
    v_title_clean := trim(p_title);
    IF length(v_title_clean) < 2 OR length(v_title_clean) > 500 THEN
        RAISE EXCEPTION 'Título inválido. Deve ter entre 2 e 500 caracteres.';
    END IF;
    
    -- 3. Validar status (deve ser um dos valores permitidos)
    v_status_clean := lower(trim(COALESCE(p_status, 'draft')));
    IF v_status_clean NOT IN ('draft', 'sent', 'accepted', 'rejected', 'negotiating') THEN
        RAISE EXCEPTION 'Status inválido. Deve ser: draft, sent, accepted, rejected ou negotiating.';
    END IF;
    
    -- 4. Validar description (se fornecido, máximo 2000 caracteres)
    IF p_description IS NOT NULL AND length(trim(p_description)) > 2000 THEN
        RAISE EXCEPTION 'Descrição inválida. Máximo 2000 caracteres.';
    END IF;
    
    -- 5. Validar notes (se fornecido, máximo 2000 caracteres)
    IF p_notes IS NOT NULL AND length(trim(p_notes)) > 2000 THEN
        RAISE EXCEPTION 'Notas inválidas. Máximo 2000 caracteres.';
    END IF;
    
    -- 6. Validar valores numéricos (se fornecidos)
    IF p_total_amount IS NOT NULL AND (p_total_amount < 0 OR p_total_amount > 999999999.99) THEN
        RAISE EXCEPTION 'Total amount inválido. Deve ser entre 0 e 999999999.99.';
    END IF;
    
    IF p_total_margin IS NOT NULL AND (p_total_margin < 0 OR p_total_margin > 999999999.99) THEN
        RAISE EXCEPTION 'Total margin inválido. Deve ser entre 0 e 999999999.99.';
    END IF;
    
    -- ============================================
    -- INSERÇÃO SEGURA (PROTEGIDA CONTRA SQL INJECTION)
    -- ============================================
    
    INSERT INTO public.proposals (
        user_id,
        client_id,
        title,
        description,
        status,
        total_amount,
        total_margin,
        valid_until,
        notes
    ) VALUES (
        v_user_id,
        NULLIF(p_client_id, '00000000-0000-0000-0000-000000000000'::UUID),
        v_title_clean,
        NULLIF(trim(COALESCE(p_description, '')), ''),
        v_status_clean,
        COALESCE(p_total_amount, 0),
        COALESCE(p_total_margin, 0),
        p_valid_until,
        NULLIF(trim(COALESCE(p_notes, '')), '')
    )
    RETURNING * INTO v_proposal_record;

    -- Retornar a proposta completa como JSON
    RETURN row_to_json(v_proposal_record);
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro real para debugging (apenas em desenvolvimento)
        RAISE WARNING 'Erro ao criar proposta: %', SQLERRM;
        -- Não expor detalhes do erro para evitar information disclosure
        RAISE EXCEPTION 'Erro ao criar proposta. Por favor, tente novamente.';
END;
$$;

-- Manter as permissões existentes
GRANT EXECUTE ON FUNCTION public.create_proposal TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_proposal TO anon;
