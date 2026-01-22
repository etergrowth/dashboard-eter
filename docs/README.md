# Documentação do Projeto

Esta pasta contém toda a documentação do projeto organizada por categoria.

## 🆕 Novidades - Sistema de Leads CRM

**📊 FASE 1 CONCLUÍDA!** Sistema completo de gestão de leads implementado.

- ✅ **Resumo Executivo:** [`FASE_1_RESUMO_EXECUTIVO.md`](./FASE_1_RESUMO_EXECUTIVO.md)
- 🔧 **Setup Rápido:** [`setup/README.md`](./setup/README.md)
- 📋 **Checklist:** [`setup/CHECKLIST.md`](./setup/CHECKLIST.md)

---

## Estrutura

```
docs/
├── FASE_1_RESUMO_EXECUTIVO.md    # 📊 Resumo da Fase 1 do CRM (NOVO!)
│
├── setup/                         # 🔧 Guias de configuração (NOVO!)
│   ├── README.md                  # Guia rápido de setup
│   ├── ENV_SETUP.md               # Configuração de ambiente
│   ├── DATABASE_MIGRATION.md      # Setup da base de dados
│   ├── CHECKLIST.md               # Checklist de validação
│   └── get-gmail-token.html       # Ferramenta OAuth Gmail
│
├── architecture/                  # 🏗️ Documentação de arquitetura
│   ├── ARCHITECTURE.md            # Arquitetura de 3 camadas (Agentic)
│   └── CRM_LEADS_ARCHITECTURE.md  # Arquitetura do sistema de leads (NOVO!)
│
├── guides/                        # 📖 Guias de uso e referência
│   ├── CRM.md                     # Guia do sistema CRM
│   ├── PROJECT_CONTEXT.md         # Contexto completo do projeto
│   ├── FORM_SUBMISSION_GUIDE.md   # Guia de submissão de formulários
│   └── FASE_1_COMPLETA.md         # Resumo técnico da Fase 1 (NOVO!)
│
└── agentic/                       # 🤖 Documentação do sistema Agentic
    ├── AGENTS.md                  # Instruções para agentes AI
    ├── AGENTIC_SETUP.md           # Setup da arquitetura agentic
    ├── directives/                # Directives (SOPs)
    └── execution/                 # Scripts Python de execução
```

---

## 🚀 Navegação Rápida

### Para Começar

- **Novo no projeto?** → [`guides/PROJECT_CONTEXT.md`](./guides/PROJECT_CONTEXT.md)
- **Setup do Sistema de Leads?** → [`setup/README.md`](./setup/README.md) ⭐
- **Aplicar Migration?** → [`setup/DATABASE_MIGRATION.md`](./setup/DATABASE_MIGRATION.md)
- **Configurar APIs?** → [`setup/ENV_SETUP.md`](./setup/ENV_SETUP.md)

### Arquitetura e Design

- **Arquitetura Geral?** → [`architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md)
- **Arquitetura do CRM?** → [`architecture/CRM_LEADS_ARCHITECTURE.md`](./architecture/CRM_LEADS_ARCHITECTURE.md) ⭐
- **Sistema Agentic?** → [`agentic/AGENTIC_SETUP.md`](./agentic/AGENTIC_SETUP.md)

### Guias Técnicos

- **Resumo da Fase 1?** → [`FASE_1_RESUMO_EXECUTIVO.md`](./FASE_1_RESUMO_EXECUTIVO.md) ⭐
- **Detalhes Técnicos?** → [`guides/FASE_1_COMPLETA.md`](./guides/FASE_1_COMPLETA.md)
- **Checklist de Setup?** → [`setup/CHECKLIST.md`](./setup/CHECKLIST.md)
- **Guia do CRM?** → [`guides/CRM.md`](./guides/CRM.md)

### Ferramentas

- **Obter Gmail Token?** → Abrir [`setup/get-gmail-token.html`](./setup/get-gmail-token.html) no browser
- **Criar Directive?** → [`agentic/directives/README.md`](./agentic/directives/README.md)

---

## 📊 Sistema de Leads CRM - Visão Geral

O sistema implementado na **Fase 1** inclui:

### ✅ Funcionalidades

1. **Recepção de Leads INBOUND** (via website)
   - Formulário com validação
   - Análise automática com IA (OpenAI)
   - Sistema de aprovação/rejeição

2. **Gestão de Leads OUTBOUND** (prospeção manual)
   - Criação direta no CRM
   - Sem necessidade de aprovação

3. **Sistema de Notificações**
   - Badge em tempo real no dashboard
   - Emails automáticos (Gmail API)
   - Templates HTML profissionais

4. **Análise Inteligente**
   - Score de qualidade (0-100)
   - Priorização automática
   - Pontos positivos e de atenção

### 🔧 Tecnologias

- **Supabase** - Base de dados + Auth + Realtime
- **OpenAI API** - Análise IA de leads (GPT-4o-mini)
- **Gmail API** - Envio de emails (OAuth 2.0)
- **reCAPTCHA** - Proteção anti-spam

### 📦 Entregas

- ✅ 2 novas tabelas + 1 modificada
- ✅ 5 funções RPC
- ✅ 13 índices de performance
- ✅ 3 templates de email HTML
- ✅ 4 módulos TypeScript
- ✅ 6 guias de documentação
- ✅ 1 ferramenta de setup OAuth

---

## 🎯 Roadmap

### ✅ Fase 1: Fundação (CONCLUÍDA)
- [x] Base de dados e migrations
- [x] Integrações (OpenAI + Gmail)
- [x] Templates de email
- [x] Documentação completa

### 🚧 Fase 2: Backend (Em Progresso)
- [ ] Endpoints da API REST
- [ ] Validação de reCAPTCHA
- [ ] Sistema de webhooks
- [ ] Testes automatizados

### 📅 Fase 3: Frontend
- [ ] Formulário do website
- [ ] Badge de notificações
- [ ] Modal de aprovação/rejeição
- [ ] Formulário OUTBOUND

### 📅 Fase 4: Testes e Deploy
- [ ] Testes end-to-end
- [ ] Deploy staging
- [ ] Deploy produção
- [ ] Monitorização

---

## 📞 Suporte

Para dúvidas ou problemas:

1. **Consulte primeiro:** Documentação relevante acima
2. **Troubleshooting:** [`setup/CHECKLIST.md`](./setup/CHECKLIST.md)
3. **Configuração:** [`setup/ENV_SETUP.md`](./setup/ENV_SETUP.md)
4. **Arquitetura:** [`architecture/CRM_LEADS_ARCHITECTURE.md`](./architecture/CRM_LEADS_ARCHITECTURE.md)

---

**Última atualização:** 21 Janeiro 2026  
**Versão:** 1.0 - Fase 1 Completa ✅
