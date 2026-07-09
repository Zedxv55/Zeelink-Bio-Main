import { createClient } from '@supabase/supabase-js';

// ต้องตั้งค่าใน .env (ดู .env.example) — ห้ามฝัง key ลงโค้ด
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — ตั้งค่าในไฟล์ .env (คัดลอกจาก .env.example)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
