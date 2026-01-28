-- Migration: Criar bucket odometer-photos para armazenamento de fotos do odómetro
-- Este bucket é necessário para a funcionalidade de Mapa de Kms

-- ============================================================================
-- 1. CRIAR BUCKET odometer-photos
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'odometer-photos',
  'odometer-photos',
  true,  -- Bucket público (para facilitar visualização)
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[],
  public = true;

-- ============================================================================
-- 2. POLÍTICAS DE STORAGE
-- ============================================================================

-- Permitir upload pelos próprios utilizadores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own odometer photos'
  ) THEN
    CREATE POLICY "Users can upload their own odometer photos"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'odometer-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Permitir leitura dos próprios ficheiros
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own odometer photos'
  ) THEN
    CREATE POLICY "Users can view their own odometer photos"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'odometer-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Política pública para visualização (bucket é público)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view odometer photos'
  ) THEN
    CREATE POLICY "Anyone can view odometer photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'odometer-photos');
  END IF;
END $$;

-- Permitir eliminação dos próprios ficheiros
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own odometer photos'
  ) THEN
    CREATE POLICY "Users can delete their own odometer photos"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'odometer-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Permitir update dos próprios ficheiros
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own odometer photos'
  ) THEN
    CREATE POLICY "Users can update their own odometer photos"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'odometer-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- ============================================================================
-- 3. COMENTÁRIOS
-- ============================================================================
COMMENT ON POLICY "Users can upload their own odometer photos" ON storage.objects IS
  'Permite upload de fotos do odómetro apenas na pasta do próprio utilizador';
COMMENT ON POLICY "Users can view their own odometer photos" ON storage.objects IS
  'Permite leitura de fotos do odómetro apenas da pasta do próprio utilizador';
COMMENT ON POLICY "Anyone can view odometer photos" ON storage.objects IS
  'Permite visualização pública de todas as fotos do odómetro (bucket público)';
COMMENT ON POLICY "Users can delete their own odometer photos" ON storage.objects IS
  'Permite eliminação de fotos do odómetro apenas da pasta do próprio utilizador';
