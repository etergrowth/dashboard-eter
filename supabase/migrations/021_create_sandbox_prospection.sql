-- Migration: Criar sistema de Sandbox de Prospecção
-- Esta migration cria as tabelas, funções e triggers necessários para o sistema de prospecção

-- ============================================================================
-- 1. TABELA: leads_sandbox
-- ============================================================================
CREATE TABLE leads_sandbox (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  location TEXT,
  
  -- Dados profissionais
  company TEXT NOT NULL,
  job_title TEXT,
  company_size INTEGER,
  
  -- Origem e status
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'website', 'referral', 'cold_call', 'email')),
  status TEXT NOT NULL DEFAULT 'prospecting' CHECK (status IN ('prospecting', 'engaged', 'qualified', 'crm_ready', 'dead')),
  
  -- Qualificação BANT (critérios individuais)
  bant_budget BOOLEAN DEFAULT false,
  bant_authority BOOLEAN DEFAULT false,
  bant_need BOOLEAN DEFAULT false,
  bant_timeline BOOLEAN DEFAULT false,
  
  -- Notas e observações
  scratchpad_notes TEXT DEFAULT '',
  
  -- Timestamps
  date_created TIMESTAMPTZ DEFAULT now(),
  date_last_contact TIMESTAMPTZ,
  date_converted TIMESTAMPTZ,
  
  -- Referência ao cliente criado (quando convertido)
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_leads_sandbox_user_id ON leads_sandbox(user_id);
CREATE INDEX idx_leads_sandbox_status ON leads_sandbox(status);
CREATE INDEX idx_leads_sandbox_source ON leads_sandbox(source);
CREATE INDEX idx_leads_sandbox_date_created ON leads_sandbox(date_created DESC);
CREATE INDEX idx_leads_sandbox_date_last_contact ON leads_sandbox(date_last_contact DESC NULLS LAST);
CREATE INDEX idx_leads_sandbox_email ON leads_sandbox(email);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leads_sandbox_updated_at
  BEFORE UPDATE ON leads_sandbox
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE leads_sandbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
  ON leads_sandbox FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads_sandbox FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads_sandbox FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads_sandbox FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. TABELA: sandbox_activities
-- ============================================================================
CREATE TABLE sandbox_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads_sandbox(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo e direção
  type TEXT NOT NULL CHECK (type IN (
    'call_outbound', 'call_inbound', 
    'email_sent', 'email_received',
    'linkedin_connect', 'linkedin_message',
    'meeting', 'note', 'lead_imported'
  )),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'neutral')),
  
  -- Conteúdo
  description TEXT NOT NULL,
  
  -- Metadata adicional (JSONB para flexibilidade)
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Exemplos de metadata:
  -- { "duration": 1800, "outcome": "interested" } para calls
  -- { "subject": "Follow-up", "opened": true } para emails
  -- { "connection_status": "accepted" } para LinkedIn
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_sandbox_activities_lead_id ON sandbox_activities(lead_id);
CREATE INDEX idx_sandbox_activities_user_id ON sandbox_activities(user_id);
CREATE INDEX idx_sandbox_activities_timestamp ON sandbox_activities(timestamp DESC);
CREATE INDEX idx_sandbox_activities_type ON sandbox_activities(type);
CREATE INDEX idx_sandbox_activities_direction ON sandbox_activities(direction);

-- RLS Policies
ALTER TABLE sandbox_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON sandbox_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON sandbox_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON sandbox_activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON sandbox_activities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. FUNÇÃO: Calcular Lead Score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  bant_progress NUMERIC;
  engagement_score INTEGER;
  recency_score INTEGER;
  company_fit_score INTEGER;
  total_score INTEGER;
  lead_record RECORD;
  activity_count INTEGER;
  hours_since_contact NUMERIC;
