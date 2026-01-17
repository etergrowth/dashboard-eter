import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
export interface LeadFormData {
  assunto: string;
  mensagem: string;
  projectType: string;
  budget: string;
  location?: string;
  firstName: string;
  email: string;
  phone?: string;
  empresa?: string;
  privacyConsent: boolean;
}

export const submitLead = async (formData: LeadFormData) => {
  try {
    const { data, error } = await supabase.rpc('submit_form', {
      p_nome: formData.firstName,
      p_email: formData.email,
      p_telefone: formData.phone || null,
      p_localizacao: formData.location || null,
      p_tipo_projeto: formData.projectType || null,
      p_orcamento: formData.budget || null,
      p_consentimento_privacidade: formData.privacyConsent,
      p_assunto: formData.assunto,
      p_mensagem: formData.mensagem,
      p_empresa: formData.empresa || null
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao submeter lead:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};
