-- ============================================================
-- Zeelink — Feed media storage bucket (รูป/วิดีโอในฟีด)
-- ============================================================
-- รันใน Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- สิ่งที่ไฟล์นี้ทำ:
--   1. สร้าง bucket "posts-media" (public — อ่านมีเดียในฟีดได้ทั่วไป)
--   2. เปิด anon อ่าน (แสดงรูป/วิดีโอในฟีด/โปรไฟล์)
--   3. เปิดให้ authenticated อัปโหลด / ลบได้
-- ============================================================

-- ===== 1. bucket =====
insert into storage.buckets (id, name, public)
values ('posts-media', 'posts-media', true)
on conflict (id) do nothing;

-- ===== 2. อ่านได้ทั่วไป =====
create policy "posts-media public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'posts-media');

-- ===== 3. เขียนได้เฉพาะผู้ใช้ที่ล็อกอิน =====
create policy "posts-media auth upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'posts-media');

create policy "posts-media auth manage"
  on storage.objects for update, delete to authenticated
  using (bucket_id = 'posts-media')
  with check (bucket_id = 'posts-media');
