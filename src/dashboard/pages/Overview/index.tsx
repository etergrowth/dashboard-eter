import { Users, Briefcase, CheckSquare, TrendingUp, Image, Calendar, MapPin } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useMediaFiles } from '../../hooks/useMediaFiles';

export function Overview() {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { data: mediaFiles, isLoading: loadingMedia } = useMediaFiles();

  const isLoading = loadingClients || loadingProjects || loadingTasks || loadingMedia;

  // Calculate stats
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter(c => c.status !== 'lost').length || 0;
  const closedDeals = clients?.filter(c => c.status === 'closed').length || 0;
  const conversionRate = totalClients > 0 ? Math.round((closedDeals / totalClients) * 100) : 0;

  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

  const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

  const totalFiles = mediaFiles?.length || 0;
  const clientsWithLocation = clients?.filter(c => c.latitude && c.longitude).length || 0;

  const stats = [
    {
      name: 'Clientes Ativos',
      value: activeClients.toString(),
      icon: Users,
      subtext: `${totalClients} total`,
      color: 'text-blue-400',
    },
    {
      name: 'Projetos em Curso',
      value: activeProjects.toString(),
      icon: Briefcase,
      subtext: `${completedProjects} concluídos`,
      color: 'text-yellow-400',
    },
    {
      name: 'Tarefas Pendentes',
      value: pendingTasks.toString(),
      icon: CheckSquare,
      subtext: `${completedTasks} concluídas`,
      color: 'text-purple-400',
    },
    {
      name: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      subtext: `${closedDeals} de ${totalClients} fechados`,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-xl text-center">
          <div className="w-12 h-12 border-4 border-[#7BA8F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">A carregar métricas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="glass-panel p-6 rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#7BA8F9]/20 rounded-lg">
                    <stat.icon className="w-6 h-6 text-[#7BA8F9]" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">
                  {stat.name}
                </h3>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className="text-xs text-gray-500 mt-2">{stat.subtext}</p>
                )}
              </div>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#7BA8F9]/20 rounded-lg">
                  <Image className="w-6 h-6 text-[#7BA8F9]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ficheiros CMS</p>
                  <p className="text-2xl font-bold text-white">{totalFiles}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#7BA8F9]/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-[#7BA8F9]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Clientes no Mapa</p>
                  <p className="text-2xl font-bold text-white">{clientsWithLocation}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#7BA8F9]/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-[#7BA8F9]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Projetos</p>
                  <p className="text-2xl font-bold text-white">{totalProjects}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CRM Pipeline */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Pipeline CRM</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Leads</span>
                  <span className="text-blue-400 font-semibold">
                    {clients?.filter(c => c.status === 'lead').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Propostas</span>
                  <span className="text-purple-400 font-semibold">
                    {clients?.filter(c => c.status === 'proposal').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Negociação</span>
                  <span className="text-yellow-400 font-semibold">
                    {clients?.filter(c => c.status === 'negotiation').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fechados</span>
                  <span className="text-green-400 font-semibold">
                    {clients?.filter(c => c.status === 'closed').length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Projects Status */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Estado dos Projetos</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Planeamento</span>
                  <span className="text-blue-400 font-semibold">
                    {projects?.filter(p => p.status === 'planning').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Em Progresso</span>
                  <span className="text-yellow-400 font-semibold">
                    {projects?.filter(p => p.status === 'in_progress').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pausados</span>
                  <span className="text-orange-400 font-semibold">
                    {projects?.filter(p => p.status === 'on_hold').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Concluídos</span>
                  <span className="text-green-400 font-semibold">
                    {projects?.filter(p => p.status === 'completed').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
