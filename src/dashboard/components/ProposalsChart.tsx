import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useProposals } from '../hooks/useProposals';
import type { Proposal } from '../../types';

interface ChartDataPoint {
  date: string;
  total: number;
  accepted: number;
  rejected: number;
}

export function ProposalsChart() {
  const { data: proposals, isLoading } = useProposals();
  const [activeMetric, setActiveMetric] = useState<'total' | 'accepted' | 'rejected'>('total');

  const chartData = useMemo(() => {
    if (!proposals || proposals.length === 0) {
      // Generate empty data for last 30 days if no proposals
      const data: ChartDataPoint[] = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          total: 0,
          accepted: 0,
          rejected: 0,
        });
      }
      return data;
    }

    // Group proposals by date
    const grouped = new Map<string, { total: number; accepted: number; rejected: number }>();

    proposals.forEach((proposal) => {
      const date = new Date(proposal.created_at || Date.now()).toISOString().split('T')[0];
      const existing = grouped.get(date) || { total: 0, accepted: 0, rejected: 0 };
      
      existing.total += 1;
      if (proposal.status === 'accepted') {
        existing.accepted += 1;
      } else if (proposal.status === 'rejected') {
        existing.rejected += 1;
      }
      
      grouped.set(date, existing);
    });

    // Generate data for last 30 days
    const data: ChartDataPoint[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = grouped.get(dateStr) || { total: 0, accepted: 0, rejected: 0 };
      
      data.push({
        date: dateStr,
        total: stats.total,
        accepted: stats.accepted,
        rejected: stats.rejected,
      });
    }

    return data;
  }, [proposals]);

  const totals = useMemo(() => {
    if (!proposals) return { total: 0, accepted: 0, rejected: 0 };
    
    return {
      total: proposals.length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
    };
  }, [proposals]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center justify-center h-[300px]">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ 
              borderColor: 'hsl(var(--primary))',
              borderTopColor: 'transparent',
            }}
          ></div>
        </div>
      </div>
    );
  }

  // Convert HSL chart colors for recharts (light theme)
  const getChartColor = (metric: typeof activeMetric) => {
    if (metric === 'total') {
      // chart-1: 12 76% 61% -> hsl(12, 76%, 61%)
      return 'hsl(12, 76%, 61%)';
    } else if (metric === 'accepted') {
      // chart-2: 173 58% 39% -> hsl(173, 58%, 39%)
      return 'hsl(173, 58%, 39%)';
    } else {
      // chart-3: 197 37% 24% -> hsl(197, 37%, 24%)
      return 'hsl(197, 37%, 24%)';
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Evolução de Propostas
            </h3>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Últimos 30 dias
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {[
              { key: 'total' as const, label: 'Total' },
              { key: 'accepted' as const, label: 'Aceites' },
              { key: 'rejected' as const, label: 'Rejeitadas' },
            ].map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                data-active={activeMetric === metric.key}
                className={`flex-1 sm:flex-initial flex flex-col justify-center gap-1 px-4 py-3 rounded-lg border transition-colors ${
                  activeMetric === metric.key
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-secondary border-border hover:bg-accent'
                }`}
                style={{
                  backgroundColor: activeMetric === metric.key 
                    ? 'hsl(var(--primary) / 0.2)' 
                    : 'hsl(var(--secondary))',
                  borderColor: activeMetric === metric.key 
                    ? 'hsl(var(--primary) / 0.5)' 
                    : 'hsl(var(--border))',
                }}
              >
                <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {metric.label}
                </span>
                <span 
                  className="text-lg sm:text-2xl font-bold leading-none"
                  style={{ 
                    color: activeMetric === metric.key 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--foreground))' 
                  }}
                >
                  {totals[metric.key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3} 
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
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
              labelFormatter={formatTooltipDate}
              formatter={(value: number) => [
                value, 
                activeMetric === 'total' ? 'Total' : activeMetric === 'accepted' ? 'Aceites' : 'Rejeitadas'
              ]}
            />
            <Line
              type="monotone"
              dataKey={activeMetric}
              stroke={getChartColor(activeMetric)}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: getChartColor(activeMetric),
                stroke: 'hsl(var(--card))',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}