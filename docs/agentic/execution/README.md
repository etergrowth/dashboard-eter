# Execution (Layer 3)

Esta pasta contém scripts Python determinísticos que executam tarefas específicas.

## O que são Execution Scripts?

Scripts Python que:
- Fazem chamadas de API
- Processam dados
- Operam arquivos
- Interagem com bancos de dados
- São **determinísticos, testáveis e rápidos**

## Princípios

1. **Determinísticos**: Mesmos inputs = mesmos outputs
2. **Bem comentados**: Código claro e documentado
3. **Testáveis**: Podem ser testados independentemente
4. **Rápidos**: Otimizados para performance

## Estrutura de um Script

```python
#!/usr/bin/env python3
"""
Script: nome_do_script.py
Descrição: O que este script faz

Inputs:
- arquivo.csv
- API_KEY (do .env)

Outputs:
- resultado.json (em .tmp/)
"""

import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def main():
    # Lógica do script
    pass

if __name__ == "__main__":
    main()
```

## Variáveis de Ambiente

Todos os scripts devem usar variáveis do arquivo `.env`:
- API keys
- Tokens
- URLs
- Configurações

## Outputs

Scripts devem escrever arquivos intermediários em `.tmp/`:
- Dados processados
- Exports temporários
- Logs de processamento

**Nunca commitar arquivos de `.tmp/`** - são sempre regenerados.
