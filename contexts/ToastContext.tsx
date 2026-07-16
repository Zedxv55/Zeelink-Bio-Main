import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastViewport, ToastItemData } from '../components/ui/Toast';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastApi {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

interface ToastContextType {
  toast: ToastApi;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

// ลำดับ ID ระดับ module (กันชนซ้ำเมื่อกดแจ้งเตือนหลายครั้งเร็วๆ)
let toastSeq = 0;

/**
 * ToastProvider — ระบบแจ้งเตือนแบบ slide-in (แทน alert() เดิม)
 * - variants: success(เขียว) / error(แดง) / info(น้ำเงิน) / warning(เหลือง)
 * - auto-dismiss: error นานกว่าปกติเล็กน้อย
 * - วางใต้ ToastProvider ทุกส่วนของแอป (รวม AuthProvider) จึงเรียก useToast ได้ทุกที่
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItemData[]>([]);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string, title?: string) => {
    const id = `toast-${++toastSeq}`;
    setItems(prev => [...prev, { id, variant, message, title }]);
    // error ค้างนานขึ้นให้อ่านทัน; อื่นๆ หมดเร็วขึ้น
    const ttl = variant === 'error' ? 5200 : 3600;
    window.setTimeout(() => remove(id), ttl);
  }, [remove]);

  const toast: ToastApi = {
    success: (m, t) => push('success', m, t),
    error: (m, t) => push('error', m, t),
    info: (m, t) => push('info', m, t),
    warning: (m, t) => push('warning', m, t),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport items={items} onClose={remove} />
    </ToastContext.Provider>
  );
};
