import React, { ReactNode } from 'react';

interface GlassBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Animated Grid Pattern */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundPosition: 'center center'
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};