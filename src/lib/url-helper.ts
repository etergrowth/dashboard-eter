/**
 * Helper para obter a URL base da aplicação
 * Detecta automaticamente se está em produção (Vercel) ou desenvolvimento
 */
export function getAppUrl(): string {
  // No Vercel, a variável VERCEL_URL está disponível durante o build
  // Mas no cliente, precisamos usar window.location.origin
  // No entanto, o Supabase usa a "Site URL" configurada no dashboard
  
  // Se estiver no cliente (browser)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Se estiver no servidor (SSR/Edge Functions)
  // Vercel fornece VERCEL_URL durante o build
  const vercelUrl = import.meta.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  
  // Fallback para variável de ambiente customizada
  const appUrl = import.meta.env.VITE_APP_URL;
  if (appUrl) {
    return appUrl;
  }
  
  // Último fallback
  return 'http://localhost:3000';
}

/**
 * Obtém a URL completa para redirecionamento após autenticação
 */
export function getRedirectUrl(path: string = '/dashboard'): string {
  const baseUrl = getAppUrl();
  return `${baseUrl}${path}`;
}
