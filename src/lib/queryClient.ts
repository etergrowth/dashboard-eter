import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Persister que usa sessionStorage para manter sessão apenas durante a sessão do browser
const sessionPersister = createSyncStoragePersister({
  storage: window.sessionStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo de garbage collection
    },
  },
});

export const persistOptions = {
  persister: sessionPersister,
  maxAge: Infinity, // Persiste até fechar o browser
  queryKeyFilter: (queryKey: unknown) => {
    // Persistir apenas queries de autenticação
    return Array.isArray(queryKey) && queryKey[0] === 'auth';
  },
};
