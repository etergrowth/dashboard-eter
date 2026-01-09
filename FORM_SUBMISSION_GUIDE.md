# Guia Completo: Formulário e Conexão com Supabase

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Formulário](#estrutura-do-formulário)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Fluxo de Submissão](#fluxo-de-submissão)
5. [Função RPC `submit_form`](#função-rpc-submit_form)
6. [Políticas de Segurança (RLS)](#políticas-de-segurança-rls)
7. [Troubleshooting](#troubleshooting)
8. [Exemplo Completo de Implementação](#exemplo-completo-de-implementação)

---

## Visão Geral

Este documento explica como o formulário multi-passo está implementado e como os dados são salvos na tabela `form_submissions` do Supabase. O sistema utiliza uma **função RPC (Remote Procedure Call)** para garantir segurança e validação dos dados antes da inserção.

### Componentes Principais

1. **Frontend (React)**: Formulário multi-passo em `src/forms/get-started/index.tsx`
2. **Cliente Supabase**: Configurado em `src/lib/supabase-client.ts`
3. **Função RPC**: `submit_form` no Supabase (executa validações e inserção)
4. **Tabela**: `form_submissions` no Supabase

---

## Estrutura do Formulário

### Dados do Formulário (TypeScript)

```typescript
// src/forms/get-started/types.ts
export interface FormData {
  firstName: string;
  email: string;
  phone: string;
  location: string;
  locationOther: string;
  projectType: string;
  projectTypeOther: string;
  budget: string;
  meetingPreference: string;
  privacyConsent: boolean;
}
```

### Estados e Refs

```typescript
const [formData, setFormData] = useState<FormData>({
  firstName: '',
  email: '',
  phone: '',
  location: '',
  locationOther: '',
  projectType: '',
  projectTypeOther: '',
  budget: '',
  meetingPreference: '',
  privacyConsent: false,
});

// Ref para controlar se a submissão foi bem-sucedida
const formSubmissionSuccess = useRef<boolean>(false);
```

---

## Configuração do Supabase

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
```

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` no Git! Adicione-o ao `.gitignore`.

### 2. Cliente Supabase

```typescript
// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 3. Instalação do Pacote

```bash
npm install @supabase/supabase-js
```

---

## Fluxo de Submissão

### Passo 1: Preparação dos Dados

Antes de enviar para o Supabase, os dados são preparados e validados:

```typescript
const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Validação dos campos obrigatórios
  if (!formData.firstName || !formData.email || !formData.privacyConsent) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  // Validação do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('Email inválido.');
    return;
  }
  
  // Preparar dados para inserção
  const isLocationOther = formData.location === 'Outros';
  const isProjectTypeOther = formData.projectType === 'Outros';
  
  const submissionData = {
    nome: formData.firstName.trim(),
    email: formData.email.trim().toLowerCase(),
    telefone: formData.phone?.trim() || null,
    localizacao: formData.location?.trim() || null,
    localizacao_outros: isLocationOther && formData.locationOther 
      ? formData.locationOther.trim() 
      : null,
    tipo_projeto: formData.projectType?.trim() || null,
    tipo_projeto_outros: isProjectTypeOther && formData.projectTypeOther 
      ? formData.projectTypeOther.trim() 
      : null,
    orcamento: formData.budget?.trim() || null,
    preferencia_contacto: formData.meetingPreference?.trim() || null,
    consentimento_privacidade: formData.privacyConsent,
  };
```

### Passo 2: Chamada à Função RPC

```typescript
// Inserir dados na tabela via RPC
const { data, error } = await supabase.rpc('submit_form', {
  p_nome: submissionData.nome,
  p_email: submissionData.email,
  p_telefone: submissionData.telefone,
  p_localizacao: submissionData.localizacao,
  p_localizacao_outros: submissionData.localizacao_outros,
  p_tipo_projeto: submissionData.tipo_projeto,
  p_tipo_projeto_outros: submissionData.tipo_projeto_outros,
  p_orcamento: submissionData.orcamento,
  p_preferencia_contacto: submissionData.preferencia_contacto,
  p_consentimento_privacidade: submissionData.consentimento_privacidade
});

if (error) {
  console.error('❌ ERRO ao submeter formulário:', error);
  alert(`Erro ao submeter formulário: ${error.message}`);
  return; 
} else {
  console.log('✅ Formulário submetido com sucesso!', data);
  // data retorna: { success: true, id: "uuid-do-registo" }
  formSubmissionSuccess.current = true;
}
```

---

## Função RPC `submit_form`

### Por que usar uma função RPC?

1. **Segurança**: Previne SQL injection através de parâmetros
2. **Validação**: Valida dados antes da inserção
3. **Controle**: Permite lógica adicional (logs, notificações, etc.)
4. **RLS Bypass**: Permite inserção mesmo com RLS ativo (usando `SECURITY DEFINER`)

### Criação da Função no Supabase

Execute este SQL no Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.submit_form(
  p_nome text,
  p_email text,
  p_telefone text DEFAULT NULL,
  p_localizacao text DEFAULT NULL,
  p_localizacao_outros text DEFAULT NULL,
  p_tipo_projeto text DEFAULT NULL,
  p_tipo_projeto_outros text DEFAULT NULL,
  p_orcamento text DEFAULT NULL,
  p_preferencia_contacto text DEFAULT NULL,
  p_consentimento_privacidade boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_id uuid;
    v_nome_clean text;
    v_email_clean text;
BEGIN
    -- ============================================
    -- VALIDAÇÕES DE SEGURANÇA E ANTI-SQL INJECTION
    -- ============================================
    
    -- 1. Validar nome (mínimo 2 caracteres, máximo 200)
    v_nome_clean := trim(p_nome);
    IF length(v_nome_clean) < 2 OR length(v_nome_clean) > 200 THEN
        RAISE EXCEPTION 'Nome inválido. Deve ter entre 2 e 200 caracteres.';
    END IF;
    
    -- 2. Validar email (formato básico e tamanho)
    v_email_clean := lower(trim(p_email));
    IF length(v_email_clean) < 5 OR length(v_email_clean) > 255 THEN
        RAISE EXCEPTION 'Email inválido.';
    END IF;
    
    IF position('@' in v_email_clean) = 0 OR position('.' in v_email_clean) = 0 THEN
        RAISE EXCEPTION 'Email inválido. Formato incorreto.';
    END IF;
    
    -- Validar que email não contém caracteres perigosos
    IF v_email_clean ~ '[<>''";\\]' THEN
        RAISE EXCEPTION 'Email contém caracteres inválidos.';
    END IF;
    
    -- 3. Validar telefone (se fornecido, máximo 50 caracteres)
    IF p_telefone IS NOT NULL AND length(trim(p_telefone)) > 50 THEN
        RAISE EXCEPTION 'Telefone inválido. Máximo 50 caracteres.';
    END IF;
    
    -- 4. Validar campos de texto (máximo 500 caracteres cada)
    IF p_localizacao IS NOT NULL AND length(trim(p_localizacao)) > 500 THEN
        RAISE EXCEPTION 'Localização inválida. Máximo 500 caracteres.';
    END IF;
    
    IF p_localizacao_outros IS NOT NULL AND length(trim(p_localizacao_outros)) > 500 THEN
        RAISE EXCEPTION 'Localização outros inválida. Máximo 500 caracteres.';
    END IF;
    
    IF p_tipo_projeto IS NOT NULL AND length(trim(p_tipo_projeto)) > 500 THEN
        RAISE EXCEPTION 'Tipo de projeto inválido. Máximo 500 caracteres.';
    END IF;
    
    IF p_tipo_projeto_outros IS NOT NULL AND length(trim(p_tipo_projeto_outros)) > 500 THEN
        RAISE EXCEPTION 'Tipo de projeto outros inválido. Máximo 500 caracteres.';
    END IF;
    
    IF p_orcamento IS NOT NULL AND length(trim(p_orcamento)) > 500 THEN
        RAISE EXCEPTION 'Orçamento inválido. Máximo 500 caracteres.';
    END IF;
    
    IF p_preferencia_contacto IS NOT NULL AND length(trim(p_preferencia_contacto)) > 500 THEN
        RAISE EXCEPTION 'Preferência de contacto inválida. Máximo 500 caracteres.';
    END IF;
    
    -- 5. Validar consentimento de privacidade (obrigatório)
    IF p_consentimento_privacidade IS NOT TRUE THEN
        RAISE EXCEPTION 'É necessário consentir com a política de privacidade.';
    END IF;
    
    -- ============================================
    -- INSERÇÃO SEGURA (PROTEGIDA CONTRA SQL INJECTION)
    -- ============================================
    -- Todos os valores são passados como parâmetros, não como concatenação de strings
    -- Isso previne completamente SQL injection
    
    INSERT INTO public.form_submissions (
        nome,
        email,
        telefone,
        localizacao,
        localizacao_outros,
        tipo_projeto,
        tipo_projeto_outros,
        orcamento,
        preferencia_contacto,
        consentimento_privacidade
    ) VALUES (
        v_nome_clean,
        v_email_clean,
        NULLIF(trim(p_telefone), ''),
        NULLIF(trim(p_localizacao), ''),
        NULLIF(trim(p_localizacao_outros), ''),
        NULLIF(trim(p_tipo_projeto), ''),
        NULLIF(trim(p_tipo_projeto_outros), ''),
        NULLIF(trim(p_orcamento), ''),
        NULLIF(trim(p_preferencia_contacto), ''),
        p_consentimento_privacidade
    )
    RETURNING id INTO v_id;

    -- Retornar sucesso sem expor dados sensíveis
    RETURN json_build_object(
        'success', true,
        'id', v_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Não expor detalhes do erro para evitar information disclosure
        RAISE EXCEPTION 'Erro ao processar submissão. Por favor, tente novamente.';
END;
$$;
```

### Permissões da Função

A função precisa ter permissão para ser executada por usuários anônimos:

```sql
-- Permitir que usuários anônimos executem a função
GRANT EXECUTE ON FUNCTION public.submit_form TO anon;
GRANT EXECUTE ON FUNCTION public.submit_form TO authenticated;
```

---

## Políticas de Segurança (RLS)

### Criação da Tabela

```sql
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  localizacao text,
  localizacao_outros text,
  tipo_projeto text,
  tipo_projeto_outros text,
  orcamento text,
  preferencia_contacto text,
  consentimento_privacidade boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
```

### Políticas RLS

**IMPORTANTE**: Como usamos uma função RPC com `SECURITY DEFINER`, não precisamos de políticas RLS para INSERT. A função executa com privilégios elevados.

No entanto, para proteger os dados, podemos criar políticas que **bloqueiam** leitura direta:

```sql
-- Bloquear leitura direta da tabela (apenas service_role pode ler)
CREATE POLICY "Bloquear leitura pública de form_submissions"
ON public.form_submissions
FOR SELECT
TO anon, authenticated
USING (false);

-- Permitir inserção apenas via função RPC (não diretamente)
-- A função RPC com SECURITY DEFINER já permite inserção
```

**Nota**: Para ler os dados, você precisará usar a `service_role` key no backend ou criar uma função RPC específica para leitura.

---

## Troubleshooting

### Problema 1: "Erro ao submeter formulário" - Dados não são salvos

#### Verificações:

1. **Variáveis de ambiente configuradas?**
   ```bash
   # Verifique se existem no .env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

2. **Função RPC existe?**
   ```sql
   -- Execute no Supabase SQL Editor
   SELECT proname FROM pg_proc 
   WHERE proname = 'submit_form';
   ```

3. **Permissões da função?**
   ```sql
   -- Verificar permissões
   SELECT 
     p.proname,
     has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
     has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth_can_execute
   FROM pg_proc p
   WHERE p.proname = 'submit_form';
   ```

4. **Tabela existe?**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'form_submissions';
   ```

5. **Console do navegador**: Verifique erros no console (F12)

#### Solução:

```sql
-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.submit_form TO anon;
GRANT EXECUTE ON FUNCTION public.submit_form TO authenticated;
```

### Problema 2: "Missing Supabase environment variables"

**Causa**: Variáveis de ambiente não estão configuradas.

**Solução**:
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as variáveis:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
   ```
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

### Problema 3: "Nome inválido" ou outras validações falhando

**Causa**: A função RPC está validando os dados e rejeitando valores inválidos.

**Solução**: Verifique os dados antes de enviar:
- Nome: mínimo 2 caracteres, máximo 200
- Email: formato válido, mínimo 5 caracteres, máximo 255
- Campos opcionais: máximo 500 caracteres
- Consentimento: deve ser `true`

### Problema 4: RLS bloqueando inserção

**Causa**: Se tentar inserir diretamente na tabela (sem usar a função RPC), o RLS pode bloquear.

**Solução**: **SEMPRE use a função RPC** `submit_form`. Não insira diretamente na tabela.

### Problema 5: Função retorna erro genérico

**Causa**: A função captura todos os erros e retorna uma mensagem genérica por segurança.

**Solução**: Verifique os logs do Supabase:
1. Vá ao Dashboard do Supabase
2. Logs → Postgres Logs
3. Procure por erros relacionados a `submit_form`

---

## Exemplo Completo de Implementação

### 1. Criar a Tabela

```sql
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  localizacao text,
  localizacao_outros text,
  tipo_projeto text,
  tipo_projeto_outros text,
  orcamento text,
  preferencia_contacto text,
  consentimento_privacidade boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
```

### 2. Criar a Função RPC

(Copie o SQL completo da seção [Função RPC `submit_form`](#função-rpc-submit_form))

### 3. Configurar Permissões

```sql
GRANT EXECUTE ON FUNCTION public.submit_form TO anon;
GRANT EXECUTE ON FUNCTION public.submit_form TO authenticated;
```

### 4. Código React

```typescript
import { supabase } from '../lib/supabase-client';

const handleSubmit = async (formData: FormData) => {
  try {
    // Preparar dados
    const submissionData = {
      nome: formData.firstName.trim(),
      email: formData.email.trim().toLowerCase(),
      telefone: formData.phone?.trim() || null,
      // ... outros campos
      consentimento_privacidade: formData.privacyConsent,
    };

    // Chamar função RPC
    const { data, error } = await supabase.rpc('submit_form', {
      p_nome: submissionData.nome,
      p_email: submissionData.email,
      p_telefone: submissionData.telefone,
      // ... outros parâmetros
      p_consentimento_privacidade: submissionData.consentimento_privacidade
    });

    if (error) {
      console.error('Erro:', error);
      alert(`Erro: ${error.message}`);
      return;
    }

    console.log('Sucesso!', data);
    // data = { success: true, id: "uuid" }
    
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
};
```

### 5. Testar

1. Preencha o formulário
2. Submeta
3. Verifique no Supabase:
   ```sql
   SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 1;
   ```

---

## Checklist de Implementação

- [ ] Tabela `form_submissions` criada
- [ ] RLS ativado na tabela
- [ ] Função RPC `submit_form` criada
- [ ] Permissões da função configuradas (`GRANT EXECUTE`)
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Cliente Supabase configurado
- [ ] Código React preparando dados corretamente
- [ ] Chamada à função RPC implementada
- [ ] Tratamento de erros implementado
- [ ] Testado e funcionando

---

## Recursos Adicionais

- [Documentação Supabase RPC](https://supabase.com/docs/guides/database/functions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Última atualização**: Janeiro 2025
