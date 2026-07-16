import React, { useEffect, useRef, useState } from 'react';

/**
 * CountUp — ตัวเลขนับขึ้นแบบนุ่มนวล (plan #4: visit counter)
 * เคารพ prefers-reduced-motion (ข้าม animation _show ค่าสุดท้ายทันที)
 */
export const CountUp: React.FC<{ value: number; durationMs?: number; className?: string }> = ({
  value,
  durationMs = 900,
  className,
}) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === 0) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{display.toLocaleString('th-TH')}</span>;
};
