-- ============================================================
-- Zeelink — RLS Hardening (แผน P0-1)
-- ⚠️ รันใน Supabase Dashboard → SQL Editor → New query → Run
--    แนะนำทดสอบในโปรเจกต์ staging ก่อนรันบน production จริง
--    สคริปต์นี้ idempotent: ลบ policy เก่า (ถ้ามี) แล้วสร้างใหม่
-- ============================================================
--
-- หลักการ:
--  - เปิด RLS ทุกตาราง
--  - ตาราง "เนื้อหาสาธารณะ" (posts/profiles/questions/popups) อ่านได้ทั่วไป
--    เพื่อไม่ให้ฟีด/แผนที่พัง (แอปใช้ anon key อ่าน)
--  - การเขียน/แก้/ลบ จำกัดเฉพาะเจ้าของแถว (user_id = auth.uid()) หรือ admin
--  - ตาราง users ล็อคtight: เจ้าของดู/แก้ตัวเองได้, admin จัดการได้, anon ไม่มีสิทธิ์

-- ฟังก์ชันช่วย: เช็คว่า user ปัจจุบันเป็น admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- เปิด RLS ทุกตาราง
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.follows enable row level security;
alter table public.ai_configs enable row level security;
alter table public.questions enable row level security;
alter table public.popups enable row level security;

-- ===== users: เจ้าของดู/แก้ของตัวเอง, admin จัดการได้ =====
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (id = auth.uid() or public.is_admin());

-- ===== profiles: อ่านสาธารณะ (Explore/โปรไฟล์) แต่แก้ได้เฉพาะเจ้าของ =====
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles for select using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete using (user_id = auth.uid() or public.is_admin());

-- ===== posts: อ่านสาธารณะ, เขียนได้เฉพาะเจ้าของ =====
drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts for select using (true);

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts
  for insert with check (user_id = auth.uid());

drop policy if exists posts_update_own on public.posts;
create policy posts_update_own on public.posts
  for update using (user_id = auth.uid());

drop policy if exists posts_delete_own on public.posts;
create policy posts_delete_own on public.posts
  for delete using (user_id = auth.uid());

-- ===== post_comments: อ่านสาธารณะ, เขียนได้เฉพาะสมาชิกที่ล็อกอิน =====
drop policy if exists post_comments_select_public on public.post_comments;
create policy post_comments_select_public on public.post_comments for select using (true);

drop policy if exists post_comments_insert on public.post_comments;
create policy post_comments_insert on public.post_comments
  for insert with check (auth.uid() is not null);

drop policy if exists post_comments_delete_own on public.post_comments;
create policy post_comments_delete_own on public.post_comments
  for delete using (user_id = auth.uid() or public.is_admin());

-- ===== follows: ดูได้ทั่วไป, จัดการได้เฉพาะตน =====
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows for select using (true);

drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows
  for insert with check (follower_id = auth.uid());

drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows
  for delete using (follower_id = auth.uid() or following_id = auth.uid());

-- ===== ai_configs: อ่านได้ทั่วไป, เขียนได้เฉพาะ admin =====
drop policy if exists ai_configs_select on public.ai_configs;
create policy ai_configs_select on public.ai_configs for select using (true);

drop policy if exists ai_configs_admin on public.ai_configs;
create policy ai_configs_admin on public.ai_configs
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== questions: อ่านเฉพาะ approved/ตนเอง/admin, เขียนได้เฉพาะสมาชิก =====
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());

drop policy if exists questions_insert on public.questions;
create policy questions_insert on public.questions
  for insert with check (auth.uid() is not null);

drop policy if exists questions_admin on public.questions;
create policy questions_admin on public.questions
  for update using (public.is_admin()) with check (public.is_admin());

-- ===== popups: อ่านเฉพาะ active, เขียนได้เฉพาะ admin =====
drop policy if exists popups_select on public.popups;
create policy popups_select on public.popups
  for select using (is_active = true or public.is_admin());

drop policy if exists popups_admin on public.popups;
create policy popups_admin on public.popups
  for all using (public.is_admin()) with check (public.is_admin());
