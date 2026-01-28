-- =============================================
-- MIGRATION 026: Corrigir search_path mutável nas funções (Vulnerabilidade de Segurança)
-- 
-- Problema: Funções com SECURITY DEFINER que não têm search_path fixo
-- são vulneráveis a ataques de search_path hijacking.
-- 
-- Solução: Adicionar SET search_path = '' ou SET search_path = public, pg_temp
-- para garantir que as funções usem apenas schemas explícitos.
-- =============================================

-- =============================================
-- 1. CORRIGIR: trigger_process_receipt
-- =============================================
CREATE OR REPLACE FUNCTION trigger_process_receipt()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  project_url TEXT;
  service_role_key TEXT;
  function_url TEXT;
BEGIN
  -- Obter URL do projeto do Supabase (via variável de ambiente)
  -- O Supabase disponibiliza estas variáveis automaticamente
  project_url := current_setting('app.settings.supabase_url', true);
  
  -- Se não estiver configurada, tentar obter do JWT claims
  IF project_url IS NULL OR project_url = '' THEN
    BEGIN
      project_url := 'https://' || (current_setting('request.jwt.claims', true)::json->>'aud') || '.supabase.co';
    EXCEPTION
      WHEN OTHERS THEN
        -- Se falhar, usar uma URL padrão (deve ser configurada manualmente)
        project_url := NULL;
    END;
  END IF;
  
  -- Obter service role key (deve ser configurada via Supabase Dashboard > Settings > API)
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Se não tiver service_role_key, tentar anon key
  IF service_role_key IS NULL OR service_role_key = '' THEN
    service_role_key := current_setting('app.settings.anon_key', true);
  END IF;
  
  -- Construir URL completa da Edge Function
  IF project_url IS NOT NULL AND project_url != '' THEN
    function_url := project_url || '/functions/v1/process-receipt-ocr';
    
    -- Chamar Edge Function via HTTP (assíncrono, não bloqueia a inserção)
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_role_key, ''),
        'apikey', COALESCE(service_role_key, '')
      ),
      body := jsonb_build_object(
        'recibo_id', NEW.id::text,
        'file_path', NEW.file_path,
        'user_id', NEW.user_id::text
      )
    );
  ELSE
    -- Se não tiver URL configurada, apenas logar warning
    RAISE WARNING 'URL do Supabase não configurada. Configure app.settings.supabase_url para habilitar processamento automático.';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falhar a inserção
    RAISE WARNING 'Erro ao chamar Edge Function para processar recibo %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_process_receipt() IS 
  'Função que chama a Edge Function process-receipt-ocr quando um recibo é inserido. Search_path fixo para segurança.';

-- =============================================
-- 2. CORRIGIR: aprovar_lead
-- =============================================
CREATE OR REPLACE FUNCTION aprovar_lead(
  p_lead_id UUID,
  p_approval_token UUID,
  p_user_id UUID
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lead RECORD;
  v_sandbox_id UUID;
BEGIN
  -- Verificar se a lead existe e o token esta correto
  SELECT * INTO v_lead
  FROM public.leads_pendentes
  WHERE id = p_lead_id
    AND approval_token = p_approval_token
    AND estado = 'pendente';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead nao encontrada ou token invalido'
    );
  END IF;

  -- Criar lead no Sandbox (NAO diretamente no CRM)
  INSERT INTO public.leads_sandbox (
    user_id,
    name,
    email,
    phone,
    company,
    source,
    status,
    scratchpad_notes,
    lead_pendente_id,
    date_created
  ) VALUES (
    p_user_id,
    v_lead.nome,
    v_lead.email,
    v_lead.telefone,
    v_lead.empresa,
    'inbound', -- Marcado como origem INBOUND
    'prospecting', -- Status inicial no sandbox
    COALESCE(v_lead.mensagem, '') ||
      E'\n\n--- Dados do Formulario ---' ||
      E'\nProjeto: ' || v_lead.projeto ||
      E'\nOrcamento: ' || v_lead.orcamento ||
      CASE WHEN v_lead.website IS NOT NULL THEN E'\nWebsite: ' || v_lead.website ELSE '' END,
    v_lead.id,
    NOW()
  )
  RETURNING id INTO v_sandbox_id;

  -- Atualizar estado da lead pendente
  UPDATE public.leads_pendentes
  SET
    estado = 'aprovado',
    data_decisao = NOW(),
    decidido_por = p_user_id
  WHERE id = p_lead_id;

  -- Remover notificacao de lead pendente
  DELETE FROM public.notificacoes
  WHERE lead_pendente_id = p_lead_id
    AND tipo = 'lead_pendente'
    AND user_id = p_user_id;

  -- Criar notificacao de lead aprovado
  INSERT INTO public.notificacoes (
    user_id,
    tipo,
    titulo,
    mensagem,
    link,
    lead_pendente_id
  ) VALUES (
    p_user_id,
    'lead_aprovado',
    'Lead Aprovada - Adicionada ao Sandbox',
    'A lead "' || v_lead.nome || '" foi aprovada e adicionada ao Sandbox para qualificacao.',
    '/dashboard/sandbox/' || v_sandbox_id,
    v_lead.id
  );

  RETURN jsonb_build_object(
    'success', true,
    'sandbox_id', v_sandbox_id,
    'message', 'Lead aprovada e adicionada ao Sandbox para qualificacao'
  );
