import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Trip, TripInsert, TripUpdate } from '../../types';

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  // Tentar pegar da sessão primeiro (mais rápido)
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id;
  }
  
  // Backup: pegar do usuário diretamente
  const { data: { user } } = await supabase.auth.getUser();
  
  return user?.id || null;
}

export function useTrips(limit?: number) {
  return useQuery({
    queryKey: ['trips', limit],
    queryFn: async () => {
      let query = supabase
        .from('trips')
        .select('*')
        .order('date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Trip[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - viagens podem ser atualizadas
  });
}

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Trip;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos - viagem individual
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trip: TripInsert) => {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Utilizador não autenticado');
      }

      // Validar que o reason não está vazio e não contém apenas espaços
      if (!trip.reason || trip.reason.trim().length < 3) {
        throw new Error('O motivo da viagem deve ter pelo menos 3 caracteres');
      }

      // Tentar garantir que o perfil existe (criar se não existir)
      // Usar função RPC que usa SECURITY DEFINER para contornar RLS
      try {
        const { error: rpcError } = await supabase.rpc('ensure_user_profile');
        if (rpcError) {
          // Se a função RPC não existir ou falhar, apenas logar e continuar
          console.warn('[useCreateTrip] Could not ensure profile via RPC (function may not exist):', rpcError);
        }
      } catch (rpcErr) {
        // Se a função não existir, não bloquear - o Supabase vai dar erro de foreign key se necessário
        console.warn('[useCreateTrip] RPC function may not exist, continuing:', rpcErr);
      }

      // Preparar dados para inserção com validações
      const insertData: any = {
        user_id: userId,
        reason: trip.reason.trim(), // Garantir que não há espaços extras
        date: trip.date,
        status: trip.status || 'draft',
      };

      // Adicionar campos opcionais apenas se não forem null/undefined
      if (trip.start_km !== null && trip.start_km !== undefined) {
        insertData.start_km = Number(trip.start_km);
      }
      if (trip.end_km !== null && trip.end_km !== undefined) {
        insertData.end_km = Number(trip.end_km);
      }
      if (trip.start_location !== null && trip.start_location !== undefined) {
        insertData.start_location = trip.start_location.trim() || null;
      }
      if (trip.end_location !== null && trip.end_location !== undefined) {
        insertData.end_location = trip.end_location.trim() || null;
      }
      if (trip.start_lat !== null && trip.start_lat !== undefined) {
        insertData.start_lat = Number(trip.start_lat);
      }
      if (trip.start_lng !== null && trip.start_lng !== undefined) {
        insertData.start_lng = Number(trip.start_lng);
      }
      if (trip.end_lat !== null && trip.end_lat !== undefined) {
        insertData.end_lat = Number(trip.end_lat);
      }
      if (trip.end_lng !== null && trip.end_lng !== undefined) {
        insertData.end_lng = Number(trip.end_lng);
      }
      if (trip.start_photo_url !== null && trip.start_photo_url !== undefined) {
        insertData.start_photo_url = trip.start_photo_url;
      }
      if (trip.end_photo_url !== null && trip.end_photo_url !== undefined) {
        insertData.end_photo_url = trip.end_photo_url;
      }

      const { data, error } = await supabase
        .from('trips')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useCreateTrip] Supabase error:', error);
        console.error('[useCreateTrip] Insert data:', insertData);
        
        // Mensagens de erro mais específicas
        if (error.code === '23503') {
          // Foreign key violation - geralmente significa que o perfil não existe
          if (error.message?.includes('user_id') || error.message?.includes('profiles')) {
            throw new Error('Perfil de utilizador não encontrado. Por favor, contacte o administrador ou tente fazer logout e login novamente.');
          }
          throw new Error('Erro: Referência inválida. Verifique os dados inseridos.');
        } else if (error.code === '23502') {
          throw new Error('Erro: Campo obrigatório em falta. Verifique todos os campos.');
        } else if (error.code === '23505') {
          throw new Error('Erro: Esta viagem já existe.');
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw error;
        }
      }
      return data as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TripUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('trips')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Trip;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// Utility hook for trip statistics
export function useTripStats() {
  return useQuery({
    queryKey: ['trips', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('distance, date, status')
        .eq('status', 'completed');

      if (error) throw error;

      const trips = data as Pick<Trip, 'distance' | 'date' | 'status'>[];

      // Calculate stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthTrips = trips.filter((t) => {
        const tripDate = new Date(t.date);
        return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
      });

      const totalKm = trips.reduce((acc, t) => acc + (t.distance || 0), 0);
      const thisMonthKm = thisMonthTrips.reduce((acc, t) => acc + (t.distance || 0), 0);
      const tripCount = trips.length;
      const thisMonthCount = thisMonthTrips.length;

      return {
        totalKm,
        thisMonthKm,
        tripCount,
        thisMonthCount,
        avgDistance: tripCount > 0 ? Math.round(totalKm / tripCount) : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - estatísticas podem ser cached
  });
}

// Hook for OCR processing
export function useOcrOdometer() {
  return useMutation({
    mutationFn: async ({ imageBase64, mimeType }: { imageBase64: string; mimeType: string }) => {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-odometer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ imageBase64, mimeType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar imagem');
      }

      const result = await response.json();
      return result as { success: boolean; km_reading: number | null; confidence: number; notes?: string };
    },
  });
}

// Hook for uploading odometer photos
export function useUploadOdometerPhoto() {
  return useMutation({
    mutationFn: async ({ file, tripId, type }: { file: File; tripId: string; type: 'start' | 'end' }) => {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Utilizador não autenticado');
      }

      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${userId}/${tripId}/${type}_${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('odometer-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[useUploadOdometerPhoto] Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('odometer-photos')
        .getPublicUrl(filePath);

      return { filePath, publicUrl };
    },
  });
}

// Hook for grouped trips by month
export function useTripsByMonth() {
  return useQuery({
    queryKey: ['trips', 'by-month'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const trips = data as Trip[];

      // Group by month
      const grouped = trips.reduce((acc, trip) => {
        const date = new Date(trip.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[key]) {
          acc[key] = {
            month: key,
            label: date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }),
            trips: [],
            totalKm: 0,
          };
        }

        acc[key].trips.push(trip);
        acc[key].totalKm += trip.distance || 0;

        return acc;
      }, {} as Record<string, { month: string; label: string; trips: Trip[]; totalKm: number }>);

      return Object.values(grouped).sort((a, b) => b.month.localeCompare(a.month));
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - agrupamento por mês pode ser cached
  });
}
