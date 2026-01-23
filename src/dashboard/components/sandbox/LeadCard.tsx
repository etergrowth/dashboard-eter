import { Building2, Users, Clock, LogIn, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { LeadSandbox } from '../../../types/sandbox';
import { SourceBadge } from './SourceBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '../../../components/ui/button';

interface LeadCardProps {
  lead: LeadSandbox;
  onQuickLog: (lead: LeadSandbox) => void;
  onValidate: (leadId: string) => void;
  onNavigate: (leadId: string) => void;
}

export function LeadCard({ lead, onQuickLog, onValidate, onNavigate }: LeadCardProps) {
  const initials = lead.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const lastContactText = lead.date_last_contact
    ? formatDistanceToNow(new Date(lead.date_last_contact), { 
        addSuffix: true, 
        locale: pt 
      })
    : 'Nunca contactado';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onNavigate(lead.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm">
            {initials}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{lead.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <SourceBadge source={lead.source} />
              <StatusBadge status={lead.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {lead.job_title && (
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span className="text-gray-600">💼</span> {lead.job_title}
          </p>
        )}
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <Building2 size={12} className="text-gray-600" /> {lead.company}
        </p>
        {lead.company_size && (
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <Users size={12} className="text-gray-600" /> {lead.company_size} colaboradores
          </p>
        )}
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <Clock size={12} className="text-gray-600" /> {lastContactText}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onQuickLog(lead);
          }}
        >
          <LogIn size={14} className="mr-1" />
          Registo Rápido
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onValidate(lead.id);
          }}
        >
          <CheckCircle2 size={14} className="mr-1" />
          Qualificar
        </Button>
      </div>
    </motion.div>
  );
}
