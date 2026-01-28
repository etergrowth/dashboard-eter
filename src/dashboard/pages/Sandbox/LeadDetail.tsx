import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Copy,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Clock,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { useSandboxLead, useUpdateSandboxLead, useConvertLeadToClient, useUpdateScratchpad } from '../../hooks/useSandboxLeads';
import { useSandboxActivities, useCreateSandboxActivity } from '../../hooks/useSandboxActivities';
import { BANTProgressCard } from '../../components/sandbox/BANTProgressCard';
import { ActivityTimeline } from '../../components/sandbox/ActivityTimeline';
import { QuickLogModal } from '../../components/sandbox/QuickLogModal';
import { EmailPreviewModal } from '../../components/sandbox/EmailPreviewModal';
import { StatusBadge } from '../../components/sandbox/StatusBadge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { LoadingState } from '../../components/sections';
import { useDebouncedCallback } from '../../../hooks/useDebounce';
import { getEmailApresentacaoHtml } from '../../../lib/email/gmail';
import { supabase } from '../../../lib/supabase';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useSandboxLead(id);
  const { data: activities } = useSandboxActivities(id);
  const updateLead = useUpdateSandboxLead();
  const convertLead = useConvertLeadToClient();
  const updateScratchpad = useUpdateScratchpad();
  const createActivity = useCreateSandboxActivity();

  const [scratchpadNotes, setScratchpadNotes] = useState('');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (lead) {
      setScratchpadNotes(lead.scratchpad_notes || '');
    }
  }, [lead]);

  const debouncedSaveScratchpad = useDebouncedCallback(
    (notes: string) => {
      if (id) {
        updateScratchpad.mutate({ leadId: id, notes });
      }
    },
    1000
  );

  const handleScratchpadChange = (value: string) => {
    setScratchpadNotes(value);
    debouncedSaveScratchpad(value);
  };

  const handleCopyToHistory = () => {
    if (id && scratchpadNotes.trim()) {
      createActivity.mutate({
        lead_id: id,
        type: 'note',
        direction: 'neutral',
        description: scratchpadNotes,
      });
      setScratchpadNotes('');
    }
  };

  const handleConvertToCRM = async () => {
    if (!id) return;
    
    if (window.confirm('Tem a certeza que deseja converter esta lead para o CRM?')) {
      try {
        const clientId = await convertLead.mutateAsync(id);
        navigate(`/dashboard/crm/${clientId}`);
      } catch (error) {
        console.error('Erro ao converter lead:', error);
      }
    }
  };

  const handleMarkAsDead = async () => {
    if (!id) return;
    
    if (window.confirm('Tem a certeza que deseja marcar esta lead como morta?')) {
      await updateLead.mutateAsync({
        id,
        status: 'dead',
      });
    }
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendEmail = async () => {
    if (!lead?.email || !id) {
      toast.error('Email ou ID da lead não encontrado');
      return;
    }

    setIsSendingEmail(true);
    
    try {
      // Chamar Edge Function do Supabase
      const { data, error } = await supabase.functions.invoke('send-email-apresentacao', {
        body: {
          lead_id: id,
          lead_name: lead.name,
          lead_email: lead.email,
        },
      });

      if (error) {
        console.error('Erro ao chamar Edge Function:', error);
        throw new Error(error.message || 'Erro ao enviar email');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao enviar email');
      }

      // Sucesso - a Edge Function já criou a atividade e atualizou o status
      toast.success('Email enviado com sucesso!');
      setShowEmailPreview(false);
      
      // Invalidar queries para atualizar a UI
      // As queries serão atualizadas automaticamente via invalidation na Edge Function
      
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Mensagens de erro mais específicas
      if (errorMessage.includes('Gmail não configurado') || errorMessage.includes('GMAIL')) {
        toast.error('Gmail não configurado. Verifique as variáveis de ambiente na Edge Function.');
      } else if (errorMessage.includes('autenticação') || errorMessage.includes('token')) {
        toast.error('Erro de autenticação Gmail. Verifique as credenciais.');
      } else if (errorMessage.includes('Email inválido')) {
        toast.error('Email inválido. Verifique o endereço de email.');
      } else if (errorMessage.includes('Lead não encontrada')) {
        toast.error('Lead não encontrada ou sem permissão.');
      } else {
        toast.error(`Erro ao enviar email: ${errorMessage}`);
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="A carregar lead..." />;
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lead não encontrada</p>
        <Button onClick={() => navigate('/dashboard/sandbox')} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const initials = lead.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/sandbox')}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detalhes da Lead</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{lead.name}</h2>
                    <StatusBadge status={lead.status} />
                  </div>
                  {lead.job_title && (
                    <p className="text-muted-foreground mb-1">{lead.job_title}</p>
                  )}
                  <p className="text-muted-foreground">{lead.company}</p>
                  {lead.company_size && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {lead.company_size} colaboradores
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>Adicionada: {format(new Date(lead.date_created), "d 'de' MMMM, yyyy", { locale: pt })}</span>
                </div>
                {lead.date_last_contact && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={16} />
                    <span>Último contacto: {format(new Date(lead.date_last_contact), "d 'de' MMMM, yyyy", { locale: pt })}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleConvertToCRM}
                  disabled={lead.status === 'crm_ready' || convertLead.isPending}
                  className="flex-1"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  Converter para CRM
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleMarkAsDead}
                  disabled={lead.status === 'dead' || updateLead.isPending}
                  className="flex-1"
                >
                  <XCircle size={16} className="mr-2" />
                  Marcar como Morta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* BANT Progress */}
          <BANTProgressCard lead={lead} />

          {/* Quick Scratchpad */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Notas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={scratchpadNotes}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="Captura insights rápidos durante chamadas/reuniões..."
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToHistory}
                  disabled={!scratchpadNotes.trim()}
                >
                  Copiar para Histórico
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScratchpadNotes('');
                    if (id) {
                      updateScratchpad.mutate({ leadId: id, notes: '' });
                    }
                  }}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <ActivityTimeline
            activities={activities || []}
            onAddActivity={() => setShowQuickLog(true)}
          />
        </div>

        {/* Sidebar - Contact Info */}
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.email && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-muted-foreground" />
                      <span className="text-sm">{lead.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy('email', lead.email)}
                    >
                      {copiedField === 'email' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowEmailPreview(true)}
                  >
                    <Send size={16} className="mr-2" />
                    Enviar E-mail de Apresentação
                  </Button>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {lead.phone}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleCopy('phone', lead.phone!)}
                  >
                    {copiedField === 'phone' ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
              )}

              {lead.linkedin_url && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Linkedin size={18} className="text-[#0A66C2]" />
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      Perfil LinkedIn
                    </a>
                  </div>
                </div>
              )}

              {lead.location && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <MapPin size={18} className="text-muted-foreground" />
                  <span className="text-sm">{lead.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Card */}
          {lead.score !== undefined && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Score da Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {lead.score}
                  </div>
                  <p className="text-sm text-muted-foreground">de 100 pontos</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Log Modal */}
      {id && (
        <QuickLogModal
          leadId={id}
          open={showQuickLog}
          onClose={() => setShowQuickLog(false)}
        />
      )}

      {/* Email Preview Modal */}
      {lead.email && (
        <EmailPreviewModal
          open={showEmailPreview}
          onClose={() => setShowEmailPreview(false)}
          onSend={handleSendEmail}
          isSending={isSendingEmail}
          recipientEmail={lead.email}
          recipientName={lead.name}
          subject="Apresentação Eter Growth"
          htmlContent={getEmailApresentacaoHtml(lead.name)}
        />
      )}
    </motion.div>
  );
}
