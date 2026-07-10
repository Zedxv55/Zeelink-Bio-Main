import React from 'react';
import { Loader2 } from 'lucide-react';
import { palette, radius, shadow, motion, fonts, fontSize } from '../../lib/designTokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Zeelink Button — ครบ state (default/hover/active/disabled/loading)
 * ใช้ Design Tokens เท่านั้น (ห้าม inline สุม)
 * A11y: focus-visible ring ชัดเจน, aria-busy ตอน loading
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: fonts.display,
    fontWeight: 700,
    borderRadius: radius.md,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: `background ${motion.base}, color ${motion.base}, transform ${motion.fast}, box-shadow ${motion.base}`,
    opacity: isDisabled ? 0.55 : 1,
    width: fullWidth ? '100%' : 'auto',
    userSelect: 'none',
    border: '1px solid transparent',
    outline: 'none',
  };

  const sizes: Record<Size, React.CSSProperties> = {
    sm: { fontSize: fontSize('sm'), padding: '8px 14px' },
    md: { fontSize: fontSize('base'), padding: '11px 20px' },
    lg: { fontSize: fontSize('lg'), padding: '14px 28px' },
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: palette.orange,
      color: '#fff',
      boxShadow: shadow.sm,
    },
    secondary: {
      background: palette.blue,
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--glass-border)',
    },
    outline: {
      background: 'transparent',
      color: palette.orange,
      borderColor: palette.orange,
    },
    danger: {
      background: palette.error,
      color: '#fff',
    },
  };

  const hoverStyles: Record<Variant, React.CSSProperties> = {
    primary: { background: palette.orangeDeep, transform: 'translateY(-1px)', boxShadow: shadow.md },
    secondary: { filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
    ghost: { background: 'var(--glass-border)', borderColor: 'var(--text-primary)' },
    outline: { background: palette.orangeSoft, transform: 'translateY(-1px)' },
    danger: { filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
  };

  return (
    <button
      className={`zee-btn ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      data-variant={variant}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!isDisabled) Object.assign(e.currentTarget.style, hoverStyles[variant]); }}
      onMouseLeave={(e) => { if (!isDisabled) Object.assign(e.currentTarget.style, { transform: 'translateY(0)', filter: 'none', boxShadow: variants[variant].boxShadow ?? 'none' }, variants[variant]); }}
      onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateY(0)'; }}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
