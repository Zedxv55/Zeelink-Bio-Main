-- Zeelink — Migration: เพิ่มตารางฟีด + พิกัดโปรไฟล์
-- รันไฟล์นี้ใน Supabase SQL Editor (Project → SQL → New query → paste → Run)
-- ไฟล์นี้ออกแบบให้ "รันซ้ำได้" (idempotent) ไม่ error หากรันหลายครั้ง
--
-- หมายเหตุ: ตาราง users/profiles/questions/popups ถูกสร้างไปแล้วจาก schema.sql เดิม
-- ไฟล์นี้เพิ่มเฉพาะส่วนที่ขาด: lat/lng ใน profiles + ตาราง posts/post_comments

-- 1) เพิ่มพิกัดใน profiles (ถ้ายังไม่มี)
alter table public.profiles add column if not exists lat double precision;
alter table public.profiles add column if not exists lng double precision;

-- 2) ตารางโพสต์ (ฟีดแบบ Facebook)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  username text,
  display_name text,
  photo_url text,
  text text,
  media_url text,
  media_type text not null default 'none' check (media_type in ('none', 'image', 'video')),
  likes integer not null default 0,
  liked_users text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 3) ตารางคอมเมนต์
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id text,
  username text,
  display_name text,
  photo_url text,
  text text not null,
  created_at timestamptz not null default now()
);

-- 4) Indexes (idempotent)
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_post_comments_post_id on public.post_comments (post_id);

-- 5) เปิด RLS (idempotent)
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;

-- 6) Policy เปิดกว้างสำหรับ anon (ชั่วคราว จนกว่าจะเพิ่ม Supabase Auth)
--    ใช้ drop + create เพื่อให้รันซ้ำได้โดยไม่ error
drop policy if exists "anon all posts" on public.posts;
create policy "anon all posts" on public.posts for all to anon using (true) with check (true);

drop policy if exists "anon all post_comments" on public.post_comments;
create policy "anon all post_comments" on public.post_comments for all to anon using (true) with check (true);

-- ✅ เสร็จสิ้น: ตอนนี้ระบบฟีด และการแชร์ตำแหน่งพอร์ต จะทำงานจริงบนฐานข้อมูล
