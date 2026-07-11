-- ============================================================
-- Zeelink — Reports (ระบบรายงานเนื้อหา)
-- ============================================================
-- รันใน Supabase SQL Editor (ครั้งเดียว)
--
-- นโยบาย: nudity อนุญาต / gore(เลือด/สยดสยอง) แบน
-- ไม่มีสแกนรูปอัตโนมัติ → ผู้ใช้กด "รายงาน" เข้า reports
-- แอดมินตรวจในคิว (AdminPanel → Moderation) แล้วซ่อน/แบน/ละเว้น
--
--   target_type = post | profile | comment
--   status      = open | resolved | dismissed
-- ============================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id text,
  target_type text not null check (target_type in ('post', 'profile', 'comment')),
  target_id text not null,
  reason text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_status on public.reports (status);
create index if not exists idx_reports_target on public.reports (target_type, target_id);

alter table public.reports enable row level security;

-- เปิดกว้างชั่วคราว (anon + authenticated) จนกว่าจะผูก Supabase Auth จริง
create policy "reports demo all" on public.reports for all to anon, authenticated using (true) with check (true);
