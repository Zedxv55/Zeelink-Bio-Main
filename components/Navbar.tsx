import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home, Map, Vote, User, Search, Sun, Moon, LogOut, LayoutDashboard,
} from 'lucide-react';
import { Logo } from './Logo';
import { fonts, palette } from '../lib/designTokens';

// ===== รายการนำทางหลัก (แถบบนเหมือน Facebook) =====
interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/feed', label: 'ฟีด', icon: Home },
  { to: '/explore', label: 'แผนที่', icon: Map },
  { to: '/vote', label: 'โหวต', icon: Vote },
  { to: '/dashboard', label: 'โปรไฟล์', icon: User },
];

const HEADER_H = '60px';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // ปิดเมนูอวตารเมื่อคลิกข้างนอก
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isActive = (to: string): boolean => location.pathname.startsWith(to);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/feed?q=${encodeURIComponent(q)}` : '/feed');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-3 sm:px-4"
      style={{
        height: HEADER_H,
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 1px 0 var(--orange-soft)',
      }}
    >
      {/* ===== โลโก้ ===== */}
      <Link to={user ? '/feed' : '/login'} className="flex items-center flex-shrink-0" aria-label="Zeelink หน้าแรก">
        <Logo size={30} variant={theme === 'dark' ? 'light' : 'dark'} withWordmark />
      </Link>

      {/* ===== ช่องค้นหา (เดสก์ท็อป) ===== */}
      <form onSubmit={submitSearch} className="hidden md:flex items-center flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาโพสต์ เพื่อน หรือครีเอเตอร์..."
            aria-label="ค้นหา"
            className="w-full pl-9 pr-3 py-2 rounded-full text-sm outline-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: fonts.body }}
          />
        </div>
      </form>

      {/* ===== ไอคอนนำทาง (เหมือนแถบบน Facebook) ===== */}
      <nav className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: active ? palette.orange : 'var(--text-secondary)',
                background: active ? palette.orangeSoft : 'transparent',
              }}
            >
              <Icon size={22} className="flex-shrink-0" />
              <span className="hidden lg:inline text-sm font-semibold" style={{ fontFamily: fonts.body }}>{item.label}</span>
              {active && <span className="hidden lg:block absolute -bottom-[9px] left-2 right-2 h-[2.5px] rounded-full" style={{ background: palette.orange }} />}
            </Link>
          );
        })}

        {/* ค้นหาแบบย่อ (มือถือ) → ไปหน้าฟีดที่มีช่องค้นหา */}
        <button
          onClick={() => navigate('/feed')}
          aria-label="ค้นหา"
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Search size={22} />
        </button>

        {/* สลับธีม */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-primary)', background: 'var(--glass-border)' }}
          aria-label="สลับธีม"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* ===== ผู้ใช้: อวตาร + เมนู ===== */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="เมนูผู้ใช้"
              className="ml-1 rounded-full p-0.5 transition-transform hover:scale-105"
              style={{ border: `2px solid ${menuOpen ? palette.orange : 'var(--glass-border)'}` }}
            >
              <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-11 w-56 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                role="menu"
              >
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)', fontFamily: fonts.body }}
                  role="menuitem"
                >
                  <img src={user.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-[11px] opacity-60 truncate">@{profileUsername(user.email)}</p>
                  </div>
                </Link>
                <div className="my-1 h-px" style={{ background: 'var(--glass-border)' }} />
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }} role="menuitem">
                  <LayoutDashboard size={18} /> โปรไฟล์ของฉัน
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors" style={{ color: palette.pink }} role="menuitem">
                  <LogOut size={18} /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="ml-1">
            <span
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ background: palette.orange, fontFamily: fonts.body }}
            >
              เข้าสู่ระบบ
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
};

const profileUsername = (email?: string) => (email ? email.split('@')[0] : 'zeelink');

export default Navbar;
