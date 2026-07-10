# คู่มือแก้ไขความปลอดภัย Zeelink (S1–S9)

ไฟล์นี้อธิบายสิ่งที่ **คุณ** ต้องทำเองบน Supabase / บัญชี AI เพราะรันคำสั่ง SQL และหมุนคีย์ไม่สามารถทำจากโค้ดได้
โค้ดฝั่ง frontend ได้แก้ไขเรียบร้อยแล้ว (ดูรายงานใน PR / commit)

---

## 🚨 ขั้นตอนที่ 1 (ด่วนที่สุด): หมุนคีย์ API ทันที

คีย์ต่อไปนี้ **รั่วแล้ว** (เคยอยู่ใน `.env` ด้วยชื่อ `VITE_AI_API_KEY` ซึ่ง Vite bundle ลง browser ให้ทุกคนดูได้):

1. **Groq API key** — เข้า https://console.groq.com → เลิกใช้งานคีย์เก่า → สร้างคีย์ใหม่
2. **Gemini API key** (ถ้าเคยใส่ลง `.env` จริง) — เข้า https://aistudio.google.com/apikey → รีเซ็ต

จากนั้นแก้ไข `.env` ของคุณ:
- **ลบ** บรรทัด `VITE_AI_API_KEY=...` และ `VITE_AI_API_URL=...` ออกทั้งหมด
- **เพิ่ม** (แบบไม่มี `VITE_` นำหน้า):
  ```
  AI_API_KEY=คีย์-groq-ใหม่
  AI_API_URL=https://api.groq.com/openai/v1/chat/completions
  ```
- `GEMINI_API_KEY=...` คงไว้ได้ (ไม่มี `VITE_` → ไม่ถูก bundle ลง client)

> ทำไมต้องเอาออกจาก `VITE_`: ตัวแปรที่ขึ้นต้นด้วย `VITE_` จะถูก Vite แปะลง JavaScript bundle
> ที่ส่งให้ผู้ใช้ทุกคน อ่านผ่าน DevTools ก็ได้ ดังนั้น secret แท้ๆ ต้องไร้นำหน้า `VITE_` เสมอ

---

## 🗄️ ขั้นตอนที่ 2: รัน SQL lockdown บน Supabase

เข้า Supabase Dashboard → **SQL Editor** → New query → paste แล้ว Run **ตามลำดับนี้** (ทีละไฟล์):

1. `supabase/schema.sql` — สร้างตารางครั้งแรก (ข้ามได้ถ้าสร้างแล้ว)
2. `supabase/auth-migration.sql` — เปิด RLS เบื้องต้น
3. `supabase/migration-feed-latlng.sql` — ตารางฟีด + พิกัด
4. `supabase/admin-online.sql` — สิทธิ์แอดมิน + สถานะออนไลน์
5. **`supabase/security-fixes.sql` — ⭐ ไฟล์ใหม่นี้ล็อกความปลอดภัยทั้งระบบ** (รันครั้งเดียว)

`security-fixes.sql` จะ:
- ลบ policy `anon all` ทุกตาราง → anon ไม่สามารถอ่าน/แก้/ลบข้อมูลได้อีกต่อไป
- ปิด `users public read` → ซ่อน email / `remember_token` (PII) จากสาธารณะ
- ล็อก `posts` / `post_comments` → ผู้ล็อกอินโพสต์/กดไลก์ได้ but ลบได้เฉพาะแอดมิน
- ผูกเจ้าของ `avatars` → ลบ/ทับรูปโปรไฟล์คนอื่นไม่ได้
- จำกัด `backups` → โหลดได้เฉพาะแอดมิน
- เพิ่ม trigger `prevent_priv_escalation` → ผู้ใช้ธรรมดาเปลี่ยน `role`/`is_banned` ตัวเองไม่ได้ (กันยกระดับสิทธิ์)
- แก้ `vote_question` → กันโหวตซ้ำในระดับฐานข้อมูล

### ตั้งแอดมิน (สำคัญ)
Policy ฝั่งแอดมินใช้งานได้ก็ต่อเมื่อมีผู้ใช้ `role='admin'` อย่างน้อย 1 คน
- วิธีแนะนำ: ใน Supabase Dashboard → Table Editor → `users` → เปลี่ยน `role` เป็น `'admin'` ที่แถวของคุณ
- หรือรัน `supabase/seed-admins.sql` (แต่ระวัง: ไฟล์นี้แตะ `auth.users` โดยตรง)

---

## ⚠️ ข้อจำกัดที่ควรรู้ (โครงสร้าง id)

แอปเก็บ owner ของโพสต์/คำถามด้วย `public.users.id` (uuid ของตาราง users ที่แอปสร้างเอง)
ไม่ใช่ `auth.uid()` (id ของ `auth.users`) — สองค่านี้คนละค่า

ผลกระทบ (และการแก้ไขที่ทำไปแล้ว):
- ✅ **จัดการเรียบร้อยแล้ว:** `security-fixes.sql` เปลี่ยน `posts auth update` → **`posts admin update`** (จำกัดแค่แอดมิน)
  และเพิ่ม RPC `toggle_post_like` (SECURITY DEFINER) ให้ `toggleLikePost` ใน `contexts/AuthContext.tsx` เรียกผ่าน RPC
  → ผู้ล็อกอินกดไลก์โพสต์คนอื่นได้ แต่ **ไม่สามารถแก้ข้อความโพสต์คนอื่นได้** (anon ไม่ได้ เพราะต้องล็อกอิน; "ลบ" จำกัดแค่แอดมิน)
- คำถาม (questions) ยังคงใช้ `public.users.id` เป็น owner — แต่แอปไม่อนุญาตแก้คำถามหลังโพสต์ (เฉพาะแอดมินผ่าน admin panel) จึงปลอดภัยในทางปฏิบัติ

---

## ✅ สรุปสถานะ

| รหัส | ปัญหา | สถานะ |
|------|-------|--------|
| S1 | RLS anon-all กว้างเกิน | ✅ แก้ใน `security-fixes.sql` |
| S2 | ยกระดับสิทธิ์เองได้ | ✅ trigger `prevent_priv_escalation` |
| S3 | Groq key รั่วลง client | ✅ ย้ายไป `api/ai.js` + **คุณต้องหมุนคีย์** |
| S4 | posts/post_comments เปิดโล่ง | ✅ ล็อกแล้ว (ดูข้อจำกัดด้านบน) |
| S5 | users public read รั่ว PII | ✅ ปิดแล้ว |
| S6 | avatars ไม่ผูกเจ้าของ | ✅ ผูกเจ้าของแล้ว |
| S7 | backups โหลดได้หมด | ✅ จำกัดแอดมิน |
| S8 | ai.js ไม่มี auth/rate limit | ✅ แพตช์ `Server/ai.js` + `api/ai.js` (ตรวจ input/ความยาว) |
| S9 | vote_question โหวตซ้ำได้ | ✅ แก้ใน RPC |
| S10 | id model สับสน (posts ownership) | ✅ เพิ่ม RPC toggle_post_like + จำกัด update เฉพาะแอดมิน |
| S11 | banned user ยังล็อกอินได้ | ✅ แก้ใน `AuthContext.login()` |
| S12 | seed-admins hardcode | ℹ️ ปล่อยตามเดิม (ควรตั้งแอดมินผ่าน Dashboard) |
