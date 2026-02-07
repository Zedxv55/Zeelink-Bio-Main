import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FLOATING_PHRASES } from '../constants';

interface FloatingWord {
  id: number;
  text: string;
  lane: number; // Vertical slot (0-5)
  speed: number;
  delay: number;
  direction: 'left' | 'right';
}

export const ThaiBackground: React.FC = () => {
  const { theme } = useTheme();
  const [words, setWords] = useState<FloatingWord[]>([]);
  
  // Opacity adjustment based on theme for readability
  const opacityClass = theme === 'dark' ? 'opacity-20' : 'opacity-10';
  const color = theme === 'dark' ? '#fff' : '#1a237e';

  useEffect(() => {
    // Create 6 lanes to prevent overlapping vertically
    const initialWords: FloatingWord[] = [];
    const usedIndices = new Set<number>();
    
    for (let lane = 0; lane < 6; lane++) {
        let wordIndex = Math.floor(Math.random() * FLOATING_PHRASES.length);
        while(usedIndices.has(wordIndex)) {
            wordIndex = Math.floor(Math.random() * FLOATING_PHRASES.length);
        }
        usedIndices.add(wordIndex);

        initialWords.push({
            id: lane,
            text: FLOATING_PHRASES[wordIndex],
            lane: lane,
            speed: 25 + Math.random() * 20, // seconds duration
            delay: lane * 3, // Staggered start
            direction: Math.random() > 0.5 ? 'left' : 'right'
        });
    }
    setWords(initialWords);

    // Loop logic is handled by CSS Animation iteration, but we can rotate text if needed
    // For simplicity and performance, we rely on CSS animations mostly, but can refresh state occasionally
    const interval = setInterval(() => {
        setWords(prev => prev.map(w => ({
           ...w,
           text: Math.random() > 0.7 ? FLOATING_PHRASES[Math.floor(Math.random() * FLOATING_PHRASES.length)] : w.text
        })));
    }, 45000); // Refresh words every 45s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${opacityClass} bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:to-black`}>
      <style>{`
        @keyframes floatLeft {
          0% { transform: translateX(100vw); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(-20vw); opacity: 0; }
        }
        @keyframes floatRight {
          0% { transform: translateX(-20vw); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
      `}</style>
      
      {words.map((word) => (
          <div
            key={word.id}
            className="absolute whitespace-nowrap text-xl md:text-3xl font-bold font-sans"
            style={{
                top: `${10 + (word.lane * 15)}%`, // Distribute vertically by lane (15% gap)
                color: color,
                animationName: word.direction === 'left' ? 'floatLeft' : 'floatRight',
                animationDuration: `${word.speed}s`,
                animationDelay: `${word.delay}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
                opacity: 0, // Starts invisible, animation handles opacity
                left: 0 // Base position
            }}
          >
              {word.text}
          </div>
      ))}

      <svg width="100%" height="100%" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-10">
        <path d="M0,800 C300,700 600,750 1200,600 L1200,800 L0,800 Z" fill={color} />
      </svg>
    </div>
  );
};