END;
$$;

COMMENT ON FUNCTION aprovar_lead(UUID, UUID, UUID) IS
  'Aprova uma lead pendente (INBOUND) e cria entrada no Sandbox para qualificacao. Search_path fixo para segurança.';

-- =============================================
-- 3. CORRIGIR: atualizar_timestamp_transacoes
-- =============================================
CREATE OR REPLACE FUNCTION atualizar_timestamp_transacoes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION atualizar_timestamp_transacoes() IS
  'Trigger function para atualizar timestamp de atualização. Search_path fixo para segurança.';

-- =============================================
-- 4. CORRIGIR: convert_sandbox_lead_to_client
-- =============================================
CREATE OR REPLACE FUNCTION convert_sandbox_lead_to_client(
  p_lead_id UUID,
  p_user_id UUID
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id UUID;
  v_lead RECORD;
  v_origem TEXT;
BEGIN
  -- Verificar ownership
  SELECT * INTO v_lead
  FROM public.leads_sandbox
  WHERE id = p_lead_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead nao encontrada ou sem permissao';
  END IF;

  -- Verificar se ja foi convertida
  IF v_lead.client_id IS NOT NULL THEN
    RAISE EXCEPTION 'Lead ja foi convertida anteriormente';
  END IF;

  -- Determinar origem baseado na source
  v_origem := CASE
    WHEN v_lead.source = 'inbound' THEN 'INBOUND_WEBSITE'
    ELSE 'OUTBOUND_PROSPECCAO'
  END;

  -- Criar cliente na tabela clients
  INSERT INTO public.clients (
    user_id, name, email, phone, company,
    status, value, priority, origem,
    notes, tags, created_at,
    lead_pendente_id
  ) VALUES (
    p_user_id,
    v_lead.name,
    v_lead.email,
    v_lead.phone,
    v_lead.company,
    'lead', -- Status inicial no CRM
    0, -- Valor inicial
    'high', -- Prioridade alta (veio de sandbox qualificada)
    v_origem,
    v_lead.scratchpad_notes,
    ARRAY[v_lead.source, 'sandbox-converted']::TEXT[],
    now(),
    v_lead.lead_pendente_id -- Manter rastreabilidade com lead pendente original
  ) RETURNING id INTO v_client_id;

  -- Atualizar lead sandbox
  UPDATE public.leads_sandbox
  SET
    status = 'crm_ready',
    client_id = v_client_id,
    date_converted = now()
  WHERE id = p_lead_id;

  -- Migrar atividades importantes para interactions
  INSERT INTO public.interactions (client_id, user_id, type, title, description, date)
  SELECT
    v_client_id,
    p_user_id,
    CASE
      WHEN type IN ('call_outbound', 'call_inbound') THEN 'call'
      WHEN type IN ('email_sent', 'email_received') THEN 'email'
      WHEN type = 'meeting' THEN 'meeting'
      ELSE 'note'
    END,
    CASE
      WHEN type = 'email_sent' THEN COALESCE(metadata->>'subject', 'Email Enviado')
      WHEN type = 'email_received' THEN COALESCE(metadata->>'subject', 'Email Recebido')
      WHEN type = 'call_outbound' THEN 'Chamada Saida'
      WHEN type = 'call_inbound' THEN 'Chamada Entrada'
      WHEN type = 'meeting' THEN 'Reuniao'
      ELSE 'Nota'
    END,
    description,
    timestamp
  FROM public.sandbox_activities
  WHERE lead_id = p_lead_id
    AND type IN ('call_outbound', 'call_inbound', 'email_sent', 'email_received', 'meeting');

  -- Atualizar lead_pendente se existir (para rastreabilidade)
  IF v_lead.lead_pendente_id IS NOT NULL THEN
    UPDATE public.leads_pendentes
    SET client_id = v_client_id
    WHERE id = v_lead.lead_pendente_id;
  END IF;

  RETURN v_client_id;
END;
$$;

COMMENT ON FUNCTION convert_sandbox_lead_to_client(UUID, UUID) IS
  'Converte uma lead do Sandbox para cliente no CRM (suporta INBOUND e OUTBOUND). Search_path fixo para segurança.';

-- =============================================
-- NOTA SOBRE LEAKED PASSWORD PROTECTION
-- =============================================
-- A proteção contra senhas vazadas (Leaked Password Protection) 
-- precisa ser habilitada via Supabase Dashboard:
-- 
-- 1. Acesse: Supabase Dashboard > Authentication > Settings
-- 2. Procure por "Password Security" ou "Leaked Password Protection"
-- 3. Habilite a opção "Check passwords against HaveIBeenPwned database"
-- 
-- Alternativamente, via API:
-- - Use a API de configuração do Supabase para habilitar esta feature
-- - Documentação: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
-- =============================================
