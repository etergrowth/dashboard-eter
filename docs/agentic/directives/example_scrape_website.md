# Scrape Website

## Objetivo
Extrair dados de um website específico e salvar em formato estruturado.

## Inputs
- URL do website (fornecido pelo usuário ou via parâmetro)
- Configurações de scraping (opcional, em `.env`)

## Processo
1. Validar URL fornecida
2. Executar `execution/scrape_single_site.py` com a URL
3. Script retorna dados em JSON
4. Salvar resultado em `.tmp/scraped_data/{domain}.json`

## Outputs
- Arquivo JSON em `.tmp/scraped_data/` com:
  - Título da página
  - Conteúdo principal
  - Links encontrados
  - Metadados (data, URL, etc.)

## Edge Cases
- Se website retornar 404: registrar erro e retornar mensagem clara
- Se timeout (>30s): tentar novamente uma vez, depois falhar
- Se bloqueado por rate limit: aguardar 60s e tentar novamente
- Se conteúdo não encontrado: retornar estrutura vazia mas válida

## Melhorias Futuras
- Adicionar suporte para JavaScript rendering (Selenium/Playwright)
- Cache de resultados para evitar re-scraping
- Suporte para múltiplas páginas (sitemap)
