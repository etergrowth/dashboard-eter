import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Trip, TripInsert, TripUpdate } from '../../types';

// Local user ID for local-only execution (UUID format)
const LOCAL_USER_ID = '00000000-0000-0000-0000-000000000000';

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
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trip: TripInsert) => {
      const { data, error } = await supabase
        .from('trips')
        .insert({ ...trip, user_id: LOCAL_USER_ID } as any)
        .select()
        .single();

      if (error) throw error;
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
      const userId = LOCAL_USER_ID;
      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${userId}/${tripId}/${type}_${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('odometer-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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
  });
}
