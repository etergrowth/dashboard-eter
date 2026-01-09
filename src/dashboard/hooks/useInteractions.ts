import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Interaction, InteractionInsert, InteractionUpdate } from '../../types';

export function useInteractions(clientId?: string) {
  return useQuery({
    queryKey: ['interactions', clientId],
    queryFn: async () => {
      let query = supabase
        .from('interactions')
        .select('*')
        .order('date', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Interaction[];
    },
  });
}

// Local user ID for local-only execution
const LOCAL_USER_ID = 'local-user';

export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interaction: InteractionInsert) => {
      const { data, error } = await supabase
        .from('interactions')
        .insert({ ...interaction, user_id: LOCAL_USER_ID } as any)
        .select()
        .single();

      if (error) throw error;
      return data as Interaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
}

export function useUpdateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: InteractionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('interactions')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Interaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
}
