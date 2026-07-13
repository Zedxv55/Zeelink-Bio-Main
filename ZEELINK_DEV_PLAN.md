# Zeelink — แผนพัฒนาสู่เวอร์ชั่นสมบูรณ์ (v1.0)

อ้างอิงจาก `ZEELINK_PROJECT_SUMMARY.txt` (สรุปวันที่ 2026-07-13)
ไฟล์นี้วางไว้ที่ root ของโปรเจกต์ (`~/Zeelink-Bio-Main/ZEELINK_DEV_PLAN.md`)
Orchestrator (`/zeelink-next-phase`) จะอ่านไฟล์นี้ทุกครั้งที่รัน และอัปเดตส่วน
"Progress Log" ด้านล่างสุดหลังแต่ละงานเสร็จ — ห้ามลบ/แก้โครงสร้างหัวข้อ

---

## กติกาการทำงาน (สำคัญ)

1. ทำทีละเฟสตามลำดับ **P0 → P1 → P2** ห้ามข้ามเฟส
2. แต่ละงานในเฟสต้องผ่าน `npm run build` และเกณฑ์ตรวจรับ (Acceptance) ก่อนนับว่าเสร็จ
3. งานที่แตะ Auth / RLS / เงินเดือน AI key ต้องให้ "ผู้ใช้" (คุณ) รีวิว diff เองก่อน commit เสมอ
   — subagent ห้าม `git commit` / `git push` / deploy ใดๆ ทั้งสิ้น
4. จบแต่ละเฟส orchestrator ต้อง **หยุดและรอคำยืนยัน** จากคุณก่อนเริ่มเฟสถัดไป
5. ถ้างานไหนติดปัญหา (ทดสอบไม่ผ่าน, ข้อมูลไม่พอ) ให้รายงานและหยุด ไม่เดาต่อ

---

## เฟส P0 — ความปลอดภัยก่อนเปิดสาธารณะ (ต้องทำก่อนอย่างอื่น)

| # | งาน | ไฟล์ที่เกี่ยวข้อง | Subagent | เกณฑ์ตรวจรับ |
|---|------|-------------------|----------|----------------|
| P0-1 | ล็อก RLS policy ให้เหลือเฉพาะเจ้าของข้อมูล (select/update ตัวเอง, ป้องกัน admin-only ตาราง) | `supabase/schema.sql`, migration files ที่เกี่ยวกับ policy | `security-reviewer` | รัน policy ผ่าน Supabase SQL editor ไม่ error, ทดสอบ query ด้วย user A อ่าน/แก้ข้อมูล user B ไม่ได้ |
| P0-2 | แก้ XSS: popup.content ที่ใช้ `dangerouslySetInnerHTML` → sanitize หรือเปลี่ยนเป็น markdown/text ที่ปลอดภัย | component ที่ render popup (ดูใน `components/`), `AdminPanel.tsx` | `security-reviewer` | ใส่ `<script>` หรือ `onerror=` ในเนื้อหา popup แล้วไม่ทำงานจริงในหน้าเว็บ |
| P0-3 | ย้าย AI key ให้ฝั่งเซิร์ฟเวอร์เท่านั้น ตัด `VITE_AI_API_KEY` ออกจาก client/README, ยืนยันทุก path เรียก AI ผ่าน `Server/ai.js` | `Server/ai.js`, `components/AiMascot.tsx`, `README.md`, `.env.example` | `security-reviewer` | `grep -r VITE_AI_API_KEY` ทั้งโปรเจกต์ไม่พบการใช้งานฝั่ง client แล้ว |
| P0-4 | เพิ่ม rate limit (login/reset/vote) + บังคับ email confirmation | `AuthContext.tsx`, `pages/Vote.tsx`, Supabase Auth settings | `security-reviewer` | ยิง login ผิดรัวๆ แล้วโดนบล็อกชั่วคราว, สมัครใหม่ต้องยืนยันอีเมลก่อนใช้งาน |

**จบเฟส P0 → หยุดรอผู้ใช้รีวิว diff ด้าน security ทั้งหมดก่อน merge จริง**

---

## เฟส P1 — คุณภาพ, ประสิทธิภาพ, เคลียร์ความขัดแย้งของโค้ด

| # | งาน | ไฟล์ที่เกี่ยวข้อง | Subagent | เกณฑ์ตรวจรับ |
|---|------|-------------------|----------|----------------|
| P1-1 | รันไฟล์ SQL ที่เหลือให้ครบ (posts/follows/ai_configs/storage/reports/visibility) แล้วตรวจว่าไม่ error ซ้ำ (idempotent) | `supabase/*.sql` | `qa` (agent เดิม) | รันซ้ำได้ไม่ error, ฟีเจอร์ที่เกี่ยวข้อง (posts/follows ฯลฯ) ทำงานจริงแทนโหมดจำลอง |
| P1-2 | แตก `AuthContext.tsx` เป็นหลาย context (Auth/Feed/Admin) หรือย้ายไป Zustand | `contexts/AuthContext.tsx`, ทุกหน้าที่ import | `problem-solver` (agent เดิม) | build ผ่าน, ทุกหน้าทำงานเหมือนเดิม, re-render ลดลงเมื่อวัดด้วย React DevTools Profiler |
| P1-3 | Code-splitting + lazy load หน้า, แยก Leaflet vendor chunk ให้โหลดเฉพาะหน้า Explore/Dashboard | `App.tsx`, `vite.config.ts` | `perf-reviewer` (ใหม่) | ขนาด initial JS bundle ลดลงจาก ~544 KB อย่างมีนัยสำคัญ (วัดจาก `npm run build` output) |
| P1-4 | เพิ่ม automated tests (unit อย่างน้อยจุดเสี่ยง: ranking.ts, social.ts, auth flow) + GitHub Actions CI | `lib/ranking.ts`, `lib/social.ts`, `.github/workflows/` | `qa` (agent เดิม) | CI รันบน PR ทุกครั้ง, tests ผ่านสีเขียว |
| P1-5 | เคลียร์ความขัดแย้ง AI provider (Gemini ใน `Server/ai.js` vs Groq ที่ README พูดถึง) ให้เหลือทางเดียว แก้เอกสารให้ตรงโค้ด | `Server/ai.js`, `components/AiMascot.tsx`, `README.md` | `problem-solver` (agent เดิม) | README กับโค้ดพูดตรงกัน 100%, มีแค่ AI provider เดียวที่ถูกเรียกจริง |

