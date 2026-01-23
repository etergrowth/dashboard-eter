-- Migration: Habilitar Realtime e Trigger Automático para Processamento de Recibos
-- Esta migration habilita Realtime na tabela transacoes_financeiras e cria trigger para processamento automático

-- ============================================================================
-- 1. HABILITAR REALTIME NA TABELA transacoes_financeiras
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transacoes_financeiras;

-- ============================================================================
-- 2. CRIAR FUNÇÃO E TRIGGER PARA PROCESSAMENTO AUTOMÁTICO DE RECIBOS
-- ============================================================================
-- Nota: A função usa net.http_post que requer a extensão pg_net
-- A extensão pg_net deve estar habilitada no Supabase Dashboard

-- Verificar se a extensão pg_net está disponível
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função que chama a Edge Function quando um recibo é inserido
CREATE OR REPLACE FUNCTION trigger_process_receipt()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função quando um recibo é inserido
CREATE TRIGGER on_recibo_inserted
  AFTER INSERT ON recibos_transacoes
  FOR EACH ROW
  WHEN (NEW.ocr_processed = false OR NEW.ocr_processed IS NULL)
  EXECUTE FUNCTION trigger_process_receipt();

-- Comentários
COMMENT ON FUNCTION trigger_process_receipt() IS 'Função que chama a Edge Function process-receipt-ocr quando um recibo é inserido';
COMMENT ON TRIGGER on_recibo_inserted ON recibos_transacoes IS 'Trigger que processa automaticamente recibos após inserção';
