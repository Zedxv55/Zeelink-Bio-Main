import React from 'react';
import { radius, shadow, motion } from '../../lib/designTokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** accent border color: 'orange' | 'pink' | 'blue' | 'green' | 'yellow' | none */
  accent?: 'orange' | 'pink' | 'blue' | 'green' | 'yellow' | 'none';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: React.CSSProperties;
}

const accentMap: Record<string, string> = {
  orange: 'var(--orange)',
  pink: 'var(--pink)',
  blue: 'var(--blue)',
  green: 'var(--green)',
  yellow: 'var(--yellow)',
};

const padMap = { sm: '16px', md: '24px', lg: '32px' };

/**
 * Zeelink Card — glass-card มาตรฐาน
 * Consistency: ใช้ --glass-* เท่านั้น, accent border ได้ 1 สี
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  accent = 'none',
  padding = 'md',
  hover = false,
  style,
}) => {
  const base: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: `1px solid ${accent !== 'none' ? accentMap[accent] : 'var(--glass-border)'}`,
    borderRadius: radius.lg,
    boxShadow: shadow.md,
    padding: padMap[padding],
    transition: `box-shadow ${motion.base}, transform ${motion.base}, border-color ${motion.base}`,
  };

  return (
    <div
      className={`zee-card ${hover ? 'zee-card-hover' : ''} ${className}`}
      style={{ ...base, ...style }}
      onMouseEnter={(e) => { if (hover) { e.currentTarget.style.boxShadow = shadow.lg; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={(e) => { if (hover) { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      {children}
    </div>
  );
};

export default Card;
