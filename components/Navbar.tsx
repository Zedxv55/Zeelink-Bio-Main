import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home, User, Map, Vote, Newspaper, LogOut, Sun, Moon, Search,
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { fonts, fontSize, spacing, palette, radius } from '../lib/designTokens';

// ===== รายการนำทางหลัก (ใช้ร่วม sidebar + bottom bar) =====
interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  public?: boolean; // เข้าได้แม้ไม่ล็อกอิน
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'หน้าแรก', icon: Home, public: true },
  { to: '/feed', label: 'ฟีด', icon: Newspaper },
  { to: '/explore', label: 'แผนที่', icon: Map },
  { to: '/vote', label: 'โหวต', icon: Vote },
  { to: '/dashboard', label: 'โปรไฟล์', icon: User },
];

const HEADER_H = '56px';
const SIDEBAR_W_MD = '72px';   // แท็บเล็ต: ไอคอน-only
const SIDEBAR_W_LG = '248px';  // เดสก์ท็อป: ไอคอน + ป้ายชื่อ
const BOTTOMBAR_H = '56px';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (to: string): boolean => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  // ปุ่มสุดท้ายของ bottom bar: โปรไฟล์ (ล็อกอินแล้ว) หรือ เข้าสู่ระบบ
  const lastItem = user
    ? { to: '/dashboard', label: 'โปรไฟล์', icon: User }
    : { to: '/login', label: 'เข้าสู่ระบบ', icon: User };

  return (
    <>
      {/* ============ TOP HEADER (ทุกขนาด) ============ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          height: HEADER_H,
          background: 'var(--glass-bg)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link to="/" className="flex items-center" aria-label="Zeelink หน้าแรก">
          <Logo size={32} variant={theme === 'dark' ? 'light' : 'dark'} withWordmark />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-primary)', background: 'var(--glass-border)' }}
            aria-label="สลับธีม"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" aria-label="โปรไฟล์">
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 object-cover"
                  style={{ borderColor: palette.orange }}
                />
              </Link>
              <Button variant="ghost" size="sm" leftIcon={<LogOut size={16} />} onClick={handleLogout} className="hidden sm:inline-flex">
                ออกจากระบบ
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">เข้าสู่ระบบ</Button>
            </Link>
          )}
        </div>
      </header>

      {/* ============ LEFT SIDEBAR (เดสก์ท็อป/แท็บเล็ต) ============ */}
      <aside
        className="hidden md:flex flex-col fixed z-40 flex-col py-4 border-r"
        style={{
          top: HEADER_H,
          bottom: 0,
          left: 0,
          width: SIDEBAR_W_MD,
          // lg ขึ้นไป ขยายเป็นเต็ม + ป้ายชื่อ
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors lg:justify-start justify-center"
                style={{
                  fontFamily: fonts.body,
                  fontSize: fontSize('sm'),
                  fontWeight: active ? 700 : 500,
                  color: active ? palette.orange : 'var(--text-primary)',
                  background: active ? palette.orangeSoft : 'transparent',
                }}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} className="flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ส่วนล่าง sidebar: ออกจากระบบ (เดสก์ท็อป) */}
        {user && (
          <div className="px-2 mt-2 border-t pt-3" style={{ borderColor: 'var(--glass-border)' }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full transition-colors lg:justify-start justify-center hover:bg-white/10"
              style={{ fontFamily: fonts.body, fontSize: fontSize('sm'), color: 'var(--text-secondary)' }}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className="hidden lg:inline">ออกจากระบบ</span>
            </button>
          </div>
        )}
      </aside>

      {/* ============ BOTTOM TAB BAR (มือถือ) ============ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t"
        style={{
          height: BOTTOMBAR_H,
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'blur(12px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV_ITEMS.slice(0, 4).map(item => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center flex-1 gap-0.5"
              style={{ color: active ? palette.orange : 'var(--text-secondary)', fontFamily: fonts.body }}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon size={22} />
              <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500 }}>{item.label}</span>
            </Link>
          );
        })}
        <Link
          to={lastItem.to}
          className="flex flex-col items-center justify-center flex-1 gap-0.5"
          style={{
            color: isActive(lastItem.to) ? palette.orange : 'var(--text-secondary)',
            fontFamily: fonts.body,
          }}
          aria-label={lastItem.label}
        >
          <User size={22} />
          <span style={{ fontSize: '10px', fontWeight: isActive(lastItem.to) ? 700 : 500 }}>{lastItem.label}</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
