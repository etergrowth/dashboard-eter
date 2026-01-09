import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Service, ServiceInsert, ServiceUpdate } from '../../types';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_services', { p_include_inactive: false });

      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useAllServices() {
  return useQuery({
    queryKey: ['services', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_services', { p_include_inactive: true });

      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: ServiceInsert) => {
      const { data, error } = await supabase
        .rpc('insert_service', {
          p_name: service.name,
          p_base_cost_per_hour: service.base_cost_per_hour,
          p_markup_percentage: service.markup_percentage,
          p_final_hourly_rate: service.final_hourly_rate,
          p_description: service.description || null,
        });

      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ServiceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .rpc('update_service', {
          p_id: id,
          p_name: updates.name || null,
          p_base_cost_per_hour: updates.base_cost_per_hour || null,
          p_markup_percentage: updates.markup_percentage || null,
          p_final_hourly_rate: updates.final_hourly_rate || null,
          p_description: updates.description !== undefined ? updates.description : null,
        });

      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .rpc('delete_service', { p_id: id });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', 'all'] });
    },
  });
}