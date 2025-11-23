import { Database } from './database';

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type ProjectTask = Database['public']['Tables']['project_tasks']['Row'];
export type ProjectTaskInsert = Database['public']['Tables']['project_tasks']['Insert'];
export type ProjectTaskUpdate = Database['public']['Tables']['project_tasks']['Update'];

export type Interaction = Database['public']['Tables']['interactions']['Row'];
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert'];
export type InteractionUpdate = Database['public']['Tables']['interactions']['Update'];

export type MediaFile = Database['public']['Tables']['media_files']['Row'];
export type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];
export type MediaFileUpdate = Database['public']['Tables']['media_files']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Enums
export type ClientStatus = 'lead' | 'proposal' | 'negotiation' | 'closed' | 'lost';
export type ClientPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';
export type KanbanColumn = 'todo' | 'doing' | 'done';
