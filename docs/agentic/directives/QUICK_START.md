# Quick Start - Arquitetura de 3 Camadas

## Para Usar Esta Arquitetura

### 1. Criar uma Directive

Crie um arquivo `.md` em `directives/` descrevendo a tarefa:

```markdown
# Minha Tarefa

## Objetivo
O que fazer

## Inputs
- O que é necessário

## Processo
1. Passo 1 usando `execution/script1.py`
2. Passo 2

## Outputs
- O que será produzido

## Edge Cases
- O que fazer em caso de erro X
```

### 2. Criar Script de Execução (se necessário)

Se não existir um script adequado em `execution/`, crie um:

```python
#!/usr/bin/env python3
"""
Script: meu_script.py
Descrição: O que faz
"""

import os
from dotenv import load_dotenv

load_dotenv()

def main():
    # Sua lógica aqui
    pass

if __name__ == "__main__":
    main()
```

### 3. Executar

O agente AI (Layer 2) irá:
1. Ler a directive
2. Executar os scripts necessários
3. Lidar com erros
4. Produzir outputs

## Exemplo Completo

**Directive**: `directives/example_scrape_website.md`
**Script**: `execution/example_scrape_single_site.py`

Para usar:
```bash
# Instalar dependências Python
pip install -r execution/requirements.txt

# Executar script diretamente (para teste)
python execution/example_scrape_single_site.py https://example.com
```

O agente AI orquestrará isso automaticamente quando você pedir para executar a directive.
