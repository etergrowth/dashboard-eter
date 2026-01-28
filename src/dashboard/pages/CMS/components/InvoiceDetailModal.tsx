import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, FileText, Calendar, Euro, Building2, Tag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { MediaFile } from '@/types';
import type { ReciboTransacao } from '@/types/finance';
import type { TransacaoFinanceira } from '@/types/finance';

interface InvoiceDetailModalProps {
  file: MediaFile;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailModal({ file, isOpen, onClose }: InvoiceDetailModalProps) {
  const [recibo, setRecibo] = useState<ReciboTransacao | null>(null);
  const [transacao, setTransacao] = useState<TransacaoFinanceira | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen || file.category !== 'invoice') return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar recibo relacionado
        const { data: reciboData, error: reciboError } = await supabase
          .from('recibos_transacoes')
          .select('*')
          .eq('file_path', file.file_path)
          .single();

        if (!reciboError && reciboData) {
          setRecibo(reciboData);

          // Se tiver transacao_id, buscar transação
          if (reciboData.transacao_id) {
            const { data: transacaoData, error: transacaoError } = await supabase
              .from('transacoes_financeiras')
              .select('*')
              .eq('id', reciboData.transacao_id)
              .single();

            if (!transacaoError && transacaoData) {
              setTransacao(transacaoData);
            }
          }
        }

        // Obter URL assinada para visualização
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('faturas-recibos')
          .createSignedUrl(file.file_path, 3600);

        if (!signedError && signedUrlData) {
          setSignedUrl(signedUrlData.signedUrl);
        }
      } catch (err) {
        console.error('Erro ao buscar dados da fatura:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, file]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-PT');
    } catch {
      return dateString;
    }
  };

  const isPDF = file.file_type === 'application/pdf';
  const isImage = file.file_type?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 md:p-4" onClick={onClose}>
      <div
        className={`bg-background shadow-lg ${isMobile ? 'max-w-full mx-0 rounded-t-3xl' : 'max-w-6xl rounded-lg mx-4'} w-full max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} border-b`}>
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 truncate`}>
            <FileText className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            <span className="truncate">{file.name}</span>
          </h2>
          <div className="flex items-center gap-2">
            {signedUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Descarregar
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className={`flex-1 overflow-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} ${isMobile ? 'gap-4' : 'gap-6'}`}>
              {/* Preview da Fatura */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Pré-visualização</h3>
                {signedUrl ? (
                  <div className="border rounded-lg overflow-hidden bg-muted/10">
                    {isPDF ? (
                      <iframe
                        src={signedUrl}
                        className={`w-full ${isMobile ? 'h-[400px]' : 'h-[600px]'} border-0`}
                        title="PDF Preview"
                      />
                    ) : isImage ? (
                      <img
                        src={signedUrl}
                        alt={file.name}
                        className={`w-full h-auto ${isMobile ? 'max-h-[400px]' : 'max-h-[600px]'} object-contain`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <p>Tipo de ficheiro não suportado para pré-visualização</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>Não foi possível carregar a fatura.</p>
                  </div>
                )}

                {/* Informações do Ficheiro */}
                <div className="glass-panel p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-semibold mb-3">Informações do Ficheiro</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tamanho:</span>
                      <span>{file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span>{file.file_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carregado em:</span>
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes da Transação */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Detalhes da Transação</h3>
                
                {transacao ? (
                  <div className="glass-panel p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}>
                        {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <Badge variant={transacao.estado === 'verificado' ? 'default' : 'outline'}>
                        {transacao.estado === 'verificado' ? 'Verificado' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Euro className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Valor</p>
                          <p className="text-2xl font-bold">{formatCurrency(Number(transacao.valor))}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Comerciante</p>
                          <p className="font-medium">{transacao.comerciante || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Data</p>
                          <p className="font-medium">{formatDate(transacao.data_transacao)}</p>
                        </div>
                      </div>

                      {transacao.categoria && (
                        <div className="flex items-center gap-3">
                          <Tag className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Categoria</p>
                            <p className="font-medium">{transacao.categoria}</p>
                          </div>
                        </div>
                      )}

                      {transacao.descricao && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                          <p className="text-sm">{transacao.descricao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Esta fatura ainda não está associada a uma transação.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Processe a fatura na secção Financeira para criar uma transação automaticamente.
                    </p>
                  </div>
                )}

                {/* Texto OCR se disponível */}
                {recibo?.ocr_text && (
                  <div className="glass-panel p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Texto Extraído (OCR)</h4>
                    <div className="max-h-48 overflow-auto">
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{recibo.ocr_text}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
