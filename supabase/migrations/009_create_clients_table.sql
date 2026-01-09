-- =============================================
-- CLIENTS TABLE (CRM)
-- =============================================
-- Create clients table for CRM functionality

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Dados Básicos
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,

  -- Endereço (para mapa)
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Portugal',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Pipeline de Vendas
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'proposal', 'negotiation', 'closed', 'lost')),
  value DECIMAL(10, 2),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),

  -- Prioridade
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  -- Metadata
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_priority ON public.clients(priority);
CREATE INDEX IF NOT EXISTS idx_clients_location ON public.clients(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- RLS Policies for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own clients
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own clients
CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own clients
CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own clients
CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();
