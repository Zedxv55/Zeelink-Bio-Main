-- ============================================================
-- Zeelink — Profile visibility (โหมด Only / สาธารณะ)
-- ============================================================
-- รันใน Supabase SQL Editor (ครั้งเดียว)
--
-- เพิ่มคอลัมน์ visibility ใน profiles:
--   'public'  = สาธารณะ (ค่าตั้งต้น) ทุกคนเห็นโปรไฟล์/โพสต์ได้
--   'private' = Only mode ดูได้เฉพาะผู้ติดตามที่เจ้าของอนุมัติ (ตาราง follows)
--               แอดมินเห็นทุกสิทธิ์ได้เสมอ
-- ============================================================

alter table public.profiles add column if not exists visibility text not null default 'public' check (visibility in ('public', 'private'));

create index if not exists idx_profiles_visibility on public.profiles (visibility);
