-- ============================================================
-- Zeelink — สิทธิ์แอดมินเต็มรูปแบบ + สถานะออนไลน์ (last_seen)
-- รันครั้งเดียวใน Supabase Dashboard → SQL Editor → New query → paste → Run
-- (idempotent — รันซ้ำได้ไม่ error)
--
-- สิ่งที่ไฟล์นี้ทำ:
--   1. เพิ่มคอลัมน์ profiles.last_seen_at (แสดง "เข้าล่าสุด")
--   2. เปิด RLS ให้ role='admin' แก้/ลบผู้ใช้คนอื่นได้ (ทำทุกอย่างในเว็บ)
--   3. สร้าง RPC touch_presence() อัปเดต last_seen_at ของตัวเอง
--
-- หมายเหตุ: ไม่รัน SQL นี้ก็ยังดู "ออนไลน์ตอนนี้" ผ่าน Realtime ได้
--          แต่การแบน/ลบ/เลื่อนแอดมินผู้ใช้คนอื่น จะทำไม่ได้จนกว่าจะรันไฟล์นี้
-- ============================================================

-- 1) คอลัมน์เวลาเข้าล่าสุด
alter table public.profiles add column if not exists last_seen_at timestamptz;
create index if not exists idx_profiles_last_seen on public.profiles (last_seen_at);

-- 2) Policy: แอดมินทำได้ทุกอย่างบนตาราง users
drop policy if exists "users admin rw" on public.users;
create policy "users admin rw"
  on public.users for all to authenticated
  using     (exists (select 1 from public.users u2 where u2.email = auth.email() and u2.role = 'admin'))
  with check (exists (select 1 from public.users u2 where u2.email = auth.email() and u2.role = 'admin'));

-- 2) Policy: แอดมินทำได้ทุกอย่างบนตาราง profiles
drop policy if exists "profiles admin rw" on public.profiles;
create policy "profiles admin rw"
  on public.profiles for all to authenticated
  using     (exists (select 1 from public.users u2 where u2.email = auth.email() and u2.role = 'admin'))
  with check (exists (select 1 from public.users u2 where u2.email = auth.email() and u2.role = 'admin'));

-- 3) RPC อัปเดต last_seen_at ของผู้ใช้ที่ล็อกอินอยู่
create or replace function public.touch_presence()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set last_seen_at = now()
    where user_id in (select id from public.users where email = auth.email());
end;
$$;

grant execute on function public.touch_presence() to authenticated;
