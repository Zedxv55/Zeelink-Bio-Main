-- ============================================================
-- Zeelink — Security lockdown (แทนที่ policy เปิดกว้างทั้งหมด)
-- รันครั้งเดียวใน Supabase Dashboard → SQL Editor → New query → paste → Run
-- ไฟล์นี้ idempotent: drop policy เก่าก่อนสร้างใหม่
--
-- สิ่งที่ไฟล์นี้แก้:
--   S1  ลบ policy anon-all ทุกตาราง (กัน anon อ่าน/แก้/ลบข้อมูลได้ทุกอย่างโดยไม่ล็อกอิน)
--   S2  กันยกระดับสิทธิ์เอง (trigger prevent_priv_escalation บนตาราง users)
--   S4  ล็อก posts / post_comments (anon ไม่สามารถลบ/แก้โพสต์คนอื่นได้)
--   S5  ปิด users public read (กันรั่ว email / remember_token / PII)
--   S6  ผูกเจ้าของ avatars (ลบ/ทับรูปโปรไฟล์คนอื่นไม่ได้)
--   S7  จำกัด backups เฉพาะ admin
--   S9  กันโหวตซ้ำใน vote_question
--   (S3 เรื่องคีย์ฝั่ง client → แก้ในโค้ด + ต้องหมุนคีย์ ดู SECURITY_FIXES.md)
--
-- ⚠️ ต้องมีแอดมินอย่างน้อย 1 คนในตาราง users (role='admin') ก่อนที่ policy admin จะทำงาน
--    ดู SECURITY_FIXES.md หัวข้อ "ตั้งแอดมิน"
-- ============================================================

-- ===== ฟังก์ชันช่วยตรวจสถานะแอดมิน (ใช้ใน policy หลายจุด) =====
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where email = auth.email() and role = 'admin'
  );
$$;

-- ============================================================
-- 1) DROP ทุก policy เก่า (anon-all + lockdown เก่า) เพื่อสร้างใหม่ให้เป็นระเบียบ
-- ============================================================
drop policy if exists "anon all users"        on public.users;
drop policy if exists "anon all profiles"      on public.profiles;
drop policy if exists "anon all questions"     on public.questions;
drop policy if exists "anon all popups"        on public.popups;
drop policy if exists "anon all posts"         on public.posts;
drop policy if exists "anon all post_comments" on public.post_comments;

-- policy ที่ไฟล์นี้สร้างเอง (กันรันซ้ำ error)
drop policy if exists "posts public read"          on public.posts;
drop policy if exists "posts auth insert"          on public.posts;
drop policy if exists "posts auth update"          on public.posts;
drop policy if exists "posts admin delete"         on public.posts;
drop policy if exists "posts admin update"         on public.posts;
drop policy if exists "post_comments public read"  on public.post_comments;
drop policy if exists "post_comments auth insert"  on public.post_comments;
drop policy if exists "post_comments admin delete" on public.post_comments;
drop policy if exists "anon backups"           on storage.objects;

drop policy if exists "users owner rw"         on public.users;
drop policy if exists "users public read"      on public.users;
drop policy if exists "users admin rw"         on public.users;
drop policy if exists "profiles owner rw"      on public.profiles;
drop policy if exists "profiles public read"   on public.profiles;
drop policy if exists "profiles admin rw"      on public.profiles;
drop policy if exists "questions public read"  on public.questions;
drop policy if exists "questions owner write"  on public.questions;
drop policy if exists "questions owner update" on public.questions;
drop policy if exists "questions admin rw"     on public.questions;
drop policy if exists "popups public read"     on public.popups;
drop policy if exists "popups admin write"     on public.popups;
drop policy if exists "backups owner rw"       on storage.objects;
drop policy if exists "avatars public read"    on storage.objects;
drop policy if exists "avatars auth upload"    on storage.objects;
drop policy if exists "avatars auth manage"    on storage.objects;

-- เปิด RLS ให้ครบ (เผื่อรันไฟล์นี้เพียงไฟล์เดียว)
alter table public.users         enable row level security;
alter table public.profiles      enable row level security;
alter table public.questions     enable row level security;
alter table public.popups        enable row level security;
alter table public.posts         enable row level security;
alter table public.post_comments enable row level security;

-- ============================================================
-- 2) USERS — เจ้าของจัดการแถวตัวเองได้, admin จัดการทั้งระบบ, ไม่มี anon read
-- ============================================================
create policy "users owner read"
  on public.users for select to authenticated
  using (email = auth.email());

create policy "users owner insert"
  on public.users for insert to authenticated
  with check (email = auth.email());

create policy "users owner update"
  on public.users for update to authenticated
  using (email = auth.email())
  with check (email = auth.email());

create policy "users admin all"
  on public.users for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 3) PROFILES — สาธารณะอ่านได้ (แผนที่/โปรไฟล์), เจ้าของเขียนได้, admin จัดการได้
-- ============================================================
create policy "profiles public read"
  on public.profiles for select to anon, authenticated
  using (true);

