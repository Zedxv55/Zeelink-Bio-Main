import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FLOATING_PHRASES } from '../constants';

interface FloatingWord {
  id: number;
  text: string;
  speed: number;
  delay: number;
  top: number;
  left: number;
  angle: number;
  glowColor: string;
}

export const ThaiBackground: React.FC = () => {
  const { theme } = useTheme();
  const [words, setWords] = useState<FloatingWord[]>([]);
  
  const glowColors = theme === 'dark' 
    ? ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00'] 
    : ['#FFA500', '#FF4500', '#DA70D6', '#20B2AA'];

  useEffect(() => {
    const initialWords: FloatingWord[] = [];
    const count = 7;
    
    for (let i = 0; i < count; i++) {
        initialWords.push({
            id: i,
            text: FLOATING_PHRASES[Math.floor(Math.random() * FLOATING_PHRASES.length)],
            speed: 20 + Math.random() * 20,
            delay: i * 2,
            top: 10 + Math.random() * 80,
            left: Math.random() * 100,
            angle: Math.random() * 360,
            glowColor: glowColors[Math.floor(Math.random() * glowColors.length)]
        });
    }
    setWords(initialWords);
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FAF8F3] dark:bg-[#1a1a1a]">
      <style>{`
        @keyframes multiFloat {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          50% { transform: translate(15vw, -10vh) rotate(5deg); opacity: 0.6; }
          90% { opacity: 0.4; }
          100% { transform: translate(-10vw, 15vh) rotate(-5deg); opacity: 0; }
        }
        .glow-text {
          transition: text-shadow 2s ease;
        }
      `}</style>
      
      {words.map((word) => (
          <div
            key={`${word.id}-${theme}`}
            className="absolute whitespace-nowrap text-2xl md:text-4xl font-bold glow-text"
            style={{
                top: `${word.top}%`,
                left: `${word.left}%`,
                color: theme === 'dark' ? '#fff' : '#2d2d2d',
                textShadow: `0 0 15px ${word.glowColor}66, 0 0 30px ${word.glowColor}33`,
                animation: `multiFloat ${word.speed}s ease-in-out ${word.delay}s infinite alternate`,
                opacity: 0
            }}
          >
              {word.text}
          </div>
      ))}

      {/* Mirror particle effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-sm animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};