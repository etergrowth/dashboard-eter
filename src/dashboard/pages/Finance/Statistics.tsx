import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFinanceStatistics } from '@/dashboard/hooks/useFinanceStatistics';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { useCategorias } from '@/dashboard/hooks/useCategorias';
import { PageHeader, LoadingState } from '@/dashboard/components/sections';

// Cores para gráficos baseadas no tema
const CHART_COLORS = [
  'hsl(22, 100%, 50%)',    // chart-1 (primary orange)
  'hsl(142, 70%, 45%)',   // chart-2 (success green)
  'hsl(199, 89%, 48%)',   // chart-3 (info blue)
  'hsl(47, 95%, 55%)',    // chart-4 (warning yellow)
  'hsl(262, 83%, 58%)',   // chart-5 (purple)
];

export function FinanceStatistics() {
  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:19',message:'Component render start',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const navigate = useNavigate();
  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:24',message:'Calling useFinanceStatistics hook',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const { data: statistics, isLoading, error: statsError } = useFinanceStatistics();
  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:26',message:'useFinanceStatistics result',data:{isLoading,hasData:!!statistics,hasError:!!statsError,errorMessage:statsError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:27',message:'Calling useCategorias hook',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const { data: categorias, error: categoriasError } = useCategorias();
  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:29',message:'useCategorias result',data:{hasData:!!categorias,hasError:!!categoriasError,errorMessage:categoriasError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getCategoriaDisplayName = (nome: string) => {
    const categoria = categorias?.find((c) => c.nome === nome);
    return categoria?.nome_display || nome;
  };

  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:43',message:'Checking loading state',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (isLoading) {
    // #region agent log
    fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:44',message:'Rendering loading state',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <PageHeader
          title="Estatísticas Financeiras"
          description="Análise completa das suas finanças"
          action={
            <Button variant="ghost" onClick={() => navigate('/dashboard/finance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          }
        />
        <LoadingState message="A carregar estatísticas..." />
      </motion.div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:65',message:'Checking statistics data',data:{hasStatistics:!!statistics,hasError:!!statsError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!statistics) {
    // #region agent log
    fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:66',message:'Rendering no data state',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <PageHeader
          title="Estatísticas Financeiras"
          description="Análise completa das suas finanças"
          action={
            <Button variant="ghost" onClick={() => navigate('/dashboard/finance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          }
        />
        <div className="glass-panel p-6 rounded-xl">
          <p className="text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Sem dados disponíveis
          </p>
        </div>
      </motion.div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7251/ingest/d78a0169-ce2b-4fe8-a85e-f7266db11323',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Statistics.tsx:91',message:'Rendering main content',data:{hasStatistics:!!statistics,statisticsKeys:statistics?Object.keys(statistics):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Estatísticas Financeiras"
        description="Análise completa das suas finanças"
        action={
          <Button variant="ghost" onClick={() => navigate('/dashboard/finance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Receitas */}
        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
              Total Receitas
            </p>
            <DollarSign className="h-4 w-4 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
          </div>
          <p 
            className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {formatCurrency(statistics.totalReceitas)}
          </p>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            Todas as receitas verificadas
          </p>
        </div>

        {/* Total Despesas */}
        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
              Total Despesas
            </p>
            <ArrowDownRight className="h-4 w-4 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
          </div>
          <p 
            className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {formatCurrency(statistics.totalDespesas)}
          </p>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            Todas as despesas verificadas
          </p>
        </div>

        {/* Lucro/Prejuízo */}
        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
              Lucro / Prejuízo
            </p>
            {statistics.lucroPrejuizo >= 0 ? (
              <TrendingUp className="h-4 w-4 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            ) : (
              <TrendingDown className="h-4 w-4 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            )}
          </div>
          <p 
            className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {formatCurrency(statistics.lucroPrejuizo)}
          </p>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            {statistics.percentualLucro >= 0 ? '+' : ''}
            {statistics.percentualLucro.toFixed(1)}% margem
          </p>
        </div>

        {/* Mês Atual */}
        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
              Mês Atual
            </p>
            <ArrowUpRight className="h-4 w-4 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
          </div>
          <p 
            className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {formatCurrency(statistics.mesAtual.lucro)}
          </p>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            {statistics.mesAtual.numTransacoes} transações
          </p>
        </div>
      </div>

      {/* Tendências */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <p className="text-sm font-medium mb-3 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            Variação de Receitas
          </p>
          <div className="flex items-center gap-2">
            {statistics.tendencias.receitasVariacao >= 0 ? (
              <TrendingUp className="h-5 w-5 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            ) : (
              <TrendingDown className="h-5 w-5 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            )}
            <span
              className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {formatPercent(statistics.tendencias.receitasVariacao)}
            </span>
          </div>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            vs. mês anterior
          </p>
        </div>

        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <p className="text-sm font-medium mb-3 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            Variação de Despesas
          </p>
          <div className="flex items-center gap-2">
            {statistics.tendencias.despesasVariacao >= 0 ? (
              <TrendingUp className="h-5 w-5 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            ) : (
              <TrendingDown className="h-5 w-5 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            )}
            <span
              className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {formatPercent(statistics.tendencias.despesasVariacao)}
            </span>
          </div>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            vs. mês anterior
          </p>
        </div>

        <div className="glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg">
          <p className="text-sm font-medium mb-3 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            Variação de Lucro
          </p>
          <div className="flex items-center gap-2">
            {statistics.tendencias.lucroVariacao >= 0 ? (
              <TrendingUp className="h-5 w-5 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            ) : (
              <TrendingDown className="h-5 w-5 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }} />
            )}
            <span
              className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {formatPercent(statistics.tendencias.lucroVariacao)}
            </span>
          </div>
          <p className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]" style={{ color: 'hsl(var(--foreground))' }}>
            vs. mês anterior
          </p>
        </div>
      </div>

      {/* Gráfico de Faturação Mensal */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
            Faturação Mensal (Últimos 12 Meses)
          </h3>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Evolução das receitas, despesas e lucro
          </p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.faturacaoMensal}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3} 
              />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Receitas"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--chart-2))',
                  stroke: 'hsl(var(--card))',
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Despesas"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--destructive))',
                  stroke: 'hsl(var(--card))',
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="lucro"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Lucro"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--card))',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoria */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Gastos por Categoria
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-1" style={{ maxWidth: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.gastosPorCategoria.map((g) => ({
                        ...g,
                        name: getCategoriaDisplayName(g.categoria),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {statistics.gastosPorCategoria.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: `1px solid hsl(var(--border))`,
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {statistics.gastosPorCategoria.map((g, index) => {
                  const totalGastos = statistics.gastosPorCategoria.reduce((sum, item) => sum + item.total, 0);
                  const percent = totalGastos > 0 ? (g.total / totalGastos) * 100 : 0;
                  return (
                    <div key={g.categoria} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                          {getCategoriaDisplayName(g.categoria)}
                        </p>
                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {formatCurrency(g.total)} • {percent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Receitas por Categoria */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Receitas por Categoria
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-1" style={{ maxWidth: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.receitasPorCategoria.map((r) => ({
                        ...r,
                        name: getCategoriaDisplayName(r.categoria),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {statistics.receitasPorCategoria.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: `1px solid hsl(var(--border))`,
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {statistics.receitasPorCategoria.map((r, index) => {
                  const totalReceitas = statistics.receitasPorCategoria.reduce((sum, item) => sum + item.total, 0);
                  const percent = totalReceitas > 0 ? (r.total / totalReceitas) * 100 : 0;
                  return (
                    <div key={r.categoria} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                          {getCategoriaDisplayName(r.categoria)}
                        </p>
                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {formatCurrency(r.total)} • {percent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras - Gastos por Categoria */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
            Top Gastos por Categoria
          </h3>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            As 10 categorias com maior gasto
          </p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statistics.gastosPorCategoria.slice(0, 10).map((g) => ({
                ...g,
                categoria: getCategoriaDisplayName(g.categoria),
              }))}
              style={{ background: 'transparent' }}
            >
              <XAxis
                dataKey="categoria"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--destructive))"
                radius={[8, 8, 0, 0]}
                cursor={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// Default export para lazy loading
export default FinanceStatistics;
