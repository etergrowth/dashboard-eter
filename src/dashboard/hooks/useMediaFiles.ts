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

export function useClientMediaFiles(clientId?: string) {
  return useQuery({
    queryKey: ['media-files', 'client', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaFile[];
    },
    enabled: !!clientId,
  });
}

export function useProjectMediaFiles(projectId?: string) {
  return useQuery({
    queryKey: ['media-files', 'project', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaFile[];
    },
    enabled: !!projectId,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Omit<MediaFileInsert, 'file_url' | 'file_size' | 'mime_type' | 'user_id'> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

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
        // @ts-ignore
        .insert({
          ...metadata,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          user_id: user.id,
        })
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
        // @ts-ignore
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
      const { error } = await supabase.functions.invoke('delete-media-file', {
        body: { id },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    },
  });
}