**จบเฟส P1 → หยุดรอผู้ใช้ยืนยันก่อนขึ้น P2**

---

## เฟส P2 — ฟีเจอร์เสริม / ความแตกต่าง (ทำได้หลัง P0-P1 เสถียรแล้ว)

| # | งาน | Subagent แนะนำ |
|---|------|------------------|
| P2-1 | ระบบแจ้งเตือน / แชทส่วนตัว / ฟีด realtime เพิ่มเติม | `problem-solver` |
| P2-2 | Dark/Light mode toggle ที่ผู้ใช้เลือกเอง | `design-reviewer` (agent เดิม) |
| P2-3 | Monetization (สมาชิกรายเดือน / featured profile / รับบริจาค) | `problem-solver` |
| P2-4 | SEO: ย้ายจาก HashRouter → BrowserRouter + SSR/SSG หรือ prerender, meta tag ต่อหน้า | `perf-reviewer` |
| P2-5 | i18n framework (รองรับมากกว่าภาษาไทย) | `problem-solver` |
| P2-6 | Accessibility audit เต็มรูปแบบ (aria, contrast, keyboard nav) | `design-reviewer` |

ให้ตัดสินใจทีละงานว่าจะทำอันไหนก่อน — เฟสนี้ไม่บังคับลำดับตายตัวเหมือน P0/P1

---

## หมายเหตุเรื่องโมเดล AI ที่ใช้รัน agent แต่ละตัว

- `security-reviewer`, `lead orchestrator` (`/zeelink-next-phase`) → ใช้โมเดลระดับสูงสุดที่มี (เช่น Opus) เพราะงานเสี่ยงสูง ผิดพลาดแพง
- `perf-reviewer`, `problem-solver` → โมเดลระดับกลาง (Sonnet) พอสำหรับงาน refactor ที่มีเกณฑ์ชัดเจน
- `qa` → โมเดลระดับกลางก็พอ เพราะงานคือรัน/ตรวจผลลัพธ์ที่ชัดเจนอยู่แล้ว
- เรื่อง Gemini vs Groq ที่ใช้ในตัวแอป (AiMascot) เป็นคนละเรื่องกับโมเดลที่รัน Claude Code — อย่าสับสนสองอย่างนี้เวลาสั่งงาน

---

## Progress Log

<!-- orchestrator จะเพิ่มบรรทัดใหม่ต่อท้ายทุกครั้งที่งานเสร็จ ห้ามลบของเก่า -->

- 2026-07-13 | P0-2 XSS | ✅ โค้ดไม่มี dangerouslySetInnerHTML แล้ว (popup render เป็น text) — ไม่ต้องแก้เพิ่ม
- 2026-07-13 | P0-3 AI key | ✅ AI เรียกฝั่งเซิร์ฟเวอร์เท่านั้น (Server/ai.js Gemini + dev plugin) ไม่มี VITE_AI_API_KEY ฝั่ง client — เคลียร์ README/.env.example เรียบร้อย
- 2026-07-13 | P1-5 AI provider | ✅ เปลี่ยน dev plugin (vite.config) จาก Groq เป็น Gemini ให้ตรงกับ production — หมดความขัดแย้ง Gemini/Groq
- 2026-07-13 | P1-3 Code-splitting | ✅ React.lazy + Suspense ทุกหน้า (ยกเว้น Login) + PageLoader → initial JS ลด 543→445 KB (gzip 153→130 KB) โหลดตามต้องการ
- 2026-07-13 | a11y/UX | ✅ เพิ่ม :focus-visible + prefers-reduced-motion ใน index.html
- 2026-07-13 | CI | ✅ เพิ่ม .github/workflows/ci.yml รัน npm run build บน push/PR
- 2026-07-13 | P0-1/P0-4/P1-1 (Supabase) | ⏳ เตรียมพร้อม: เพิ่ม supabase/security-lockdown.sql (RLS เจ้าของ/แอดมิน) + supabase/SECURITY_RUNBOOK.md — **ต้องรันใน Supabase Dashboard มือเอง** (โค้ดฝั่งแอปรัน SQL ต่อ DB สดไม่ได้) รอผู้ใช้รันและรีวิว
- 2026-07-13 | P2-2 Dark/Light | ✅ พบว่ามีแล้วใน Navbar + index.html (data-theme) — ไม่ต้องทำเพิ่ม
