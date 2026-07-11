-- ============================================================
-- Zeelink — Follows (ระบบติดตาม + โหมด Only)
-- ============================================================
-- รันใน Supabase SQL Editor (ครั้งเดียว)
--
-- ตาราง follows:
--   follower_id  = ผู้ขอติดตาม (users.id)
--   following_id = เจ้าของบัญชีที่ถูกติดตาม (users.id)
--   status       = pending (ขอติดตามบัญชี Only) | approved | rejected
-- บัญชีปกติ (public) ติดตามได้ทันที (approved)
-- บัญชี Only (private) ต้องเจ้าของอนุมัติก่อน (pending → approved)
-- ============================================================

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id text not null,
  following_id text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (follower_id, following_id)
);

create index if not exists idx_follows_following on public.follows (following_id);
create index if not exists idx_follows_follower on public.follows (follower_id);

alter table public.follows enable row level security;

-- เปิดกว้างชั่วคราว (anon + authenticated) เหมือนตารางอื่นในโหมด Demo
-- จนกว่าจะผูก Supabase Auth จริง ให้คงแบบนี้เพื่อไม่ให้ฟีด/โปรไฟล์พัง
-- (แอปใช้ตาราง users แยกต่างหาก user_id จึงยังไม่ตรงกับ auth.uid() — ดูหมายเหตุใน schema.sql)
create policy "follows demo all" on public.follows for all to anon, authenticated using (true) with check (true);
