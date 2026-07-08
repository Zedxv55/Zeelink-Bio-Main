-- Zeelink — Supabase schema
-- รันไฟล์นี้ใน Supabase SQL Editor (Project → SQL → New query → paste → Run)
--
-- หมายเหตุความปลอดภัย:_policy ด้านล่างเปิดกว้าง (anon สามารถอ่าน/เขียนได้)
-- เพราะแอปใช้ anon key โดยยังไม่มี Supabase Auth จริง จึงต้องเปิดแบบนี้ถึงจะทำงานได้
-- เมื่อพร้อมขึ้นโปรดเปลี่ยนเป็น Supabase Auth + RLS ที่เข้มงวดขึ้น (ดูหมายเหตุท้ายไฟล์)

-- ============ TABLES ============

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  photo_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_banned boolean not null default false,
  remember_token text,
  last_login timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  uid text,
  username text unique not null,
  display_name text,
  photo_url text,
  bio text,
  tags text[] not null default '{}',
  region text,
  province text,
  district text,
  sub_district text,
  postal_code text,
  show_on_explore boolean not null default false,
  likes integer not null default 0,
  views integer not null default 0,
  theme_config jsonb not null default '{}'::jsonb,
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  username text,
  text text not null,
  votes integer not null default 0,
  voted_user_ids text[] not null default '{}',
  status text not null default 'pending' check (status in ('approved', 'rejected', 'pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  link_url text,
  content text,
  is_active boolean not null default true,
  frequency text not null default 'once_daily',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now()
);

-- ============ INDEXES ============
create index if not exists idx_profiles_show_on_explore on public.profiles (show_on_explore);
create index if not exists idx_questions_status on public.questions (status);
create index if not exists idx_popups_is_active on public.popups (is_active);

-- ============ ROW LEVEL SECURITY ============
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.popups enable row level security;

-- เปิดกว้างสำหรับ anon (ชั่วคราว จนกว่าจะเพิ่ม Supabase Auth)
create policy "anon all users" on public.users for all to anon using (true) with check (true);
create policy "anon all profiles" on public.profiles for all to anon using (true) with check (true);
create policy "anon all questions" on public.questions for all to anon using (true) with check (true);
create policy "anon all popups" on public.popups for all to anon using (true) with check (true);

-- ============ STORAGE (backups) ============
insert into storage.buckets (id, name, public)
values ('backups', 'backups', false)
on conflict (id) do nothing;

create policy "anon backups" on storage.objects for all to anon
using (bucket_id = 'backups') with check (bucket_id = 'backups');

-- ============ สิ่งที่ต้องทำต่อเมื่อขึ้นโปรดักชัน ============
-- 1. เปลี่ยนจาก anon มาใช้ Supabase Auth (signUp / signInWithPassword)
--    โค้ดปัจจุบันเก็บแค่ email ไม่มีการเข้ารหัสรหัสผ่าน — ไม่ปลอดภัยสำหรับโปรดักชัน
-- 2. แทนที่ policy เปิดกว้างด้านบนด้วย policy เฉพาะเจ้าของ (using (auth.uid() = user_id))
-- 3. ตั้ง site URL / redirect ใน Authentication → URL Configuration
