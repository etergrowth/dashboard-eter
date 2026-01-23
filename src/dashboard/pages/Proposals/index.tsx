import { useState } from 'react';
import { Plus, Trash2, Edit, X, Calculator, Settings, FileText } from 'lucide-react';
import { useProposals, useDeleteProposal } from '../../hooks/useProposals';
import { useProposalItems, useDeleteProposalItem } from '../../hooks/useProposals';
import { ProposalForm } from './ProposalForm';
import { ProposalItemForm } from './ProposalItemForm';
import { ProposalsTable } from './ProposalsTable';
import { ServicesTable } from './ServicesTable';
import { CostSimulationModal } from './CostSimulation';
import type { Proposal, ProposalItem } from '../../../types';
import { PageHeader, SearchBar, ActionButton, LoadingState } from '../../components/sections';

type TabType = 'proposals' | 'services';

export function Proposals() {
  const { isLoading } = useProposals();
  const [activeTab, setActiveTab] = useState<TabType>('proposals');
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProposalItem | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCostSimulation, setShowCostSimulation] = useState(false);

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

  if (isLoading && activeTab === 'proposals') {
    return <LoadingState message="A carregar propostas..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propostas"
        description={activeTab === 'proposals' ? "Gerir e criar propostas para clientes" : "Gerir serviços, preços e configurações de tarifas"}
        action={
          activeTab === 'proposals' ? (
            <ActionButton
              label="Nova Proposta"
              onClick={() => {
                setShowCostSimulation(true);
              }}
              icon={Plus}
            />
          ) : null
        }
      />

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'proposals'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          style={{
            borderBottom: activeTab === 'proposals' ? '2px solid hsl(var(--primary))' : 'none',
          }}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Propostas</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'services'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          style={{
            borderBottom: activeTab === 'services' ? '2px solid hsl(var(--primary))' : 'none',
          }}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Serviços</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'proposals' ? (
        <>
          <SearchBar
            placeholder="Pesquisar propostas..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Proposals Table */}
          <ProposalsTable onAddProposal={() => setShowCostSimulation(true)} />
        </>
      ) : (
        <ServicesTable />
      )}

      {/* Proposal Items View - Only show in proposals tab */}
      {activeTab === 'proposals' && selectedProposal && (
        <ProposalItemsView
          proposal={selectedProposal}
          onClose={handleCloseItems}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
        />
      )}

      {/* Forms - Only show in proposals tab */}
      {activeTab === 'proposals' && showForm && (
        <ProposalForm
          onClose={handleCloseForm}
          proposal={editingProposal}
        />
      )}

      {activeTab === 'proposals' && showItemForm && selectedProposal && (
        <ProposalItemForm
          onClose={handleCloseItemForm}
          proposalId={selectedProposal.id}
          item={editingItem}
        />
      )}

      {/* Cost Simulation Modal (Quiz-style pop-up) - Only show in proposals tab */}
      {activeTab === 'proposals' && showCostSimulation && (
        <CostSimulationModal
          onClose={() => setShowCostSimulation(false)}
          onSuccess={() => {
            setShowCostSimulation(false);
          }}
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