-- =============================================
-- MIGRATION 024: Corrigir aprovar_lead para enviar para Sandbox
-- De acordo com a logica do sistema:
-- INBOUND -> leads_pendentes -> (aprovacao) -> leads_sandbox -> (contrato) -> CRM
-- =============================================

-- Adicionar source 'inbound' ao enum de sources do leads_sandbox
-- Primeiro verificar se a constraint existe e alterá-la
ALTER TABLE leads_sandbox DROP CONSTRAINT IF EXISTS leads_sandbox_source_check;
ALTER TABLE leads_sandbox ADD CONSTRAINT leads_sandbox_source_check
  CHECK (source IN ('linkedin', 'website', 'referral', 'cold_call', 'email', 'door_to_door', 'inbound'));

-- Adicionar referencia ao leads_pendentes no leads_sandbox
ALTER TABLE leads_sandbox
  ADD COLUMN IF NOT EXISTS lead_pendente_id UUID REFERENCES leads_pendentes(id) ON DELETE SET NULL;

-- Index para a referencia
CREATE INDEX IF NOT EXISTS idx_leads_sandbox_lead_pendente ON leads_sandbox(lead_pendente_id);

-- =============================================
-- Recriar funcao aprovar_lead para criar em leads_sandbox
-- =============================================
CREATE OR REPLACE FUNCTION aprovar_lead(
  p_lead_id UUID,
  p_approval_token UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Atualizar funcao convert_sandbox_lead_to_client para suportar INBOUND
-- =============================================
CREATE OR REPLACE FUNCTION convert_sandbox_lead_to_client(
  p_lead_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
  v_lead RECORD;
  v_origem TEXT;
BEGIN
  -- Verificar ownership
  SELECT * INTO v_lead
  FROM leads_sandbox
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
  INSERT INTO clients (
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
  UPDATE leads_sandbox
  SET
    status = 'crm_ready',
    client_id = v_client_id,
    date_converted = now()
  WHERE id = p_lead_id;

  -- Migrar atividades importantes para interactions
  INSERT INTO interactions (client_id, user_id, type, title, description, date)
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
  FROM sandbox_activities
  WHERE lead_id = p_lead_id
    AND type IN ('call_outbound', 'call_inbound', 'email_sent', 'email_received', 'meeting');

  -- Atualizar lead_pendente se existir (para rastreabilidade)
  IF v_lead.lead_pendente_id IS NOT NULL THEN
    UPDATE leads_pendentes
    SET client_id = v_client_id
    WHERE id = v_lead.lead_pendente_id;
  END IF;

  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Comentarios
-- =============================================
COMMENT ON FUNCTION aprovar_lead(UUID, UUID, UUID) IS
  'Aprova uma lead pendente (INBOUND) e cria entrada no Sandbox para qualificacao';

COMMENT ON FUNCTION convert_sandbox_lead_to_client(UUID, UUID) IS
  'Converte uma lead do Sandbox para cliente no CRM (suporta INBOUND e OUTBOUND)';
