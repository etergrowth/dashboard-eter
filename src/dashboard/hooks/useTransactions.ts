import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { TransacaoFinanceira, TransactionDraft } from '../../types/finance';
import type { Database } from '../../types/database';
import { useTransactionsRealtime } from './useTransactionsRealtime';

type TransacaoInsert = Database['public']['Tables']['transacoes_financeiras']['Insert'];
type TransacaoUpdate = Database['public']['Tables']['transacoes_financeiras']['Update'];

export function useTransactions(limit = 10) {
  // Ativar atualizações em tempo real
  useTransactionsRealtime();

  return useQuery({
    queryKey: ['transacoes_financeiras', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .order('data_transacao', { ascending: false })
        .order('criado_em', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as TransacaoFinanceira[];
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transacoes_financeiras', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TransacaoFinanceira;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionDraft) => {
      // Obter user_id atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizador não autenticado');

      const insertData: TransacaoInsert = {
        user_id: user.id,
        tipo: transaction.tipo,
        valor: transaction.valor,
        moeda: transaction.moeda || 'EUR',
        data_transacao: transaction.data_transacao,
        comerciante: transaction.comerciante || null,
        descricao: transaction.descricao,
        categoria: transaction.categoria,
        recibo_url: transaction.recibo_url || null,
        recibo_filename: transaction.recibo_filename || null,
        estado: 'pendente',
        confianca_ai: transaction.confianca_ai || null,
        extraido_via: transaction.extraido_via,
        metadata: transaction.metadata || null,
      };

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as TransacaoFinanceira;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes_financeiras'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & TransacaoUpdate) => {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TransacaoFinanceira;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes_financeiras'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes_financeiras'] });
    },
  });
}
