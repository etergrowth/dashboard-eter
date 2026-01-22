# Projeto: Dashboard Eter (Eter Growth)

Este documento fornece o contexto completo do projeto, incluindo as suas funcionalidades, arquitetura e stack tecnológica.

## 📌 Visão Geral
O **Dashboard Eter** é uma plataforma interna de gestão (ERP/CRM) desenvolvida para a **Eter Growth**, focada em centralizar a gestão de clientes, projetos, propostas comerciais e a simulação detalhada de custos de serviços.

## 🚀 Tecnologias Utilizadas

### Core & Frameworks
- **React 18**: Biblioteca principal para a interface.
- **Vite**: Build tool extremamente rápida para o desenvolvimento.
- **TypeScript**: Tipagem estática para maior segurança e produtividade.
- **React Router DOM (v7)**: Gestão de rotas e navegação.

### Backend & Database
- **Supabase**: Backend-as-a-Service (BaaS).
  - **PostgreSQL**: Base de dados relacional.
  - **Supabase Auth**: Gestão de autenticação e perfis de utilizador.
  - **Supabase Storage**: Armazenamento de ficheiros e media.
  - **Row Level Security (RLS)**: Políticas de segurança ao nível da base de dados.

### Gestão de Estado & Dados
- **TanStack Query (React Query)**: Sincronização e cache de dados de servidor.
- **Zustand**: Gestão de estado global leve e performante.
- **React Hook Form**: Gestão de formulários complexos.
- **Zod**: Validação de esquemas e dados.

### UI & Estética
- **Tailwind CSS**: Framework CSS utility-first para estilização rápida e responsiva.
- **Framer Motion**: Animações fluidas e interações premium.
- **Lucide React**: Biblioteca de ícones moderna.
- **Glassmorphism**: Estilo visual "glass-panel" aplicado em toda a interface para um look premium.
- **Recharts**: Visualização de dados e gráficos estatísticos.

### Utilitários
- **TanStack Table (React Table)**: Tabelas robustas com ordenação e filtragem.
- **React Beautiful Dnd**: Funcionalidades de Drag & Drop (ex: Kanban).
- **Date-fns**: Manipulação e formatação de datas.

## 🛠️ Funcionalidades Principais

### 1. Overview & Analytics
- Painel principal com KPIs (Indicadores Chave de Performance).
- Gráficos de evolução de leads, vendas e performance de projetos.

### 2. CRM (Customer Relationship Management)
- **Gestão de Leads**: Pipeline de potenciais clientes com estados (Lead, Proposta, Negociação, Fechado, Perdido).
- **Interações**: Histórico de chamadas, emails, reuniões e notas por cliente.
- **Kanban de Vendas**: Visualização intuitiva do funil de vendas.

### 3. Gestão de Projetos
- **Kanban de Tarefas**: Organização de tarefas por estado (A fazer, Em progresso, Concluído).
- **Acompanhamento de Projetos**: Monitorização do estado dos projetos ativos.

### 4. Catálogo de Serviços
- Gestão centralizada dos serviços oferecidos.
- Configuração de custos base e taxas horárias finais.

### 5. Propostas & Simulação de Custos (Módulo Avançado)
- **Simulador de Custos**: Ferramenta dinâmica para calcular custos de serviços combinados.
  - Adição de múltiplos serviços por proposta.
  - Cálculo automático de margens de lucro, horas totais e custos de software.
  - **Toggle System**: Funcionalidade de expandir/recolher itens para manter a organização durante a simulação.
- **Gerador de Propostas**: Conversão de simulações em propostas formais para envio aos clientes.

### 6. Media Library
- Gestão e upload de assets e ficheiros relevantes para o negócio.

## 📁 Estrutura do Projeto
- `/src/components`: Componentes UI reutilizáveis.
- `/src/dashboard`: Módulos específicos do dashboard (páginas, componentes, hooks).
- `/src/lib`: Configurações de bibliotecas externas (ex: Supabase client).
- `/src/types`: Definições globais de TypeScript e esquemas da base de dados.
- `/src/hooks`: Hooks personalizados para lógica de negócio e queries.

---
*Este documento deve ser atualizado sempre que novas funcionalidades estruturais forem adicionadas ou houver mudanças na tecnologia base.*
