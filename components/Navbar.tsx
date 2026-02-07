import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, Map, Vote, Shield, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200" style={{ fontFamily: 'Prompt' }}>
              Zeelink
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                 <Link to="/dashboard" className={`flex items-center space-x-1 hover:text-blue-500 transition-colors ${isActive('/dashboard')}`}>
                  <LayoutDashboard size={18} />
                  <span>แดชบอร์ด</span>
                </Link>
                <Link to="/explore" className={`flex items-center space-x-1 hover:text-blue-500 transition-colors ${isActive('/explore')}`}>
                  <Map size={18} />
                  <span>ออนไลน์</span>
                </Link>
                <Link to="/vote" className={`flex items-center space-x-1 hover:text-blue-500 transition-colors ${isActive('/vote')}`}>
                  <Vote size={18} />
                  <span>โหวต</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${isActive('/admin')}`}>
                    <Shield size={18} />
                    <span>แอดมิน</span>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
             <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <button 
                onClick={logout}
                className="flex items-center space-x-1 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            ) : (
               <Link to="/login" className="flex items-center space-x-1 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                  <LogIn size={16} />
                  <span>เข้าสู่ระบบ</span>
               </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around p-3 z-50">
            <Link to="/dashboard" className={`flex flex-col items-center ${isActive('/dashboard')}`}>
              <LayoutDashboard size={24} />
              <span className="text-[10px] mt-1">Dashboard</span>
            </Link>
            <Link to="/explore" className={`flex flex-col items-center ${isActive('/explore')}`}>
              <Map size={24} />
              <span className="text-[10px] mt-1">Explore</span>
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className={`flex flex-col items-center ${isActive('/admin')}`}>
                <Shield size={24} />
                <span className="text-[10px] mt-1">Admin</span>
              </Link>
            )}
        </div>
      )}
    </nav>
  );
};
