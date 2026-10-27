import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SokoNova] Supabase env vars not set. Running in offline/local-only mode.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
