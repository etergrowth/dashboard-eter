-- =============================================
-- SERVICES TABLE (Tabela Mestre de Serviços)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  base_cost_per_hour DECIMAL(10, 2) NOT NULL,
  markup_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  final_hourly_rate DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for services
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = true;

-- RLS Policies for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view active services" ON services;
DROP POLICY IF EXISTS "Users can view all services" ON services;
DROP POLICY IF EXISTS "Users can manage services" ON services;

CREATE POLICY "Anyone authenticated can view active services"
  ON services FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Users can view all services"
  ON services FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage services"
  ON services FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- PROPOSALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'negotiating')),
  
  total_amount DECIMAL(10, 2) DEFAULT 0,
  total_margin DECIMAL(10, 2) DEFAULT 0,
  
  valid_until DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete their own proposals" ON proposals;

CREATE POLICY "Users can view their own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- PROPOSAL ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS proposal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  
  estimated_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  software_costs DECIMAL(10, 2) NOT NULL DEFAULT 0,
  applied_hourly_rate DECIMAL(10, 2) NOT NULL,
  
  -- Calculated fields
  line_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  line_margin DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  notes TEXT,
  position INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal_id ON proposal_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_service_id ON proposal_items(service_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_position ON proposal_items(position);

ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view items of their proposals" ON proposal_items;
DROP POLICY IF EXISTS "Users can insert items to their proposals" ON proposal_items;
DROP POLICY IF EXISTS "Users can update items of their proposals" ON proposal_items;
DROP POLICY IF EXISTS "Users can delete items of their proposals" ON proposal_items;

CREATE POLICY "Users can view items of their proposals"
  ON proposal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to their proposals"
  ON proposal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of their proposals"
  ON proposal_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of their proposals"
  ON proposal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_items.proposal_id
      AND proposals.user_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to calculate final_hourly_rate automatically
CREATE OR REPLACE FUNCTION calculate_final_hourly_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_hourly_rate = NEW.base_cost_per_hour * (1 + NEW.markup_percentage / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate final_hourly_rate
DROP TRIGGER IF EXISTS calculate_services_final_rate ON services;
CREATE TRIGGER calculate_services_final_rate
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION calculate_final_hourly_rate();

-- Trigger to update updated_at for services
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for proposals
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for proposal_items
DROP TRIGGER IF EXISTS update_proposal_items_updated_at ON proposal_items;
CREATE TRIGGER update_proposal_items_updated_at BEFORE UPDATE ON proposal_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate proposal totals
CREATE OR REPLACE FUNCTION update_proposal_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(10, 2);
  v_margin DECIMAL(10, 2);
  v_proposal_id UUID;
BEGIN
  -- Get proposal_id from NEW or OLD
  v_proposal_id := COALESCE(NEW.proposal_id, OLD.proposal_id);
  
  -- Calculate totals from all items
  SELECT 
    COALESCE(SUM(line_total), 0),
    COALESCE(SUM(line_margin), 0)
  INTO v_total, v_margin
  FROM proposal_items
  WHERE proposal_id = v_proposal_id;
  
  -- Update proposal
  UPDATE proposals
  SET 
    total_amount = v_total,
    total_margin = v_margin,
    updated_at = NOW()
  WHERE id = v_proposal_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update proposal totals when items change
DROP TRIGGER IF EXISTS update_proposal_totals_trigger ON proposal_items;
CREATE TRIGGER update_proposal_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON proposal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_totals();

-- Function to calculate line totals for proposal items
CREATE OR REPLACE FUNCTION calculate_proposal_item_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_base_cost DECIMAL(10, 2);
BEGIN
  -- Get base cost from service
  SELECT base_cost_per_hour INTO v_base_cost
  FROM services
  WHERE id = NEW.service_id;
  
  -- Calculate line total: (hours * hourly_rate) + software_costs
  NEW.line_total = (NEW.estimated_hours * NEW.applied_hourly_rate) + NEW.software_costs;
  
  -- Calculate line margin: (applied_rate - base_cost) * hours
  NEW.line_margin = (NEW.applied_hourly_rate - COALESCE(v_base_cost, 0)) * NEW.estimated_hours;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate line totals
DROP TRIGGER IF EXISTS calculate_proposal_item_totals_trigger ON proposal_items;
CREATE TRIGGER calculate_proposal_item_totals_trigger
  BEFORE INSERT OR UPDATE ON proposal_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_proposal_item_totals();

-- =============================================
-- INSERT DEFAULT SERVICES
-- =============================================
INSERT INTO services (name, base_cost_per_hour, markup_percentage, description) VALUES
('Gestão de Tráfego', 75.00, 40.00, 'Gestão e otimização de campanhas de tráfego pago'),
('Desenvolvimento de Website', 100.00, 45.00, 'Desenvolvimento completo de website'),
('Desenvolvimento de Landing Page', 70.00, 35.00, 'Criação de landing page otimizada'),
('Desenvolvimento do Dashboard', 120.00, 40.00, 'Desenvolvimento de dashboard personalizado'),
('Automações Básicas (N8N)', 100.00, 40.00, 'Automações básicas usando N8N'),
('Automações Avançadas (Backend)', 200.00, 40.00, 'Automações avançadas com desenvolvimento backend'),
('Consultoria para Redes Sociais', 55.00, 50.00, 'Consultoria estratégica para redes sociais'),
('Consultoria Gestão de Crescimento', 150.00, 40.00, 'Consultoria em gestão e crescimento de negócios'),
('Consultoria Cibersegurança', 150.00, 45.00, 'Consultoria em segurança cibernética')
ON CONFLICT (name) DO NOTHING;