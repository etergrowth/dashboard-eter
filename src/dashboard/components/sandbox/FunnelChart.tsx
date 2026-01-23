import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { motion } from 'framer-motion';

interface FunnelChartProps {
  prospects: number;
  engaged: number;
  engagedRate: number;
  qualified: number;
  qualifiedRate: number;
  crmReady: number;
  crmReadyRate: number;
  avgDurationDays: number;
  overallConversionRate: number;
}

const stages = [
  { key: 'prospects', label: 'Prospects', color: 'bg-blue-500' },
  { key: 'engaged', label: 'Engajadas', color: 'bg-green-500' },
  { key: 'qualified', label: 'Qualificadas', color: 'bg-yellow-500' },
  { key: 'crmReady', label: 'Prontas CRM', color: 'bg-orange-500' },
];

export function FunnelChart({
  prospects,
  engaged,
  engagedRate,
  qualified,
  qualifiedRate,
  crmReady,
  crmReadyRate,
  avgDurationDays,
  overallConversionRate,
}: FunnelChartProps) {
  const maxValue = Math.max(prospects, engaged, qualified, crmReady, 1);
  
  const stageData = [
    { value: prospects, rate: 100, label: 'Prospects' },
    { value: engaged, rate: engagedRate, label: 'Engajadas' },
    { value: qualified, rate: qualifiedRate, label: 'Qualificadas' },
    { value: crmReady, rate: crmReadyRate, label: 'Prontas CRM' },
  ];

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-lg">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stageData.map((stage, index) => {
            const width = (stage.value / maxValue) * 100;
            const stageColor = stages[index]?.color || 'bg-gray-500';
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{stage.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({stage.value})
                    </span>
                  </div>
                  {index > 0 && (
                    <span className="text-xs font-bold text-primary">
                      {stage.rate.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="relative h-12 bg-secondary rounded-lg overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                    className={`h-full ${stageColor} rounded-lg`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duração Média</p>
            <p className="text-lg font-bold text-foreground">
              {avgDurationDays ? avgDurationDays.toFixed(1) : '0'} Dias
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão Geral</p>
            <p className="text-lg font-bold text-foreground">
              {overallConversionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
