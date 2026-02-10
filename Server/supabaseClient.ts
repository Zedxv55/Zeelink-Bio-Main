import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://svqzqjjzvglhhjxnecnl.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_VGwkTrFk7hQBvdO1bmIGIQ_kmtqGvMe";

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing! Using mock data.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
