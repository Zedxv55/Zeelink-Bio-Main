import React, { ReactNode } from 'react';

interface GlassBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* พื้นโทนอุ่น (Paper) */}
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary), var(--bg-primary))' }} />

      {/* เส้นบรรทัดแนวนอน (notebook ruled paper) — ปรับตามธีม */}
      <div
        className="fixed inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 31px, var(--rule-color) 32px)',
          backgroundPosition: 'center top',
        }}
      />

      {/* เงารอบขอบแบบกระดาษ (subtle vignette) */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 140px -40px rgba(31,27,22,0.18)' }}
      />

      {/* เนื้อหา */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
