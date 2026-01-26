import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type {
  LeadPendente,
  LeadsPendentesStats,
  AprovarLeadResponse,
  RejeitarLeadResponse
} from '../../types/leadsPendentes';

const QUERY_KEY = 'leads-pendentes';

// Hook: Listar todas as leads pendentes
export function useLeadsPendentes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<LeadPendente[]> => {
      const { data, error } = await supabase
        .from('leads_pendentes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook: Listar apenas leads pendentes (estado = 'pendente')
export function useLeadsPendentesPendentes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'pendentes'],
    queryFn: async (): Promise<LeadPendente[]> => {
      const { data, error } = await supabase
        .from('leads_pendentes')
        .select('*')
        .eq('estado', 'pendente')
        .order('score_ia', { ascending: false, nullsFirst: false })
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

// Hook: Buscar lead individual
export function useLeadPendente(leadId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, leadId],
    queryFn: async (): Promise<LeadPendente | null> => {
      if (!leadId) return null;

      const { data, error } = await supabase
        .from('leads_pendentes')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!leadId,
    staleTime: 1 * 60 * 1000,
  });
}

// Hook: Estatísticas das leads
export function useLeadsPendentesStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async (): Promise<LeadsPendentesStats> => {
      const { data, error } = await supabase
        .rpc('get_leads_stats', { p_user_id: user?.id });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook: Aprovar lead
export function useAprovarLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lead: LeadPendente): Promise<AprovarLeadResponse> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('aprovar_lead', {
          p_lead_id: lead.id,
          p_approval_token: lead.approval_token,
          p_user_id: user.id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });
}

// Hook: Rejeitar lead
export function useRejeitarLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lead: LeadPendente): Promise<RejeitarLeadResponse> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('rejeitar_lead', {
          p_lead_id: lead.id,
          p_approval_token: lead.approval_token,
          p_user_id: user.id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });
}

// Hook: Contagem de leads pendentes (para badge no sidebar)
export function useLeadsPendentesCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('leads_pendentes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendente');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  });
}
