import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { UploadedFile } from '../../types/finance';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export function useReceiptUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'Ficheiro demasiado grande. Máximo: 10MB';
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Tipo de ficheiro não suportado. Use: JPEG, PNG ou PDF';
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validação
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Obter user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilizador não autenticado');
      }

      // Estrutura de caminho: {user_id}/{year}/{month}/{timestamp}_{filename}
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timestamp = now.getTime();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

      const filePath = `${user.id}/${year}/${month}/${timestamp}_${sanitizedFilename}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('faturas-recibos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Se o bucket não existir, criar um erro mais claro
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Bucket "faturas-recibos" não encontrado. Por favor, crie-o no Supabase Dashboard.');
        }
        throw uploadError;
      }

      setProgress(100);

      // Obter URL assinada (válida por 1 hora)
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from('faturas-recibos')
        .createSignedUrl(filePath, 3600);

      if (signedError) throw signedError;

      // Criar registo em recibos_transacoes para trigger automático
      const { data: reciboData, error: reciboError } = await supabase
        .from('recibos_transacoes')
        .insert({
          user_id: user.id,
          filename: sanitizedFilename,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          ocr_processed: false,
        })
        .select()
        .single();

      if (reciboError) {
        console.error('Erro ao criar registo de recibo:', reciboError);
        // Não falhar o upload se o registo falhar, mas logar o erro
      }

      return {
        url: signedUrlData.signedUrl,
        filename: sanitizedFilename,
        path: filePath,
        size: file.size,
        mimeType: file.type,
        reciboId: reciboData?.id,
      };
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload do ficheiro');
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getSignedUrl = async (filePath: string, expiresIn = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('faturas-recibos')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    const { error } = await supabase.storage
      .from('faturas-recibos')
      .remove([filePath]);

    if (error) throw error;
  };

  return {
    uploadFile,
    getSignedUrl,
    deleteFile,
    uploading,
    progress,
    error,
  };
}

// Helper para converter ficheiro para base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
