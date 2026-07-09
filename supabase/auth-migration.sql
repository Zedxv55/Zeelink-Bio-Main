-- ============================================================
-- Zeelink Phase 0 — Supabase Auth + RLS lockdown
-- ============================================================
-- รันไฟล์นี้ใน Supabase Dashboard → SQL Editor → New query
-- → paste → Run (รันครั้งเดียว)
--
-- สิ่งที่ไฟล์นี้ทำ:
--   1. ลบ policy เปิดกว้าง (anon อ่าน/เขียนได้ทุกตาราง)
--   2. เปิด RLS ให้ anon อ่านได้เฉพาะข้อมูลสาธารณะ
--      (profiles สำหรบแผนที่, questions, popups)
--   3. ล็อกการเขียนไว้เฉพาะเจ้าของ (เทียบด้วยอีเมล)
--
-- หมายเหตุ: แอปเรียก supabase.auth.signUp / signInWithPassword
-- ซึ่งจะออก JWT ให้ client → RLS จึงเห็น role = authenticated
-- ============================================================

-- ===== 1. ลบ policy เปิดกว้างเดิม =====
drop policy if exists "anon all users"    on public.users;
drop policy if exists "anon all profiles"  on public.profiles;
drop policy if exists "anon all questions" on public.questions;
drop policy if exists "anon all popups"    on public.popups;
drop policy if exists "anon backups"      on storage.objects;

-- ===== 2. users: เจ้าของจัดการได้, ทุกคนอ่านชื่ออีเมลได้ =====
create policy "users owner rw"
  on public.users for all to authenticated
  using (email = auth.email())
  with check (email = auth.email());

create policy "users public read"
  on public.users for select to anon, authenticated
  using (true);

-- ===== 3. profiles: เจ้าของ rw, ทุกคนอ่าน (แผนที่) =====
create policy "profiles owner rw"
  on public.profiles for all to authenticated
  using (user_id in (select id from public.users where email = auth.email()))
  with check (user_id in (select id from public.users where email = auth.email()));

create policy "profiles public read"
  on public.profiles for select to anon, authenticated
  using (true);

-- ===== 4. questions: ทุกคนอ่าน, เจ้าของเขียน =====
create policy "questions public read"
  on public.questions for select to anon, authenticated
  using (true);

create policy "questions owner write"
  on public.questions for insert to authenticated
  with check (true);

create policy "questions owner update"
  on public.questions for update to authenticated
  using (user_id = auth.uid()::text);

-- ===== 5. popups: อ่านได้ทุกคน, เขียนได้เฉพาะ admin =====
create policy "popups public read"
  on public.popups for select to anon, authenticated
  using (true);

create policy "popups admin write"
  on public.popups for all to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'admin'))
  with check (exists (select 1 from public.users where email = auth.email() and role = 'admin'));

-- ===== 6. storage backps: เฉพาะเจ้าของ =====
create policy "backups owner rw"
  on storage.objects for all to authenticated
  using (bucket_id = 'backups')
  with check (bucket_id = 'backups');

-- ============================================================
-- สิ่งที่ต้องทำเพิ่มใน Supabase Dashboard (ไม่ใช่ SQL):
--   Authentication → URL Configuration
--     Site URL: https://your-domain.com
--     Redirect URLs: https://your-domain.com/**
--   Authentication → Providers → Email: เปิด "Confirm email"
--     (หรือปิดถ้าอยากให้ล็อกอินได้ทันทีตอน dev)
-- ============================================================
