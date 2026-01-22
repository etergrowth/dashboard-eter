import { useState } from 'react';
import {
  Plus,
  Phone,
  Mail,
  Building2,
  Trash2,
  Eye,
  LayoutGrid,
  List as ListIcon,
  Search,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClients, useDeleteClient, useUpdateClient } from '../../hooks/useClients';
import { PageHeader, StatsGrid, ActionButton, EmptyState, LoadingState } from '../../components/sections';
import { MultiStepForm } from '../../../components/form/MultiStepForm';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import type { Client } from '../../../types';

type ViewMode = 'list' | 'kanban';

// Draggable Card Component
interface DraggableCardProps {
  client: Client;
  onNavigate: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  isDragging?: boolean;
}

function DraggableCard({ client, onNavigate, onDelete, isDragging = false }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isCurrentlyDragging } = useDraggable({
    id: client.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Hide original card when dragging to prevent duplicate effect
  if (isCurrentlyDragging && !isDragging) {
    return <div ref={setNodeRef} />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden ${isDragging ? 'shadow-2xl rotate-2' : 'shadow-sm'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-xs font-bold text-foreground">
            {client.name.charAt(0)}
          </div>
          <h4 className="font-bold text-foreground text-sm truncate max-w-[120px]">{client.name}</h4>
        </div>
        <span className="text-[10px] font-bold text-gray-500">{client.ai_score || 0} pts</span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-[10px] text-gray-400 flex items-center gap-2">
          <Building2 size={12} className="text-gray-600" /> {client.company || 'Pessoa Singular'}
        </p>
        <p className="text-[10px] text-gray-400 flex items-center gap-2">
          <span className="text-gray-600">€</span> {Number(client.value || 0).toLocaleString('pt-PT')}
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase border ${client.urgency === 'alta' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
          client.urgency === 'media' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10' :
            'bg-blue-500/10 text-blue-400 border-blue-500/10'
          }`}>
          {client.urgency || 'baixa'}
        </span>
        <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-[8px] font-bold rounded uppercase border border-border">
          {client.source || 'manual'}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(client.id);
        }}
        className="w-full py-2 bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-xl transition-all border border-primary/20 flex items-center justify-center gap-2"
      >
        Ver Detalhes
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(client.id, client.name);
        }}
        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// Droppable Column Component
interface DroppableColumnProps {
  id: string;
  title: string;
  color: string;
  clients: Client[];
  onNavigate: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

function DroppableColumn({ id, title, color, clients, onNavigate, onDelete }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">{title}</h3>
          <span className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border border-border">
            {clients.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-[500px] p-3 rounded-xl border transition-all ${color} ${isOver ? 'ring-2 ring-primary/50 border-primary' : ''
          }`}
      >
        {clients.map(client => (
          <DraggableCard
            key={client.id}
            client={client}
            onNavigate={onNavigate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export function CRM() {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const updateClient = useUpdateClient();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    })
  );

  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar ${name}?`)) {
      deleteClient.mutate(id);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const clientId = active.id as string;
    const newStatus = over.id as string;

    // Find the client being dragged
    const client = clients?.find(c => c.id === clientId);

    if (client && client.status !== newStatus) {
      // Update client status
      updateClient.mutate({
        id: clientId,
        status: newStatus as any,
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'proposal': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'negotiation': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const kanbanColumns = [
    { id: 'lead', title: 'Cold', color: 'bg-blue-50 border-blue-200' },
    { id: 'proposal', title: 'Morno', color: 'bg-green-50 border-green-200' },
    { id: 'negotiation', title: 'Quente', color: 'bg-purple-50 border-purple-200' },
    { id: 'closed', title: 'Ultra Quente', color: 'bg-pink-50 border-pink-200' }
  ];

  const stats = [
    { name: 'Total Clientes', value: clients?.length || 0 },
    { name: 'Leads', value: clients?.filter((c) => c.status === 'lead').length || 0 },
    { name: 'Em Negociação', value: clients?.filter((c) => c.status === 'negotiation').length || 0 },
    { name: 'Fechados', value: clients?.filter((c) => c.status === 'closed').length || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="CRM"
        description="Gestão de clientes e pipeline de vendas"
        action={
          <div className="flex gap-3">
            <div className="flex bg-secondary p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
            <ActionButton
              label="Novo Lead"
              onClick={() => setShowForm(true)}
              icon={Plus}
            />
          </div>
        }
      />

      <StatsGrid stats={stats} columns={4} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por nome, empresa ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-border text-foreground pl-12 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary border border-border text-foreground px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          >
            <option value="all">Todos os Status</option>
            <option value="lead">Lead</option>
            <option value="proposal">Proposta</option>
            <option value="negotiation">Negociação</option>
            <option value="closed">Fechado</option>
            <option value="lost">Perdido</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="A carregar clientes..." />
      ) : filteredClients && filteredClients.length > 0 ? (
        viewMode === 'list' ? (
          /* List View */
          <div className="glass-panel rounded-2xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-secondary transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.company || 'Pessoa Singular'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <Mail size={12} className="text-gray-600" /> {client.email || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <Phone size={12} className="text-gray-600" /> {client.phone || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground text-sm">
                        €{Number(client.value || 0).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/crm/${client.id}`)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition text-gray-400 hover:text-primary"
                            title="Ver Detalhes"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id, client.name)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition text-gray-400 hover:text-red-500"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
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
          /* Kanban View with Drag and Drop */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {kanbanColumns.map((col) => (
                <DroppableColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  clients={filteredClients.filter(c => c.status === col.id)}
                  onNavigate={navigate}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <DraggableCard
                  client={clients?.find(c => c.id === activeId)!}
                  onNavigate={() => { }}
                  onDelete={() => { }}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      ) : (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente criado'}
          description={searchTerm ? 'Tente ajustar os termos de pesquisa' : 'Comece adicionando o seu primeiro cliente'}
          action={
            !searchTerm ? (
              <ActionButton
                label="Adicionar Primeiro Cliente"
                onClick={() => setShowForm(true)}
                icon={Plus}
              />
            ) : undefined
          }
        />
      )}

      {/* MultiStep Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-white">
            <MultiStepForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
