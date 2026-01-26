// Textos da interface em Português de Portugal (PT-PT)

export const TEXTS_PT = {
  pageTitle: 'Agente AI de Finanças e Central de Registos',
  pageSubtitle: 'Transforme linguagem natural e recibos em registos contabilísticos instantaneamente.',

  // Assistente
  assistantTitle: 'Carla, Assistente Financeira',
  assistantBadge: 'AO VIVO',
  inputPlaceholder: 'Descreva a transação ou carregue uma fatura...',
  sendButton: 'Enviar',

  // Upload
  uploadTitle: 'Carregar Fatura / Recibo',
  uploadSubtitle: 'Arraste e solte ou clique para procurar (PNG, JPG)',
  uploadMaxSize: 'Máximo: 10MB',
  uploadProcessing: 'A processar ficheiro...',
  uploadDragActive: 'Solte o ficheiro aqui...',

  // Preview Panel
  previewTitle: 'Pré-visualização da Transação',
  previewBadgeAI: 'RASCUNHO AI',
  previewBadgeEdited: 'EDITADO',
  previewDateLabel: 'DATA',
  previewAmountLabel: 'VALOR',
  previewMerchantLabel: 'COMERCIANTE / DESCRIÇÃO',
  previewCategoryLabel: 'CATEGORIA',
  previewCategoryPlaceholder: 'Selecione uma categoria...',
  confirmButton: 'Confirmar Entrada',
  discardButton: 'Descartar Rascunho',

  // Tabela
  tableTitle: 'Processados Recentemente',
  tableViewAll: 'Ver Todo o Histórico',
  tableHeaderDate: 'DATA',
  tableHeaderDescription: 'DESCRIÇÃO',
  tableHeaderCategory: 'CATEGORIA',
  tableHeaderAmount: 'VALOR',
  tableHeaderReceipt: 'RECIBO',
  tableHeaderStatus: 'ESTADO',
  tableStatusVerified: 'Verificado',
  tableStatusPending: 'Pendente de Revisão',

  // Categorias (nome_display)
  categorySoftwareSaaS: 'Software & SaaS',
  categoryTravel: 'Viagens',
  categoryMeals: 'Refeições',
  categoryOfficeSupplies: 'Material de Escritório',
  categoryIncome: 'Receitas',
  categorySubscriptions: 'Subscrições',
  categoryUtilities: 'Serviços Públicos',
  categoryMarketing: 'Marketing',
  categoryProfessionalServices: 'Serviços Profissionais',
  categoryOther: 'Outro',

  // Tipos
  typeIncome: 'Receita',
  typeExpense: 'Despesa',

  // Toast messages
  toastSuccess: '✅ Transação guardada com sucesso!',
  toastError: '❌ Erro ao processar. Tente novamente.',
  toastFileTooBig: 'Ficheiro demasiado grande. Máximo: 10MB',
  toastInvalidFile: 'Tipo de ficheiro não suportado. Use: JPEG ou PNG',
  toastTransactionSaved: 'Transação guardada com sucesso!',
  toastTransactionError: 'Erro ao guardar transação',

  // Agent messages
  agentWelcome: 'Olá! Sou a Carla, a sua assistente financeira. Estou pronta para processar as suas finanças. Pode escrever uma transação como "Paguei 45,50€ por almoço com cliente no Blue Bottle" ou simplesmente carregar um recibo aqui.',
  agentExtracted: 'Compreendido. Extraí os seguintes detalhes. Por favor, reveja-os no painel de pré-visualização à direita.',
  agentReceiptProcessed: (merchant: string, amount: number, date: string) =>
    `Processei o seu recibo de ${merchant}. Encontrei um total de ${amount.toFixed(2)}€ com data de ${date}. Por favor, verifique os detalhes no painel de pré-visualização.`,
  agentConfirmed: 'Perfeito! O seu registo foi guardado. Posso ajudar com mais alguma coisa?',
  agentError: 'Desculpe, não consegui processar essa informação. Pode reformular ou fornecer mais detalhes?',
} as const;
