import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Target, Clock, LayoutGrid, List, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ActionButton, EmptyState, LoadingState } from '../../components/sections';
import { useSandboxLeads, useUpdateSandboxLead } from '../../hooks/useSandboxLeads';
import { LeadCard } from '../../components/sandbox/LeadCard';
import { QuickLogModal } from '../../components/sandbox/QuickLogModal';
import { LeadForm } from '../../components/sandbox/LeadForm';
import { useCreateSandboxLead } from '../../hooks/useSandboxLeads';
import { useIsMobile } from '../../../hooks/use-mobile';
import type { LeadSandbox, LeadSource, LeadStatus } from '../../../types/sandbox';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

type Segment = 'active_search' | 'follow_up' | 'all';
type SourceFilter = LeadSource | 'all';
type ViewMode = 'cards' | 'list';

export function LeadsQueue() {
  const navigate = useNavigate();
  const { data: leads, isLoading } = useSandboxLeads();
  const createLead = useCreateSandboxLead();
  const updateLead = useUpdateSandboxLead();
  const isMobile = useIsMobile();
  
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadSandbox | null>(null);
  const [quickLogLead, setQuickLogLead] = useState<LeadSandbox | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [segment, setSegment] = useState<Segment>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

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
    setEditingLead(null);
  };

  const handleEditLead = (lead: LeadSandbox) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleUpdateLead = async (leadData: any) => {
    if (!editingLead) return;
    
    await updateLead.mutateAsync({
      id: editingLead.id,
      ...leadData,
    });
    setShowForm(false);
    setEditingLead(null);
  };

  const sources: { value: SourceFilter; label: string }[] = [
    { value: 'all', label: 'Todas as Origens' },
    { value: 'inbound', label: 'Inbound (Website)' },
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
          <div className="flex gap-3">
            <div className="flex bg-secondary p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                title="Vista em Cards"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                title="Vista em Lista"
              >
                <List size={18} />
              </button>
            </div>
            <ActionButton
              label="Nova Lead"
              onClick={() => setShowForm(true)}
              icon={Plus}
            />
          </div>
        }
      />

      {/* Filtros e Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm space-y-4">
        {/* Tabs */}
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} border-b border-border pb-2 overflow-x-auto`}>
          <button
            onClick={() => setSegment('all')}
            className={`${isMobile ? 'w-full text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-lg transition-all ${
              segment === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas as Leads
          </button>
          <button
            onClick={() => setSegment('active_search')}
            className={`${isMobile ? 'w-full text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-lg transition-all flex items-center ${isMobile ? 'justify-center' : 'gap-2'}`}
          >
            <Target size={isMobile ? 14 : 16} />
            {isMobile ? 'Prospecção' : 'Prospecção Ativa'}
          </button>
          <button
            onClick={() => setSegment('follow_up')}
            className={`${isMobile ? 'w-full text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-lg transition-all flex items-center ${isMobile ? 'justify-center' : 'gap-2'}`}
          >
            <Clock size={isMobile ? 14 : 16} />
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
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onQuickLog={handleQuickLog}
                onValidate={handleValidate}
                onEdit={handleEditLead}
                onNavigate={(id) => navigate(`/dashboard/sandbox/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Empresa</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden md:table-cell">Fonte</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden lg:table-cell">Último Contacto</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/sandbox/${lead.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{lead.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground">{lead.company}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-foreground">
                        {sources.find(s => s.value === lead.source)?.label || lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {lead.date_last_contact
                        ? format(new Date(lead.date_last_contact), "d MMM yyyy", { locale: pt })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                        lead.status === 'crm_ready' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'dead' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lead.status === 'new' && 'Novo'}
                        {lead.status === 'contacted' && 'Contactado'}
                        {lead.status === 'qualified' && 'Qualificado'}
                        {lead.status === 'crm_ready' && 'Pronto CRM'}
                        {lead.status === 'dead' && 'Perdido'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Lead"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleQuickLog(lead)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title="Registar Atividade"
                        >
                          <Clock size={16} />
                        </button>
                        {lead.status !== 'qualified' && lead.status !== 'crm_ready' && (
                          <button
                            onClick={() => handleValidate(lead.id)}
                            className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Validar Lead"
                          >
                            <Target size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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

      {/* Modal New/Edit Lead */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className={`relative w-full ${isMobile ? 'max-w-full mx-0 rounded-t-3xl' : 'max-w-2xl rounded-3xl'} max-h-[90vh] overflow-y-auto border border-border shadow-2xl bg-white ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingLead ? 'Editar Lead' : 'Nova Lead'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingLead(null);
                }}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <LeadForm
              onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
              onCancel={() => {
                setShowForm(false);
                setEditingLead(null);
              }}
              initialData={editingLead ? {
                name: editingLead.name,
                email: editingLead.email,
                phone: editingLead.phone,
                linkedin_url: editingLead.linkedin_url,
                location: editingLead.location,
                company: editingLead.company,
                job_title: editingLead.job_title,
                company_size: editingLead.company_size,
                source: editingLead.source,
                status: editingLead.status,
              } : undefined}
              isLoading={editingLead ? updateLead.isPending : createLead.isPending}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
