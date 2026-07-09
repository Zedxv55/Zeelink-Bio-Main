/**
 * Zeelink Design Tokens — ระบบค่ามาตรฐานระดับมืออาชีพ
 * อิงตาม AI Skill Design Blueprint: ความสม่ำเสมอ (M3) + Hierarchy + Accessibility (N5)
 *
 * หลักการ:
 * - Spacing: ทวีคูณของ 4px เสมอ (4/8/12/16/24/32/48/64)
 * - Typography: ไม่เกิน 2 ฟอนต์ตระกูล (display=heading, body=เนื้อหา) + mono สำหรับเลข/code
 * - Color: 1 primary + 1-2 secondary + neutral scale + status colors
 * - ทุกค่า referencing จากนี้เท่านั้น ห้ามสุ่ม inline
 */

// ===== Spacing System (4px baseline) =====
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

export type SpacingKey = keyof typeof spacing;

// Helper: แปลงเป็น px string
export const sp = (key: SpacingKey): string => `${spacing[key]}px`;

// ===== Typography Scale (12/14/16/20/24/32/48) =====
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type FontSizeKey = keyof typeof fontSizes;

export const fontSize = (key: FontSizeKey): string => `${fontSizes[key]}px`;

// Line-height ตาม blueprint: body 1.5–1.6, heading 1.1–1.2
export const lineHeight = {
  tight: 1.15,   // heading
  normal: 1.5,    // body
  relaxed: 1.6,   // long-form
} as const;

// ===== Font Families =====
export const fonts = {
  display: "'IBM Plex Sans Thai', sans-serif",  // หัวข้อ
  body: "'IBM Plex Sans Thai', sans-serif",     // เนื้อหา
  mono: "'IBM Plex Mono', ui-monospace, monospace", // เลข/code/eyebrow
  pixel: "'Press Start 2P', monospace",        // Logo/Accent เท่านั้น (retro feel)
} as const;

// ===== Font Weights =====
export const weights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// ===== Color Palette (Brand-consistent) =====
// Primary: สีส้ม Zeelink (brand identity คงที่ ไม่ผูก theme)
// Secondary: น้ำเงิน (links/info), เหลือง (highlight)
// Neutral: ใช้จาก index.html CSS vars (--text-*, --bg-*, --glass-*)
// Status: success/warning/error
export const palette = {
  // Brand
  orange: '#FF7A2F',
  orangeDeep: '#E8651E',
  orangeSoft: 'rgba(255, 122, 47, 0.15)',

  // Secondary accents
  blue: '#3D7DD6',
  yellow: '#E8B23D',
  pink: '#E36B9B',
  green: '#4F9D69',

  // Status
  success: '#4F9D69',
  successSoft: 'rgba(79, 157, 105, 0.15)',
  warning: '#E8B23D',
  warningSoft: 'rgba(232, 178, 61, 0.15)',
  error: '#D9534F',
  errorSoft: 'rgba(217, 83, 79, 0.15)',

  // Neutrals (dark theme defaults — light theme override ผ่าน CSS vars)
  white: '#FFFFFF',
  black: '#1F1B16',
} as const;

// ===== Border Radius (ระบบเดียว) =====
export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
} as const;

// ===== Shadow / Elevation =====
export const shadow = {
  sm: '0 1px 4px rgba(31, 27, 22, 0.08)',
  md: '0 2px 14px rgba(31, 27, 22, 0.12)',
  lg: '0 8px 32px rgba(31, 27, 22, 0.18)',
  glow: '0 0 0 3px rgba(61, 125, 214, 0.25)',  // focus/hover ring
} as const;

// ===== Animation Timing =====
export const motion = {
  fast: '0.15s ease',
  base: '0.25s ease',
  slow: '0.4s ease',
} as const;

// ===== Max Content Width (grid system) =====
export const layout = {
  maxWidth: '1100px',
  maxWidthWide: '1280px',
} as const;
