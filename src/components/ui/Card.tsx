'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  glow?: boolean;
  gradient?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'md',
  onClick,
  glow = false,
  gradient = false,
  elevated = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const baseClasses = `
    rounded-2xl 
    border border-[var(--border)]
    transition-all duration-300
    ${glass ? 'glass-enhanced' : gradient ? 'gradient-primary text-white border-transparent' : 'bg-[var(--surface)] shadow-sm'}
    ${hover ? 'hover:shadow-xl hover:-translate-y-2' : ''}
    ${glow ? 'shadow-glow' : ''}
    ${elevated ? 'shadow-elevated' : ''}
    ${onClick ? 'cursor-pointer hover-lift' : ''}
    ${paddingClasses[padding]}
  `;
  
  const Component = onClick ? motion.div : 'div';
  
  return (
    <Component
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -6, scale: 1.02 } : onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        opacity: { duration: 0.3 },
        y: { duration: 0.3 }
      }}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
      )}
      <div className={gradient ? 'relative z-10' : undefined}>
        {children}
      </div>
    </Component>
  );
};