# Directives (Layer 1)

Esta pasta contém as **Directives** (SOPs - Standard Operating Procedures) escritas em Markdown.

## O que são Directives?

Directives são instruções em linguagem natural que definem:
- **Objetivos**: O que fazer
- **Inputs**: O que é necessário
- **Ferramentas/Scripts**: Quais scripts Python usar (em `execution/`)
- **Outputs**: O que produzir
- **Edge cases**: Casos especiais e tratamento de erros

## Princípios

1. **Linguagem natural**: Como instruções para um funcionário de nível médio
2. **Documentos vivos**: Atualizados conforme aprendemos com erros e melhorias
3. **Não criar/sobrescrever sem permissão**: Directives são preservadas e melhoradas ao longo do tempo

## Estrutura de uma Directive

```markdown
# Nome da Tarefa

## Objetivo
O que esta directive faz.

## Inputs
- Arquivo X
- Parâmetro Y
- API key Z

## Processo
1. Passo 1 usando `execution/script1.py`
2. Passo 2 usando `execution/script2.py`
3. Passo 3

## Outputs
- Arquivo gerado em `.tmp/`
- Google Sheet atualizado
- Email enviado

## Edge Cases
- Se API retornar erro 429: aguardar 60s e tentar novamente
- Se arquivo não existir: criar template vazio
```

## Exemplos

Veja os arquivos nesta pasta para exemplos de directives específicas.
