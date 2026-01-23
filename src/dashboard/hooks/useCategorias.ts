import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { CategoriaTransacao } from '../../types/finance';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias_transacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_transacoes')
        .select('*')
        .eq('ativa', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as CategoriaTransacao[];
    },
    staleTime: Infinity, // Categorias raramente mudam
  });
}

export function useCategoriaByNome(nome: string) {
  return useQuery({
    queryKey: ['categorias_transacoes', nome],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_transacoes')
        .select('*')
        .eq('nome', nome)
        .single();

      if (error) throw error;
      return data as CategoriaTransacao;
    },
    enabled: !!nome,
    staleTime: Infinity,
  });
}