BEGIN
  -- Buscar lead
  SELECT * INTO lead_record FROM leads_sandbox WHERE id = lead_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- 1. BANT Progress (40% do score)
  bant_progress := (
    (CASE WHEN lead_record.bant_budget THEN 1 ELSE 0 END) +
    (CASE WHEN lead_record.bant_authority THEN 1 ELSE 0 END) +
    (CASE WHEN lead_record.bant_need THEN 1 ELSE 0 END) +
    (CASE WHEN lead_record.bant_timeline THEN 1 ELSE 0 END)
  )::NUMERIC / 4.0 * 40;
  
  -- 2. Engagement Score (30% do score)
  SELECT COUNT(*) INTO activity_count
  FROM sandbox_activities
  WHERE sandbox_activities.lead_id = calculate_lead_score.lead_id;
  
  engagement_score := CASE
    WHEN activity_count >= 6 THEN 30
    WHEN activity_count >= 3 THEN 18
    ELSE (activity_count * 4.5)::INTEGER
  END;
  
  -- 3. Recency Score (20% do score)
  IF lead_record.date_last_contact IS NOT NULL THEN
    hours_since_contact := EXTRACT(EPOCH FROM (now() - lead_record.date_last_contact)) / 3600;
    recency_score := CASE
      WHEN hours_since_contact < 24 THEN 20
      WHEN hours_since_contact < 72 THEN 14
      WHEN hours_since_contact < 168 THEN 8
      ELSE 2
    END;
  ELSE
    recency_score := 0;
  END IF;
  
  -- 4. Company Fit Score (10% do score)
  company_fit_score := CASE
    WHEN lead_record.company_size IS NULL THEN 5
    WHEN lead_record.company_size > 50 THEN 10
    WHEN lead_record.company_size > 10 THEN 7
    ELSE 4
  END;
  
  -- Adicionar pontos por autoridade no job title
  IF lead_record.job_title ILIKE '%director%' OR 
     lead_record.job_title ILIKE '%ceo%' OR 
     lead_record.job_title ILIKE '%founder%' THEN
    company_fit_score := LEAST(company_fit_score + 3, 10);
  END IF;
  
  -- Total score
  total_score := (bant_progress + engagement_score + recency_score + company_fit_score)::INTEGER;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. FUNÇÃO: Converter Lead para CRM
