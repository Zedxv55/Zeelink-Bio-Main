# CLAUDE.md — Zeelink (AI Loop)

คู่มือสำหรับ **Claude Code** เมื่อทำงานใน repo นี้ และนิยาม **AI Loop** — ระบบปรับปรุงโปรเจกต์อัตโนมัติที่พกพาได้ (โคลนแล้วใช้ได้ทันทีบนเครื่องใดก็ได้)

---

## 1. โปรเจกต์คืออะไร

**Zeelink** — แพลตฟอร์มพอร์ตโฟลิโอเชิงสังคมสำหรับคนไทย (คล้าย Linktree + ฟีด + แผนที่คนใกล้เคียง + ระบบโหวต + แอดมิน)
มี 2 ฝั่งที่ AI Loop ต้องดูแลทั้งคู่:

| ฝั่ง | ตำแหน่ง | หมายเหตุ |
|------|---------|----------|
| หน้าบ้าน (Web) | `pages/*`, `components/*`, `contexts/*`, `lib/*`, `App.tsx`, `index.html` | React 19 + Vite + TypeScript |
| เซิฟเวอร์ (Server) | `Server/*` | Node/Edge functions (รวม `Server/ai.js` สำหรับ AI) |
| ฐานข้อมูล (DB) | `supabase/schema.sql`, `supabase/*.sql` | Supabase (Postgres + RLS) |

หน้าต่าง ๆ: Landing `/`, Login `/login`, Dashboard `/dashboard`, Feed `/feed`, Explore `/explore`, Vote `/vote`, Profile `/:username`, Admin `/admin`

---

## 2. รันบนเครื่องตัวเอง

```bash
npm install            # ติดตั้งครั้งแรก
npm run dev            # http://localhost:3000

npm run build          # กฎบังคับ: tsc --noEmit && vite build  (ใช้ตรวจก่อน commit เสมอ)
```

- **โหมด Demo** — ไม่มี `.env` แอปทำงานได้เลย (มีข้อมูลจำลอง) ไม่พังหน้าจอ
- **ต่อฐานข้อมูลจริง** — คัดลอก `.env.example` → `.env` ใส่ Supabase URL + anon key แล้วรันไฟล์ `.sql` ใน `supabase/`
- แอดมินจำลองล็อกอินด้วย `zbcd1053@gmail.com` (ตั้งรหัสในหน้า Login ครั้งแรก)

---

## 3. AI Loop คืออะไร + วิธีรัน

AI Loop = วงลูปอัตโนมัติ: **หาปัญหา → แก้ → ตรวจ build → ดันขึ้น GitHub `origin/main`**
มี 2 สกิลหลักที่ฝังมาใน repo นี้ (ดู `.claude/agents/`):

- **`problem-solver`** — สกิลการแก้ปัญหา: วินิจฉัยและแก้บัคในเว็บ/เซิฟเวอร์/DB อย่างปลอดภัย minimal
- **`design-reviewer`** — ดีไซน์เนอร์: หาจุดบกพร่อง/จุดพัฒนา (UX/accessibility/ความปลอดภัย/perf/ดีไซน์) รายงานเป็น P0/P1/P2 **โดยไม่แก้โค้ด**

### รันลูป (บนเครื่องใดก็ได้ หลัง clone)
พิมพ์ใน Claude Code:
```
/zeelink-loop
```
คำสั่งนี้จะเรียก `/loop` ให้เดินอัตโนมัติ (แต่ละรอบรีวิวหน้า → แก้ → build → commit → push) จนกว่าจะหยุดตามกฎข้อ 4

---

## 4. กฎความปลอดภัย (บังคับ — ต้องทำตามเสมอ)

1. **ทุกครั้งที่แก้โค้ด ต้องรัน `npm run build`** ห้าม commit/push ถ้า build ไม่ผ่าน → `git checkout -- .` ย้อนแล้วข้าม
2. **ห้ามแตะ:** schema ฐานข้อมูล (`.sql`), logic ล็อกอิน/auth (`contexts/AuthContext.tsx` ส่วน auth), หรือลบฟีเจอร์เดิม — เจอบัคประเภทนี้ให้ **รายงานแทน อย่าทำเอง**
3. **ทำทีละ 1 การเปลี่ยนแปลงเล็กๆ focused ต่อรอบ** ห้าม rewrite ใหญ่
4. **หยุดลูปเมื่อ:** ไม่มีการปรับปรุงที่ปลอดภัยให้ทำ หรือ 3 รอบติดทำไม่สำเร็จ/ถูกบล็อก → รายงานสรุป

---

## 5. ลำดับความสำคัญที่หาแต่ละรอบ

- **P0** — บัคที่ทำให้ใช้ไม่ได้ (ปุ่มตาย, state ผิดเพี้ยน, route พัง, crash)
- **P1** — UX/ความปลอดภัย (responsive พังบนมือถือ, accessible ขาด `aria-label`/`alt`/`focus`, XSS จาก `dangerouslySetInnerHTML`)
- **P2** — perf (memoization บน list/map ใหญ่, N+1 query, re-render ฟุ่มเฟือย) + ฟีเจอร์เล็กที่เร็ว

---

## 6. ระบบดีไซน์ (อ้างอิงจาก `lib/designTokens.ts` เท่านั้น — ห้ามสุ่ม inline)

- **Spacing:** ทวีคูณ 4px เสมอ (`spacing` = 4/8/12/16/24/32/48/64) ใช้ผ่าน `sp('md')`
- **Typography:** ฟอนต์ `IBM Plex Sans Thai` (display/body) + `IBM Plex Mono` (เลข/code) — ไม่เกิน 2 ตระกูล
- **Palette:** `palette.orange` (#FF7A2F) เป็น primary; `blue`/`yellow`/`pink`/`green` เป็น secondary; status `success`/`warning`/`error`
- **Radius:** `radius` (sm 6 / md 10 / lg 14 / xl 20 / full)
- **Shadow:** `shadow` (sm/md/lg/glow)
- **Motion:** `motion` (fast 0.15s / base 0.25s / slow 0.4s)
- **คอมโพเนนต์:** ใช้ชุด `components/ui` (`Button`/`Card`/`Input`/`Modal`) ให้ responsive + accessible เสมอ (aria-label, alt text, focus-visible, keyboard nav)
- **สีธีม:** อ่านจาก CSS variables ใน `index.html` (`--text-*`, `--bg-*`, `--glass-*`, `--orange*`) ห้าม hardcode สี hex นอก token

---

## 7. อัลกอริทึมที่อยากได้ (ใช้เมื่อเพิ่ม/ปรับ)

- Explore: เรียงคนใกล้คุณด้วยระยะ **haversine** (ไม่สุ่ม)
- Feed: เรียงด้วย **recency + engagement score** (likes/comments)
- ค้นหา/กรองฝั่ง client เป็น **O(n)** ไม่วนซ้ำซ้อน

---

## 8. หมายเหตุความปลอดภัย (จากเดิม)

`schema.sql` เปิด RLS แบบกว้างชั่วคราว (แอปยังไม่มี Supabase Auth จริง) ก่อนเปิดให้คนใช้จริง ให้เพิ่ม Supabase Auth และล็อก policy ให้เฉพาะเจ้าของ
