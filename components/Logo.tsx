import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  /** variant: 'dark' = พื้นดำอุ่น (ใช้บนพื้นสว่าง), 'light' = พื้นขาว (ใช้บนพื้นมืด) */
  variant?: 'dark' | 'light';
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * Zeelink Logo — ตัว Z สีส้ม (#FF7A2F) บนพื้นโค้งมน
 * ใช้ซ้ำเป็นแบรนด์หลักทั้งเว็บ (Navbar, header, loading, footer)
 * สีส้มคงที่ (brand color) ไม่ผูกกับ theme เพื่อคงความจดจำ
 */
export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  variant = 'dark',
  withWordmark = false,
  wordmarkClassName = '',
}) => {
  const bg = variant === 'dark' ? '#1F1B16' : '#FFFFFF';
  const wordColor = variant === 'dark' ? '#1F1B16' : '#F3EDE4';

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Zeelink"
    >
      <rect width="32" height="32" rx="7" fill={bg} />
      <text
        x="16"
        y="23"
        fontFamily="Arial, sans-serif"
        fontWeight={800}
        fontSize="20"
        fill="#FF7A2F"
        textAnchor="middle"
      >
        Z
      </text>
    </svg>
  );

  if (!withWordmark) return mark;

  return (
    <span className="flex items-center space-x-2">
      {mark}
      <span
        className={`font-bold tracking-wide ${wordmarkClassName}`}
        style={{ color: wordColor, fontSize: size * 0.5 }}
      >
        ZEELINK
      </span>
    </span>
  );
};

export default Logo;
