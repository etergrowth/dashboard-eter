import { Badge } from '../../../components/ui/badge';
import type { LeadStatus } from '../../../types/sandbox';

interface StatusBadgeProps {
  status: LeadStatus;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  prospecting: {
    label: 'Prospecção',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  engaged: {
    label: 'Engajada',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  qualified: {
    label: 'Qualificada',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  crm_ready: {
    label: 'Pronta CRM',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  dead: {
    label: 'Morta',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={`text-[10px] font-bold uppercase tracking-widest ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
