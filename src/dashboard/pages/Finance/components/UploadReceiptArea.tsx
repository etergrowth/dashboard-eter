import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReceiptUpload } from '@/dashboard/hooks/useReceiptUpload';
import { TEXTS_PT } from '../i18n';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface UploadReceiptAreaProps {
  onFileUploaded: (reciboId: string, transacaoId?: string) => void;
}

export function UploadReceiptArea({ onFileUploaded }: UploadReceiptAreaProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { uploadAndProcess, uploading, processing, error } = useReceiptUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setResult(null);

    // Preview da imagem (apenas para imagens)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    try {
      // Upload e processar com OCR numa única chamada
      const response = await uploadAndProcess(file);

      if (response) {
        const { uploaded, ocr } = response;

        if (ocr.success && ocr.transacao_id) {
          setResult({
            success: true,
            message: `Recibo processado! Valor: ${ocr.extracted_data?.valor?.toFixed(2) || '0.00'}€ - ${ocr.extracted_data?.comerciante || 'Comerciante desconhecido'}`,
          });
          onFileUploaded(uploaded.reciboId!, ocr.transacao_id);
        } else {
          setResult({
            success: false,
            message: ocr.error || 'Erro ao processar recibo com OCR',
          });
          // Ainda notificar que o ficheiro foi carregado, mesmo sem OCR
          if (uploaded.reciboId) {
            onFileUploaded(uploaded.reciboId);
          }
        }
      }
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setResult({
        success: false,
        message: err.message || 'Erro ao processar ficheiro',
      });
    }
  }, [uploadAndProcess, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    disabled: uploading || processing,
  });

  const isLoading = uploading || processing;

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
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-2">
            {isLoading ? (
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
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className={`mt-4 p-3 text-sm rounded-lg flex items-center gap-2 ${
            result.success
              ? 'bg-green-500/10 text-green-700'
              : 'bg-destructive/10 text-destructive'
          }`}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {result.message}
          </div>
        )}

        {preview && !isLoading && (
          <div className="mt-4 border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Pre-visualizacao:</p>
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
