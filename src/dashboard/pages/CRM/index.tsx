import { useState } from 'react';
import { Users, Plus, Search, Filter, MapPin, Phone, Mail, Building2, Trash2, Edit } from 'lucide-react';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import { ClientForm } from './ClientForm';
import type { Client } from '../../../types';

export function CRM() {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || client.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar ${name}?`)) {
      deleteClient.mutate(id);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'proposal':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'negotiation':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CRM</h1>
          <p className="text-gray-400">
            Gestão de clientes e pipeline de vendas
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClient(undefined);
            setShowForm(true);
          }}
          className="glass-button px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 hover:bg-[#7BA8F9]/20 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Total Clientes</p>
          <p className="text-2xl font-bold text-white">{clients?.length || 0}</p>
        </div>
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Leads</p>
          <p className="text-2xl font-bold text-blue-400">
            {clients?.filter((c) => c.status === 'lead').length || 0}
          </p>
        </div>
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Em Negociação</p>
          <p className="text-2xl font-bold text-yellow-400">
            {clients?.filter((c) => c.status === 'negotiation').length || 0}
          </p>
        </div>
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Fechados</p>
          <p className="text-2xl font-bold text-green-400">
            {clients?.filter((c) => c.status === 'closed').length || 0}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7BA8F9] focus:border-transparent transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`glass-button px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 hover:bg-[#7BA8F9]/20 transition ${
              showFilters || statusFilter !== 'all' || priorityFilter !== 'all' ? 'bg-[#7BA8F9]/20' : ''
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-panel p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA8F9]"
                >
                  <option value="all">Todos</option>
                  <option value="lead">Lead</option>
                  <option value="proposal">Proposta</option>
                  <option value="negotiation">Negociação</option>
                  <option value="closed">Fechado</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prioridade</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7BA8F9]"
                >
                  <option value="all">Todas</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            {(statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="mt-4 text-sm text-[#7BA8F9] hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clients List */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-xl text-center">
          <div className="w-12 h-12 border-4 border-[#7BA8F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">A carregar clientes...</p>
        </div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Prioridade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Localização
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        {client.company && (
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {client.company}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getPriorityColor(client.priority)}`}>
                        {client.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.value && (
                        <p className="text-white font-medium">
                          €{Number(client.value).toLocaleString('pt-PT', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.latitude && client.longitude ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">GPS</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Sem localização</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition text-gray-400 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-xl text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente criado'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm
              ? 'Tente ajustar os termos de pesquisa'
              : 'Comece adicionando o seu primeiro cliente'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingClient(undefined);
                setShowForm(true);
              }}
              className="glass-button px-6 py-3 rounded-lg font-semibold text-white inline-flex items-center gap-2 hover:bg-[#7BA8F9]/20 transition"
            >
              <Plus className="w-5 h-5" />
              Adicionar Primeiro Cliente
            </button>
          )}
        </div>
      )}

      {/* Client Form Modal */}
      {showForm && <ClientForm onClose={handleCloseForm} client={editingClient} />}
    </div>
  );
}
