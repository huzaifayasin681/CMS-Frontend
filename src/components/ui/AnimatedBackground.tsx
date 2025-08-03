'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'dots' | 'grid' | 'waves' | 'particles';
  density?: 'low' | 'medium' | 'high';
  className?: string;
  animated?: boolean;
}

export const AnimatedBackground = memo<AnimatedBackgroundProps>(({ 
  variant = 'dots', 
  density = 'medium',
  className = '',
  animated = true
}) => {
  const densityConfig = {
    low: { count: 20, size: 'large' },
    medium: { count: 50, size: 'medium' },
    high: { count: 100, size: 'small' }
  };
  
  const config = densityConfig[density];
  
  const elements = useMemo(() => {
    return Array.from({ length: config.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
  }, [config.count]);
  
  if (variant === 'dots') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {elements.map(element => (
          <motion.div
            key={element.id}
            className="absolute w-1 h-1 bg-[var(--primary)] rounded-full opacity-20"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={animated ? {
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            } : undefined}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'grid') {
    return (
      <div className={`absolute inset-0 bg-pattern opacity-30 ${className}`} />
    );
  }
  
  if (variant === 'waves') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
            `
          }}
          animate={animated ? {
            background: [
              `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 60% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
            ]
          } : undefined}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    );
  }
  
  if (variant === 'particles') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {elements.map(element => (
          <motion.div
            key={element.id}
            className="absolute w-0.5 h-0.5 bg-[var(--accent)] rounded-full"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={animated ? {
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            } : undefined}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  }
  
  return null;
});

AnimatedBackground.displayName = 'AnimatedBackground';