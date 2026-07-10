import React, { useEffect, useRef, useState } from 'react';

/**
 * PixelMascot — ตัวการ์ตูนพิกเซลประจำแบรนด์ Zeelink
 * ขับตามเมาส์ (parallax/lerp เพื่อความนุ่มนวล) และมี "หน้าที่" ตาม Blueprint N2:
 *   - สะท้อนทิศทางเมาส์ (หันหน้าไปทางที่เมาส์ไป)
 *   - ตอบสนองเมื่อคลิก (กระโดดเฉลิมฉลอง + เปลี่ยนท่าทาง)
 *   - ทักทายเบา ๆ (กระพริบตา)
 * ใช้ transform + requestAnimationFrame เพื่อสมรรถนะดี
 * เคารพ prefers-reduced-motion (หยุด animation ถ้าระบบตั้งค่าไว้)
 */
const MASCOT_MESSAGES = [
  'สวัสดีครับ! 👋',
  'คลิกฉันสิ! 🎮',
  'มาเล่นกัน! ✨',
  'ตามฉันมา~ 🐾',
  'สร้างพอร์ตเถอะ! 🚀',
];

export const PixelMascot: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<'idle' | 'happy'>('idle');
  const [showBubble, setShowBubble] = useState(false);
  const [msg, setMsg] = useState(MASCOT_MESSAGES[0]);

  // เป้าหมาย (ตำแหน่งเมาส์) และตำแหน่งจริงปัจจุบัน (lerp)
  const target = useRef({ x: window.innerWidth * 0.85, y: window.innerHeight * 0.7 });
  const pos = useRef({ x: target.current.x, y: target.current.y });
  const rafRef = useRef<number>(0);
  const lastMoveRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = Date.now();
      if (!showBubble) {
        setShowBubble(true);
        setMsg(MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]);
      }
    };

    const tick = () => {
      const el = ref.current;
      if (el) {
        // ตามหลังเมาส์ (offset เล็กน้อยให้ไม่บังคลิก)
        const tx = target.current.x + 26;
        const ty = target.current.y + 26;
        pos.current.x += (tx - pos.current.x) * 0.12;
        pos.current.y += (ty - pos.current.y) * 0.12;

        // หันหน้าไปทิศที่เมาส์วิ่ง (ซ้าย/ขวา)
        const dir = target.current.x > pos.current.x ? 1 : -1;
        const bob = Math.sin(Date.now() / 400) * 3; // ลอยขึ้นลงเบา ๆ
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y + bob}px) scaleX(${dir})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    if (!reduce) rafRef.current = requestAnimationFrame(tick);
    else if (ref.current) {
      ref.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
    }

    // ซ่อน speech bubble หลังไม่ขยับเมาส์สักพัก
    const hideTimer = setInterval(() => {
      if (Date.now() - lastMoveRef.current > 4000) setShowBubble(false);
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      clearInterval(hideTimer);
    };
  }, [showBubble]);

  const handleClick = () => {
    setMood('happy');
    setShowBubble(true);
    setMsg('เย้! 🎉');
    setTimeout(() => setMood('idle'), 900);
    setTimeout(() => setShowBubble(false), 1500);
  };

  return (
    <>
      {/* Speech bubble */}
      {showBubble && (
        <div
          className="fixed z-[150] pointer-events-none select-none"
          style={{
            left: pos.current.x + 40,
            top: pos.current.y - 10,
            transform: 'translateY(-100%)',
          }}
        >
          <div
            className="px-3 py-2 rounded-2xl text-[12px] font-bold shadow-lg whitespace-nowrap animate-fade-in"
            style={{
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              border: '2px solid var(--orange)',
              fontFamily: "'IBM Plex Sans Thai', sans-serif",
            }}
          >
            {msg}
          </div>
        </div>
      )}

      <div
        ref={ref}
        onClick={handleClick}
        title="สวัสดี! ฉันคือน้องซี Mascot ของ Zeelink"
        className="fixed z-[140] cursor-pointer select-none will-change-transform"
        style={{ top: 0, left: 0, imageRendering: 'pixelated' }}
      >
        <div
          className={`relative ${mood === 'happy' ? 'animate-bounce' : ''}`}
          style={{
            width: 56,
            height: 56,
            background:
              'linear-gradient(135deg, #FF9A4D 0%, #FF7A2F 55%, #E8651E 100%)',
            borderRadius: 14,
            border: '3px solid #1F1B16',
            boxShadow: '3px 3px 0 rgba(31,27,22,0.25)',
          }}
        >
          {/* ตา (กลมโต พิกเซล) */}
          <div
            className="absolute bg-white"
            style={{ width: 14, height: 14, borderRadius: 4, left: 9, top: 16, border: '2px solid #1F1B16' }}
          >
            <div className="absolute" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1F1B16', left: 4, top: 3 }} />
          </div>
          <div
            className="absolute bg-white"
            style={{ width: 14, height: 14, borderRadius: 4, right: 9, top: 16, border: '2px solid #1F1B16' }}
          >
            <div className="absolute" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1F1B16', left: 4, top: 3 }} />
          </div>
          {/* หนวด/ยิ้ม (พิกเซล) */}
          <div
            className="absolute"
            style={{
              width: 22,
              height: 8,
              left: 17,
              top: 38,
              borderBottom: '3px solid #1F1B16',
              borderRadius: '0 0 14px 14px',
            }}
          />
          {/* แก้ม (เวลาสุข) */}
          {mood === 'happy' && (
            <>
              <div className="absolute" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,120,80,0.6)', left: 4, top: 34 }} />
              <div className="absolute" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,120,80,0.6)', right: 4, top: 34 }} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PixelMascot;
