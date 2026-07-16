import React from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { palette } from '../../lib/designTokens';

export interface ToastItemData {
  id: string;
  variant: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

type IconType = React.ComponentType<{ size?: number; className?: string }>;

const ICON: Record<ToastItemData['variant'], IconType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const ACCENT: Record<ToastItemData['variant'], string> = {
  success: palette.success,
  error: palette.error,
  info: palette.blue,
  warning: palette.warning,
};

/**
 * ToastViewport — กองแจ้งเตือนมุมขวาล่าง (slide-in)
 * container เป็น pointer-events-none ทีละตัวเป็น auto เพื่อไม่บังการคลิกด้านหลัง
 */
export const ToastViewport: React.FC<{ items: ToastItemData[]; onClose: (id: string) => void }> = ({ items, onClose }) => {
  if (items.length === 0) return null;
  return (
    <div
      className="fixed z-[9998] right-4 bottom-24 md:bottom-5 flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      role="region"
      aria-label="การแจ้งเตือน"
      aria-live="polite"
    >
      {items.map(t => {
        const Icon = ICON[t.variant];
        const accent = ACCENT[t.variant];
        return (
          <div key={t.id} className="zee-toast pointer-events-auto" style={{ borderLeftColor: accent }} role="status">
            <span className="zee-toast-icon" style={{ color: accent }} aria-hidden="true"><Icon size={20} /></span>
            <div className="flex-1 min-w-0">
              {t.title && <p className="zee-toast-title">{t.title}</p>}
              <p className="zee-toast-msg">{t.message}</p>
            </div>
            <button type="button" onClick={() => onClose(t.id)} aria-label="ปิดการแจ้งเตือน" className="zee-toast-close">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
