import { useState, useEffect } from 'react';
import { FinanceChat } from './components/FinanceChat';
import { ManualTransactionForm } from './components/ManualTransactionForm';
import { UploadReceiptArea } from './components/UploadReceiptArea';
import { TransactionPreview } from './components/TransactionPreview';
import { TransactionsHistory } from './components/TransactionsHistory';
import { ReceiptModal } from './components/ReceiptModal';
import { Button } from '@/components/ui/button';
import { useCreateTransaction, useTransactions } from '@/dashboard/hooks/useTransactions';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TEXTS_PT } from './i18n';
import type { TransactionDraft, DadosExtraidosAI } from '@/types/finance';
import { Bot, PenTool, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type InputMode = 'ai' | 'manual';

export function Finance() {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<InputMode>('ai');
  const [draft, setDraft] = useState<TransactionDraft | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedReceiptTransactionId, setSelectedReceiptTransactionId] = useState<string | null>(null);
  const [processingReceiptId, setProcessingReceiptId] = useState<string | null>(null);
  const [processingFilePath, setProcessingFilePath] = useState<string | null>(null);
  const createTransaction = useCreateTransaction();
  const { data: transactions } = useTransactions(50); // Buscar mais transações para monitorar

  // Monitorar quando uma transação é criada a partir de um recibo processado
  useEffect(() => {
    if (!processingReceiptId || !processingFilePath || !transactions) return;

    // Procurar transação criada com o file_path correspondente e estado pendente
    // (recém criada pelo trigger)
    const newTransaction = transactions.find(
      (t) => 
        t.recibo_url === processingFilePath && 
        t.extraido_via === 'ocr' &&
        t.estado === 'pendente'
    );

    if (newTransaction) {
      // Converter transação para draft
      const draftData: TransactionDraft = {
        tipo: newTransaction.tipo,
        valor: newTransaction.valor,
        moeda: newTransaction.moeda,
        data_transacao: newTransaction.data_transacao,
        comerciante: newTransaction.comerciante,
        descricao: newTransaction.descricao,
        categoria: newTransaction.categoria,
        recibo_url: newTransaction.recibo_url,
        recibo_filename: newTransaction.recibo_filename,
        extraido_via: 'ocr',
        confianca_ai: newTransaction.confianca_ai,
        metadata: newTransaction.metadata,
      };
      setDraft(draftData);
      setProcessingReceiptId(null);
      setProcessingFilePath(null);
      setShowUpload(false);
      toast.success('Recibo processado com sucesso!');
    }
  }, [transactions, processingReceiptId, processingFilePath]);

  const handleTransactionExtracted = async (data: DadosExtraidosAI) => {
    const draftData: TransactionDraft = {
      tipo: data.tipo,
      valor: data.valor,
      moeda: data.moeda || 'EUR',
      data_transacao: data.data,
      comerciante: data.comerciante,
      descricao: data.descricao,
      categoria: data.categoria,
      extraido_via: 'texto',
      confianca_ai: data.confianca,
      metadata: data.metadata,
    };
    setDraft(draftData);
    setShowUpload(false);
  };

  const handleFileUploaded = async (reciboId: string, transacaoId?: string) => {
    try {
      // Se a transação já foi criada pelo processamento direto
      if (transacaoId) {
        // Buscar a transação criada
        const { data: transacao, error: transacaoError } = await supabase
          .from('transacoes_financeiras')
          .select('*')
          .eq('id', transacaoId)
          .single();

        if (transacaoError || !transacao) {
          toast.error('Erro ao obter transação processada');
          return;
        }

        // Converter transação para draft
        const draftData: TransactionDraft = {
          tipo: transacao.tipo,
          valor: transacao.valor,
          moeda: transacao.moeda,
          data_transacao: transacao.data_transacao,
          comerciante: transacao.comerciante,
          descricao: transacao.descricao,
          categoria: transacao.categoria,
          recibo_url: transacao.recibo_url,
          recibo_filename: transacao.recibo_filename,
          extraido_via: 'ocr',
          confianca_ai: transacao.confianca_ai,
          metadata: transacao.metadata,
        };
        setDraft(draftData);
        setShowUpload(false);
        return;
      }

      // Fallback: aguardar processamento por trigger (se configurado)
      const { data: recibo, error } = await supabase
        .from('recibos_transacoes')
        .select('file_path, filename')
        .eq('id', reciboId)
        .single();

      if (error || !recibo) {
        toast.error('Erro ao obter informações do recibo');
        return;
      }

      setProcessingReceiptId(reciboId);
      setProcessingFilePath(recibo.file_path);
      toast.info('A processar recibo com AI...');
    } catch (error: any) {
      toast.error(error.message || TEXTS_PT.toastError);
      setProcessingReceiptId(null);
      setProcessingFilePath(null);
    }
  };

  const handleManualTransactionCreated = (draftData: TransactionDraft) => {
    setDraft(draftData);
    setShowUpload(false);
  };

  const handleConfirm = async (confirmedDraft: TransactionDraft) => {
    try {
      await createTransaction.mutateAsync(confirmedDraft);
      toast.success(TEXTS_PT.toastSuccess);
      setDraft(null);
    } catch (error: any) {
      toast.error(error.message || TEXTS_PT.toastTransactionError);
    }
  };

  const handleDiscard = () => {
    setDraft(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{TEXTS_PT.pageTitle}</h1>
          <p className="text-muted-foreground mt-2">{TEXTS_PT.pageSubtitle}</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/finance/estatisticas')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Estatísticas
        </Button>
      </div>

      {/* Tabs para alternar entre AI e Manual */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={inputMode === 'ai' ? 'default' : 'outline'}
          onClick={() => setInputMode('ai')}
          className="flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Modo AI
        </Button>
        <Button
          variant={inputMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setInputMode('manual')}
          className="flex items-center gap-2"
        >
          <PenTool className="h-4 w-4" />
          Modo Manual
        </Button>
      </div>

      {/* Layout principal: Input (AI ou Manual) | Upload+Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Coluna esquerda: AI Chat ou Formulário Manual */}
        <div className="w-full">
          {inputMode === 'ai' ? (
            <FinanceChat
              onTransactionExtracted={handleTransactionExtracted}
              onFileSelect={() => setShowUpload(!showUpload)}
            />
          ) : (
            <ManualTransactionForm
              onTransactionCreated={handleManualTransactionCreated}
              isSubmitting={createTransaction.isPending}
            />
          )}
        </div>

        {/* Coluna direita: Upload + Preview */}
        <div className="space-y-6 w-full">
          {showUpload && inputMode === 'ai' && (
            <UploadReceiptArea onFileUploaded={handleFileUploaded} />
          )}
          {processingReceiptId && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <p className="text-sm text-foreground">
                  A processar recibo com AI... Aguarde enquanto extraímos os dados.
                </p>
              </div>
            </div>
          )}
          <TransactionPreview
            draft={draft}
            onConfirm={handleConfirm}
            onDiscard={handleDiscard}
          />
        </div>
      </div>

      {/* Histórico */}
      <TransactionsHistory
        onReceiptClick={setSelectedReceiptTransactionId}
      />

      {/* Modal de Recibo */}
      {selectedReceiptTransactionId && (
        <ReceiptModal
          transactionId={selectedReceiptTransactionId}
          isOpen={!!selectedReceiptTransactionId}
          onClose={() => setSelectedReceiptTransactionId(null)}
        />
      )}
    </div>
  );
}
