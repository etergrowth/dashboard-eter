import { StatCard } from './StatCard';

interface Stat {
  name: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
}

interface StatsGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-2 ${gridCols[columns]} gap-4`}>
      {stats.map((stat) => (
        <StatCard
          key={stat.name}
          name={stat.name}
          value={stat.value}
          subtext={stat.subtext}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
}