import { createClient } from '@supabase/supabase-js';

// Safe placeholder values to prevent initialization crashes if environment variables are missing
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
const storage = typeof window !== 'undefined' ? window.localStorage : undefined;

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key-string-that-satisfies-supabase-client',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage,
    },
  }
);
