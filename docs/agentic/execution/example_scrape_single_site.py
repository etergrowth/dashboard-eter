#!/usr/bin/env python3
"""
Script: scrape_single_site.py
Descrição: Extrai dados de uma página web específica

Inputs:
- URL (via argumento de linha de comando)
- Opcional: USER_AGENT do .env

Outputs:
- JSON com dados extraídos (stdout)
- Logs de erro (stderr)
"""

import sys
import json
import os
import requests
from urllib.parse import urlparse
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# Carregar variáveis de ambiente
load_dotenv()

def scrape_website(url: str) -> dict:
    """
    Extrai dados de uma página web.
    
    Args:
        url: URL da página a ser extraída
        
    Returns:
        dict: Dados extraídos da página
    """
    try:
        # Configurar headers
        headers = {
            'User-Agent': os.getenv('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        }
        
        # Fazer requisição
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrair dados
        data = {
            'url': url,
            'title': soup.title.string if soup.title else '',
            'domain': urlparse(url).netloc,
            'content': soup.get_text(separator=' ', strip=True)[:1000],  # Primeiros 1000 chars
            'links': [a.get('href') for a in soup.find_all('a', href=True)][:10],  # Primeiros 10 links
            'meta_description': '',
            'status_code': response.status_code,
            'timestamp': None
        }
        
        # Extrair meta description se existir
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            data['meta_description'] = meta_desc.get('content', '')
        
        return data
        
    except requests.exceptions.Timeout:
        return {
            'error': 'Timeout: Website não respondeu em 30 segundos',
            'url': url
        }
    except requests.exceptions.HTTPError as e:
        return {
            'error': f'HTTP Error: {e.response.status_code}',
            'url': url
        }
    except Exception as e:
        return {
            'error': f'Erro desconhecido: {str(e)}',
            'url': url
        }

def main():
    """Função principal"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'URL não fornecida. Uso: python scrape_single_site.py <URL>'
        }), file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape_website(url)
    
    # Output JSON para stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
