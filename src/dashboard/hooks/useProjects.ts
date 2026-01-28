import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Project, ProjectInsert, ProjectUpdate, ProjectTask, ProjectTaskInsert, ProjectTaskUpdate } from '../../types';

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

// Projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - dados de projetos mudam raramente
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });
}

// Project Tasks
export function useProjectTasks(projectId?: string) {
  return useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      let query = supabase
        .from('project_tasks')
        .select('*')
        .order('position', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProjectTask[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - tasks podem ser atualizadas mais frequentemente
  });
}

export function useCreateProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: ProjectTaskInsert) => {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Utilizador não autenticado');
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .insert({ ...task, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });
}

export function useUpdateProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectTaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('project_tasks')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });
}

export function useDeleteProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });
}
