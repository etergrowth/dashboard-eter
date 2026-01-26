-- Migration: Criar bucket faturas-recibos para armazenamento de recibos/faturas
-- Este bucket é necessário para a funcionalidade de OCR de recibos

-- ============================================================================
-- 1. CRIAR BUCKET faturas-recibos
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faturas-recibos',
  'faturas-recibos',
  false,  -- Bucket privado (requer autenticação)
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']::text[];

-- ============================================================================
-- 2. POLÍTICAS DE STORAGE
-- ============================================================================

-- Permitir upload pelos próprios utilizadores
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'faturas-recibos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir leitura dos próprios ficheiros
CREATE POLICY "Users can read their own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'faturas-recibos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir eliminação dos próprios ficheiros
CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'faturas-recibos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir update dos próprios ficheiros
CREATE POLICY "Users can update their own receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'faturas-recibos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 3. COMENTÁRIOS
-- ============================================================================
COMMENT ON POLICY "Users can upload their own receipts" ON storage.objects IS
  'Permite upload de recibos apenas na pasta do próprio utilizador';
COMMENT ON POLICY "Users can read their own receipts" ON storage.objects IS
  'Permite leitura de recibos apenas da pasta do próprio utilizador';
