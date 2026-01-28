import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Plus,
  ExternalLink,
  Award,
  X,
  Loader2,
  FileText,
  Save,
  Edit,
} from 'lucide-react';
import { useProposal, useUpdateProposal, useDeleteProposal } from '../../hooks/useProposals';
import { useProposalItems } from '../../hooks/useProposals';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';

interface Link {
  label: string;
  url: string;
}

export function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: proposal, isLoading } = useProposal(id || '');
  const { data: items } = useProposalItems(id || '');
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();

  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [awarded, setAwarded] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [originalLinks, setOriginalLinks] = useState<Link[]>([]);
  const [originalAwarded, setOriginalAwarded] = useState(false);

  useEffect(() => {
    if (proposal) {
      // Parse links from JSONB
      try {
        const parsedLinks = proposal.links 
          ? (Array.isArray(proposal.links) 
              ? proposal.links 
              : (typeof proposal.links === 'string' 
                  ? JSON.parse(proposal.links) 
                  : proposal.links))
          : [];
        const linksArray = Array.isArray(parsedLinks) ? (parsedLinks as Link[]) : [];
        setLinks(linksArray);
        setOriginalLinks([...linksArray]);
      } catch (e) {
        console.error('Erro ao fazer parse dos links:', e);
        setLinks([]);
        setOriginalLinks([]);
      }
      const awardedValue = proposal.awarded ?? false;
      setAwarded(awardedValue);
      setOriginalAwarded(awardedValue);
    }
  }, [proposal]);

  const handleSave = async () => {
    if (!id) return;

    await updateProposal.mutateAsync({
      id,
      links: links.length > 0 ? (links as any) : null,
      awarded,
    } as any);

    // Atualizar valores originais após salvar
    setOriginalLinks([...links]);
    setOriginalAwarded(awarded);
    setIsEditing(false);
  };

  const handleAddLink = () => {
    if (newLink.label && newLink.url) {
      setLinks([...links, { ...newLink }]);
      setNewLink({ label: '', url: '' });
      setShowLinkForm(false);
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (window.confirm('Tem a certeza que deseja eliminar esta proposta?')) {
      deleteProposal.mutate(id!, {
        onSuccess: () => navigate('/dashboard/proposals'),
      });
    }
  };

  const getStatusLabel = (status: string | null) => {
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
        return status || 'Rascunho';
    }
  };

  const getStatusBadge = (status: string | null) => {
    const label = getStatusLabel(status);
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            {label}
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {label}
          </Badge>
        );
      case 'negotiating':
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {label}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {label}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
            {label}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            {label}
          </Badge>
        );
    }
  };

  if (isLoading || !proposal) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/proposals')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Voltar às Propostas</span>
        </button>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={updateProposal.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
              >
                {updateProposal.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Guardar
              </button>
              <button
                onClick={() => {
                  setLinks([...originalLinks]);
                  setAwarded(originalAwarded);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl border border-border hover:bg-accent transition-all"
              >
                <X size={16} />
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl border border-border hover:bg-accent transition-all"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Proposal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              {getStatusBadge(proposal.status)}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{proposal.title}</h2>
                {proposal.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{proposal.description}</p>
                )}
              </div>

              {proposal.client && (
                <div className="p-4 bg-secondary rounded-2xl border border-border">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-sm font-medium text-foreground">{proposal.client.name}</p>
                  {proposal.client.company && (
                    <p className="text-xs text-muted-foreground">{proposal.client.company}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-2xl border border-border">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Total</p>
                  <p className="text-lg font-bold text-foreground">
                    {proposal.total_amount?.toFixed(2) || '0.00'}€
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-2xl border border-border">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Margem</p>
                  <p className="text-lg font-bold text-foreground">
                    {proposal.total_margin?.toFixed(2) || '0.00'}€
                  </p>
                </div>
              </div>

              {proposal.valid_until && (
                <div className="p-4 bg-secondary rounded-2xl border border-border">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Válida até</p>
                  <p className="text-sm text-foreground">
                    {new Date(proposal.valid_until).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Awarded Status */}
          <div className="glass-panel p-6 rounded-3xl border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="text-primary" size={20} />
                <div>
                  <p className="text-sm font-bold text-foreground">Adjudicada</p>
                  <p className="text-xs text-muted-foreground">A proposta foi ganha?</p>
                </div>
              </div>
              {isEditing ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={awarded}
                    onChange={(e) => setAwarded(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              ) : (
                <Badge
                  variant={awarded ? 'secondary' : 'outline'}
                  className={awarded ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                >
                  {awarded ? 'Sim' : 'Não'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Links & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Links Section */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExternalLink className="text-primary" size={20} />
                <h3 className="text-xl font-bold text-foreground">Links</h3>
              </div>
              {isEditing && (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-xl border border-border transition-all text-xs font-bold"
                >
                  <Plus size={14} />
                  ADICIONAR LINK
                </button>
              )}
            </div>

            <div className="p-6 space-y-3">
              {links.length > 0 ? (
                links.map((link, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={index}
                    className="flex items-center justify-between p-4 bg-secondary rounded-2xl border border-border hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ExternalLink className="text-primary flex-shrink-0" size={16} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{link.label}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 opacity-40">
                  <ExternalLink size={48} className="text-gray-600" />
                  <p className="text-sm text-gray-500">Nenhum link adicionado.</p>
                </div>
              )}
            </div>
          </div>

          {/* Proposal Items */}
          {items && items.length > 0 && (
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" size={20} />
                  <h3 className="text-xl font-bold text-foreground">Itens da Proposta</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Serviço
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Horas
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/5 transition">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">
                              {item.service?.name || 'Serviço desconhecido'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            {item.estimated_hours.toFixed(2)}h
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                            {item.line_total.toFixed(2)}€
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {proposal.notes && (
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Notas</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {proposal.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Link Form Modal */}
      <AnimatePresence>
        {showLinkForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkForm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6"
            >
              <h3 className="text-xl font-bold text-foreground">Adicionar Link</h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Rótulo</label>
                  <input
                    type="text"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                    placeholder="Ex: Proposta PDF"
                    className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">URL</label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://exemplo.com"
                    className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowLinkForm(false);
                    setNewLink({ label: '', url: '' });
                  }}
                  className="flex-1 py-4 text-muted-foreground font-bold hover:text-foreground transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleAddLink}
                  className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                >
                  ADICIONAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Default export para lazy loading
export default ProposalDetails;
