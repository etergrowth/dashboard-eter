import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Inbox,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Clock,
  Building2,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { PageHeader, EmptyState, LoadingState } from '../../components/sections';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import {
  useLeadsPendentesPendentes,
  useLeadsPendentesStats,
  useAprovarLead,
  useRejeitarLead
} from '../../hooks/useLeadsPendentes';
import type { LeadPendente, PrioridadeIA } from '../../../types/leadsPendentes';

type PriorityFilter = PrioridadeIA | 'all';

const priorityConfig: Record<PrioridadeIA, { label: string; color: string; bgColor: string }> = {
  muito_alta: { label: 'Muito Alta', color: 'text-red-600', bgColor: 'bg-red-100' },
  alta: { label: 'Alta', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  media: { label: 'Media', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  baixa: { label: 'Baixa', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export function LeadsPendentes() {
  const navigate = useNavigate();
  const { data: leads, isLoading } = useLeadsPendentesPendentes();
  const { data: stats } = useLeadsPendentesStats();
  const aprovarLead = useAprovarLead();
  const rejeitarLead = useRejeitarLead();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      // Filtro por prioridade
      if (priorityFilter !== 'all' && lead.prioridade_ia !== priorityFilter) {
        return false;
      }

      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          lead.nome.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          (lead.empresa?.toLowerCase().includes(searchLower)) ||
          lead.projeto.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [leads, priorityFilter, searchTerm]);

  const handleAprovar = async (lead: LeadPendente) => {
    if (window.confirm(`Aprovar lead de ${lead.nome}? A lead sera adicionada ao Sandbox para qualificacao.`)) {
      try {
        const result = await aprovarLead.mutateAsync(lead);
        if (result.success && result.sandbox_id) {
          navigate(`/dashboard/sandbox/${result.sandbox_id}`);
        }
      } catch (error) {
        console.error('Erro ao aprovar lead:', error);
      }
    }
  };

  const handleRejeitar = async (lead: LeadPendente) => {
    if (window.confirm(`Rejeitar lead de ${lead.nome}? Esta acao nao pode ser desfeita.`)) {
      try {
        await rejeitarLead.mutateAsync(lead);
      } catch (error) {
        console.error('Erro ao rejeitar lead:', error);
      }
    }
  };

  const toggleExpand = (leadId: string) => {
    setExpandedLead(expandedLead === leadId ? null : leadId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Leads do Website"
        description="Leads INBOUND aguardando aprovacao manual"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_pendentes}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_aprovadas}</p>
                  <p className="text-xs text-muted-foreground">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_rejeitadas}</p>
                  <p className="text-xs text-muted-foreground">Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.score_medio ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">Score Medio IA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, empresa ou projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary border border-border text-foreground pl-12 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="bg-secondary border border-border text-foreground px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="muito_alta">Muito Alta</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Lista de Leads */}
      {isLoading ? (
        <LoadingState message="A carregar leads..." />
      ) : filteredLeads && filteredLeads.length > 0 ? (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <LeadPendenteCard
              key={lead.id}
              lead={lead}
              isExpanded={expandedLead === lead.id}
              onToggleExpand={() => toggleExpand(lead.id)}
              onAprovar={() => handleAprovar(lead)}
              onRejeitar={() => handleRejeitar(lead)}
              isApproving={aprovarLead.isPending}
              isRejecting={rejeitarLead.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title={searchTerm ? 'Nenhuma lead encontrada' : 'Nenhuma lead pendente'}
          description={
            searchTerm
              ? 'Tente ajustar os termos de pesquisa'
              : 'Todas as leads foram processadas. Novas leads do website aparecerão aqui.'
          }
        />
      )}
    </motion.div>
  );
}

// Componente do Card de Lead
interface LeadPendenteCardProps {
  lead: LeadPendente;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAprovar: () => void;
  onRejeitar: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function LeadPendenteCard({
  lead,
  isExpanded,
  onToggleExpand,
  onAprovar,
  onRejeitar,
  isApproving,
  isRejecting
}: LeadPendenteCardProps) {
  const priorityInfo = lead.prioridade_ia ? priorityConfig[lead.prioridade_ia] : null;

  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Score Badge */}
            {lead.score_ia !== undefined && lead.score_ia !== null && (
              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                lead.score_ia >= 80 ? 'bg-green-100' :
                lead.score_ia >= 60 ? 'bg-yellow-100' :
                lead.score_ia >= 40 ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                <span className={`text-xl font-bold ${
                  lead.score_ia >= 80 ? 'text-green-600' :
                  lead.score_ia >= 60 ? 'text-yellow-600' :
                  lead.score_ia >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {lead.score_ia}
                </span>
                <span className="text-[10px] text-muted-foreground">Score</span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{lead.nome}</CardTitle>
                {priorityInfo && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}>
                    {priorityInfo.label}
                  </span>
                )}
              </div>
              <CardDescription className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {lead.email}
                </span>
                {lead.empresa && (
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {lead.empresa}
                  </span>
                )}
                {lead.telefone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {lead.telefone}
                  </span>
                )}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <FileText size={14} />
                <span className="font-medium">{lead.projeto}</span>
                <span className="text-xs">({lead.orcamento})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.data_criacao), { addSuffix: true, locale: pt })}
            </span>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="border-t border-border pt-4 space-y-4">
              {/* Mensagem */}
              {lead.mensagem && (
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Mensagem do Cliente
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {lead.mensagem}
                  </p>
                </div>
              )}

              {/* Analise IA */}
              {lead.analise_ia && (
                <div className="grid md:grid-cols-2 gap-4">
                  {lead.analise_ia.pontos_positivos && lead.analise_ia.pontos_positivos.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Pontos Positivos
                      </h4>
                      <ul className="text-sm text-green-600 space-y-1">
                        {lead.analise_ia.pontos_positivos.map((ponto, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">+</span>
                            {ponto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lead.analise_ia.pontos_atencao && lead.analise_ia.pontos_atencao.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Pontos de Atencao
                      </h4>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        {lead.analise_ia.pontos_atencao.map((ponto, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-1">!</span>
                            {ponto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {lead.analise_ia?.recomendacao && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                    <Star size={16} />
                    Recomendacao IA
                  </h4>
                  <p className="text-sm">{lead.analise_ia.recomendacao}</p>
                </div>
              )}

              {/* UTM Info */}
              {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                <div className="text-xs text-muted-foreground flex gap-4 flex-wrap">
                  {lead.utm_source && <span>Fonte: {lead.utm_source}</span>}
                  {lead.utm_medium && <span>Meio: {lead.utm_medium}</span>}
                  {lead.utm_campaign && <span>Campanha: {lead.utm_campaign}</span>}
                </div>
              )}

              {/* Acoes */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={(e) => { e.stopPropagation(); onAprovar(); }}
                  disabled={isApproving}
                  className="flex-1"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  {isApproving ? 'A aprovar...' : 'Aprovar Lead'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={(e) => { e.stopPropagation(); onRejeitar(); }}
                  disabled={isRejecting}
                  className="flex-1"
                >
                  <XCircle size={16} className="mr-2" />
                  {isRejecting ? 'A rejeitar...' : 'Rejeitar Lead'}
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default LeadsPendentes;
