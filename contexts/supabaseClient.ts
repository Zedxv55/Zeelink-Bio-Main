import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://drwbwsfvxmhkoxmrknpz.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2J3c2Z2eG1oa294bXJrbnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTAzNjcsImV4cCI6MjA5OTA2NjM2N30.CZvVF7Lkf6dgBO-4YxgS0heORGiYSNoEPMKqtANA3Mo";

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing! Using mock data.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
