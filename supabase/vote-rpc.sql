-- ===========================================================
-- Zeelink — RPC ใคร่โหวต (แก้ RLS บล็อกโหวตคำถามคนอื่น)
-- รันใน Supabase Dashboard → SQL Editor → New query → paste → Run
-- ต้องใช้ service-role key (sk-or-v1-...) หรือรันใน SQL Editor ของโปรเจกต์นี้
-- ===========================================================
-- ฟังก์ชันรันในฐานะ SECURITY DEFINER → ไม่ติด RLS บน UPDATE
-- ทำเฉพาะ "เพิ่มโหวต + ผนวก auth.uid() ให้คนโหวต" เท่านั้น
-- (ไม่ให้แก้ user_id / text ของคำถามคนอื่น)

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
  where id = q_id;
end;
$$;

-- ให้คนที่ล็อกอินเรียกได้ (แอปตรวจสอบ user อยู่แล้ว)
grant execute on function public.vote_question(uuid) to authenticated;
