import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useReceiptUpload } from '@/dashboard/hooks/useReceiptUpload';
import { Button } from '@/components/ui/button';
import { X, Download, Loader2 } from 'lucide-react';
import type { ReciboTransacao } from '@/types/finance';

interface ReceiptModalProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ transactionId, isOpen, onClose }: ReceiptModalProps) {
  const [recibo, setRecibo] = useState<ReciboTransacao | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { getSignedUrl } = useReceiptUpload();

  useEffect(() => {
    if (!isOpen || !transactionId) return;

    const fetchRecibo = async () => {
      setLoading(true);
      try {
        // Buscar recibo
        const { data, error } = await supabase
          .from('recibos_transacoes')
          .select('*')
          .eq('transacao_id', transactionId)
          .single();

        if (error) throw error;
        setRecibo(data);

        // Obter URL assinada
        if (data.file_path) {
          const url = await getSignedUrl(data.file_path, 3600);
          setSignedUrl(url);
        }
      } catch (err) {
        console.error('Erro ao buscar recibo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecibo();
  }, [isOpen, transactionId, getSignedUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const isPDF = recibo?.mime_type === 'application/pdf';
  const isImage = recibo?.mime_type?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Recibo / Fatura</h2>
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

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : signedUrl ? (
            <div className="space-y-4">
              {isPDF ? (
                <iframe
                  src={signedUrl}
                  className="w-full h-[600px] border rounded"
                  title="PDF Preview"
                />
              ) : isImage ? (
                <img
                  src={signedUrl}
                  alt="Recibo"
                  className="max-w-full mx-auto rounded"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Tipo de ficheiro não suportado para pré-visualização</p>
              )}

              {recibo?.ocr_text && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Texto Extraído (OCR):</h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{recibo.ocr_text}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Não foi possível carregar o recibo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
