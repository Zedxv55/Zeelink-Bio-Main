-- ============================================================
-- Zeelink — Feed RLS (โพสต์/คอมเมนต์)
-- ============================================================
-- รันใน Supabase SQL Editor (ครั้งเดียว)
--
-- หมายเหตุ: แอปใช้ anon key โดยยังไม่มี Supabase Auth จริง
-- จึงคง policy เปิดกว้าง (anon อ่าน/เขียนได้) เพื่อไม่ให้ Demo พัง
-- ไฟล์นี้เพิ่ม policy "เจ้าของจัดการได้" เป็นแนวทางสำหรับตอนผูก auth.uid()
-- (ดูหมายเหตุ production ใน schema.sql)
-- ============================================================

alter table public.posts enable row level security;
alter table public.post_comments enable row level security;

-- anon อ่านโพสต์/คอมเมนต์ได้ (Demo + หน้าแรก/ฟีด)
drop policy if exists "anon read posts" on public.posts;
create policy "anon read posts" on public.posts for select to anon using (true);

drop policy if exists "anon read post_comments" on public.post_comments;
create policy "anon read post_comments" on public.post_comments for select to anon using (true);

-- เจ้าของจัดการโพสต์ได้ (เมื่อผูก auth.uid() เข้ากับ posts.user_id)
-- หมายเหตุ: ตอนนี้ app ใช้ตาราง users แยกต่างหาก user_id จึงยังไม่ตรงกับ auth.uid()
-- เปิดใช้งานจริงตอนย้ายไป Supabase Auth (production)
drop policy if exists "owner manage posts" on public.posts;
create policy "owner manage posts" on public.posts for all to authenticated
  using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

create index if not exists idx_posts_user_id on public.posts (user_id);
