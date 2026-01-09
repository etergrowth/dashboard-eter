import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Proposal, ProposalInsert, ProposalUpdate, ProposalItem, ProposalItemInsert, ProposalItemUpdate } from '../../types';

// Local user ID for local-only execution
const LOCAL_USER_ID = 'local-user';

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
      if (proposal.client_id) {
        const { data } = await supabase
          .from('clients')
          .select('name, company')
          .eq('id', proposal.client_id)
          .single();
        client = data;
      }

      return { ...proposal, client } as Proposal & { client: { name: string; company: string | null } | null };
    },
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: ProposalInsert) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert({ ...proposal, user_id: LOCAL_USER_ID } as any)
        .select()
        .single();

      if (error) throw error;
      return data as Proposal;
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
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Proposal;
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
        .insert(item)
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

export function useUpdateProposalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProposalItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('proposal_items')
        .update(updates)
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
      return item?.proposal_id;
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