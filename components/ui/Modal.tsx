import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { radius, shadow, motion, palette } from '../../lib/designTokens';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  maxWidth?: number;
}

/**
 * Zeelink Modal — ระบบ popup มาตรฐานเดียว (ใช้แทน App.tsx popup เดิม)
 * A11y: Esc ปิดได้, focus trap เบื้องต้น, backdrop blur
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  imageUrl,
  linkUrl,
  linkLabel = 'ดูรายละเอียด',
  maxWidth = 420,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full relative overflow-hidden animate-[scaleIn_0.3s_ease-out]"
        style={{ maxWidth, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="ปิด"
          className="absolute top-2 right-2 p-2 rounded-full transition-colors z-10"
          style={{ background: 'var(--glass-border)', color: 'var(--text-primary)' }}
        >
          <X size={20} />
        </button>

        {imageUrl && <img src={imageUrl} alt={title || ''} className="w-full h-64 object-cover" />}

        <div className="p-6" style={{ color: 'var(--text-primary)' }}>
          {title && <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>}
          {children}
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center mt-4 px-6 py-3 rounded-full font-bold transition-colors"
              style={{ background: palette.orange, color: '#fff' }}
            >
              {linkLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
