import { Badge } from '../../../components/ui/badge';
import type { LeadSource } from '../../../types/sandbox';

interface SourceBadgeProps {
  source: LeadSource;
}

const sourceConfig: Record<LeadSource, { label: string; className: string }> = {
  linkedin: {
    label: 'LinkedIn',
    className: 'bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30',
  },
  website: {
    label: 'Website',
    className: 'bg-primary/20 text-primary border-primary/30',
  },
  referral: {
    label: 'Indicação',
    className: 'bg-green-500/20 text-green-500 border-green-500/30',
  },
  cold_call: {
    label: 'Cold Call',
    className: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  },
  email: {
    label: 'Email',
    className: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  },
  door_to_door: {
    label: 'Porta-a-Porta',
    className: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  },
};

export function SourceBadge({ source }: SourceBadgeProps) {
  const config = sourceConfig[source];
  
  return (
    <Badge 
      variant="outline" 
      className={`text-[10px] font-bold uppercase tracking-widest ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
