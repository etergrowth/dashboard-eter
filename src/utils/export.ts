/**
 * Converte um array de objetos para formato CSV
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Obter todas as chaves únicas dos objetos
  const keys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => keys.add(key));
  });

  const headers = Array.from(keys);
  
  // Criar linha de cabeçalho
  const headerRow = headers.map(header => {
    // Mapear nomes de campos para nomes mais legíveis
    const headerMap: Record<string, string> = {
      id: 'ID',
      title: 'Título',
      description: 'Descrição',
      status: 'Estado',
      total_amount: 'Total (€)',
      total_margin: 'Margem (€)',
      valid_until: 'Válida até',
      notes: 'Notas',
      created_at: 'Data de Criação',
      updated_at: 'Data de Atualização',
      client: 'Cliente',
      client_id: 'ID Cliente',
    };
    return headerMap[header] || header;
  }).join(',');

  // Criar linhas de dados
  const dataRows = data.map(item => {
    return headers.map(header => {
      let value = item[header];
      
      // Tratar valores nulos/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Tratar objetos (como client)
      if (typeof value === 'object' && value !== null) {
        if (header === 'client' && value.name) {
          value = value.name;
        } else {
          value = JSON.stringify(value);
        }
      }
      
      // Tratar datas
      if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        value = new Date(value).toLocaleDateString('pt-PT');
      }
      
      // Escapar vírgulas e aspas
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Faz download de um CSV
 */
export function downloadCSV(csv: string, filename: string): void {
  if (!csv) {
    console.warn('CSV vazio, não é possível fazer download');
    return;
  }

  // Adicionar BOM para UTF-8 (ajuda Excel a reconhecer encoding)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
