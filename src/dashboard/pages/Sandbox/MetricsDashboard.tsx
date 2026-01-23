import { useState } from 'react';
import { Users, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/sections';
import { useSandboxMetrics, type MetricsPeriod } from '../../hooks/useSandboxMetrics';
import { MetricCard } from '../../components/sandbox/MetricCard';
import { FunnelChart } from '../../components/sandbox/FunnelChart';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LoadingState } from '../../components/sections';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { LeadSource } from '../../../types/sandbox';

export function MetricsDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<MetricsPeriod>('7days');
  const { data: stats, isLoading } = useSandboxMetrics(period);

  const periods: { value: MetricsPeriod; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: '7days', label: 'Últimos 7 Dias' },
    { value: '30days', label: 'Mensal' },
  ];

  if (isLoading) {
    return <LoadingState message="A carregar métricas..." />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma métrica disponível</p>
      </div>
    );
  }

  // Preparar dados para gráfico de barras
  const sourceLabels: Record<LeadSource, string> = {
    linkedin: 'LinkedIn',
    website: 'Website',
    referral: 'Indicação',
    cold_call: 'Cold Call',
    email: 'Email',
    door_to_door: 'Porta-a-Porta',
  };

  const sourceData = Object.entries(stats.leads_by_source || {}).map(([source, count]) => ({
    source: sourceLabels[source as LeadSource] || source,
    count,
  }));

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Métricas de Prospecção"
        description="Analytics em tempo real da performance de prospecção"
        action={
          <div className="flex gap-2">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Contactos"
          value={stats.total_contacts}
          variation={stats.total_contacts_variation}
          icon={Users}
        />
        <MetricCard
          title="Taxa de Resposta"
          value={formatPercentage(stats.response_rate)}
          variation={stats.response_rate_variation}
          icon={MessageSquare}
        />
        <MetricCard
          title="Taxa de Validação"
          value={formatPercentage(stats.validation_rate)}
          variation={stats.validation_rate_variation}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Acquired per Source */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Leads Adquiridas por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="source" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <FunnelChart
          prospects={stats.conversion_funnel.prospects}
          engaged={stats.conversion_funnel.engaged}
          engagedRate={stats.conversion_funnel.engaged_rate}
          qualified={stats.conversion_funnel.qualified}
          qualifiedRate={stats.conversion_funnel.qualified_rate}
          crmReady={stats.conversion_funnel.crm_ready}
          crmReadyRate={stats.conversion_funnel.crm_ready_rate}
          avgDurationDays={stats.avg_duration_days || 0}
          overallConversionRate={stats.overall_conversion_rate}
        />
      </div>

      {/* High Potential Opportunities */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Oportunidades de Alto Potencial</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.high_potential_leads && stats.high_potential_leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Empresa
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Origem
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Score
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.high_potential_leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{lead.company}</p>
                          <p className="text-xs text-muted-foreground">{lead.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs">
                          {lead.source === 'door_to_door' ? 'Porta-a-Porta' : 
                           lead.source === 'referral' ? 'Indicação' : 
                           lead.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs">
                          {lead.status === 'prospecting' ? 'Prospecção' :
                           lead.status === 'engaged' ? 'Engajada' :
                           lead.status === 'qualified' ? 'Qualificada' :
                           lead.status === 'crm_ready' ? 'Pronta CRM' :
                           lead.status === 'dead' ? 'Morta' : lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-foreground">{lead.score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/sandbox/${lead.id}`)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma lead de alto potencial encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
