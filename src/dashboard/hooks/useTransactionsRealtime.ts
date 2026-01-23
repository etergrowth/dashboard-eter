import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

/**
 * Hook para subscrever a mudanças em tempo real na tabela transacoes_financeiras
 * Atualiza automaticamente as queries do React Query quando há mudanças
 */
export function useTransactionsRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Criar canal para mudanças em tempo real
    const channel = supabase
      .channel('transacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transacoes_financeiras',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Invalidar queries para forçar refetch
          queryClient.invalidateQueries({ queryKey: ['transacoes_financeiras'] });
        }
      )
      .subscribe();

    // Cleanup: remover subscription quando componente desmonta
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
