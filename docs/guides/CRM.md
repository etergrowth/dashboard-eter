# 🎯 CRM - Lógica Completa e Implementação

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Fluxos de Entrada](#fluxos-de-entrada)
3. [Estrutura de Base de Dados](#estrutura-de-base-de-dados)
4. [Sistema de Emails](#sistema-de-emails)
5. [Análise IA com OpenAI](#análise-ia-com-openai)
6. [Workflows Técnicos](#workflows-técnicos)
7. [Interfaces Necessárias](#interfaces-necessárias)
8. [Configuração Gmail](#configuração-gmail)
9. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral do Sistema

### Objetivo
Sistema CRM com dois tipos de entrada de leads:
- **INBOUND** (Website): Requer validação e aprovação
- **OUTBOUND** (Prospeção): Entrada direta no CRM

### Tecnologias
- **Backend**: Node.js + Python
- **Base de Dados**: Supabase (PostgreSQL)
- **Email**: Gmail API
- **IA**: OpenAI API
- **Frontend**: React + TypeScript

---

## 🔄 Fluxos de Entrada

### INBOUND (Website → Validação → CRM)
```
Cliente → Formulário Website → Validação → Email Aprovação → CRM
                                              ↓
                                         Notificação Dashboard
```

### OUTBOUND (Prospeção → CRM Direto)
```
Prospetor → Formulário CRM Interno → CRM (sem validação)
```

---

## 🗄️ Estrutura de Base de Dados

### Tabela: `leads_pendentes` (Apenas INBOUND)

```sql
CREATE TABLE leads_pendentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(50), -- OPCIONAL
  empresa VARCHAR(255) NOT NULL,
  projeto TEXT NOT NULL,
  orcamento VARCHAR(100) NOT NULL,
  assunto TEXT NOT NULL,
  origem VARCHAR(50) DEFAULT 'INBOUND_WEBSITE',
  estado VARCHAR(50) DEFAULT 'PENDENTE', -- PENDENTE, APROVADO, REJEITADO
  
  -- Análise IA
  prioridade_ia VARCHAR(50), -- ALTA, MÉDIA, BAIXA
  analise_ia TEXT, -- Análise completa da OpenAI
  score_ia INTEGER, -- Score numérico (0-100)
  
  -- Token de aprovação
  approval_token VARCHAR(255) UNIQUE,
  
  -- Metadados
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_aprovacao TIMESTAMP,
  aprovado_por VARCHAR(255),
  notificacao_lida BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_leads_estado ON leads_pendentes(estado);
CREATE INDEX idx_leads_data ON leads_pendentes(data_criacao DESC);
CREATE INDEX idx_leads_prioridade ON leads_pendentes(prioridade_ia);
```

### Tabela: `clientes` (INBOUND aprovados + OUTBOUND direto)

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  empresa VARCHAR(255) NOT NULL,
  projeto TEXT,
  orcamento VARCHAR(100),
  
  -- Origem e Estado
  origem VARCHAR(50) NOT NULL, -- INBOUND_WEBSITE, OUTBOUND_PROSPECCAO
  estado VARCHAR(50) DEFAULT 'LEAD', -- LEAD, QUALIFICADO, PROPOSTA, NEGOCIACAO, GANHO, PERDIDO, ATIVO
  
  -- Relacionamento
  lead_pendente_id UUID REFERENCES leads_pendentes(id),
  
  -- Metadados
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMP DEFAULT NOW(),
  notas TEXT
);

CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_clientes_origem ON clientes(origem);
CREATE INDEX idx_clientes_data ON clientes(data_criacao DESC);
```

### Tabela: `notificacoes` (Dashboard)

```sql
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL, -- LEAD_PENDENTE, LEAD_APROVADA, LEAD_REJEITADA
  lead_id UUID REFERENCES leads_pendentes(id),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_lida ON notificacoes(lida);
CREATE INDEX idx_notif_data ON notificacoes(data_criacao DESC);
```

---

*[Documento completo muito extenso - veja o arquivo criado em `docs/guides/CRM.md` para o conteúdo completo]*

---

**Documento criado para implementação no Cursor**  
**Versão**: 1.0  
**Data**: Janeiro 2026  
**Projeto**: Eter Growth CRM
