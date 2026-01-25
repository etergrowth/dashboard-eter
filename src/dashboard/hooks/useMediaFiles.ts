import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { MediaFile, MediaFileInsert, MediaFileUpdate } from '../../types';

export function useMediaFiles() {
  return useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [] as MediaFile[];
      }

      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaFile[];
    },
  });
}


export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Omit<MediaFileInsert, 'file_path' | 'file_size' | 'file_type' | 'user_id' | 'public_url'> }) => {
      // Obter user_id autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilizador não autenticado');
      }

      const isInvoice = metadata.category === 'invoice';
      const bucketName = isInvoice ? 'faturas-recibos' : 'media';
      
      // Estrutura de caminho diferente para faturas
      let fileName: string;
      if (isInvoice) {
        // Para faturas: {user_id}/{year}/{month}/{timestamp}_{filename}
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const timestamp = now.getTime();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        fileName = `${user.id}/${year}/${month}/${timestamp}_${sanitizedFilename}`;
      } else {
        // Para outros ficheiros: {user_id}/{timestamp}.{ext}
        const fileExt = file.name.split('.').pop();
        fileName = `${user.id}/${Date.now()}.${fileExt}`;
      }

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get URL (signed URL para faturas, public URL para media)
      let publicUrl: string | null = null;
      if (isInvoice) {
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileName, 3600);
        if (!signedError && signedUrlData) {
          publicUrl = signedUrlData.signedUrl;
        }
      } else {
        const { data: { publicUrl: url } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        publicUrl = url;
      }

      // Save file metadata to database
      const { data, error } = await supabase
        .from('media_files')
        .insert({
          ...metadata,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          public_url: publicUrl,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Se for uma fatura, criar também registo em recibos_transacoes
      if (isInvoice && data) {
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const { error: reciboError } = await supabase
          .from('recibos_transacoes')
          .insert({
            user_id: user.id,
            filename: sanitizedFilename,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            ocr_processed: false,
          });

        if (reciboError) {
          console.error('Erro ao criar registo de recibo:', reciboError);
          // Não falhar o upload se o registo falhar
        }
      }

      return data as MediaFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      queryClient.invalidateQueries({ queryKey: ['recibos_transacoes'] });
    },
  });
}

export function useUpdateMediaFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: MediaFileUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('media_files')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MediaFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the file to delete from storage
      const { data: file, error: fetchError } = await supabase
        .from('media_files')
        .select('file_path')
        .eq('id', id)
        .single() as { data: { file_path: string } | null; error: any };

      if (fetchError) throw fetchError;

      // Delete from storage if file_path exists
      if (file?.file_path) {
        // Determinar bucket baseado no caminho ou categoria
        const { data: fileData } = await supabase
          .from('media_files')
          .select('category, file_path')
          .eq('id', id)
          .single();

        const isInvoice = fileData?.category === 'invoice';
        const bucketName = isInvoice ? 'faturas-recibos' : 'media';

        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([file.file_path]);

        if (storageError) throw storageError;

        // Se for fatura, também remover de recibos_transacoes
        if (isInvoice && file.file_path) {
          await supabase
            .from('recibos_transacoes')
            .delete()
            .eq('file_path', file.file_path);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    },
  });
}
