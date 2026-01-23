import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ActionButton, EmptyState, LoadingState } from '../../components/sections';
import { useSandboxLeads, useUpdateSandboxLead } from '../../hooks/useSandboxLeads';
import { LeadCard } from '../../components/sandbox/LeadCard';
import { QuickLogModal } from '../../components/sandbox/QuickLogModal';
import { LeadForm } from '../../components/sandbox/LeadForm';
import { useCreateSandboxLead } from '../../hooks/useSandboxLeads';
import type { LeadSandbox, LeadSource, LeadStatus } from '../../../types/sandbox';

type Segment = 'active_search' | 'follow_up' | 'all';
type SourceFilter = LeadSource | 'all';

export function LeadsQueue() {
  const navigate = useNavigate();
  const { data: leads, isLoading } = useSandboxLeads();
  const createLead = useCreateSandboxLead();
  const updateLead = useUpdateSandboxLead();
  
  const [showForm, setShowForm] = useState(false);
  const [quickLogLead, setQuickLogLead] = useState<LeadSandbox | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [segment, setSegment] = useState<Segment>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      // Filtro por fonte
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) {
        return false;
      }

      // Filtro por segmento
      if (segment === 'active_search') {
        // Leads sem atividades ou com última atividade há mais de 7 dias
        const hasRecentActivity = lead.date_last_contact 
          ? new Date(lead.date_last_contact).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
          : false;
        if (hasRecentActivity || lead.status === 'qualified' || lead.status === 'crm_ready') {
          return false;
        }
      } else if (segment === 'follow_up') {
        // Leads com atividade recente que precisam de follow-up
        const hasRecentActivity = lead.date_last_contact 
          ? new Date(lead.date_last_contact).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
          : false;
        if (!hasRecentActivity || lead.status === 'dead') {
          return false;
        }
      }

      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower) ||
          lead.source.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [leads, sourceFilter, segment, searchTerm]);

  const handleQuickLog = (lead: LeadSandbox) => {
    setQuickLogLead(lead);
  };

  const handleValidate = async (leadId: string) => {
    await updateLead.mutateAsync({
      id: leadId,
      status: 'qualified',
    });
  };

  const handleCreateLead = async (leadData: any) => {
    await createLead.mutateAsync(leadData);
    setShowForm(false);
  };

  const sources: { value: SourceFilter; label: string }[] = [
    { value: 'all', label: 'Todas as Origens' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Indicação' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email', label: 'Email' },
    { value: 'door_to_door', label: 'Porta-a-Porta' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Fila de Leads"
        description="Gerir leads em fase de prospecção ativa"
        action={
          <ActionButton
            label="Nova Lead"
            onClick={() => setShowForm(true)}
            icon={Plus}
          />
        }
      />

      {/* Filtros e Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            onClick={() => setSegment('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              segment === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas as Leads
          </button>
          <button
            onClick={() => setSegment('active_search')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              segment === 'active_search'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target size={16} />
            Prospecção Ativa
          </button>
          <button
            onClick={() => setSegment('follow_up')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              segment === 'follow_up'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock size={16} />
            Follow-up
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por nome, empresa ou origem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary border border-border text-foreground pl-12 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
            className="bg-secondary border border-border text-foreground px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          >
            {sources.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Leads */}
      {isLoading ? (
        <LoadingState message="A carregar leads..." />
      ) : filteredLeads && filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onQuickLog={handleQuickLog}
              onValidate={handleValidate}
              onNavigate={(id) => navigate(`/dashboard/sandbox/${id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title={searchTerm ? 'Nenhuma lead encontrada' : 'Nenhuma lead criada'}
          description={
            searchTerm
              ? 'Tente ajustar os termos de pesquisa'
              : 'Comece adicionando a sua primeira lead'
          }
          action={
            !searchTerm ? (
              <ActionButton
                label="Adicionar Primeira Lead"
                onClick={() => setShowForm(true)}
                icon={Plus}
              />
            ) : undefined
          }
        />
      )}

      {/* Modal Quick Log */}
      {quickLogLead && (
        <QuickLogModal
          leadId={quickLogLead.id}
          open={!!quickLogLead}
          onClose={() => setQuickLogLead(null)}
        />
      )}

      {/* Modal New Lead */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border shadow-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nova Lead</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <LeadForm
              onSubmit={handleCreateLead}
              onCancel={() => setShowForm(false)}
              isLoading={createLead.isPending}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
