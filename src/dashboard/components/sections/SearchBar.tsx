import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ 
  placeholder = 'Pesquisar...', 
  value, 
  onChange 
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
        style={{ color: 'hsl(var(--muted-foreground))' }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
        style={{
          backgroundColor: 'hsl(var(--input))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--border))';
        }}
      />
    </div>
  );
}