create policy "profiles owner rw"
  on public.profiles for all to authenticated
  using (user_id in (select id from public.users where email = auth.email()))
  with check (user_id in (select id from public.users where email = auth.email()));

create policy "profiles admin all"
  on public.profiles for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 4) QUESTIONS — สาธารณะอ่าน, เจ้าของเขียน, admin จัดการ
-- ============================================================
create policy "questions public read"
  on public.questions for select to anon, authenticated
  using (true);

create policy "questions owner insert"
  on public.questions for insert to authenticated
  with check (true);

create policy "questions admin all"
  on public.questions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 5) POPUPS — สาธารณะอ่าน, admin เขียนได้
-- ============================================================
create policy "popups public read"
  on public.popups for select to anon, authenticated
  using (true);

create policy "popups admin all"
  on public.popups for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 6) POSTS (ฟีด) — สาธารณะอ่าน
--    ผู้ล็อกอินโพสต์/กดไลก์ได้, แต่ "ลบได้เฉพาะ admin" (ป้องกัน anon ทำลายฟีด)
--    ⚠️ ข้อจำกัดรู้ไว้: owner ระบุด้วย public.users.id (แอปใช้ค่านี้) ซึ่งยังไม่เทียบกับ auth.uid()
--       จึงปล่อยให้ authenticated อัปเดตโพสต์ได้ (ใช้กดไลก์) แต่อนุญาตให้แก้ข้อความโพสต์คนอื่นได้
--       ดู SECURITY_FIXES.md หัวข้อ "โครงสร้าง id" สำหรับการรัดกุมขึ้นในอนาคต (RPC toggle_post_like)
-- ============================================================
create policy "posts public read"
  on public.posts for select to anon, authenticated
  using (true);

create policy "posts auth insert"
  on public.posts for insert to authenticated
  with check (true);

-- อัปเดตโพสต์ทำได้เฉพาะแอดมิน (การกดไลก์ใช้ RPC toggle_post_like แทน — กันแก้ข้อความโพสต์คนอื่น = S10)
create policy "posts admin update"
  on public.posts for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "posts admin delete"
  on public.posts for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 7) POST_COMMENTS — สาธารณะอ่าน, ล็อกอินคอมเมนต์ได้, ลบได้เฉพาะ admin
-- ============================================================
create policy "post_comments public read"
  on public.post_comments for select to anon, authenticated
  using (true);

create policy "post_comments auth insert"
  on public.post_comments for insert to authenticated
  with check (true);

create policy "post_comments admin delete"
  on public.post_comments for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 8) STORAGE — avatars (ผูกเจ้าของ), backups (admin เท่านั้น)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars owner write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

insert into storage.buckets (id, name, public)
values ('backups', 'backups', false)
on conflict (id) do nothing;

create policy "backups admin all"
  on storage.objects for all to authenticated
  using (bucket_id = 'backups' and public.is_admin())
  with check (bucket_id = 'backups' and public.is_admin());

-- ============================================================
-- 9) กันยกระดับสิทธิ์เอง (S2) — trigger บนตาราง users
-- ============================================================
create or replace function public.prevent_priv_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     or new.is_banned is distinct from old.is_banned then
    if not public.is_admin() then
      raise exception 'ไม่มีสิทธิ์เปลี่ยน role หรือสถานะการแบน';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_prevent_priv on public.users;
create trigger trg_prevent_priv
  before update on public.users
  for each row execute function public.prevent_priv_escalation();

-- ============================================================
-- 10) ทำให้ RPC ที่มีอยู่ปลอดภัยขึ้น
-- ============================================================
-- vote_question: กันโหวตซ้ำ (S9)
create or replace function public.vote_question(q_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.questions
    set votes = coalesce(votes, 0) + 1,
        voted_user_ids = array_append(coalesce(voted_user_ids, array[]::text[]), auth.uid()::text)
  where id = q_id
    and not (auth.uid()::text = any(coalesce(voted_user_ids, array[]::text[])));
end;
$$;

grant execute on function public.vote_question(uuid) to authenticated;

-- toggle_post_like: กดไลก์/เลิกไลก์ แบบ idempotent (แก้ S10 — ผู้ล็อกอินแก้ข้อความโพสต์คนอื่นไม่ได้)
create or replace function public.toggle_post_like(p_id uuid, uid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts p
    set likes = coalesce(p.likes, 0)
             + case when uid = any(coalesce(p.liked_users, array[]::text[])) then -1 else 1 end,
        liked_users = case when uid = any(coalesce(p.liked_users, array[]::text[]))
                           then array_remove(coalesce(p.liked_users, array[]::text[]), uid)
                           else array_append(coalesce(p.liked_users, array[]::text[]), uid) end
  where p.id = p_id;
end;
$$;

grant execute on function public.toggle_post_like(uuid, text) to authenticated;

-- touch_presence: คงไว้ตาม admin-online.sql (สร้างเผื่อยังไม่รันไฟล์นั้น)
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
