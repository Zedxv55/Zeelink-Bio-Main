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
      title: "สร้าง Dashboard",
      desc: "ตกแต่งหน้าโปรไฟล์ของคุณ",
      icon: <LayoutDashboard className="w-12 h-12 text-white drop-shadow-md" />,
      link: "/dashboard",
      action: "เริ่มสร้าง",
      glassClass: "border-cyan hover-glow-cyan",
      btnClass: "bg-cyan-500 hover:bg-cyan-600",
      accent: "var(--accent-cyan)"
    },
    {
      title: "Online",
      desc: "สำรวจผู้ใช้บนแผนที่",
      icon: <Map className="w-12 h-12 text-white drop-shadow-md" />,
      link: "/explore",
      action: "เข้าสำรวจ",
      glassClass: "border-purple hover-glow-purple",
      btnClass: "bg-purple-500 hover:bg-purple-600",
      accent: "var(--accent-purple)"
    },
    {
      title: "โหวต",
      desc: "สังคมแห่งการแชร์",
      icon: <Vote className="w-12 h-12 text-white drop-shadow-md" />,
      link: "/vote",
      action: "ดูอันดับ",
      glassClass: "border-pink hover-glow-pink",
      btnClass: "bg-pink-500 hover:bg-pink-600",
      accent: "var(--accent-pink)"
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center pt-16 px-4 overflow-hidden">
      {/* Background Layer */}
      <ThaiBackground />
      
      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg text-gradient-primary">
            Zeelink Platform <br/>
            <span style={{ color: 'var(--text-primary)' }}>เชื่อมต่อคนไทย</span>
          </h1>
          <h2 className="text-xl md:text-2xl opacity-80" style={{ color: 'var(--text-secondary)' }}>
            สร้างโปรไฟล์ • ค้นหาเพื่อน • ร่วมโหวต
          </h2>
        </div>

        {!user && (
          <div className="mb-16 animate-bounce-slow">
            <button
              onClick={() => navigate('/login')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold transition-all duration-200 glass-card hover:scale-105 border-green hover-glow-green"
              style={{ color: 'var(--text-primary)' }}
            >
              <LogIn className="mr-2 w-6 h-6" />
              เข้าสู่ระบบ (Login)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className={`glass-card p-10 relative group ${card.glassClass}`}
            >
              {/* Colorful Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: card.accent, borderRadius: '16px 16px 0 0' }}></div>

              <div className="flex flex-col items-center space-y-6 relative z-10">
                <div className="p-4 rounded-full shadow-inner" style={{ background: card.accent }}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold">
                  {card.title}
                </h3>
                <p className="opacity-80">
                  {card.desc}
                </p>
                {user ? (
                  <Link to={card.link} className={`mt-4 px-8 py-3 rounded-full text-white font-bold shadow-lg transition-colors w-full ${card.btnClass}`}>
                    {card.action}
                  </Link>
                ) : (
                  <button onClick={() => navigate('/login')} className="mt-4 px-8 py-3 rounded-full bg-gray-500/20 cursor-not-allowed w-full backdrop-blur-sm opacity-50">
                    กรุณาล็อกอิน
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-sm opacity-60" style={{ color: 'var(--text-muted)' }}>
          <p>© 2026 Zeelink Thailand. Version 2.0 Production Ready.</p>
        </div>
      </div>
    </div>
  );
};