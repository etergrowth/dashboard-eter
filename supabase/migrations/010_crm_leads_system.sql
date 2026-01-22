-- =============================================
-- SISTEMA DE GESTÃO DE LEADS CRM
-- Migration 010: Criação do sistema completo de leads
-- =============================================

-- ============================================= 
-- 1. TABELA: leads_pendentes
-- Armazena leads INBOUND do website aguardando aprovação
-- =============================================

CREATE TABLE IF NOT EXISTS public.leads_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados da Lead
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  website TEXT,
  projeto TEXT NOT NULL,
  orcamento VARCHAR(100) NOT NULL,
  mensagem TEXT,
  
  -- Análise da IA (OpenAI)
  prioridade_ia TEXT CHECK (prioridade_ia IN ('baixa', 'media', 'alta', 'muito_alta')),
  analise_ia JSONB, -- { pontos_positivos: [], pontos_atencao: [], recomendacao: "" }
  score_ia INTEGER CHECK (score_ia >= 0 AND score_ia <= 100),
  
  -- Sistema de Aprovação
  approval_token UUID UNIQUE DEFAULT gen_random_uuid(),
  estado TEXT DEFAULT 'pendente' CHECK (estado IN ('pendente', 'aprovado', 'rejeitado')),
  
  -- Metadados
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_decisao TIMESTAMPTZ,
  decidido_por UUID REFERENCES auth.users(id),
  
  -- Relação com cliente aprovado
  client_id UUID REFERENCES public.clients(id)
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_estado ON public.leads_pendentes(estado);
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_data_criacao ON public.leads_pendentes(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_approval_token ON public.leads_pendentes(approval_token);
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_email ON public.leads_pendentes(email);
CREATE INDEX IF NOT EXISTS idx_leads_pendentes_prioridade_ia ON public.leads_pendentes(prioridade_ia);

-- RLS Policies
ALTER TABLE public.leads_pendentes ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todas as leads pendentes
CREATE POLICY "Admins podem ver leads pendentes"
  ON public.leads_pendentes FOR SELECT
  TO authenticated
  USING (true); -- TODO: Adicionar verificação de role admin quando implementar

-- Apenas sistema pode inserir leads (via API pública)
CREATE POLICY "Sistema pode inserir leads"
  ON public.leads_pendentes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins podem atualizar leads
CREATE POLICY "Admins podem atualizar leads"
  ON public.leads_pendentes FOR UPDATE
  TO authenticated
  USING (true);


-- ============================================= 
-- 2. TABELA: notificacoes
-- Sistema de notificações do dashboard
-- =============================================

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Conteúdo da Notificação
  tipo TEXT NOT NULL CHECK (tipo IN ('lead_pendente', 'lead_aprovado', 'lead_rejeitado', 'novo_cliente', 'tarefa', 'outro')),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  
  -- Link/Ação
  link TEXT, -- Ex: /crm/leads/pendentes ou /crm/clients/123
  acao_label TEXT, -- Ex: "Ver Lead", "Aprovar", "Rejeitar"
  
  -- Referências
  lead_pendente_id UUID REFERENCES public.leads_pendentes(id),
  client_id UUID REFERENCES public.clients(id),
  
  -- Estado
  lida BOOLEAN DEFAULT false,
  
  -- Timestamps
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_leitura TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lead_pendente ON public.notificacoes(lead_pendente_id);

-- RLS Policies
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Users podem ver apenas suas próprias notificações
CREATE POLICY "Users veem suas notificações"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema pode criar notificações
CREATE POLICY "Sistema cria notificações"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users podem atualizar suas notificações (marcar como lida)
CREATE POLICY "Users atualizam suas notificações"
  ON public.notificacoes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users podem deletar suas notificações
CREATE POLICY "Users deletam suas notificações"
  ON public.notificacoes FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================= 
-- 3. MODIFICAR TABELA: clients
-- Adicionar campos para origem e ligação com leads
-- =============================================

-- Adicionar novos campos à tabela clients
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS origem VARCHAR(50) DEFAULT 'OUTBOUND_PROSPECCAO' 
    CHECK (origem IN ('INBOUND_WEBSITE', 'OUTBOUND_PROSPECCAO', 'INDICACAO', 'OUTRO'));

ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS lead_pendente_id UUID REFERENCES public.leads_pendentes(id);

ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS projeto TEXT;

ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS orcamento VARCHAR(100);

ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS mensagem_inicial TEXT;

-- Index para origem
CREATE INDEX IF NOT EXISTS idx_clients_origem ON public.clients(origem);
CREATE INDEX IF NOT EXISTS idx_clients_lead_pendente ON public.clients(lead_pendente_id);


-- ============================================= 
-- 4. FUNÇÕES RPC
-- Funções auxiliares para o sistema de leads
-- =============================================

-- Função: Aprovar Lead
CREATE OR REPLACE FUNCTION aprovar_lead(
  p_lead_id UUID,
  p_approval_token UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
  v_client_id UUID;
BEGIN
  -- Verificar se a lead existe e o token está correto
  SELECT * INTO v_lead
  FROM public.leads_pendentes
  WHERE id = p_lead_id 
    AND approval_token = p_approval_token
    AND estado = 'pendente';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead não encontrada ou token inválido'
    );
  END IF;
  
  -- Criar cliente na tabela clients
  INSERT INTO public.clients (
    user_id,
    name,
    email,
    phone,
    company,
    origem,
    lead_pendente_id,
    projeto,
    orcamento,
    notes,
    status,
    priority
  ) VALUES (
    p_user_id,
    v_lead.nome,
    v_lead.email,
    v_lead.telefone,
    v_lead.empresa,
    'INBOUND_WEBSITE',
    v_lead.id,
    v_lead.projeto,
    v_lead.orcamento,
    v_lead.mensagem,
    'lead',
    CASE 
      WHEN v_lead.prioridade_ia = 'muito_alta' THEN 'high'
      WHEN v_lead.prioridade_ia = 'alta' THEN 'high'
      WHEN v_lead.prioridade_ia = 'media' THEN 'medium'
      ELSE 'low'
    END
  )
  RETURNING id INTO v_client_id;
  
  -- Atualizar estado da lead pendente
  UPDATE public.leads_pendentes
  SET 
    estado = 'aprovado',
    data_decisao = NOW(),
    decidido_por = p_user_id,
    client_id = v_client_id
  WHERE id = p_lead_id;
  
  -- Remover notificação de lead pendente
  DELETE FROM public.notificacoes
  WHERE lead_pendente_id = p_lead_id
    AND tipo = 'lead_pendente'
    AND user_id = p_user_id;
  
  -- Criar notificação de lead aprovado
  INSERT INTO public.notificacoes (
    user_id,
    tipo,
    titulo,
    mensagem,
    link,
    client_id
  ) VALUES (
    p_user_id,
    'lead_aprovado',
    'Lead Aprovado com Sucesso',
    'A lead "' || v_lead.nome || '" foi aprovada e adicionada ao CRM.',
    '/crm/clients/' || v_client_id,
    v_client_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'client_id', v_client_id,
    'message', 'Lead aprovada com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Rejeitar Lead
CREATE OR REPLACE FUNCTION rejeitar_lead(
  p_lead_id UUID,
  p_approval_token UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
BEGIN
  -- Verificar se a lead existe e o token está correto
  SELECT * INTO v_lead
  FROM public.leads_pendentes
  WHERE id = p_lead_id 
    AND approval_token = p_approval_token
    AND estado = 'pendente';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead não encontrada ou token inválido'
    );
  END IF;
  
  -- Atualizar estado da lead
  UPDATE public.leads_pendentes
  SET 
    estado = 'rejeitado',
    data_decisao = NOW(),
    decidido_por = p_user_id
  WHERE id = p_lead_id;
  
  -- Remover notificação de lead pendente
  DELETE FROM public.notificacoes
  WHERE lead_pendente_id = p_lead_id
    AND tipo = 'lead_pendente'
    AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Lead rejeitada com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Obter Estatísticas de Leads
CREATE OR REPLACE FUNCTION get_leads_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_pendentes', COUNT(*) FILTER (WHERE estado = 'pendente'),
    'total_aprovadas', COUNT(*) FILTER (WHERE estado = 'aprovado'),
    'total_rejeitadas', COUNT(*) FILTER (WHERE estado = 'rejeitado'),
    'score_medio', ROUND(AVG(score_ia) FILTER (WHERE score_ia IS NOT NULL)),
    'por_prioridade', jsonb_build_object(
      'muito_alta', COUNT(*) FILTER (WHERE prioridade_ia = 'muito_alta' AND estado = 'pendente'),
      'alta', COUNT(*) FILTER (WHERE prioridade_ia = 'alta' AND estado = 'pendente'),
      'media', COUNT(*) FILTER (WHERE prioridade_ia = 'media' AND estado = 'pendente'),
      'baixa', COUNT(*) FILTER (WHERE prioridade_ia = 'baixa' AND estado = 'pendente')
    )
  ) INTO v_stats
  FROM public.leads_pendentes;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Marcar Notificação como Lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(
  p_notificacao_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notificacoes
  SET 
    lida = true,
    data_leitura = NOW()
  WHERE id = p_notificacao_id
    AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Marcar Todas as Notificações como Lidas
CREATE OR REPLACE FUNCTION marcar_todas_notificacoes_lidas(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notificacoes
  SET 
    lida = true,
    data_leitura = NOW()
  WHERE user_id = p_user_id
    AND lida = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================= 
-- 5. TRIGGERS
-- =============================================

-- Trigger: Criar notificação quando uma nova lead é criada
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- TODO: Buscar ID do admin real quando sistema de roles estiver implementado
  -- Por enquanto, vamos criar notificação para o primeiro user do sistema
  SELECT id INTO v_admin_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.notificacoes (
      user_id,
      tipo,
      titulo,
      mensagem,
      link,
      acao_label,
      lead_pendente_id
    ) VALUES (
      v_admin_id,
      'lead_pendente',
      '🌟 Nova Lead do Website',
      'Nova lead de ' || NEW.nome || ' aguardando aprovação. Score IA: ' || COALESCE(NEW.score_ia::TEXT, 'N/A'),
      '/crm/leads/pendentes/' || NEW.id,
      'Analisar Lead',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_lead
  AFTER INSERT ON public.leads_pendentes
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();


-- ============================================= 
-- 6. DADOS INICIAIS / SEED (OPCIONAL)
-- =============================================

-- Comentar esta seção se não quiser dados de exemplo
/*
-- Inserir uma lead de exemplo (apenas para testes)
INSERT INTO public.leads_pendentes (
  nome,
  email,
  telefone,
  empresa,
  website,
  projeto,
  orcamento,
  mensagem,
  prioridade_ia,
  score_ia,
  analise_ia
) VALUES (
  'João Silva',
  'joao.silva@empresa.pt',
  '+351 912 345 678',
  'Tech Solutions, Lda',
  'https://techsolutions.pt',
  'Desenvolvimento de Website Corporativo',
  '5000-10000',
  'Gostaria de saber mais sobre os vossos serviços de marketing digital.',
  'alta',
  85,
  '{
    "pontos_positivos": [
      "Empresa com website profissional",
      "Email corporativo válido",
      "Mensagem clara e objetiva",
      "Setor de tecnologia (target ideal)"
    ],
    "pontos_atencao": [
      "Verificar orçamento disponível",
      "Confirmar poder de decisão"
    ],
    "recomendacao": "Lead de alta qualidade. Recomenda-se contacto rápido."
  }'::jsonb
);
*/

-- ============================================= 
-- FIM DA MIGRATION
-- =============================================

-- Comentários finais
COMMENT ON TABLE public.leads_pendentes IS 'Armazena leads INBOUND do website que aguardam aprovação manual';
COMMENT ON TABLE public.notificacoes IS 'Sistema de notificações em tempo real para o dashboard';
COMMENT ON COLUMN public.clients.origem IS 'Origem da lead: INBOUND_WEBSITE, OUTBOUND_PROSPECCAO, INDICACAO, OUTRO';
COMMENT ON COLUMN public.clients.lead_pendente_id IS 'Referência à lead pendente que originou este cliente (se aplicável)';
