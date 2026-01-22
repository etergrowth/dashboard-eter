export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          status: string;
          value: number | null;
          probability: number;
          priority: string;
          tags: string[] | null;
          notes: string | null;
          sector: string | null;
          revenue: string | null;
          investment: string | null;
          main_objective: string | null;
          ai_analysis: string | null;
          ai_score: number | null;
          urgency: string | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: string;
          value?: number | null;
          probability?: number;
          priority?: string;
          tags?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: string;
          value?: number | null;
          probability?: number;
          priority?: string;
          tags?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          client_id: string;
          user_id: string;
          type: string;
          title: string;
          description: string | null;
          location: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          user_id: string;
          type: string;
          title: string;
          description?: string | null;
          location?: string | null;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          date?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          project_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          project_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          name: string;
          description: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          deadline: string | null;
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          name: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          deadline?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          name?: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          deadline?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          title: string;
          description: string | null;
          kanban_column: string;
          position: number;
          assignee_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          kanban_column?: string;
          position?: number;
          assignee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          kanban_column?: string;
          position?: number;
          assignee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_path: string;
          file_type: string | null;
          file_size: number | null;
          category: string | null;
          tags: string[] | null;
          public_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_path: string;
          file_type?: string | null;
          file_size?: number | null;
          category?: string | null;
          tags?: string[] | null;
          public_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_path?: string;
          file_type?: string | null;
          file_size?: number | null;
          category?: string | null;
          tags?: string[] | null;
          public_url?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          base_cost_per_hour: number;
          markup_percentage: number;
          final_hourly_rate: number;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          base_cost_per_hour: number;
          markup_percentage: number;
          final_hourly_rate: number;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          base_cost_per_hour?: number;
          markup_percentage?: number;
          final_hourly_rate?: number;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      proposals: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          title: string;
          description: string | null;
          status: string | null;
          total_amount: number | null;
          total_margin: number | null;
          valid_until: string | null;
          notes: string | null;
          links: Json | null;
          awarded: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          title: string;
          description?: string | null;
          status?: string | null;
          total_amount?: number | null;
          total_margin?: number | null;
          valid_until?: string | null;
          notes?: string | null;
          links?: Json | null;
          awarded?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string | null;
          total_amount?: number | null;
          total_margin?: number | null;
          valid_until?: string | null;
          notes?: string | null;
          links?: Json | null;
          awarded?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      proposal_items: {
        Row: {
          id: string;
          proposal_id: string;
          service_id: string;
          estimated_hours: number;
          software_costs: number;
          applied_hourly_rate: number;
          line_total: number;
          line_margin: number;
          notes: string | null;
          position: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          service_id: string;
          estimated_hours?: number;
          software_costs?: number;
          applied_hourly_rate: number;
          line_total?: number;
          line_margin?: number;
          notes?: string | null;
          position?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          service_id?: string;
          estimated_hours?: number;
          software_costs?: number;
          applied_hourly_rate?: number;
          line_total?: number;
          line_margin?: number;
          notes?: string | null;
          position?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
