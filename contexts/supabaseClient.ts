import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ต้องตั้งค่าใน .env (ดู .env.example) — ห้ามฝัง key ลงโค้ด
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ===== Demo mode fallback =====
// ถ้าไม่มี .env จะ "ไม่ throw" ให้แอปพังทั้งเว็บ (ขัดกับโหมด demo ที่ README บอกไว้)
// แต่จะสร้าง client แบบ placeholder ที่ทุกการเรียกจะ reject อย่างนุ่มนวล
// ทุกหน้ามี try/catch + mock data อยู่แล้ว จึงยังเปิดดูหน้าเว็บได้ปกติ
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  // แจ้งเตือนใน console เท่านั้น ไม่ทำให้แอปล่ม
  console.warn(
    '[Zeelink] ไม่พบ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — กำลังทำงานในโหมด Demo (ข้อมูลจำลอง)\n' +
    'ตั้งค่าในไฟล์ .env (คัดลอกจาก .env.example) เพื่อเปิดใช้งานระบบสมาชิกจริง'
  );
}

// ใช้ค่า placeholder ที่ valid ทาง syntax เพื่อให้ createClient ไม่ throw
// (ตัว URL นี้จะไม่ถูกเรียกจริงเพราะทุก query มี fallback)
const FALLBACK_URL = 'https://demo.supabase.co';
const FALLBACK_KEY = 'demo-anon-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseKey || FALLBACK_KEY
);
