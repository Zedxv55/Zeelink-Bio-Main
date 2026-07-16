import React from 'react';

/**
 * Skeleton — placeholder ตอนโหลดข้อมูล (plan #1)
 * ใช้ shimmer animation จาก index.html (.zee-skel)
 */
export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width, height, radius: r = '8px', className = '', style }) => (
  <span className={`zee-skel ${className}`} style={{ width, height, borderRadius: r, ...style }} aria-hidden="true" />
);

// โครงการการ์ดโพสต์ (Feed) — เหมือนรูปแบบโพสต์จริง
export const SkeletonPost: React.FC = () => (
  <div className="glass-card p-4 border-[var(--glass-border)] animate-fade-in">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton width={40} height={40} radius="50%" />
      <div className="flex-1 space-y-2">
        <Skeleton width="40%" height={12} />
        <Skeleton width="22%" height={10} />
      </div>
    </div>
    <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
    <Skeleton width="92%" height={14} style={{ marginBottom: 8 }} />
    <Skeleton width="70%" height={180} radius="14px" />
  </div>
);

// แถวรายชื่อ (Explore sidebar) — skeleton หนึ่งแถว
export const SkeletonRow: React.FC = () => (
  <div className="p-3 rounded-xl border border-[var(--glass-border)] flex items-center space-x-3" style={{ background: 'var(--glass-border)' }}>
    <Skeleton width={40} height={40} radius="50%" />
    <div className="flex-1 space-y-2">
      <Skeleton width="50%" height={12} />
      <Skeleton width="30%" height={10} />
    </div>
    <Skeleton width={44} height={24} radius="10px" />
  </div>
);

// การ์ดคำถาม (Vote) — skeleton หนึ่งใบ
export const SkeletonQuestion: React.FC = () => (
  <div className="glass-card p-5 flex justify-between items-center border-[var(--glass-border)]">
    <div className="flex-1 pr-4 space-y-2">
      <Skeleton width="80%" height={14} />
      <Skeleton width="40%" height={10} />
    </div>
    <Skeleton width={50} height={36} radius="12px" />
  </div>
);
