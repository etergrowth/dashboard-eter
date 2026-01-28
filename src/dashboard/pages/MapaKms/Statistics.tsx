import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Car,
  TrendingUp,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Download,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrips, useTripStats } from '@/dashboard/hooks/useTrips';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MapaKmsStatistics() {
  const { data: trips = [], isLoading } = useTrips();
  const { data: stats } = useTripStats();
  const [timeRange, setTimeRange] = useState('6months');

  // Filtrar viagens por período
  const getFilteredTrips = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '12months':
        startDate = subMonths(now, 12);
        break;
      case 'all':
        return trips.filter(t => t.status === 'completed');
      default:
        startDate = subMonths(now, 6);
    }

    return trips.filter(
      t => t.status === 'completed' && new Date(t.date) >= startDate
    );
  };

  const filteredTrips = getFilteredTrips();

  // Dados para gráfico de barras (km por mês)
  const getMonthlyData = () => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: timeRange === 'all' 
        ? new Date(Math.min(...filteredTrips.map(t => new Date(t.date).getTime())))
        : subMonths(now, timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12),
      end: now,
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTrips = filteredTrips.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate >= monthStart && tripDate <= monthEnd;
      });

      const totalKm = monthTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
      const tripCount = monthTrips.length;

      return {
        month: format(month, 'MMM', { locale: pt }),
        km: totalKm,
        viagens: tripCount,
      };
    });
  };

  // Dados para gráfico de pizza (motivos)
  const getReasonData = () => {
    const reasonMap = new Map<string, number>();

    filteredTrips.forEach(trip => {
      const reason = trip.reason || 'Sem motivo';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + (trip.distance || 0));
    });

    return Array.from(reasonMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 motivos
  };

  // Top localizações
  const getTopLocations = () => {
    const locationMap = new Map<string, { count: number; km: number }>();

    filteredTrips.forEach(trip => {
      if (trip.start_location) {
        const current = locationMap.get(trip.start_location) || { count: 0, km: 0 };
        locationMap.set(trip.start_location, {
          count: current.count + 1,
          km: current.km + (trip.distance || 0),
        });
      }
      if (trip.end_location && trip.end_location !== trip.start_location) {
        const current = locationMap.get(trip.end_location) || { count: 0, km: 0 };
        locationMap.set(trip.end_location, {
          count: current.count + 1,
          km: current.km + (trip.distance || 0),
        });
      }
    });

    return Array.from(locationMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Média de km por dia da semana
  const getDayOfWeekData = () => {
    const dayMap = new Map<number, { km: number; count: number }>();

    filteredTrips.forEach(trip => {
      const day = new Date(trip.date).getDay();
      const current = dayMap.get(day) || { km: 0, count: 0 };
      dayMap.set(day, {
        km: current.km + (trip.distance || 0),
        count: current.count + 1,
      });
    });

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dayNames.map((name, index) => {
      const data = dayMap.get(index) || { km: 0, count: 0 };
      return {
        day: name,
        km: data.count > 0 ? Math.round(data.km / data.count) : 0,
        viagens: data.count,
      };
    });
  };

  const monthlyData = getMonthlyData();
  const reasonData = getReasonData();
  const topLocations = getTopLocations();
  const dayOfWeekData = getDayOfWeekData();

  // Calcular estatísticas do período
  const periodStats = {
    totalKm: filteredTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0),
    totalTrips: filteredTrips.length,
    avgDistance: filteredTrips.length > 0
      ? Math.round(filteredTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0) / filteredTrips.length)
      : 0,
    maxDistance: Math.max(...filteredTrips.map(trip => trip.distance || 0), 0),
  };

  const handleExportStatistics = () => {
    const data = {
      periodo: timeRange,
      estatisticas: periodStats,
      kmPorMes: monthlyData,
      topMotivos: reasonData,
      topLocalizacoes: topLocations,
      mediaPorDiaSemana: dayOfWeekData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estatisticas_kms_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Estatísticas de Viagens</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Análise detalhada das suas deslocações
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            <Button
              variant={timeRange === '3months' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('3months')}
              className="text-xs h-8"
            >
              3M
            </Button>
            <Button
              variant={timeRange === '6months' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('6months')}
              className="text-xs h-8"
            >
              6M
            </Button>
            <Button
              variant={timeRange === '12months' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('12months')}
              className="text-xs h-8"
            >
              1A
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('all')}
              className="text-xs h-8"
            >
              Tudo
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatistics}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Car className="h-4 w-4" />
            <span className="text-xs">Total Km</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {periodStats.totalKm.toLocaleString('pt-PT')}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Total Viagens</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {periodStats.totalTrips}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Média p/ Viagem</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {periodStats.avgDistance}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">Viagem Maior</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {periodStats.maxDistance}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Km por Mês */}
        <div className="p-4 md:p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Quilómetros por Mês</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                style={{ fontSize: '11px', fontWeight: 500 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: '11px', fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '13px',
                }}
                cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
              />
              <Bar 
                dataKey="km" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Motivos de Viagem */}
        <div className="p-4 md:p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Top Motivos de Viagem</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={reasonData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (percent < 0.05) return ''; // Não mostrar labels muito pequenos
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={90}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {reasonData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      transition: 'opacity 0.3s',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value.toLocaleString('pt-PT')} km`, 'Distância']}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                )}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Média por Dia da Semana */}
        <div className="p-4 md:p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Média por Dia da Semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dayOfWeekData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                style={{ fontSize: '11px', fontWeight: 500 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: '11px', fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '13px',
                }}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
                iconType="line"
                formatter={(value) => (
                  <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="km"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ 
                  r: 5, 
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: 'hsl(var(--card))',
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#8b5cf6',
                  stroke: 'hsl(var(--card))',
                  strokeWidth: 3,
                  style: { filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4))' }
                }}
                name="Km Médios"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Localizações */}
        <div className="p-4 md:p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Top Localizações</h3>
          </div>
          <div className="space-y-3">
            {topLocations.map((location, index) => (
              <div
                key={location.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {location.count} {location.count === 1 ? 'viagem' : 'viagens'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {location.km.toLocaleString('pt-PT')} km
                  </p>
                </div>
              </div>
            ))}
            {topLocations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Sem dados de localização disponíveis
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="p-4 md:p-6 rounded-lg border bg-card">
        <h3 className="text-lg font-semibold mb-4">Resumo do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Período analisado:</p>
            <p className="font-medium">
              {timeRange === '3months' && 'Últimos 3 meses'}
              {timeRange === '6months' && 'Últimos 6 meses'}
              {timeRange === '12months' && 'Último ano'}
              {timeRange === 'all' && 'Todo o período'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Km por dia (média):</p>
            <p className="font-medium">
              {periodStats.totalTrips > 0
                ? Math.round(periodStats.totalKm / periodStats.totalTrips)
                : 0}{' '}
              km
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Dados disponíveis:</p>
            <p className="font-medium">
              {stats?.tripCount || 0} viagens completadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export para lazy loading
export default MapaKmsStatistics;
