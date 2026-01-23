// Enums
export type LeadSource = 'linkedin' | 'website' | 'referral' | 'cold_call' | 'email' | 'door_to_door';
export type LeadStatus = 'prospecting' | 'engaged' | 'qualified' | 'crm_ready' | 'dead';

export type ActivityType = 
  | 'call_outbound' 
  | 'call_inbound' 
  | 'email_sent' 
  | 'email_received'
  | 'linkedin_connect' 
  | 'linkedin_message'
  | 'meeting' 
  | 'note' 
  | 'lead_imported';

export type ActivityDirection = 'inbound' | 'outbound' | 'neutral';

// Lead Sandbox
export interface LeadSandbox {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  location?: string;
  company: string;
  job_title?: string;
  company_size?: number;
  source: LeadSource;
  status: LeadStatus;
  bant_budget: boolean;
  bant_authority: boolean;
  bant_need: boolean;
  bant_timeline: boolean;
  scratchpad_notes: string;
  date_created: string;
  date_last_contact?: string;
  date_converted?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadSandboxInsert {
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  location?: string;
  company: string;
  job_title?: string;
  company_size?: number;
  source: LeadSource;
  bant_budget?: boolean;
  bant_authority?: boolean;
  bant_need?: boolean;
  bant_timeline?: boolean;
  scratchpad_notes?: string;
}

export interface LeadSandboxUpdate {
  name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  location?: string;
  company?: string;
  job_title?: string;
  company_size?: number;
  source?: LeadSource;
  status?: LeadStatus;
  bant_budget?: boolean;
  bant_authority?: boolean;
  bant_need?: boolean;
  bant_timeline?: boolean;
  scratchpad_notes?: string;
  date_last_contact?: string;
}

// Sandbox Activity
export interface SandboxActivity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  direction: ActivityDirection;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface SandboxActivityInsert {
  lead_id: string;
  type: ActivityType;
  direction: ActivityDirection;
  description: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

// Lead com Score calculado
export interface LeadWithScore extends LeadSandbox {
  score: number;
}

// Estatísticas da Sandbox
export interface SandboxStats {
  total_contacts: number;
  total_contacts_variation: number;
  response_rate: number;
  response_rate_variation: number;
  validation_rate: number;
  validation_rate_variation: number;
  leads_by_source: Record<LeadSource, number>;
  conversion_funnel: {
    prospects: number;
    engaged: number;
    engaged_rate: number;
    qualified: number;
    qualified_rate: number;
    crm_ready: number;
    crm_ready_rate: number;
  };
  avg_duration_days: number;
  overall_conversion_rate: number;
  high_potential_leads: Array<{
    id: string;
    name: string;
    company: string;
    source: LeadSource;
    status: LeadStatus;
    score: number;
  }>;
}

// Filtros
export interface LeadFilters {
  source?: LeadSource | 'all';
  status?: LeadStatus | 'all';
  segment?: 'active_search' | 'follow_up' | 'all';
  search?: string;
}

// BANT Progress
export interface BANTProgress {
  budget: boolean;
  authority: boolean;
  need: boolean;
  timeline: boolean;
  percentage: number;
  completed: number;
  total: number;
}
