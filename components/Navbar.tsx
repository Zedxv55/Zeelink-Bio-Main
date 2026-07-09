import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Home, User, Map, Vote, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { fonts, fontSize, spacing } from '../lib/designTokens';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pixel-nav">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo size={34} variant="dark" withWordmark />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="pixel-link font-bold flex items-center" style={{ fontSize: fontSize('sm'), fontFamily: fonts.body }}>
              <Home size={16} className="mr-2" /> หน้าแรก
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="pixel-link font-bold flex items-center" style={{ fontSize: fontSize('sm'), fontFamily: fonts.body }}>
                  <User size={16} className="mr-2" /> Dashboard
                </Link>
                <Link to="/explore" className="pixel-link font-bold flex items-center" style={{ fontSize: fontSize('sm'), fontFamily: fonts.body }}>
                  <Map size={16} className="mr-2" /> แผนที่
                </Link>
                <Link to="/vote" className="pixel-link font-bold flex items-center" style={{ fontSize: fontSize('sm'), fontFamily: fonts.body }}>
                  <Vote size={16} className="mr-2" /> โหวต
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="pixel-link font-bold" style={{ color: 'var(--orange)', fontSize: fontSize('sm'), fontFamily: fonts.body }}>
                    Admin
                  </Link>
                )}
              </>
            )}

            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-primary)', background: 'var(--glass-border)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2"
                  style={{ borderColor: 'var(--orange)' }}
                />
                <Button variant="ghost" size="sm" leftIcon={<LogOut size={16} />} onClick={handleLogout}>
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <Link to="/login" className="ml-4">
                <Button variant="primary" size="sm">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t-2 animate-fade-in"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}
          >
            <div className="flex flex-col space-y-2" style={{ fontFamily: fonts.body }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 pixel-link font-bold flex items-center" style={{ fontSize: fontSize('base') }}>
                <Home size={18} className="mr-3" /> หน้าแรก
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 pixel-link font-bold flex items-center" style={{ fontSize: fontSize('base') }}>
                    <User size={18} className="mr-3" /> Dashboard
                  </Link>
                  <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 pixel-link font-bold flex items-center" style={{ fontSize: fontSize('base') }}>
                    <Map size={18} className="mr-3" /> แผนที่
                  </Link>
                  <Link to="/vote" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 pixel-link font-bold flex items-center" style={{ fontSize: fontSize('base') }}>
                    <Vote size={18} className="mr-3" /> โหวต
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 pixel-link font-bold" style={{ color: 'var(--orange)', fontSize: fontSize('base') }}>
                      Admin Panel
                    </Link>
                  )}
                </>
              )}

              <button
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                className="px-4 py-3 pixel-link font-bold flex items-center"
                style={{ fontSize: fontSize('base') }}
              >
                {theme === 'dark' ? (<><Sun size={18} className="mr-3" /> โหมดสว่าง</>) : (<><Moon size={18} className="mr-3" /> โหมดมืด</>)}
              </button>

              {user ? (
                <>
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <img src={user.photoUrl} alt={user.name} className="w-10 h-10 rounded-full border-2" style={{ borderColor: 'var(--orange)' }} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      <p className="text-xs opacity-60">{user.email}</p>
                    </div>
                  </div>
                  <div className="px-4">
                    <Button variant="ghost" size="sm" fullWidth leftIcon={<LogOut size={16} />} onClick={handleLogout}>
                      ออกจากระบบ
                    </Button>
                  </div>
                </>
              ) : (
                <div className="px-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="primary" size="sm" fullWidth>
                      เข้าสู่ระบบ
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
