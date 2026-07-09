-- ============================================================
-- Zeelink Phase 1 — avatar / profile image uploads
-- ============================================================
-- รันใน Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- สิ่งที่ไฟล์นี้ทำ:
--   1. สร้าง bucket "avatars" (public — อ่านรูปโปรไฟล์ได้ทั่วไป)
--   2. เปิด anon อ่านรูป (เผยแพร่บนแผนที่/โปรไฟล์)
--   3. เปิดให้ authenticated อัปโหลด / ลบได้
--
-- หมายเหตุ MVP: ยังไม่จำกัดเฉพาะเจ้าของรายคน
-- (ใครล็อกอินก็อัปโหลดใน bucket นี้ได้) — เพิ่ม policy เฉพาะ
-- เจ้าของทีหลังเมื่อผูก auth.uid() กับ public.users.id แล้ว
-- ============================================================

-- ===== 1. bucket =====
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ===== 2. อ่านได้ทั่วไป =====
create policy "avatars public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

-- ===== 3. เขียนได้เฉพาะผู้ใช้ที่ล็อกอิน =====
create policy "avatars auth upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "avatars auth manage"
  on storage.objects for update, delete to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');
