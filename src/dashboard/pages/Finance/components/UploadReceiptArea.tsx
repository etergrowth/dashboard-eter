import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReceiptUpload } from '@/dashboard/hooks/useReceiptUpload';
import { TEXTS_PT } from '../i18n';
import { Upload, Loader2 } from 'lucide-react';

interface UploadReceiptAreaProps {
  onFileUploaded: (reciboId: string) => void;
}

export function UploadReceiptArea({ onFileUploaded }: UploadReceiptAreaProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { uploadFile, uploading, error } = useReceiptUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Preview da imagem (apenas para imagens)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    try {
      setProcessing(true);
      // Upload para Supabase Storage e criar registo em recibos_transacoes
      // O trigger automaticamente chama a Edge Function para processar
      const uploadResult = await uploadFile(file);

      if (uploadResult.reciboId) {
        // Notificar componente pai que o recibo foi carregado
        // A transação será criada automaticamente pelo trigger
        onFileUploaded(uploadResult.reciboId);
        // Manter processing=true enquanto aguarda processamento automático
        // O estado será limpo quando a transação aparecer via Realtime
      } else {
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setProcessing(false);
      // Erro já é tratado no hook
    }
  }, [uploadFile, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{TEXTS_PT.uploadTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-2">
            {uploading || processing ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm text-gray-600 mt-2">
                  {uploading ? TEXTS_PT.uploadProcessing : 'A processar recibo com AI...'}
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400" />
                <h3 className="font-semibold text-lg">{TEXTS_PT.uploadTitle}</h3>
                <p className="text-sm text-gray-600">
                  {isDragActive ? TEXTS_PT.uploadDragActive : TEXTS_PT.uploadSubtitle}
                </p>
                <p className="text-xs text-gray-500">{TEXTS_PT.uploadMaxSize}</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {preview && !uploading && (
          <div className="mt-4 border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Pré-visualização:</p>
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
