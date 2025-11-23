import { Search, Filter } from 'lucide-react';

interface MapControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
}

export function MapControls({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}: MapControlsProps) {
  return (
    <div className="glass-panel p-4 rounded-xl mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Pesquisar clientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#7BA8F9] transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <div className="relative min-w-[140px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-white appearance-none focus:outline-none focus:border-[#7BA8F9] transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#1A1F2C]">Todos os Status</option>
            <option value="lead" className="bg-[#1A1F2C]">Lead</option>
            <option value="proposal" className="bg-[#1A1F2C]">Proposta</option>
            <option value="negotiation" className="bg-[#1A1F2C]">Negociação</option>
            <option value="closed" className="bg-[#1A1F2C]">Fechado</option>
            <option value="lost" className="bg-[#1A1F2C]">Perdido</option>
          </select>
        </div>

        <div className="relative min-w-[140px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-white appearance-none focus:outline-none focus:border-[#7BA8F9] transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#1A1F2C]">Todas Prioridades</option>
            <option value="high" className="bg-[#1A1F2C]">Alta</option>
            <option value="medium" className="bg-[#1A1F2C]">Média</option>
            <option value="low" className="bg-[#1A1F2C]">Baixa</option>
          </select>
        </div>
      </div>
    </div>
  );
}
