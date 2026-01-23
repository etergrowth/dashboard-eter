import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../../../components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  variation: number;
  icon: LucideIcon;
  formatValue?: (value: number) => string;
}

export function MetricCard({ 
  title, 
  value, 
  variation, 
  icon: Icon,
  formatValue 
}: MetricCardProps) {
  const isPositive = variation >= 0;
  const formattedValue = typeof value === 'number' && formatValue 
    ? formatValue(value) 
    : value.toString();
  
  const formattedVariation = Math.abs(variation).toFixed(1);
  
  return (
    <Card className="p-6 border border-border bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-bold">{formattedVariation}%</span>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{formattedValue}</p>
      </div>
    </Card>
  );
}
