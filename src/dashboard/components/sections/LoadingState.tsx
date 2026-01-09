interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'A carregar...' }: LoadingStateProps) {
  return (
    <div className="glass-panel p-12 rounded-xl text-center">
      <div 
        className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        style={{ 
          borderColor: 'hsl(var(--primary))',
          borderTopColor: 'transparent',
        }}
      ></div>
      <p style={{ color: 'hsl(var(--muted-foreground))' }}>{message}</p>
    </div>
  );
}