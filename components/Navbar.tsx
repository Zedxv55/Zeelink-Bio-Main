import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home, Map, Vote, User, Search, Sun, Moon, LogOut, LayoutDashboard, Menu, X,
} from 'lucide-react';
import { Logo } from './Logo';
import { fonts, palette } from '../lib/designTokens';

// ===== รายการนำทางหลัก =====
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
const fallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Z')}&background=FF7A2F&color=fff&bold=true`;

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  // ปิดเมนู/ลิ้นชักเมื่อคลิกข้างนอก
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-drawer-toggle]')) setDrawerOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // ปิดลิ้นชักเมื่อกด Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawerOpen(false); setMenuOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ปิดลิ้นชัก/เมนูเมื่อเปลี่ยนหน้า
  useEffect(() => { setDrawerOpen(false); setMenuOpen(false); }, [location.pathname]);

  // ปิดลิ้นชักเมื่อย่อขนาดเป็นเดสก์ท็อป (กัน body ล็อก overflow ค้าง)
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setDrawerOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ล็อกการเลื่อน body เมื่อลิ้นชักเปิด
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

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
        boxShadow: '0 1px 0 var(--orange-soft), 0 6px 18px -16px rgba(31,27,22,0.5)',
      }}
    >
      {/* ===== โลโก้ ===== */}
      <Link to={user ? '/feed' : '/login'} className="flex items-center flex-shrink-0" aria-label="Zeelink หน้าแรก">
        <Logo size={30} variant={theme === 'dark' ? 'light' : 'dark'} withWordmark />
      </Link>

      {/* ===== ปุ่มเมนู (มือถือเท่านั้น) ===== */}
      <button
        data-drawer-toggle
        onClick={() => setDrawerOpen(o => !o)}
        aria-label={drawerOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        aria-expanded={drawerOpen}
        className="md:hidden p-2 -ml-1 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: 'var(--text-secondary)' }}
      >
        {drawerOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ===== ช่องค้นหา (เดสก์ท็อป) ===== */}
      <form onSubmit={submitSearch} className="hidden md:flex items-center flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาโพสต์ เพื่อน หรือครีเอเตอร์..."
            aria-label="ค้นหา"
            className="w-full pl-9 pr-3 py-2 rounded-full text-sm outline-none transition-shadow"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: fonts.body }}
          />
        </div>
      </form>

      {/* ===== ไอคอนนำทาง (เดสก์ท็อปเท่านั้น — มือถือใช้ลิ้นชัก) ===== */}
      <nav className="hidden md:flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
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
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-sm font-semibold" style={{ fontFamily: fonts.body }}>{item.label}</span>
            </Link>
          );
        })}

        {/* สลับธีม */}
        <button
          onClick={toggleTheme}
          className="ml-1 p-2 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-primary)', background: 'var(--glass-border)' }}
          aria-label="สลับธีม"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* ===== ผู้ใช้: อวตาร + เมนู ===== */}
        {user ? (
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="เมนูผู้ใช้"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="rounded-full p-0.5 transition-transform hover:scale-105"
              style={{ border: `2px solid ${menuOpen ? palette.orange : 'var(--glass-border)'}` }}
            >
              <img
                src={user.photoUrl}
                alt={user.name}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar(user.name); }}
                className="w-8 h-8 rounded-full object-cover bg-white"
              />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-11 w-60 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in"
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
                  <img
                    src={user.photoUrl}
                    alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar(user.name); }}
                    className="w-9 h-9 rounded-full object-cover bg-white"
                  />
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

      {/* ===== ลิ้นชักเมนู (มือถือ) ===== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="เมนูนำทาง">
          {/* ฉากหลังทึบแสง คลิกปิด */}
          <button
            aria-label="ปิดเมนู"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          />
          {/* แผงเลื่อนจากขวา */}
          <div
            ref={drawerRef}
            className="absolute top-0 right-0 h-full w-[84%] max-w-xs shadow-2xl flex flex-col animate-slide-in-right"
            style={{ background: 'var(--glass-bg)', borderLeft: '1px solid var(--glass-border)' }}
          >
            <div className="flex items-center justify-between px-4 h-[60px] border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="text-[11px] font-mono tracking-[0.18em] uppercase" style={{ color: 'var(--blueprint)' }}>Menu</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="ปิดเมนู" className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                <X size={22} />
              </button>
            </div>

            {/* ค้นหาในลิ้นชัก (มือถือ) */}
            <form onSubmit={submitSearch} className="p-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="ค้นหาโพสต์ เพื่อน หรือครีเอเตอร์..."
                  aria-label="ค้นหา"
                  className="w-full pl-9 pr-3 py-2.5 rounded-full text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: fonts.body }}
                />
              </div>
            </form>

            {/* รายการนำทาง */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors"
                    style={{
                      color: active ? palette.orange : 'var(--text-primary)',
                      background: active ? palette.orangeSoft : 'transparent',
                      fontFamily: fonts.body,
                    }}
                  >
                    <Icon size={22} className="flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* บัญชีผู้ใช้ (มือถือ) */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              {user ? (
                <div className="space-y-1">
                  <Link to="/dashboard" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }} role="menuitem">
                    <LayoutDashboard size={20} /> โปรไฟล์ของฉัน
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors" style={{ color: palette.pink }} role="menuitem">
                    <LogOut size={20} /> ออกจากระบบ
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setDrawerOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-full text-sm font-bold text-white transition-transform hover:scale-105" style={{ background: palette.orange, fontFamily: fonts.body }}>
                  เข้าสู่ระบบ
                </Link>
              )}
              <p className="text-center text-[10px] font-mono tracking-wider pt-3 opacity-50">ZELINK · พอร์ตโฟลิโอคนไทย</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const profileUsername = (email?: string) => (email ? email.split('@')[0] : 'zeelink');

export default Navbar;
