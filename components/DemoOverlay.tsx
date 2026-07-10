import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, Lock } from 'lucide-react';

interface DemoOverlayProps {
  title?: string;
  subtitle?: string;
}

// ===== Demo/Preview mode overlay for unauthenticated users =====
// Shows a blurred "preview" of the feature with a login CTA.
// No private data is shown — only the concept/UI is revealed.
export const DemoOverlay: React.FC<DemoOverlayProps> = ({
  title = 'ล็อกอินเพื่อเริ่มต้นสร้างพอร์ต',
  subtitle = 'และเปิดใช้งานฟีเจอร์จริงของคุณ'
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* Overlay card */}
      <div className="relative z-10 mx-4 w-full max-w-md glass-card border-[var(--orange)] p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--orange)]/20 flex items-center justify-center">
          <Lock size={28} className="text-[var(--orange)]" />
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-sm mb-6 opacity-70" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-deep)] text-white font-bold text-sm transition-colors flex items-center justify-center shadow-lg"
        >
          <LogIn size={18} className="mr-2" />
          เข้าสู่ระบบ / สมัครสมาชิก
        </button>

        <div className="flex items-center justify-center mt-4 text-[11px] opacity-50">
          <Sparkles size={12} className="mr-1 text-[var(--yellow)]" />
          นี้คือโหมดตัวอย่าง — ข้อมูลทั้งหมดเป็น Mock Data
        </div>
      </div>
    </div>
  );
};
