-- ============================================================
-- Zeelink — สร้างบัญชีแอดมิน 2 ตัว (รันครั้งเดียวใน Supabase SQL Editor)
-- วิธีรัน: Supabase Dashboard → SQL Editor → New query
--         → paste ไฟล์นี้ → Run
-- ผลลัพธ์: สร้างผู้ใช้ที่ยืนยันอีเมลแล้ว + ตั้ง role='admin' + สร้างโปรไฟล์
-- สามารถรันซ้ำได้ (idempotent)
-- ============================================================

do $$
declare
  v_email   text;
  v_name    text;
  v_auth_id uuid;
  v_user_id uuid;
begin
  -- รายชื่อแอดมิน: อีเมล / ชื่อแสดง
  create temp table _admins (email text, name text) on commit drop;
  insert into _admins values
    ('zbcd1053@gmail.com',  'Admin Zbcd'),
    ('zeetosit@gmail.com',  'Admin Zeetosit');

  for v_email, v_name in select a.email, a.name from _admins a loop

    -- 1) สร้าง/อัปเดต auth.users (ยืนยันอีเมล + ตั้งรหัสผ่าน)
    --    ⚠️ แทน $ADMIN_PASSWORD ด้วยรหัสผ่านจริงก่อนรัน (ห้ามฝังรหัสลง Git)
    select id into v_auth_id from auth.users where email = v_email;
    if v_auth_id is null then
      insert into auth.users (
        instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, role, created_at, updated_at
      ) values (
        '00000000-0000-0000-0000-000000000000',
        v_email,
        crypt('$ADMIN_PASSWORD', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name', v_name),
        'authenticated',
        now(), now()
      ) returning id into v_auth_id;
    else
      update auth.users
      set encrypted_password = crypt('$ADMIN_PASSWORD', gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
          updated_at = now()
      where id = v_auth_id;
    end if;

    -- 2) สร้าง/อัปเดต public.users (role = 'admin')
    select id into v_user_id from public.users where email = v_email;
    if v_user_id is null then
      insert into public.users (email, name, role, is_banned)
      values (v_email, v_name, 'admin', false) returning id into v_user_id;
    else
      update public.users set role = 'admin', name = coalesce(name, v_name), is_banned = false
      where id = v_user_id;
    end if;

    -- 3) สร้าง profiles ถ้ายังไม่มี
    if not exists (select 1 from public.profiles where user_id = v_user_id) then
      insert into public.profiles (
        user_id, username, display_name, photo_url, bio, show_on_explore,
        theme_config, links
      ) values (
        v_user_id,
        split_part(v_email, '@', 1),
        v_name,
        null, '', false,
        '{"backgroundColor":"#ffffff","textColor":"#000000","buttonColor":"#000000","fontFamily":"Prompt","layout":"minimal","enableGlassEffect":false}'::jsonb,
        '[]'::jsonb
      );
    end if;

    raise notice 'admin ready: % (auth=%, user=%)', v_email, v_auth_id, v_user_id;
  end loop;
end $$;
