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
import time
from urllib.parse import urlparse, urljoin
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# #region agent log
def log_debug(hypothesis_id, message, data=None, location="example_scrape_single_site.py"):
    log_entry = {
        "sessionId": "debug-session",
        "runId": "post-fix",
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000)
    }
    try:
        with open("/Users/ricardo/Documents/Dashboard Eter/.cursor/debug.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except:
        pass
# #endregion

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
    # #region agent log
    log_debug("H1", "Entering scrape_website", {"url": url}, "example_scrape_single_site.py:36")
    # #endregion
    
    # Garantir que a URL tem um esquema (H1 fix)
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
        # #region agent log
        log_debug("H1", "Added scheme to URL", {"new_url": url}, "example_scrape_single_site.py:41")
        # #endregion

    try:
        # Configurar headers
        headers = {
            'User-Agent': os.getenv('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        }
        # #region agent log
        log_debug("H1", "Before requests.get", {"url": url, "headers": headers}, "example_scrape_single_site.py:42")
        # #endregion
        
        # Fazer requisição
        response = requests.get(url, headers=headers, timeout=30)
        # #region agent log
        log_debug("H2", "After requests.get", {"status_code": response.status_code, "encoding": response.encoding, "apparent_encoding": response.apparent_encoding}, "example_scrape_single_site.py:45")
        # #endregion
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrair dados
        data = {
            'url': url,
            'title': soup.title.string.strip() if soup.title and soup.title.string else '',
            'domain': urlparse(url).netloc,
            'content': soup.get_text(separator=' ', strip=True)[:1000],  # Primeiros 1000 chars
            'links': [],
            'meta_description': '',
            'status_code': response.status_code,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Extrair e resolver links (H4 fix)
        raw_links = [a.get('href') for a in soup.find_all('a', href=True)][:10]
        data['links'] = [urljoin(url, link) for link in raw_links]
        
        # #region agent log
        log_debug("H3", "Extracted basic data", {"title": data['title'], "links_count": len(data['links'])}, "example_scrape_single_site.py:60")
        # #endregion
        
        # Extrair meta description se existir
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            data['meta_description'] = meta_desc.get('content', '')
        
        # #region agent log
        log_debug("H4", "Extracted resolved links", {"links": data['links']}, "example_scrape_single_site.py:66")
        # #endregion
        return data
        
    except requests.exceptions.Timeout:
        # #region agent log
        log_debug("H5", "Timeout exception", {"url": url}, "example_scrape_single_site.py:70")
        # #endregion
        return {
            'error': 'Timeout: Website não respondeu em 30 segundos',
            'url': url
        }
    except requests.exceptions.HTTPError as e:
        # #region agent log
        log_debug("H5", "HTTPError exception", {"url": url, "status_code": e.response.status_code}, "example_scrape_single_site.py:75")
        # #endregion
        return {
            'error': f'HTTP Error: {e.response.status_code}',
            'url': url
        }
    except requests.exceptions.RequestException as e:
        # #region agent log
        log_debug("H5", "RequestException", {"url": url, "error": str(e)}, "example_scrape_single_site.py:80")
        # #endregion
        return {
            'error': f'Erro de rede: {str(e)}',
            'url': url
        }
    except Exception as e:
        # #region agent log
        log_debug("H5", "General exception", {"url": url, "error": str(e), "type": type(e).__name__}, "example_scrape_single_site.py:81")
        # #endregion
        return {
            'error': f'Erro inesperado: {str(e)}',
            'url': url
        }

def main():
    """Função principal"""
    # #region agent log
    log_debug("H1", "Entering main", {"args": sys.argv}, "example_scrape_single_site.py:86")
    # #endregion
    if len(sys.argv) < 2:
        # #region agent log
        log_debug("H1", "URL not provided", None, "example_scrape_single_site.py:89")
        # #endregion
        print(json.dumps({
            'error': 'URL não fornecida. Uso: python scrape_single_site.py <URL>'
        }), file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    # #region agent log
    log_debug("H1", "URL provided", {"url": url}, "example_scrape_single_site.py:97")
    # #endregion
    result = scrape_website(url)
    
    # #region agent log
    log_debug("H3", "Result obtained", {"success": "error" not in result}, "example_scrape_single_site.py:101")
    # #endregion
    # Output JSON para stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
