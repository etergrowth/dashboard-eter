import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Proposal, ProposalInsert, ProposalUpdate, ProposalItem, ProposalItemInsert, ProposalItemUpdate } from '../../types';

// Helper function to get current user ID (optional, RPC function will use auth.uid() if available)
async function getCurrentUserId(): Promise<string | null> {
  // Tentar pegar da sessão primeiro (mais rápido)
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id;
  }
  
  // Backup: pegar do usuário diretamente
  const { data: { user } } = await supabase.auth.getUser();
  
  return user?.id || null;
}

// Proposals
export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client data separately
      const proposalsWithClients = await Promise.all(
        (proposals as Proposal[]).map(async (proposal) => {
          if (proposal.client_id) {
            const { data: client } = await supabase
              .from('clients')
              .select('name, company')
              .eq('id', proposal.client_id)
              .single();
            
            return { ...proposal, client };
          }
          return { ...proposal, client: null };
        })
      );

      return proposalsWithClients as (Proposal & { client: { name: string; company: string | null } | null })[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - propostas mudam raramente
  });
}

export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: ['proposals', proposalId],
    queryFn: async () => {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) throw error;

      let client = null;
      if ((proposal as any).client_id) {
        const { data } = await supabase
          .from('clients')
          .select('name, company')
          .eq('id', (proposal as any).client_id)
          .single();
        client = data;
      }

      return { ...(proposal as any), client } as Proposal & { client: { name: string; company: string | null } | null };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - proposta individual
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: ProposalInsert) => {
      // Get current user ID (opcional - RPC vai usar fallback se null)
      const userId = proposal.user_id || await getCurrentUserId();
      
      // Ordem dos parâmetros deve corresponder à função RPC:
      // p_title, p_user_id, p_client_id, p_description, p_status, p_total_amount, p_total_margin, p_valid_until, p_notes
      
      // Garantir que client_id seja null se for string vazia ou undefined
      const clientId = proposal.client_id && proposal.client_id !== '' 
        ? proposal.client_id 
        : null;
      
      // Garantir que valores numéricos sejam preservados (incluindo 0)
      const totalAmount = proposal.total_amount !== undefined && proposal.total_amount !== null 
        ? Number(proposal.total_amount) 
        : null;
      const totalMargin = proposal.total_margin !== undefined && proposal.total_margin !== null 
        ? Number(proposal.total_margin) 
        : null;
      
      // Nova ordem de parâmetros: p_title vem primeiro
      const rpcParams = {
        p_title: proposal.title,
        p_user_id: userId || null,
        p_client_id: clientId,
        p_description: proposal.description || null,
        p_status: proposal.status || 'draft',
        p_total_amount: totalAmount,
        p_total_margin: totalMargin,
        p_valid_until: proposal.valid_until || null,
        p_notes: proposal.notes || null,
      };
      
      // Use RPC function instead of direct INSERT (following FORM_SUBMISSION_GUIDE.md pattern)
      const { data, error } = await supabase.rpc('create_proposal', rpcParams as any);

      if (error) {
        console.error('❌ ERRO ao criar proposta:', error);
        throw error;
      }

      // A função RPC agora retorna a proposta completa diretamente
      if (data) {
        return data as Proposal;
      }

      throw new Error('Erro ao criar proposta: resposta inválida da função RPC');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProposalUpdate & { id: string }) => {
      // Use RPC function instead of direct UPDATE (following FORM_SUBMISSION_GUIDE.md pattern)
      const { data, error } = await supabase.rpc('update_proposal', {
        p_id: id,
        p_client_id: updates.client_id !== undefined ? updates.client_id : null,
        p_title: updates.title || null,
        p_description: updates.description !== undefined ? updates.description : null,
        p_status: updates.status || null,
        p_total_amount: updates.total_amount !== undefined ? updates.total_amount : null,
        p_total_margin: updates.total_margin !== undefined ? updates.total_margin : null,
        p_valid_until: updates.valid_until !== undefined ? updates.valid_until : null,
        p_notes: updates.notes !== undefined ? updates.notes : null,
        p_links: updates.links !== undefined ? updates.links : null,
        p_awarded: updates.awarded !== undefined ? updates.awarded : null,
      } as any);

      if (error) {
        console.error('❌ ERRO ao atualizar proposta:', error);
        throw error;
      }

      // Fetch the updated proposal
      if (data && (data as any).success) {
        const { data: updatedProposal, error: fetchError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        return updatedProposal as Proposal;
      }

      throw new Error('Erro ao atualizar proposta: resposta inválida da função RPC');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals', variables.id] });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

// Proposal Items
export function useProposalItems(proposalId: string) {
  return useQuery({
    queryKey: ['proposal-items', proposalId],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('position', { ascending: true });

      if (error) throw error;

      // Fetch service data separately
      const itemsWithServices = await Promise.all(
        (items as ProposalItem[]).map(async (item) => {
          const { data: service } = await supabase
            .from('services')
            .select('name, base_cost_per_hour, final_hourly_rate')
            .eq('id', item.service_id)
            .single();
          
          return { ...item, service };
        })
      );

      return itemsWithServices as (ProposalItem & { service: { name: string; base_cost_per_hour: number; final_hourly_rate: number } | null })[];
    },
  });
}

export function useCreateProposalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ProposalItemInsert) => {
      const { data, error } = await supabase
        .from('proposal_items')
        .insert(item as any)
        .select()
        .single();

      if (error) throw error;
      return data as ProposalItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-items', (data as any).proposal_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals', (data as any).proposal_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useUpdateProposalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProposalItemUpdate & { id: string }) => {
      const updateData: any = updates;
      const { data, error } = await (supabase
        .from('proposal_items') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProposalItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-items', data.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals', data.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useDeleteProposalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get proposal_id before deleting
      const { data: item } = await supabase
        .from('proposal_items')
        .select('proposal_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('proposal_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return (item as any)?.proposal_id;
    },
    onSuccess: (proposalId) => {
      if (proposalId) {
        queryClient.invalidateQueries({ queryKey: ['proposal-items', proposalId] });
        queryClient.invalidateQueries({ queryKey: ['proposals', proposalId] });
        queryClient.invalidateQueries({ queryKey: ['proposals'] });
      }
    },
  });
}