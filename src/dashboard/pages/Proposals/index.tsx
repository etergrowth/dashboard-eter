import { useState } from 'react';
import { Plus, FileText, Trash2, Edit, X, Calculator } from 'lucide-react';
import { useProposals, useDeleteProposal } from '../../hooks/useProposals';
import { useProposalItems, useDeleteProposalItem } from '../../hooks/useProposals';
import { ProposalForm } from './ProposalForm';
import { ProposalItemForm } from './ProposalItemForm';
import { ServicesTable } from './ServicesTable';
import { ProposalsTable } from './ProposalsTable';
import { CostSimulation } from './CostSimulation';
import type { Proposal, ProposalItem } from '../../../types';
import { PageHeader, SearchBar, ActionButton, LoadingState, EmptyState } from '../../components/sections';

export function Proposals() {
  const { data: proposals, isLoading } = useProposals();
  const deleteProposal = useDeleteProposal();
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProposalItem | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProposals = proposals?.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proposal.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar a proposta "${title}"?`)) {
      deleteProposal.mutate(id);
    }
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProposal(undefined);
  };

  const handleViewItems = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseItems = () => {
    setSelectedProposal(null);
    setEditingItem(undefined);
  };

  const handleAddItem = () => {
    setEditingItem(undefined);
    setShowItemForm(true);
  };

  const handleEditItem = (item: ProposalItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
    setEditingItem(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground border-border';
      case 'sent':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'negotiating':
        return 'bg-chart-3/20 border-chart-3/30';
      case 'accepted':
        return 'bg-chart-2/20 border-chart-2/30';
      case 'rejected':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };
  
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'hsl(var(--muted-foreground))';
      case 'sent':
        return 'hsl(var(--primary))';
      case 'negotiating':
        return 'hsl(var(--chart-3))';
      case 'accepted':
        return 'hsl(var(--chart-2))';
      case 'rejected':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'sent':
        return 'Enviada';
      case 'negotiating':
        return 'Em Negociação';
      case 'accepted':
        return 'Aceite';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <LoadingState message="A carregar propostas..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propostas"
        description="Gerir e criar propostas para clientes"
        action={
          <ActionButton
            label="Nova Proposta"
            onClick={() => {
              setEditingProposal(undefined);
              setShowForm(true);
            }}
            icon={Plus}
          />
        }
      />

      <SearchBar
        placeholder="Pesquisar propostas..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Services Table */}
      <ServicesTable />

      {/* Proposals Table */}
      <ProposalsTable />

      {/* Cost Simulation */}
      <CostSimulation />

      {/* Proposals List */}
      {selectedProposal ? (
        <ProposalItemsView
          proposal={selectedProposal}
          onClose={handleCloseItems}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
        />
      ) : (
        <div className="grid gap-4">
          {filteredProposals && filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="glass-panel rounded-lg p-6 transition-colors hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {proposal.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                          proposal.status || 'draft'
                        )}`}
                        style={{ 
                          color: getStatusTextColor(proposal.status || 'draft'),
                        }}
                      >
                        {getStatusLabel(proposal.status || 'draft')}
                      </span>
                    </div>
                    {proposal.client && (
                      <p 
                        className="text-sm mb-2"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        Cliente: {proposal.client.name}
                        {proposal.client.company && ` - ${proposal.client.company}`}
                      </p>
                    )}
                    {proposal.description && (
                      <p 
                        className="text-sm mb-3"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        {proposal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Total: <span 
                          className="font-semibold"
                          style={{ color: 'hsl(var(--foreground))' }}
                        >
                          {proposal.total_amount?.toFixed(2) || '0.00'}€
                        </span>
                      </span>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Margem: <span 
                          className="font-semibold"
                          style={{ color: 'hsl(var(--foreground))' }}
                        >
                          {proposal.total_margin?.toFixed(2) || '0.00'}€
                        </span>
                      </span>
                      {proposal.valid_until && (
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Válida até: {new Date(proposal.valid_until).toLocaleDateString('pt-PT')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewItems(proposal)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: 'hsl(var(--primary))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Ver itens"
                    >
                      <Calculator className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(proposal)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: 'hsl(var(--muted-foreground))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                      }}
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proposal.id, proposal.title)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: 'hsl(var(--destructive))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhuma proposta encontrada"
              action={
                <ActionButton
                  label="Criar primeira proposta"
                  onClick={() => setShowForm(true)}
                  icon={Plus}
                />
              }
            />
          )}
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <ProposalForm
          onClose={handleCloseForm}
          proposal={editingProposal}
        />
      )}

      {showItemForm && selectedProposal && (
        <ProposalItemForm
          onClose={handleCloseItemForm}
          proposalId={selectedProposal.id}
          item={editingItem}
        />
      )}
    </div>
  );
}

