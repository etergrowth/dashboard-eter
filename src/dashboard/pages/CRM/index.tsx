import { useState } from 'react';
import { Plus, Filter, MapPin, Phone, Mail, Building2, Trash2, Edit } from 'lucide-react';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import { ClientForm } from './ClientForm';
import type { Client } from '../../../types';
import { PageHeader, StatsGrid, SearchBar, ActionButton, EmptyState, LoadingState } from '../../components/sections';
import { Users } from 'lucide-react';

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

  const stats = [
    {
      name: 'Total Clientes',
      value: clients?.length || 0,
    },
    {
      name: 'Leads',
      value: clients?.filter((c) => c.status === 'lead').length || 0,
    },
    {
      name: 'Em Negociação',
      value: clients?.filter((c) => c.status === 'negotiation').length || 0,
    },
    {
      name: 'Fechados',
      value: clients?.filter((c) => c.status === 'closed').length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Gestão de clientes e pipeline de vendas"
        action={
          <ActionButton
            label="Novo Cliente"
            onClick={() => {
              setEditingClient(undefined);
              setShowForm(true);
            }}
            icon={Plus}
          />
        }
      />

      <StatsGrid stats={stats} columns={4} />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Pesquisar clientes..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`glass-button px-6 py-3 rounded-lg font-semibold text-secondary-foreground flex items-center gap-2 transition ${
              showFilters || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'bg-primary/20 text-primary-foreground' 
                : ''
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Prioridade
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
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
                className="mt-4 text-sm text-primary hover:underline transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clients List */}
      {isLoading ? (
        <LoadingState message="A carregar clientes..." />
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/10 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Prioridade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Localização
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-muted/5 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-card-foreground">{client.name}</p>
                        {client.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {client.company}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
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
                        <p className="text-card-foreground font-medium">
                          €{Number(client.value).toLocaleString('pt-PT', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.latitude && client.longitude ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">GPS</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem localização</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 hover:bg-muted/10 rounded-lg transition text-muted-foreground hover:text-card-foreground"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition text-muted-foreground hover:text-destructive"
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
        <EmptyState
          icon={Users}
          title={searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente criado'}
          description={
            searchTerm
              ? 'Tente ajustar os termos de pesquisa'
              : 'Comece adicionando o seu primeiro cliente'
          }
          action={
            !searchTerm ? (
              <ActionButton
                label="Adicionar Primeiro Cliente"
                onClick={() => {
                  setEditingClient(undefined);
                  setShowForm(true);
                }}
                icon={Plus}
              />
            ) : undefined
          }
        />
      )}

      {/* Client Form Modal */}
      {showForm && <ClientForm onClose={handleCloseForm} client={editingClient} />}
    </div>
  );
}
