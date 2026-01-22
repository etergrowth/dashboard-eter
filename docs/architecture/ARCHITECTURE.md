# Arquitetura de 3 Camadas (Agentic Architecture)

Este projeto implementa uma arquitetura de 3 camadas que separa responsabilidades para maximizar confiabilidade.

## Visão Geral

LLMs são probabilísticos, enquanto a maioria da lógica de negócio é determinística e requer consistência. Esta arquitetura resolve essa incompatibilidade.

## As 3 Camadas

### Layer 1: Directive (O que fazer)
- **Localização**: `directives/`
- **Formato**: SOPs (Standard Operating Procedures) escritas em Markdown
- **Conteúdo**: 
  - Objetivos
  - Inputs necessários
  - Ferramentas/scripts a usar
  - Outputs esperados
  - Edge cases e tratamento de erros
- **Linguagem**: Natural, como instruções para um funcionário de nível médio

### Layer 2: Orchestration (Decisão)
- **Responsável**: Agente AI (você)
- **Função**: Roteamento inteligente
  - Ler directives
  - Chamar scripts de execução na ordem correta
  - Lidar com erros
  - Pedir esclarecimentos quando necessário
  - Atualizar directives com aprendizados
- **Princípio**: Você é a ponte entre intenção e execução

### Layer 3: Execution (Fazer o trabalho)
- **Localização**: `execution/`
- **Formato**: Scripts Python determinísticos
- **Responsabilidades**:
  - Chamadas de API
  - Processamento de dados
  - Operações de arquivo
  - Interações com banco de dados
- **Características**: Confiáveis, testáveis, rápidos, bem comentados

## Por que funciona?

Se você fizer tudo sozinho, erros se acumulam. 90% de precisão por passo = 59% de sucesso em 5 passos.

A solução: empurrar complexidade para código determinístico. Assim você foca apenas em tomada de decisão.

## Princípios Operacionais

### 1. Verificar ferramentas primeiro
Antes de escrever um script, verifique `execution/` conforme sua directive. Só crie novos scripts se nenhum existir.

### 2. Auto-anelar quando algo quebra
- Ler mensagem de erro e stack trace
- Corrigir o script e testar novamente (a menos que use tokens/credits pagos - nesse caso, verificar com usuário primeiro)
- Atualizar a directive com o que foi aprendido (limites de API, timing, edge cases)
- Exemplo: você atinge limite de rate da API → investigar API → encontrar endpoint batch que resolveria → reescrever script → testar → atualizar directive

### 3. Atualizar directives conforme aprende
Directives são documentos vivos. Quando você descobre:
- Restrições de API
- Abordagens melhores
- Erros comuns
- Expectativas de timing

Atualize a directive. **Mas não crie ou sobrescreva directives sem permissão**, a menos que explicitamente instruído. Directives são seu conjunto de instruções e devem ser preservadas (e melhoradas ao longo do tempo, não usadas extemporaneamente e depois descartadas).

## Loop de Auto-Anelamento

Erros são oportunidades de aprendizado. Quando algo quebra:

1. **Corrigir** - Resolver o problema imediato
2. **Atualizar ferramenta** - Melhorar o script
3. **Testar** - Garantir que funciona
4. **Atualizar directive** - Documentar novo fluxo
5. **Sistema mais forte** - Próxima vez será melhor

## Organização de Arquivos

### Deliverables vs Intermediários

- **Deliverables**: Google Sheets, Google Slides, ou outras saídas baseadas em nuvem que o usuário pode acessar
- **Intermediários**: Arquivos temporários necessários durante o processamento

### Estrutura de Diretórios

```
projeto/
├── directives/          # SOPs em Markdown (conjunto de instruções)
├── execution/           # Scripts Python (ferramentas determinísticas)
├── .tmp/               # Arquivos intermediários (nunca commitados, sempre regenerados)
├── .env                # Variáveis de ambiente e API keys
├── credentials.json    # Credenciais OAuth do Google (em .gitignore)
└── token.json          # Token OAuth do Google (em .gitignore)
```

### Princípio Chave

Arquivos locais são apenas para processamento. Deliverables vivem em serviços de nuvem (Google Sheets, Slides, etc.) onde o usuário pode acessá-los. Tudo em `.tmp/` pode ser deletado e regenerado.

## Resumo

Você fica entre a intenção humana (directives) e a execução determinística (scripts Python). Leia instruções, tome decisões, chame ferramentas, lide com erros, melhore continuamente o sistema.

**Seja pragmático. Seja confiável. Auto-anelar.**
