---
description: รัน AI Loop ปรับปรุง Zeelink อัตโนมัติ (หาบัค → แก้ → build → ดันขึ้น GitHub origin/main)
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, ScheduleWakeup, TaskStop
---

รัน **AI Loop** ปรับปรุงโปรเจกต์ Zeelink โดยเรียกใช้ `/loop` skill ด้วย prompt ด้านล่าง
(ถ้าผู้ใช้ส่ง argument เพิ่มเติม ให้ต่อท้ายลงใน prompt ด้วย: $ARGUMENTS)

---

ปรับปรุงโปรเจกต์ Zeelink (C:\Users\zeeto\Zeelink-Bio-Main) แบบวนลูปอัตโนมัติ: หาปัญหา → แก้ → ตรวจ build → ดันขึ้น GitHub origin/main

กฎความปลอดภัย (สำคัญที่สุด, ต้องทำตามเสมอ):
- ทุกครั้งที่แก้โค้ด ต้องรัน `npm run build` (คำสั่งรันจริงคือ `tsc --noEmit && vite build` ผ่าน npm run build)
- ห้าม git commit หรือ git push ถ้า build ไม่ผ่าน → ให้ `git checkout -- .` ย้อนการแก้ไขแล้วข้ามไปรอบต่อไป
- ทำทีละ 1 การเปลี่ยนแปลงเล็กๆ focused ต่อรอบ อย่าจับต้อง schema ฐานข้อมูล (.sql), logic ล็อกอิน/auth (contexts/AuthContext.tsx ส่วน auth), หรือลบฟีเจอร์เดิม — ถ้าเจอบัคประเภทนั้น ให้รายงานแทน อย่าทำเอง
- ถ้าไม่มีการปรับปรุงที่ปลอดภัยให้ทำ หรือ 3 รอบติดทำไม่สำเร็จ/ถูกบล็อก → หยุดลูปและรายงานสรุป

แต่ละรอบให้ทำตามนี้:
1. ดู `git log --oneline -10` และ `git status` ก่อน เพื่อไม่ทำซ้ำและไม่ทำงานบนไฟล์ที่มี conflict
2. หาปัญหาที่มีค่าสูงสุดและเสี่ยงต่ำ จากลำดับความสำคัญ:
   - P0: บัคที่ทำให้ใช้ไม่ได้ (ปุ่มตาย, state ผิดเพี้ยน, route พัง)
   - P1: UX/ความปลอดภัย (responsive พังบนมือถือ, accessible ขาด aria-label/alt/focus, XSS จาก dangerouslySetInnerHTML)
   - P2: perf (memoization บน list/map ใหญ่, N+1 query, re-render ฟุ่มเฟือย) + ฟีเจอร์เล็กที่เร็ว
3. แก้ไขอย่าง minimal ที่สุด (ห้าม rewrite ใหญ่)
4. การออกแบบต้องอิงระบบ design (spacing ทวีคูณ 4px, palette, radius, shadow, motion) ใช้ชุดคอมโพเนนต์ components/ui (Button/Card/Input/Modal) ให้ responsive + accessible (aria-label, alt text, focus-visible, keyboard nav)
5. เพิ่มอัลกอริทึมที่เร็วและมีค่า: เรียงฟีดด้วย recency+engagement score, ค้นหา/กรองฝั่ง client เป็น O(n)
6. รัน `npm run build` — ถ้าผ่าน: `git add -A && git commit -m "fix/ux/perf: <สั้นๆ ภาษาไทย>"` แล้ว `git push origin main` — ถ้าไม่ผ่าน: `git checkout -- .` แล้วข้าม
7. รายงานสั้นๆ ทุกครั้ง: แก้อะไร (P0/P1/P2) และผล build
