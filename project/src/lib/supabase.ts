import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export { supabase };

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: 'admin' | 'provider' | 'tourist';
  province?: string;
  city?: string;
  hosting_type?: string;
  created_at: string;
  updated_at: string;
}
