import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { 
  LeadSandbox, 
  LeadSandboxInsert, 
  LeadSandboxUpdate,
  LeadWithScore
} from '../../types/sandbox';

const QUERY_KEY = 'sandbox-leads';

// Hook: Listar todas as leads
export function useSandboxLeads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<LeadSandbox[]> => {
      const { data, error } = await supabase
        .from('leads_sandbox')
        .select('*')
        .order('date_created', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook: Buscar lead individual com score
export function useSandboxLead(leadId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, leadId],
    queryFn: async (): Promise<LeadWithScore | null> => {
      if (!leadId) return null;
      
      // Buscar lead
      const { data: lead, error: leadError } = await supabase
        .from('leads_sandbox')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (leadError) throw leadError;
      if (!lead) return null;
      
      // Calcular score
      const { data: scoreData, error: scoreError } = await supabase
        .rpc('calculate_lead_score', { lead_id: leadId });
      
      if (scoreError) throw scoreError;
      
      return {
        ...lead,
        score: scoreData || 0
      };
    },
    enabled: !!user && !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook: Criar lead
export function useCreateSandboxLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (lead: LeadSandboxInsert): Promise<LeadSandbox> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('leads_sandbox')
        .insert({
          ...lead,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook: Atualizar lead
export function useUpdateSandboxLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: LeadSandboxUpdate & { id: string }): Promise<LeadSandbox> => {
      const { data, error } = await supabase
        .from('leads_sandbox')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

// Hook: Deletar lead
export function useDeleteSandboxLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadId: string): Promise<void> => {
      const { error } = await supabase
        .from('leads_sandbox')
        .delete()
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook: Converter lead para CRM
export function useConvertLeadToClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (leadId: string): Promise<string> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .rpc('convert_sandbox_lead_to_client', {
          p_lead_id: leadId,
          p_user_id: user.id
        });
      
      if (error) throw error;
      return data; // client_id
    },
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, leadId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Hook: Atualizar scratchpad (debounced)
export function useUpdateScratchpad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      leadId, 
      notes 
    }: { 
      leadId: string; 
      notes: string 
    }): Promise<void> => {
      const { error } = await supabase
        .from('leads_sandbox')
        .update({ scratchpad_notes: notes })
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.leadId] });
    },
  });
}

// Hook: Atualizar critério BANT
export function useUpdateBANT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      leadId, 
      criterion, 
      value 
    }: { 
      leadId: string; 
      criterion: 'budget' | 'authority' | 'need' | 'timeline'; 
      value: boolean 
    }): Promise<void> => {
      const fieldName = `bant_${criterion}`;
      
      const { error } = await supabase
        .from('leads_sandbox')
        .update({ [fieldName]: value })
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.leadId] });
    },
  });
}
