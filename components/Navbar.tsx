import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Home, User, Map, Vote, LogOut, Sun, Moon, Menu, X } from 'lucide-react';

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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://brilliant-maroon-7qyv9qr1xg.edgeone.app/zl_icon_white_bg.png" 
              alt="Zeelink" 
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-bold text-gradient-primary">Zeelink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-bold text-sm flex items-center">
              <Home size={16} className="mr-2" /> หน้าแรก
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-bold text-sm flex items-center">
                  <User size={16} className="mr-2" /> Dashboard
                </Link>
                <Link to="/explore" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-bold text-sm flex items-center">
                  <Map size={16} className="mr-2" /> Online
                </Link>
                <Link to="/vote" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-bold text-sm flex items-center">
                  <Vote size={16} className="mr-2" /> โหวต
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors font-bold text-sm">
                    Admin
                  </Link>
                )}
              </>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                <img 
                  src={user.photoUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-bold text-sm flex items-center"
                >
                  <LogOut size={16} className="mr-2" /> ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transition-transform text-sm"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold flex items-center"
              >
                <Home size={18} className="mr-3" /> หน้าแรก
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold flex items-center"
                  >
                    <User size={18} className="mr-3" /> Dashboard
                  </Link>
                  <Link 
                    to="/explore" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold flex items-center"
                  >
                    <Map size={18} className="mr-3" /> Online
                  </Link>
                  <Link 
                    to="/vote" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold flex items-center"
                  >
                    <Vote size={18} className="mr-3" /> โหวต
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors font-bold"
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}

              {/* Theme Toggle Mobile */}
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-bold flex items-center"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={18} className="mr-3" /> โหมดสว่าง
                  </>
                ) : (
                  <>
                    <Moon size={18} className="mr-3" /> โหมดมืด
                  </>
                )}
              </button>

              {/* Auth Buttons Mobile */}
              {user ? (
                <>
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs opacity-60">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-bold flex items-center justify-center"
                  >
                    <LogOut size={18} className="mr-3" /> ออกจากระบบ
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-center"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};