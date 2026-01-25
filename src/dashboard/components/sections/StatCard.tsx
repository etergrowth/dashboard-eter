interface StatCardProps {
  name: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
}

export function StatCard({ name, value, subtext, onClick }: StatCardProps) {
  return (
    <div
      className={`glass-panel p-4 rounded-lg group transition-all duration-300 hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <p 
        className="text-sm mb-1 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {name}
      </p>
      <p 
        className="text-2xl font-bold transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {value}
      </p>
      {subtext && (
        <p 
          className="text-xs mt-2 transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}