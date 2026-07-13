# Zeelink — คู่มือรัน Supabase (แผน P0-1 / P0-4 / P1-1)

ไฟล์ SQL ในโฟลเดอร์นี้พร้อมหมด แต่บางรายการ **ต้องรันใน Supabase Dashboard เอง**
(โค้ดฝั่งแอปไม่สามารถรัน SQL ต่อฐานข้อมูลสดได้) คู่มือนี้รวมขั้นตอนที่ผู้ใช้ต้องทำมือ

## 1. รันไฟล์ SQL ทั้งหมด (P1-1 + P0-1)
ใน Supabase Dashboard → SQL Editor → New query → paste → Run **ทีละไฟล์** (ลำดับแนะนำ):

1. `schema.sql` — สร้างตารางพื้นฐาน
2. `migration-feed-latlng.sql` — เปิดฟีด + คอลัมน์ lat/lng
3. `auth-migration.sql` — ย้าย auth ไป Supabase Auth
4. `security-fixes.sql` — แก้ปัญหาความปลอดภัยเบื้องต้น
5. `follows.sql` — ระบบติดตาม
6. `ai-configs.sql` — แอดมินคุม AI
7. `storage-posts-media.sql` — bucket อัปโหลดมีเดียฟีด
8. `storage-uploads.sql` — bucket อัปโหลดทั่วไป
9. `reports.sql` — ระบบรายงานเนื้อหา
10. `profile-visibility.sql` — โหมดโปรไฟล์สาธารณะ/ปิด
11. `feed-media-policy.sql` — RLS โพสต์/คอมเมนต์
12. `vote-rpc.sql` — RPC โหวตคำถาม
13. `admin-online.sql` — สถานะออนไลน์ + last_seen + RPC
14. `seed-admins.sql` — ใส่แอดมินจำลอง (zbcd1053@gmail.com)
15. `security-lockdown.sql` — **ล็อก RLS ตามเจ้าของ/แอดมิน (P0-1)** ← ไฟล์นี้เพิ่มมา

ทุกไฟล์ idempotent (รันซ้ำได้ไม่ error) ยกเว้น `security-lockdown.sql` ที่ใช้
`drop policy if exists` ก่อนสร้างใหม่

## 2. บังคับยืนยันอีเมล (P0-4)
Supabase Dashboard → Authentication → Providers → Email:
- เปิด **Confirm email** (ผู้ใช้ใหม่ต้องกดลิงก์ยืนยันในอีเมลก่อนเข้าใช้)
- เปิด **Secure email change** (กันเปลี่ยนอีเมลโดยไม่ยืนยัน)

⚠️ ถ้ามีบัญชีเดิมที่ยังไม่ยืนยัน (รวมแอดมินจำลอง) ให้ยืนยันผ่าน SQL:
```sql
update auth.users set email_confirmed_at = now()
where email = 'zbcd1053@gmail.com';
```

## 3. เปิด Rate Limit (P0-4)
Supabase Dashboard → Authentication → Rate Limits:
- เปิดและตั้งค่าการจำกัดรอบการล็อกอิน / รีเซ็ตรหัสผ่าน (ป้องกันบรัทฟอร์ซ/สแปม)
(แอปฝั่งหน้าได้จำกัดการเรียก AI ฝั่งผู้ใช้แล้วใน `AiMascot.tsx` อยู่แล้ว)

## 4. ตรวจสอบก่อนขึ้น production
- [ ] ล็อกอิน/สมัครสมาชิกทำงาน + ต้องยืนยันอีเมล
- [ ] โพสต์/คอมเมนต์/ไลก์ ทำงาน และคนอื่นเห็นได้ (public read เปิดอยู่)
- [ ] ผู้ใช้ A ไม่สามารถแก้/ลบโพสต์หรือโปรไฟล์ของผู้ใช้ B ได้ (ทดสอบด้วย 2 บัญชี)
- [ ] แอดมินเข้า `/admin` จัดการผู้ใช้/ป็อปอัปได้
- [ ] ไม่มี API key ไหนหลุดฝั่ง client (grep `VITE_AI_API_KEY` ทั้งโปรเจกต์ต้องไม่พบ)

## หมายเหตุ
- ถ้า `security-lockdown.sql` ทำให้ฟีด/แผนที่อ่านไม่ได้ → ตรวจว่า policy `select` ของ
  `posts`/`profiles` ยังคง `using (true)` อยู่ (อ่านสาธารณะตั้งใจไว้)
- เปลี่ยน RLS ใดๆ ให้ทดสอบในโปรเจกต์ staging ก่อนเสมอ
