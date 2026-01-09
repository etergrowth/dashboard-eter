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
        className="text-sm mb-1"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        {name}
      </p>
      <p 
        className="text-2xl font-bold transition-colors duration-300"
        style={{ color: 'hsl(var(--foreground))' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'hsl(var(--primary))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'hsl(var(--foreground))';
        }}
      >
        {value}
      </p>
      {subtext && (
        <p 
          className="text-xs mt-2"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}