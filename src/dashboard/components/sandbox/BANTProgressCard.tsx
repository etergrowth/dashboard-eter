import { Checkbox } from '../../../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { motion } from 'framer-motion';
import type { LeadSandbox } from '../../../types/sandbox';
import { useUpdateBANT } from '../../hooks/useSandboxLeads';

interface BANTProgressCardProps {
  lead: LeadSandbox;
}

const bantCriteria = [
  {
    key: 'budget' as const,
    label: 'Orçamento',
    description: 'Lead tem orçamento disponível para o projeto',
  },
  {
    key: 'authority' as const,
    label: 'Autoridade',
    description: 'Lead tem autoridade para tomar decisões',
  },
  {
    key: 'need' as const,
    label: 'Necessidade',
    description: 'Lead tem necessidade clara do serviço/produto',
  },
  {
    key: 'timeline' as const,
    label: 'Timeline',
    description: 'Lead tem timeline definido para implementação',
  },
];

export function BANTProgressCard({ lead }: BANTProgressCardProps) {
  const updateBANT = useUpdateBANT();

  const completed = [
    lead.bant_budget,
    lead.bant_authority,
    lead.bant_need,
    lead.bant_timeline,
  ].filter(Boolean).length;

  const percentage = (completed / 4) * 100;

  const handleToggle = (criterion: 'budget' | 'authority' | 'need' | 'timeline', value: boolean) => {
    updateBANT.mutate({
      leadId: lead.id,
      criterion,
      value,
    });
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-lg">Progresso de Qualificação</CardTitle>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {completed} de 4 critérios cumpridos
            </span>
            <span className="text-sm font-bold text-primary">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bantCriteria.map((criterion) => {
          const isChecked = lead[`bant_${criterion.key}` as keyof LeadSandbox] as boolean;
          
          return (
            <div
              key={criterion.key}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => 
                  handleToggle(criterion.key, checked as boolean)
                }
                disabled={updateBANT.isPending}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground cursor-pointer">
                  {criterion.label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {criterion.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
