import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { MediaFile, MediaFileInsert, MediaFileUpdate } from '../../types';

export function useMediaFiles() {
  return useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaFile[];
    },
  });
}


// Local user ID for local-only execution
const LOCAL_USER_ID = 'local-user';

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Omit<MediaFileInsert, 'file_path' | 'file_size' | 'file_type' | 'user_id' | 'public_url'> }) => {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${LOCAL_USER_ID}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Save file metadata to database
      const { data, error } = await supabase
        .from('media_files')
        .insert({
          ...metadata,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          public_url: publicUrl,
          user_id: LOCAL_USER_ID,
        } as any)
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
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([file.file_path]);

        if (storageError) throw storageError;
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
