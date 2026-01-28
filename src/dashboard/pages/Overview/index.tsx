import { motion } from 'framer-motion';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { ProposalsChart } from '../../components/ProposalsChart';
import { PageHeader, StatsGrid, LoadingState } from '../../components/sections';

export function Overview() {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useTasks();

  const isLoading = loadingClients || loadingProjects || loadingTasks;

  // Calculate stats
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter(c => c.status !== 'lost').length || 0;
  const closedDeals = clients?.filter(c => c.status === 'closed').length || 0;
  const conversionRate = totalClients > 0 ? Math.round((closedDeals / totalClients) * 100) : 0;

  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

  const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

  const stats = [
    {
      name: 'Clientes Ativos',
      value: activeClients.toString(),
      subtext: `${totalClients} total`,
    },
    {
      name: 'Projetos em Curso',
      value: activeProjects.toString(),
      subtext: `${completedProjects} concluídos`,
    },
    {
      name: 'Tarefas Pendentes',
      value: pendingTasks.toString(),
      subtext: `${completedTasks} concluídas`,
    },
    {
      name: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      subtext: `${closedDeals} de ${totalClients} fechados`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio"
      />

      {isLoading ? (
        <LoadingState message="A carregar métricas..." />
      ) : (
        <>
          <StatsGrid stats={stats} columns={4} />
          <div className="w-full max-w-full overflow-hidden">
            <ProposalsChart />
          </div>
        </>
      )}
    </motion.div>
  );
}

// Default export para lazy loading
export default Overview;
