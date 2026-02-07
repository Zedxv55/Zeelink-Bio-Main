import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Map, Vote, LogIn } from 'lucide-react';
import { ThaiBackground } from '../components/ThaiBackground';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: "สร้างแดชบอร์ด",
      desc: "จัดการโปรไฟล์และลิงก์ของคุณ",
      icon: <LayoutDashboard className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
      link: "/dashboard",
      action: "เริ่มสร้าง",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    },
    {
      title: "ออนไลน์",
      desc: "สำรวจผู้ใช้บนแผนที่ไทย",
      icon: <Map className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      link: "/explore",
      action: "เข้าสำรวจ",
      color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
    },
    {
      title: "โหวต",
      desc: "เสนอแนะฟีเจอร์ใหม่",
      icon: <Vote className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
      link: "/vote",
      action: "ดูอันดับ",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center pt-16 px-4">
      <ThaiBackground />
      
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            สร้างพอร์ตของคุณ <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              เชื่อมต่อกับคนไทย
            </span>
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            ในแพลตฟอร์มเดียว (All-in-one Platform)
          </h2>
        </div>

        {!user && (
          <div className="mb-16 animate-bounce-slow">
            <button
              onClick={() => navigate('/login')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 dark:bg-white dark:text-gray-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <LogIn className="mr-2 w-6 h-6" />
              เข้าสู่ระบบด้วย Google
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 opacity-20 group-hover:opacity-40 blur transition-opacity duration-200" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className={`relative group overflow-hidden rounded-2xl p-8 border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 ${card.color}`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-white dark:bg-gray-700 shadow-sm">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {card.desc}
                </p>
                {user ? (
                  <Link to={card.link} className="mt-4 px-6 py-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors w-full">
                    {card.action}
                  </Link>
                ) : (
                  <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed w-full">
                    Login First
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2026 Zeelink. Created for Thai Creators.</p>
        </div>
      </div>
    </div>
  );
};