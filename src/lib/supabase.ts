import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

/**
 * Klient Supabase dla przeglądarki używa wyłącznie publicznego klucza anon (VITE_SUPABASE_ANON_KEY).
 * Nigdy nie umieszczaj klucza `service_role` w zmiennych `VITE_*` ani w kodzie klienta.
 */
export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
