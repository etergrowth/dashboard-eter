import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { SandboxActivity, SandboxActivityInsert } from '../../types/sandbox';

const QUERY_KEY = 'sandbox-activities';

// Hook: Listar atividades de uma lead
export function useSandboxActivities(leadId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, leadId],
    queryFn: async (): Promise<SandboxActivity[]> => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('sandbox_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook: Criar atividade
export function useCreateSandboxActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (activity: SandboxActivityInsert): Promise<SandboxActivity> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('sandbox_activities')
        .insert({
          ...activity,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['sandbox-leads', data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['sandbox-leads'] });
    },
  });
}

// Hook: Deletar atividade
export function useDeleteSandboxActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      activityId, 
      leadId 
    }: { 
      activityId: string; 
      leadId: string 
    }): Promise<void> => {
      const { error } = await supabase
        .from('sandbox_activities')
        .delete()
        .eq('id', activityId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['sandbox-leads', variables.leadId] });
    },
  });
}
