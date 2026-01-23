import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { TransacaoFinanceira } from '../../types/finance';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

export interface FinanceStatistics {
  // Totais gerais
  totalReceitas: number;
  totalDespesas: number;
  lucroPrejuizo: number;
  percentualLucro: number;
  
  // Faturação mensal (últimos 12 meses)
  faturacaoMensal: Array<{
    mes: string;
    receitas: number;
    despesas: number;
    lucro: number;
  }>;
  
  // Gastos por categoria
  gastosPorCategoria: Array<{
    categoria: string;
    total: number;
    percentual: number;
  }>;
  
  // Receitas por categoria
  receitasPorCategoria: Array<{
    categoria: string;
    total: number;
    percentual: number;
  }>;
  
  // Estatísticas do mês atual
  mesAtual: {
    receitas: number;
    despesas: number;
    lucro: number;
    numTransacoes: number;
  };
  
  // Tendências (comparação com mês anterior)
  tendencias: {
    receitasVariacao: number;
    despesasVariacao: number;
    lucroVariacao: number;
  };
}

export function useFinanceStatistics() {
  return useQuery({
    queryKey: ['finance_statistics'],
    queryFn: async () => {
      // Obter user_id atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizador não autenticado');

      // Buscar todas as transações verificadas do utilizador
      const { data: transactions, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'verificado')
        .order('data_transacao', { ascending: true });

      if (error) throw error;

      const transacoes = transactions as TransacaoFinanceira[];

      // Se não houver transações, retornar mock data para visualização
      if (transacoes.length === 0) {
        return getMockStatistics();
      }

      // Calcular totais gerais
      const totalReceitas = transacoes
        .filter((t) => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const totalDespesas = transacoes
        .filter((t) => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const lucroPrejuizo = totalReceitas - totalDespesas;
      const percentualLucro = totalReceitas > 0 
        ? (lucroPrejuizo / totalReceitas) * 100 
        : 0;

      // Faturação mensal (últimos 12 meses)
      const faturacaoMensal = calcularFaturacaoMensal(transacoes);

      // Gastos por categoria
      const gastosPorCategoria = calcularGastosPorCategoria(transacoes);

      // Receitas por categoria
      const receitasPorCategoria = calcularReceitasPorCategoria(transacoes);

      // Estatísticas do mês atual
      const mesAtual = calcularEstatisticasMesAtual(transacoes);

      // Tendências
      const tendencias = calcularTendencias(transacoes);

      return {
        totalReceitas,
        totalDespesas,
        lucroPrejuizo,
        percentualLucro,
        faturacaoMensal,
        gastosPorCategoria,
        receitasPorCategoria,
        mesAtual,
        tendencias,
      } as FinanceStatistics;
    },
  });
}

function calcularFaturacaoMensal(transacoes: TransacaoFinanceira[]) {
  const meses: Record<string, { receitas: number; despesas: number }> = {};
  
  // Inicializar últimos 12 meses
  const hoje = new Date();
  for (let i = 11; i >= 0; i--) {
    const data = subMonths(hoje, i);
    const chave = format(data, 'yyyy-MM');
    meses[chave] = { receitas: 0, despesas: 0 };
  }

  // Agrupar transações por mês
  transacoes.forEach((t) => {
    const data = parseISO(t.data_transacao);
    const chave = format(data, 'yyyy-MM');
    
    if (meses[chave]) {
      if (t.tipo === 'receita') {
        meses[chave].receitas += Number(t.valor);
      } else {
        meses[chave].despesas += Number(t.valor);
      }
    }
  });

  // Converter para array
  return Object.entries(meses).map(([mes, valores]) => {
    const dataMes = parseISO(`${mes}-01`);
    const mesFormatado = format(dataMes, 'MMM yyyy');
    return {
      mes: mesFormatado,
      receitas: valores.receitas,
      despesas: valores.despesas,
      lucro: valores.receitas - valores.despesas,
    };
  });
}

function calcularGastosPorCategoria(transacoes: TransacaoFinanceira[]) {
  const porCategoria: Record<string, number> = {};
  let totalDespesas = 0;

  transacoes
    .filter((t) => t.tipo === 'despesa')
    .forEach((t) => {
      const categoria = t.categoria || 'outro';
      porCategoria[categoria] = (porCategoria[categoria] || 0) + Number(t.valor);
      totalDespesas += Number(t.valor);
    });

  return Object.entries(porCategoria)
    .map(([categoria, total]) => ({
      categoria,
      total,
      percentual: totalDespesas > 0 ? (total / totalDespesas) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function calcularReceitasPorCategoria(transacoes: TransacaoFinanceira[]) {
  const porCategoria: Record<string, number> = {};
  let totalReceitas = 0;

  transacoes
    .filter((t) => t.tipo === 'receita')
    .forEach((t) => {
      const categoria = t.categoria || 'outro';
      porCategoria[categoria] = (porCategoria[categoria] || 0) + Number(t.valor);
      totalReceitas += Number(t.valor);
    });

  return Object.entries(porCategoria)
    .map(([categoria, total]) => ({
      categoria,
      total,
      percentual: totalReceitas > 0 ? (total / totalReceitas) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function calcularEstatisticasMesAtual(transacoes: TransacaoFinanceira[]) {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const transacoesMes = transacoes.filter((t) => {
    const data = parseISO(t.data_transacao);
    return data >= inicioMes && data <= fimMes;
  });

  const receitas = transacoesMes
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const despesas = transacoesMes
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  return {
    receitas,
    despesas,
    lucro: receitas - despesas,
    numTransacoes: transacoesMes.length,
  };
}

function calcularTendencias(transacoes: TransacaoFinanceira[]) {
  const hoje = new Date();
  const inicioMesAtual = startOfMonth(hoje);
  const fimMesAtual = endOfMonth(hoje);
  const inicioMesAnterior = startOfMonth(subMonths(hoje, 1));
  const fimMesAnterior = endOfMonth(subMonths(hoje, 1));

  const mesAtual = transacoes.filter((t) => {
    const data = parseISO(t.data_transacao);
    return data >= inicioMesAtual && data <= fimMesAtual;
  });

  const mesAnterior = transacoes.filter((t) => {
    const data = parseISO(t.data_transacao);
    return data >= inicioMesAnterior && data <= fimMesAnterior;
  });

  const receitasAtual = mesAtual
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const receitasAnterior = mesAnterior
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const despesasAtual = mesAtual
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const despesasAnterior = mesAnterior
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const lucroAtual = receitasAtual - despesasAtual;
  const lucroAnterior = receitasAnterior - despesasAnterior;

  return {
    receitasVariacao: receitasAnterior > 0 
      ? ((receitasAtual - receitasAnterior) / receitasAnterior) * 100 
      : receitasAtual > 0 ? 100 : 0,
    despesasVariacao: despesasAnterior > 0 
      ? ((despesasAtual - despesasAnterior) / despesasAnterior) * 100 
      : despesasAtual > 0 ? 100 : 0,
    lucroVariacao: lucroAnterior !== 0 
      ? ((lucroAtual - lucroAnterior) / Math.abs(lucroAnterior)) * 100 
      : lucroAtual > 0 ? 100 : 0,
  };
}

function getMockStatistics(): FinanceStatistics {
  const hoje = new Date();
  const faturacaoMensal = [];
  
  for (let i = 11; i >= 0; i--) {
    const data = subMonths(hoje, i);
    const baseReceitas = 5000 + Math.random() * 3000;
    const baseDespesas = 3000 + Math.random() * 1500;
    
    faturacaoMensal.push({
      mes: format(data, 'MMM yyyy'),
      receitas: baseReceitas,
      despesas: baseDespesas,
      lucro: baseReceitas - baseDespesas,
    });
  }

  const totalReceitas = faturacaoMensal.reduce((sum, m) => sum + m.receitas, 0);
  const totalDespesas = faturacaoMensal.reduce((sum, m) => sum + m.despesas, 0);

  return {
    totalReceitas,
    totalDespesas,
    lucroPrejuizo: totalReceitas - totalDespesas,
    percentualLucro: ((totalReceitas - totalDespesas) / totalReceitas) * 100,
    faturacaoMensal,
    gastosPorCategoria: [
      { categoria: 'software_saas', total: totalDespesas * 0.35, percentual: 35 },
      { categoria: 'marketing', total: totalDespesas * 0.25, percentual: 25 },
      { categoria: 'servicos_profissionais', total: totalDespesas * 0.20, percentual: 20 },
      { categoria: 'viagens', total: totalDespesas * 0.10, percentual: 10 },
      { categoria: 'outro', total: totalDespesas * 0.10, percentual: 10 },
    ],
    receitasPorCategoria: [
      { categoria: 'receitas', total: totalReceitas * 0.80, percentual: 80 },
      { categoria: 'servicos_profissionais', total: totalReceitas * 0.15, percentual: 15 },
      { categoria: 'outro', total: totalReceitas * 0.05, percentual: 5 },
    ],
    mesAtual: {
      receitas: faturacaoMensal[11].receitas,
      despesas: faturacaoMensal[11].despesas,
      lucro: faturacaoMensal[11].lucro,
      numTransacoes: 24,
    },
    tendencias: {
      receitasVariacao: 12.5,
      despesasVariacao: -5.2,
      lucroVariacao: 18.7,
    },
  };
}
