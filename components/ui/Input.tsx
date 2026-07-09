import React, { useState } from 'react';
import { radius, shadow, motion, fonts, fontSize, palette } from '../../lib/designTokens';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  hint?: string;
}

/**
 * Zeelink Input — ครบ state (default/hover/focus/error/disabled)
 * Accessibility: label เชื่อมด้วย htmlFor, error aria-describedby
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  hint,
  id,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const inputId = id || `inp-${Math.random().toString(36).slice(2, 8)}`;
  const [focused, setFocused] = useState(false);

  const base: React.CSSProperties = {
    width: '100%',
    fontFamily: fonts.body,
    fontSize: fontSize('base'),
    color: 'var(--text-primary)',
    background: 'var(--input-bg)',
    border: `1px solid ${error ? palette.error : focused ? palette.orange : 'var(--input-border)'}`,
    borderRadius: radius.md,
    padding: leftIcon ? '10px 12px 10px 40px' : '10px 12px',
    outline: 'none',
    transition: `border-color ${motion.fast}, box-shadow ${motion.fast}`,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  return (
    <div className={`zee-input-wrap ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: fontSize('sm'), fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className="zee-input"
          style={base}
          onFocus={(e) => { setFocused(true); e.currentTarget.style.boxShadow = `0 0 0 3px ${palette.orangeSoft}`; }}
          onBlur={(e) => { setFocused(false); e.currentTarget.style.boxShadow = 'none'; }}
          {...props}
        />
      </div>
      {error ? (
        <span id={`${inputId}-err`} role="alert" style={{ fontSize: fontSize('xs'), color: palette.error, fontWeight: 500 }}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} style={{ fontSize: fontSize('xs'), color: 'var(--text-muted)' }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
