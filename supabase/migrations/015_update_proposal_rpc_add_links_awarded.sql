-- =============================================
-- UPDATE PROPOSAL RPC FUNCTION - ADD LINKS AND AWARDED
-- =============================================
-- Atualiza a função update_proposal para incluir os campos links e awarded

CREATE OR REPLACE FUNCTION public.update_proposal(
  p_id UUID,
  p_client_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_total_amount DECIMAL(10, 2) DEFAULT NULL,
  p_total_margin DECIMAL(10, 2) DEFAULT NULL,
  p_valid_until DATE DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_links JSONB DEFAULT NULL,
  p_awarded BOOLEAN DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_title_clean TEXT;
    v_status_clean TEXT;
    v_updated_id UUID;
BEGIN
    -- ============================================
    -- VALIDAÇÕES DE SEGURANÇA E ANTI-SQL INJECTION
    -- ============================================
    
    -- 1. Validar ID (obrigatório)
    IF p_id IS NULL THEN
        RAISE EXCEPTION 'ID da proposta é obrigatório.';
    END IF;
    
    -- 2. Verificar se a proposta existe
    SELECT id INTO v_updated_id FROM public.proposals WHERE id = p_id;
    IF v_updated_id IS NULL THEN
        RAISE EXCEPTION 'Proposta não encontrada.';
    END IF;
    
    -- 3. Validar título (se fornecido, mínimo 2 caracteres, máximo 500)
    IF p_title IS NOT NULL THEN
        v_title_clean := trim(p_title);
        IF length(v_title_clean) < 2 OR length(v_title_clean) > 500 THEN
            RAISE EXCEPTION 'Título inválido. Deve ter entre 2 e 500 caracteres.';
        END IF;
    END IF;
    
    -- 4. Validar status (se fornecido, deve ser um dos valores permitidos)
    IF p_status IS NOT NULL THEN
        v_status_clean := lower(trim(p_status));
        IF v_status_clean NOT IN ('draft', 'sent', 'accepted', 'rejected', 'negotiating') THEN
            RAISE EXCEPTION 'Status inválido. Deve ser: draft, sent, accepted, rejected ou negotiating.';
        END IF;
    END IF;
    
    -- 5. Validar description (se fornecido, máximo 2000 caracteres)
    IF p_description IS NOT NULL AND length(trim(p_description)) > 2000 THEN
        RAISE EXCEPTION 'Descrição inválida. Máximo 2000 caracteres.';
    END IF;
    
    -- 6. Validar notes (se fornecido, máximo 2000 caracteres)
    IF p_notes IS NOT NULL AND length(trim(p_notes)) > 2000 THEN
        RAISE EXCEPTION 'Notas inválidas. Máximo 2000 caracteres.';
    END IF;
    
    -- 7. Validar valores numéricos (se fornecidos)
    IF p_total_amount IS NOT NULL AND (p_total_amount < 0 OR p_total_amount > 999999999.99) THEN
        RAISE EXCEPTION 'Total amount inválido. Deve ser entre 0 e 999999999.99.';
    END IF;
    
    IF p_total_margin IS NOT NULL AND (p_total_margin < 0 OR p_total_margin > 999999999.99) THEN
        RAISE EXCEPTION 'Total margin inválido. Deve ser entre 0 e 999999999.99.';
    END IF;
    
    -- 8. Validar links (se fornecido, deve ser um JSONB válido)
    IF p_links IS NOT NULL AND NOT (jsonb_typeof(p_links) = 'array') THEN
        RAISE EXCEPTION 'Links inválido. Deve ser um array JSON válido.';
    END IF;
    
    -- ============================================
    -- ATUALIZAÇÃO SEGURA (PROTEGIDA CONTRA SQL INJECTION)
    -- ============================================
    
    UPDATE public.proposals
    SET 
        client_id = COALESCE(NULLIF(p_client_id, '00000000-0000-0000-0000-000000000000'::UUID), client_id),
        title = COALESCE(v_title_clean, title),
        description = CASE 
            WHEN p_description IS NOT NULL THEN NULLIF(trim(p_description), '')
            ELSE description
        END,
        status = COALESCE(v_status_clean, status),
        total_amount = COALESCE(p_total_amount, total_amount),
        total_margin = COALESCE(p_total_margin, total_margin),
        valid_until = COALESCE(p_valid_until, valid_until),
        notes = CASE 
            WHEN p_notes IS NOT NULL THEN NULLIF(trim(p_notes), '')
            ELSE notes
        END,
        links = CASE 
            WHEN p_links IS NOT NULL THEN p_links
            ELSE links
        END,
        awarded = COALESCE(p_awarded, awarded),
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
        RAISE EXCEPTION 'Erro ao atualizar proposta. Por favor, tente novamente.';
END;
$$;

-- Manter permissões
GRANT EXECUTE ON FUNCTION public.update_proposal TO authenticated;