-- ============================================================================
CREATE OR REPLACE FUNCTION convert_sandbox_lead_to_client(
  p_lead_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
  v_lead RECORD;
BEGIN
  -- Verificar ownership
  SELECT * INTO v_lead 
  FROM leads_sandbox 
  WHERE id = p_lead_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead não encontrada ou sem permissão';
  END IF;
  
  -- Verificar se já foi convertida
  IF v_lead.client_id IS NOT NULL THEN
    RAISE EXCEPTION 'Lead já foi convertida anteriormente';
  END IF;
  
  -- Criar cliente na tabela clients
  INSERT INTO clients (
    user_id, name, email, phone, company,
    status, value, priority, origem,
    notes, tags, created_at
  ) VALUES (
    p_user_id,
    v_lead.name,
    v_lead.email,
    v_lead.phone,
    v_lead.company,
    'lead', -- Status inicial no CRM
    0, -- Valor inicial
    'high', -- Prioridade alta (veio de sandbox qualificada)
    'OUTBOUND_PROSPECCAO',
    v_lead.scratchpad_notes,
    ARRAY[v_lead.source, 'sandbox-converted']::TEXT[],
    now()
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
      WHEN type = 'email_sent' THEN metadata->>'subject'
      WHEN type = 'call_outbound' THEN 'Outbound Call'
      WHEN type = 'call_inbound' THEN 'Inbound Call'
      ELSE type
    END,
    description,
    timestamp
  FROM sandbox_activities
  WHERE lead_id = p_lead_id
    AND type IN ('call_outbound', 'call_inbound', 'email_sent', 'email_received', 'meeting');
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNÇÃO: Estatísticas da Sandbox
-- ============================================================================
CREATE OR REPLACE FUNCTION get_sandbox_stats(
  p_user_id UUID,
  p_period_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  total_contacts INTEGER,
  total_contacts_variation NUMERIC,
  response_rate NUMERIC,
  response_rate_variation NUMERIC,
  validation_rate NUMERIC,
  validation_rate_variation NUMERIC,
  leads_by_source JSONB,
  conversion_funnel JSONB,
  avg_duration_days NUMERIC,
  overall_conversion_rate NUMERIC,
  high_potential_leads JSONB
) AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_previous_period_start TIMESTAMPTZ;
  v_current_total INTEGER;
  v_previous_total INTEGER;
  v_current_responded INTEGER;
  v_previous_responded INTEGER;
  v_current_validated INTEGER;
  v_previous_validated INTEGER;
BEGIN
  v_period_start := now() - (p_period_days || ' days')::INTERVAL;
  v_previous_period_start := v_period_start - (p_period_days || ' days')::INTERVAL;
  
  -- Total Contacts (current period)
  SELECT COUNT(*) INTO v_current_total
  FROM leads_sandbox
  WHERE user_id = p_user_id
    AND status NOT IN ('dead', 'crm_ready')
    AND date_created >= v_period_start;
  
  -- Total Contacts (previous period)
  SELECT COUNT(*) INTO v_previous_total
  FROM leads_sandbox
  WHERE user_id = p_user_id
    AND status NOT IN ('dead', 'crm_ready')
    AND date_created >= v_previous_period_start
    AND date_created < v_period_start;
  
  total_contacts := v_current_total;
  total_contacts_variation := CASE 
    WHEN v_previous_total > 0 THEN 
      ((v_current_total - v_previous_total)::NUMERIC / v_previous_total * 100)
    ELSE 0 
  END;
  
  -- Response Rate (leads com atividades inbound)
  SELECT COUNT(DISTINCT l.id) INTO v_current_responded
  FROM leads_sandbox l
  INNER JOIN sandbox_activities sa ON sa.lead_id = l.id
  WHERE l.user_id = p_user_id
    AND l.date_created >= v_period_start
    AND sa.direction = 'inbound';
  
  SELECT COUNT(DISTINCT l.id) INTO v_previous_responded
  FROM leads_sandbox l
  INNER JOIN sandbox_activities sa ON sa.lead_id = l.id
  WHERE l.user_id = p_user_id
    AND l.date_created >= v_previous_period_start
    AND l.date_created < v_period_start
    AND sa.direction = 'inbound';
  
  response_rate := CASE 
    WHEN v_current_total > 0 THEN (v_current_responded::NUMERIC / v_current_total * 100)
    ELSE 0 
  END;
  
  response_rate_variation := CASE 
    WHEN v_previous_total > 0 AND v_previous_responded > 0 THEN 
      ((v_current_responded::NUMERIC / v_current_total * 100) - 
       (v_previous_responded::NUMERIC / v_previous_total * 100))
    ELSE 0 
  END;
  
  -- Validation Rate
  SELECT COUNT(*) INTO v_current_validated
  FROM leads_sandbox
  WHERE user_id = p_user_id
    AND status IN ('qualified', 'crm_ready')
    AND date_created >= v_period_start;
  
  SELECT COUNT(*) INTO v_previous_validated
  FROM leads_sandbox
  WHERE user_id = p_user_id
    AND status IN ('qualified', 'crm_ready')
    AND date_created >= v_previous_period_start
    AND date_created < v_period_start;
  
  validation_rate := CASE 
    WHEN v_current_total > 0 THEN (v_current_validated::NUMERIC / v_current_total * 100)
    ELSE 0 
  END;
  
  validation_rate_variation := CASE 
    WHEN v_previous_total > 0 AND v_previous_validated > 0 THEN 
      ((v_current_validated::NUMERIC / v_current_total * 100) - 
       (v_previous_validated::NUMERIC / v_previous_total * 100))
    ELSE 0 
  END;
  
  -- Leads by Source
  SELECT jsonb_object_agg(source, count)
  INTO leads_by_source
  FROM (
    SELECT source, COUNT(*) as count
    FROM leads_sandbox
    WHERE user_id = p_user_id
      AND date_created >= v_period_start
    GROUP BY source
  ) s;
  
  -- Conversion Funnel
  WITH funnel AS (
    SELECT
      COUNT(*) FILTER (WHERE status IN ('prospecting', 'engaged', 'qualified', 'crm_ready')) as prospects,
      COUNT(*) FILTER (WHERE status IN ('engaged', 'qualified', 'crm_ready')) as engaged,
      COUNT(*) FILTER (WHERE status IN ('qualified', 'crm_ready')) as qualified,
      COUNT(*) FILTER (WHERE status = 'crm_ready') as crm_ready
    FROM leads_sandbox
    WHERE user_id = p_user_id
      AND date_created >= v_period_start
  )
  SELECT jsonb_build_object(
    'prospects', prospects,
    'engaged', engaged,
    'engaged_rate', CASE WHEN prospects > 0 THEN (engaged::NUMERIC / prospects * 100) ELSE 0 END,
    'qualified', qualified,
    'qualified_rate', CASE WHEN engaged > 0 THEN (qualified::NUMERIC / engaged * 100) ELSE 0 END,
    'crm_ready', crm_ready,
    'crm_ready_rate', CASE WHEN qualified > 0 THEN (crm_ready::NUMERIC / qualified * 100) ELSE 0 END
  ) INTO conversion_funnel
  FROM funnel;
  
  -- Average Duration
  SELECT AVG(EXTRACT(EPOCH FROM (date_converted - date_created)) / 86400)
  INTO avg_duration_days
  FROM leads_sandbox
  WHERE user_id = p_user_id
    AND status = 'crm_ready'
    AND date_converted IS NOT NULL;
  
  -- Overall Conversion Rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'crm_ready')::NUMERIC / COUNT(*) * 100)
      ELSE 0 
    END
  INTO overall_conversion_rate
  FROM leads_sandbox
  WHERE user_id = p_user_id
    AND date_created >= v_period_start;
  
  -- High Potential Leads (top 10 por score)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'company', company,
      'source', source,
      'status', status,
      'score', calculate_lead_score(id)
    ) ORDER BY calculate_lead_score(id) DESC
  )
  INTO high_potential_leads
  FROM (
    SELECT * FROM leads_sandbox
    WHERE user_id = p_user_id
      AND status IN ('engaged', 'qualified')
    ORDER BY date_last_contact DESC NULLS LAST
    LIMIT 10
  ) top_leads;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGER: Atualizar date_last_contact
-- ============================================================================
CREATE OR REPLACE FUNCTION update_lead_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads_sandbox
  SET date_last_contact = NEW.timestamp
  WHERE id = NEW.lead_id
    AND (date_last_contact IS NULL OR date_last_contact < NEW.timestamp);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_last_contact
  AFTER INSERT ON sandbox_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_last_contact();

-- ============================================================================
-- Comentários para documentação
-- ============================================================================
COMMENT ON TABLE leads_sandbox IS 
  'Tabela principal para leads em fase de prospecção (sandbox)';
  
COMMENT ON TABLE sandbox_activities IS 
  'Registo de todas as atividades relacionadas com leads da sandbox';
  
COMMENT ON FUNCTION calculate_lead_score(UUID) IS 
  'Calcula o score de uma lead baseado em BANT, engagement, recency e company fit';
  
COMMENT ON FUNCTION convert_sandbox_lead_to_client(UUID, UUID) IS 
  'Converte uma lead da sandbox para cliente no CRM principal';
  
COMMENT ON FUNCTION get_sandbox_stats(UUID, INTEGER) IS 
  'Retorna estatísticas agregadas da sandbox para um período específico';
