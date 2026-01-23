import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { SandboxStats } from '../../types/sandbox';

const QUERY_KEY = 'sandbox-metrics';

export type MetricsPeriod = 'today' | '7days' | '30days';

const PERIOD_DAYS: Record<MetricsPeriod, number> = {
  today: 1,
  '7days': 7,
  '30days': 30,
};

// Hook: Buscar estatísticas da sandbox
export function useSandboxMetrics(period: MetricsPeriod = '7days') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, period],
    queryFn: async (): Promise<SandboxStats | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_sandbox_stats', {
          p_user_id: user.id,
          p_period_days: PERIOD_DAYS[period]
        })
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}
