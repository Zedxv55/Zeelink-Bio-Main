-- ============================================================
-- Zeelink — AI configs (แอดมินคุม AI ต่อคน / ฟีด)
-- ============================================================
-- รันใน Supabase SQL Editor (ครั้งเดียว)
--
-- ตาราง ai_configs:
--   scope    = global | user | feed
--   owner_ref= 'global' | users.id (user scope) | 'feed' (feed scope)
--   model    = โมเดล Groq (ดีฟอลต์ llama-3.3-70b-versatile)
--   persona  = บุคลิก/ชื่อเรียก AI
--   enabled  = เปิด/ปิด AI สำหรับ scope นี้
--
-- แอดมินเปลี่ยนผ่าน AdminPanel → แท็บ AI
-- ผู้ใช้ปกติใช้ AI ได้อย่างเดียว (Q&A) ห้ามแก้ config
-- ============================================================

create table if not exists public.ai_configs (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'user', 'feed')),
  owner_ref text,
  model text not null default 'llama-3.3-70b-versatile',
  persona text,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (scope, owner_ref)
);

alter table public.ai_configs enable row level security;

-- เปิดกว้างชั่วคราว (anon + authenticated) จนกว่าจะผูก Supabase Auth จริง
-- (ใน production ควรจำกัดเฉพาะแอดมิน — ดูหมายเหตุ security-fixes.sql)
create policy "ai_configs demo all" on public.ai_configs for all to anon, authenticated using (true) with check (true);

-- seed config ระดับ global (ใช้ค่าปัจจุบัน)
insert into public.ai_configs (scope, owner_ref, model, persona, enabled)
values ('global', 'global', 'llama-3.3-70b-versatile', 'แอดมินจำลองใจดีของ Zeelink', true)
on conflict (scope, owner_ref) do nothing;