interface ProposalItemsViewProps {
  proposal: Proposal;
  onClose: () => void;
  onAddItem: () => void;
  onEditItem: (item: ProposalItem) => void;
}

function ProposalItemsView({ proposal, onClose, onAddItem, onEditItem }: ProposalItemsViewProps) {
  const { data: items, isLoading } = useProposalItems(proposal.id);
  const deleteItem = useDeleteProposalItem();

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este item?')) {
      deleteItem.mutate(id);
    }
  };

  return (
    <div className="glass-panel rounded-lg">
      <div 
        className="p-6 border-b flex items-center justify-between"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div>
          <h2 
            className="text-xl font-semibold"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {proposal.title}
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Total: <span 
              className="font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {proposal.total_amount?.toFixed(2) || '0.00'}€
            </span>
            {' | '}
            Margem: <span 
              className="font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {proposal.total_margin?.toFixed(2) || '0.00'}€
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddItem}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: 'hsl(var(--muted-foreground))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
              e.currentTarget.style.color = 'hsl(var(--foreground))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div 
            className="text-center py-8"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            A carregar itens...
          </div>
        ) : items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr 
                  className="border-b"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  <th 
                    className="text-left py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Serviço
                  </th>
                  <th 
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Horas
                  </th>
                  <th 
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Preço/Hora
                  </th>
                  <th 
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Software
                  </th>
                  <th 
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Total
                  </th>
                  <th 
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Margem
                  </th>
                  <th 
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr 
                    key={item.id} 
                    className="border-b hover:bg-accent/30 transition-colors"
                    style={{ borderColor: 'hsl(var(--border) / 0.5)' }}
                  >
                    <td 
                      className="py-3 px-4"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {item.service?.name || 'Serviço desconhecido'}
                    </td>
                    <td 
                      className="py-3 px-4 text-right"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {item.estimated_hours.toFixed(2)}h
                    </td>
                    <td 
                      className="py-3 px-4 text-right"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {item.applied_hourly_rate.toFixed(2)}€
                    </td>
                    <td 
                      className="py-3 px-4 text-right"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {item.software_costs.toFixed(2)}€
                    </td>
                    <td 
                      className="py-3 px-4 text-right font-semibold"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {item.line_total.toFixed(2)}€
                    </td>
                    <td 
                      className="py-3 px-4 text-right"
                      style={{ color: 'hsl(var(--chart-2))' }}
                    >
                      {item.line_margin.toFixed(2)}€
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 rounded transition-colors"
                          style={{ 
                            color: 'hsl(var(--muted-foreground))',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                            e.currentTarget.style.color = 'hsl(var(--foreground))';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                          }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded transition-colors"
                          style={{ 
                            color: 'hsl(var(--destructive))',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr 
                  className="border-t-2"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  <td 
                    colSpan={4} 
                    className="py-4 px-4 text-right font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Total:
                  </td>
                  <td 
                    className="py-4 px-4 text-right font-bold text-lg"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {proposal.total_amount?.toFixed(2) || '0.00'}€
                  </td>
                  <td 
                    className="py-4 px-4 text-right font-bold text-lg"
                    style={{ color: 'hsl(var(--chart-2))' }}
                  >
                    {proposal.total_margin?.toFixed(2) || '0.00'}€
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div 
            className="text-center py-12"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <p>Nenhum item adicionado ainda</p>
            <button
              onClick={onAddItem}
              className="mt-4 transition-colors"
              style={{ color: 'hsl(var(--primary))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Adicionar primeiro item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}