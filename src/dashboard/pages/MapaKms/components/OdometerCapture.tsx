import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOcrOdometer } from '@/dashboard/hooks/useTrips';
import { toast } from 'sonner';

interface OdometerCaptureProps {
  label: string;
  value: number | null;
  imageUrl: string | null;
  onValueChange: (value: number | null) => void;
  onImageChange: (file: File | null, base64: string | null) => void;
  disabled?: boolean;
}

export function OdometerCapture({
  label,
  value,
  imageUrl,
  onValueChange,
  onImageChange,
  disabled,
}: OdometerCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl);
  const [ocrResult, setOcrResult] = useState<{
    success: boolean;
    confidence: number;
    notes?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrMutation = useOcrOdometer();

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreviewUrl(base64);
        onImageChange(file, base64);

        // OCR
        try {
          setOcrResult(null);
          const base64Data = base64.split(',')[1];
          const result = await ocrMutation.mutateAsync({
            imageBase64: base64Data,
            mimeType: file.type,
          });

          setOcrResult({
            success: result.success,
            confidence: result.confidence,
            notes: result.notes,
          });

          if (result.success && result.km_reading) {
            onValueChange(result.km_reading);
            toast.success(`Leitura detectada: ${result.km_reading.toLocaleString('pt-PT')} km`);
          } else {
            toast.warning('Não foi possível detectar a leitura automaticamente');
          }
        } catch (error) {
          console.error('OCR error:', error);
          toast.error('Erro ao processar imagem');
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageChange, onValueChange, ocrMutation]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setOcrResult(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* Image Preview or Upload Area */}
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Odómetro"
            className="w-full h-48 object-cover rounded-lg border"
            style={{ borderColor: 'hsl(var(--border))' }}
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>

          {/* OCR Status */}
          {ocrMutation.isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>A processar...</span>
              </div>
            </div>
          )}

          {ocrResult && (
            <div
              className={`absolute bottom-2 left-2 right-2 p-2 rounded-md ${
                ocrResult.success
                  ? 'bg-green-500/90 text-white'
                  : 'bg-yellow-500/90 text-black'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {ocrResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>
                  {ocrResult.success
                    ? `Confiança: ${Math.round(ocrResult.confidence * 100)}%`
                    : ocrResult.notes || 'Insira manualmente'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition"
          style={{ borderColor: 'hsl(var(--border))' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Tirar foto ou carregar imagem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Arraste uma imagem ou clique para selecionar
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Carregar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Leitura do odómetro (km)
        </label>
        <Input
          type="number"
          placeholder="Ex: 123456"
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value ? parseInt(e.target.value, 10) : null)}
          disabled={disabled}
          className="text-lg"
        />
      </div>
    </div>
  );
}
